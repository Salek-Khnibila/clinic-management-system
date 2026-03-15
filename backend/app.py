from flask import Flask, request, jsonify, g
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
import mysql.connector
import bcrypt
import os
from datetime import timedelta, date
from dotenv import load_dotenv
from security_utils import (
    log_security_event, rate_limit, validate_input,
    get_client_ip, log_request_response, security_headers,
    detect_brute_force
)

# Load .env from the backend directory
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'change-me-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})
jwt = JWTManager(app)

# ──────────────────────────────────────────────
# Database configuration — reads from .env only
# ──────────────────────────────────────────────
def get_db_config():
    return {
        'host': os.getenv('DB_HOST', '127.0.0.1'),
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', ''),
        'database': os.getenv('DB_NAME', 'gestion_clinique'),
        'port': int(os.getenv('DB_PORT', 3306)),
    }

def get_db_connection():
    try:
        connection = mysql.connector.connect(**get_db_config())
        return connection
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

def execute_query(query, params=None, fetch_one=False):
    connection = get_db_connection()
    if not connection:
        return None
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params or [])
        if query.strip().upper().startswith(('INSERT', 'UPDATE', 'DELETE')):
            connection.commit()
            result = cursor.lastrowid if query.strip().upper().startswith('INSERT') else cursor.rowcount
        else:
            result = cursor.fetchone() if fetch_one else cursor.fetchall()
        cursor.close()
        return result
    except Exception as e:
        print(f"Query execution error: {e}")
        connection.rollback()
        return None
    finally:
        connection.close()


# ══════════════════════════════════════════════
#  AUTH ROUTES
# ══════════════════════════════════════════════

@app.route('/api/auth/login', methods=['POST'])
@rate_limit(max_requests=10, window_seconds=300)
@log_request_response
def login():
    try:
        client_ip = get_client_ip()
        if detect_brute_force(client_ip):
            log_security_event('BRUTE_FORCE_DETECTED', ip_address=client_ip)
            return jsonify({'success': False, 'message': 'Trop de tentatives. Réessayez plus tard.'}), 429

        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')

        if not all([validate_input(email), validate_input(password), validate_input(role)]):
            log_security_event('INPUT_VALIDATION_FAILED', ip_address=client_ip, details={'email': email})
            return jsonify({'success': False, 'message': 'Données invalides'}), 400

        if not email or not password or not role:
            return jsonify({'success': False, 'message': 'Email, mot de passe et rôle requis'}), 400

        query = "SELECT * FROM users WHERE email = %s AND role = %s"
        user = execute_query(query, (email, role), fetch_one=True)

        if not user:
            log_security_event('LOGIN_FAILED', ip_address=client_ip, details={'email': email, 'role': role})
            return jsonify({'success': False, 'message': 'Identifiants incorrects'}), 401

        if bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            extra_claims = {
                'email': user['email'],
                'role': user['role'],
                'prenom': user['prenom'],
                'nom': user['nom'],
            }
            access_token = create_access_token(identity=str(user['id']), additional_claims=extra_claims)
            refresh_token = create_refresh_token(identity=str(user['id']), additional_claims=extra_claims)

            log_security_event('LOGIN_SUCCESS', user_id=user['id'], ip_address=client_ip)
            return jsonify({
                'success': True,
                'user': {
                    'id': user['id'],
                    'prenom': user['prenom'],
                    'nom': user['nom'],
                    'email': user['email'],
                    'role': user['role'],
                },
                'token': access_token,
                'refreshToken': refresh_token,
            })
        else:
            log_security_event('LOGIN_FAILED', user_id=user['id'], ip_address=client_ip)
            return jsonify({'success': False, 'message': 'Identifiants incorrects'}), 401

    except Exception as e:
        log_security_event('LOGIN_ERROR', ip_address=get_client_ip(), details={'error': str(e)})
        return jsonify({'success': False, 'message': 'Erreur serveur'}), 500


@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        query = """
        INSERT INTO users (prenom, nom, email, password, role, telephone, groupe_sanguin)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        user_id = execute_query(query, (
            data['prenom'],
            data['nom'],
            data['email'],
            hashed_password.decode('utf-8'),
            data['role'],
            data.get('telephone'),
            data.get('groupe_sanguin'),
        ))
        if user_id:
            return jsonify({'success': True, 'message': 'Utilisateur créé avec succès'})
        return jsonify({'success': False, 'message': 'Erreur lors de la création'}), 500
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500


@app.route('/api/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Issue a new access token using a valid refresh token."""
    try:
        identity = get_jwt_identity()
        claims = get_jwt()
        extra_claims = {k: claims[k] for k in ('email', 'role', 'prenom', 'nom') if k in claims}
        access_token = create_access_token(identity=identity, additional_claims=extra_claims)
        return jsonify({'success': True, 'token': access_token})
    except Exception as e:
        return jsonify({'success': False, 'message': 'Erreur serveur'}), 500


# ══════════════════════════════════════════════
#  APPOINTMENTS ROUTES
# ══════════════════════════════════════════════

@app.route('/api/appointments', methods=['GET'])
@jwt_required()
def get_appointments():
    try:
        query = """
        SELECT a.*,
               p.prenom as patient_prenom, p.nom as patient_nom,
               m.prenom as medecin_prenom, m.nom as medecin_nom
        FROM appointments a
        LEFT JOIN users p ON a.patient_id = p.id
        LEFT JOIN users m ON a.medecin_id = m.id
        ORDER BY a.date DESC, a.heure DESC
        """
        appointments = execute_query(query)
        return jsonify({'success': True, 'data': appointments or []})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500


@app.route('/api/appointments/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_appointments(user_id):
    """Get appointments for a specific patient or doctor."""
    try:
        query = """
        SELECT a.*,
               p.prenom as patient_prenom, p.nom as patient_nom,
               m.prenom as medecin_prenom, m.nom as medecin_nom, m.specialite
        FROM appointments a
        LEFT JOIN users p ON a.patient_id = p.id
        LEFT JOIN users m ON a.medecin_id = m.id
        WHERE a.patient_id = %s OR a.medecin_id = %s
        ORDER BY a.date DESC, a.heure DESC
        """
        appointments = execute_query(query, (user_id, user_id))
        return jsonify({'success': True, 'data': appointments or []})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500


@app.route('/api/appointments/slots/<int:medecin_id>/<string:rdv_date>', methods=['GET'])
@jwt_required()
def get_available_slots(medecin_id, rdv_date):
    """Return time slots not yet booked for a doctor on a given date."""
    try:
        query = """
        SELECT heure FROM appointments
        WHERE medecin_id = %s AND date = %s AND statut NOT IN ('annulé')
        """
        booked = execute_query(query, (medecin_id, rdv_date))
        booked_hours = [r['heure'] for r in (booked or [])]

        # Normalize TIME objects to strings
        booked_str = []
        for h in booked_hours:
            if hasattr(h, 'seconds'):
                total = h.seconds
                booked_str.append(f"{total // 3600:02}:{(total % 3600) // 60:02}")
            else:
                booked_str.append(str(h)[:5])

        all_slots = [
            '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
        ]
        available = [s for s in all_slots if s not in booked_str]
        return jsonify({'success': True, 'data': available})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500


@app.route('/api/appointments', methods=['POST'])
@jwt_required()
def create_appointment():
    try:
        data = request.get_json()
        if not isinstance(data, dict):
            return jsonify({'success': False, 'message': 'Données JSON invalides'}), 400

        required_fields = ['date', 'heure', 'motif', 'patient_id', 'medecin_id']
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({'success': False, 'message': f"Champs manquants: {', '.join(missing)}"}), 400

        query = """
        INSERT INTO appointments (date, heure, motif, statut, patient_id, medecin_id, arrivee)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        appointment_id = execute_query(query, (
            data['date'],
            data['heure'],
            data['motif'],
            data.get('statut', 'en attente'),
            data['patient_id'],
            data['medecin_id'],
            data.get('arrivee', 'en attente'),
        ))
        if appointment_id:
            return jsonify({'success': True, 'data': {'id': appointment_id}})
        return jsonify({'success': False, 'message': 'Erreur lors de la création'}), 500
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500


@app.route('/api/appointments/<int:appointment_id>', methods=['PUT'])
@jwt_required()
def update_appointment(appointment_id):
    """Update appointment fields (statut, date, heure, arrivee, etc.)."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'Données manquantes'}), 400

        # Whitelist of updatable columns to prevent SQL injection via key names
        allowed_fields = {'date', 'heure', 'motif', 'statut', 'arrivee'}
        fields = []
        params = []
        for key, value in data.items():
            if key in allowed_fields:
                fields.append(f"{key} = %s")
                params.append(value)

        if not fields:
            return jsonify({'success': False, 'message': 'Aucun champ valide fourni'}), 400

        query = f"UPDATE appointments SET {', '.join(fields)} WHERE id = %s"
        params.append(appointment_id)
        rows_affected = execute_query(query, params)

        if rows_affected is not None and rows_affected > 0:
            return jsonify({'success': True, 'message': 'Rendez-vous mis à jour'})
        elif rows_affected == 0:
            return jsonify({'success': False, 'message': 'Rendez-vous introuvable'}), 404
        return jsonify({'success': False, 'message': 'Erreur lors de la mise à jour'}), 500
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500


@app.route('/api/appointments/<int:appointment_id>', methods=['DELETE'])
@jwt_required()
def delete_appointment(appointment_id):
    """Permanently delete an appointment (admin use). For cancellation use PUT with statut=annulé."""
    try:
        rows_affected = execute_query("DELETE FROM appointments WHERE id = %s", (appointment_id,))
        if rows_affected is not None and rows_affected > 0:
            return jsonify({'success': True, 'message': 'Rendez-vous supprimé'})
        return jsonify({'success': False, 'message': 'Rendez-vous introuvable'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500


# ══════════════════════════════════════════════
#  DOCTORS ROUTES
# ══════════════════════════════════════════════

@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    try:
        query = """
        SELECT id, prenom, nom, email, specialite, ville, tarif, experience, note, avis, dispo
        FROM users
        WHERE role = 'medecin'
        ORDER BY nom, prenom
        """
        doctors = execute_query(query)
        return jsonify({'success': True, 'data': doctors or []})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500


@app.route('/api/doctors/<int:doctor_id>', methods=['GET'])
def get_doctor(doctor_id):
    try:
        query = """
        SELECT id, prenom, nom, email, specialite, ville, tarif, experience, note, avis, dispo
        FROM users
        WHERE id = %s AND role = 'medecin'
        """
        doctor = execute_query(query, (doctor_id,), fetch_one=True)
        if doctor:
            return jsonify({'success': True, 'data': doctor})
        return jsonify({'success': False, 'message': 'Médecin introuvable'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500


@app.route('/api/doctors/specialty/<string:specialty>', methods=['GET'])
def get_doctors_by_specialty(specialty):
    try:
        query = """
        SELECT id, prenom, nom, email, specialite, ville, tarif, experience, note, avis, dispo
        FROM users
        WHERE role = 'medecin' AND specialite LIKE %s
        ORDER BY nom, prenom
        """
        doctors = execute_query(query, (f'%{specialty}%',))
        return jsonify({'success': True, 'data': doctors or []})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500


@app.route('/api/doctors/city/<string:city>', methods=['GET'])
def get_doctors_by_city(city):
    try:
        query = """
        SELECT id, prenom, nom, email, specialite, ville, tarif, experience, note, avis, dispo
        FROM users
        WHERE role = 'medecin' AND ville LIKE %s
        ORDER BY nom, prenom
        """
        doctors = execute_query(query, (f'%{city}%',))
        return jsonify({'success': True, 'data': doctors or []})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500


@app.route('/api/doctors/search', methods=['GET'])
def search_doctors():
    try:
        q = request.args.get('q', '')
        query = """
        SELECT id, prenom, nom, email, specialite, ville, tarif, experience, note, avis, dispo
        FROM users
        WHERE role = 'medecin'
          AND (nom LIKE %s OR prenom LIKE %s OR specialite LIKE %s OR ville LIKE %s)
        ORDER BY nom, prenom
        """
        pattern = f'%{q}%'
        doctors = execute_query(query, (pattern, pattern, pattern, pattern))
        return jsonify({'success': True, 'data': doctors or []})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500


# ══════════════════════════════════════════════
#  PATIENTS ROUTES
# ══════════════════════════════════════════════

@app.route('/api/patients', methods=['GET'])
@jwt_required()
def get_patients():
    try:
        query = """
        SELECT id, prenom, nom, email, telephone, groupe_sanguin
        FROM users
        WHERE role = 'patient'
        ORDER BY nom, prenom
        """
        patients = execute_query(query)
        return jsonify({'success': True, 'data': patients or []})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500


@app.route('/api/patients/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_patient(patient_id):
    try:
        query = """
        SELECT id, prenom, nom, email, telephone, groupe_sanguin
        FROM users
        WHERE id = %s AND role = 'patient'
        """
        patient = execute_query(query, (patient_id,), fetch_one=True)
        if patient:
            return jsonify({'success': True, 'data': patient})
        return jsonify({'success': False, 'message': 'Patient introuvable'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500


@app.route('/api/patients/<int:patient_id>', methods=['PUT'])
@jwt_required()
def update_patient(patient_id):
    try:
        data = request.get_json()
        allowed_fields = {'prenom', 'nom', 'email', 'telephone', 'groupe_sanguin'}
        fields = []
        params = []
        for key, value in data.items():
            if key in allowed_fields:
                fields.append(f"{key} = %s")
                params.append(value)

        if not fields:
            return jsonify({'success': False, 'message': 'Aucun champ valide fourni'}), 400

        query = f"UPDATE users SET {', '.join(fields)} WHERE id = %s AND role = 'patient'"
        params.append(patient_id)
        rows_affected = execute_query(query, params)

        if rows_affected is not None and rows_affected > 0:
            return jsonify({'success': True, 'message': 'Profil mis à jour'})
        elif rows_affected == 0:
            return jsonify({'success': False, 'message': 'Patient introuvable'}), 404
        return jsonify({'success': False, 'message': 'Erreur lors de la mise à jour'}), 500
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500


# ══════════════════════════════════════════════
#  MESSAGES ROUTES
# ══════════════════════════════════════════════

@app.route('/api/messages', methods=['GET'])
@jwt_required()
def get_messages():
    try:
        query = """
        SELECT m.*, p.prenom as patient_prenom, p.nom as patient_nom
        FROM messages m
        LEFT JOIN users p ON m.to_patient_id = p.id
        ORDER BY m.date DESC
        """
        messages = execute_query(query)
        return jsonify({'success': True, 'data': messages or []})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500


@app.route('/api/messages/patient/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_patient_messages(patient_id):
    try:
        query = """
        SELECT m.*, p.prenom as patient_prenom, p.nom as patient_nom
        FROM messages m
        LEFT JOIN users p ON m.to_patient_id = p.id
        WHERE m.to_patient_id = %s
        ORDER BY m.date DESC
        """
        messages = execute_query(query, (patient_id,))
        return jsonify({'success': True, 'data': messages or []})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500


@app.route('/api/messages', methods=['POST'])
@jwt_required()
def send_message():
    try:
        data = request.get_json()
        today = date.today().isoformat()
        query = """
        INSERT INTO messages (`from`, to_patient_id, sujet, corps, date)
        VALUES (%s, %s, %s, %s, %s)
        """
        message_id = execute_query(query, (
            data['from'],
            data['to_patient_id'],
            data['sujet'],
            data['corps'],
            data.get('date', today),
        ))
        if message_id:
            return jsonify({'success': True, 'data': {'id': message_id}})
        return jsonify({'success': False, 'message': "Erreur lors de l'envoi"}), 500
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500


@app.route('/api/messages/<int:message_id>/read', methods=['PUT'])
@jwt_required()
def mark_message_read(message_id):
    try:
        rows_affected = execute_query(
            "UPDATE messages SET lu = TRUE WHERE id = %s", (message_id,)
        )
        if rows_affected is not None and rows_affected > 0:
            return jsonify({'success': True, 'message': 'Message marqué comme lu'})
        return jsonify({'success': False, 'message': 'Message introuvable'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500


# ══════════════════════════════════════════════
#  UTILITY
# ══════════════════════════════════════════════

@app.route('/api/health', methods=['GET'])
def health_check():
    db_ok = get_db_connection() is not None
    return jsonify({
        'status': 'OK',
        'database': 'connected' if db_ok else 'disconnected',
        'message': 'Backend Flask opérationnel',
    })


@app.after_request
def add_security_headers(response):
    return security_headers(response)


if __name__ == '__main__':
    app.run(debug=os.getenv('FLASK_DEBUG', 'True') == 'True', host='0.0.0.0', port=3001)
