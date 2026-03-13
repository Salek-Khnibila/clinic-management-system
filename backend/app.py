from flask import Flask, request, jsonify, g
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import mysql.connector
from mysql.connector import Error
import bcrypt
import os
from datetime import timedelta
from dotenv import load_dotenv
from security_utils import (
    log_security_event, rate_limit, validate_input, 
    get_client_ip, log_request_response, security_headers,
    detect_brute_force
)

load_dotenv()

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'votre-secret-key-here')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

CORS(app)
jwt = JWTManager(app)

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'gestion_clinique'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'port': int(os.getenv('DB_PORT', 3306))
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Database connection error: {e}")
        return None

def execute_query(query, params=None, fetch_one=False):
    connection = get_db_connection()
    if not connection:
        return None
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params)
        
        if query.strip().upper().startswith(('INSERT', 'UPDATE', 'DELETE')):
            connection.commit()
            result = cursor.lastrowid if query.strip().upper().startswith('INSERT') else cursor.rowcount
        else:
            result = cursor.fetchone() if fetch_one else cursor.fetchall()
        
        cursor.close()
        return result
    except Error as e:
        print(f"Query execution error: {e}")
        return None
    finally:
        connection.close()

# Routes d'authentification
@app.route('/api/auth/login', methods=['POST'])
@rate_limit(max_requests=10, window_seconds=300)  # 10 tentatives par 5 minutes
@log_request_response
def login():
    try:
        client_ip = get_client_ip()
        
        # Détection brute force
        if detect_brute_force(client_ip):
            log_security_event('BRUTE_FORCE_DETECTED', ip_address=client_ip)
            return jsonify({'success': False, 'message': 'Trop de tentatives. Réessayez plus tard.'}), 429
        
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')
        
        # Validation des entrées
        if not all([validate_input(email), validate_input(password), validate_input(role)]):
            log_security_event('INPUT_VALIDATION_FAILED', ip_address=client_ip, details={'email': email})
            return jsonify({'success': False, 'message': 'Données invalides'}), 400
        
        if not email or not password or not role:
            return jsonify({'success': False, 'message': 'Email, mot de passe et rôle requis'}), 400
        
        # Rechercher l'utilisateur
        query = "SELECT * FROM users WHERE email = %s AND role = %s"
        user = execute_query(query, (email, role), fetch_one=True)
        
        if not user:
            log_security_event('LOGIN_FAILED', user_id=None, ip_address=client_ip, 
                            details={'email': email, 'role': role})
            return jsonify({'success': False, 'message': 'Identifiants incorrects'}), 401
        
        # Vérifier le mot de passe
        if bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            # Créer le token JWT
            access_token = create_access_token(identity={
                'id': user['id'],
                'email': user['email'],
                'role': user['role'],
                'prenom': user['prenom'],
                'nom': user['nom']
            })
            
            log_security_event('LOGIN_SUCCESS', user_id=user['id'], ip_address=client_ip)
            
            return jsonify({
                'success': True,
                'user': {
                    'id': user['id'],
                    'prenom': user['prenom'],
                    'nom': user['nom'],
                    'email': user['email'],
                    'role': user['role']
                },
                'token': access_token,
                'refreshToken': 'refresh-token-placeholder'  # À implémenter plus tard
            })
        else:
            log_security_event('LOGIN_FAILED', user_id=user['id'], ip_address=client_ip, 
                            details={'email': email, 'role': role})
            return jsonify({'success': False, 'message': 'Identifiants incorrects'}), 401
            
    except Exception as e:
        log_security_event('LOGIN_ERROR', ip_address=get_client_ip(), details={'error': str(e)})
        return jsonify({'success': False, 'message': f'Erreur serveur: {str(e)}'}), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Hasher le mot de passe
        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        
        # Insérer l'utilisateur
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
            data.get('groupe_sanguin')
        ))
        
        if user_id:
            return jsonify({'success': True, 'message': 'Utilisateur créé avec succès'})
        else:
            return jsonify({'success': False, 'message': 'Erreur lors de la création'}), 500
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500

# Routes pour les rendez-vous
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

@app.route('/api/appointments', methods=['POST'])
@jwt_required()
def create_appointment():
    try:
        data = request.get_json()
        
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
            data.get('arrivee', 'en attente')
        ))
        
        if appointment_id:
            return jsonify({'success': True, 'data': {'id': appointment_id}})
        else:
            return jsonify({'success': False, 'message': 'Erreur lors de la création'}), 500
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500

# Routes pour les médecins
@app.route('/api/doctors', methods=['GET'])
@jwt_required()
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

# Routes pour les patients
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

# Routes pour les messages
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

@app.route('/api/messages', methods=['POST'])
@jwt_required()
def send_message():
    try:
        data = request.get_json()
        
        query = """
        INSERT INTO messages (`from`, to_patient_id, sujet, corps, date)
        VALUES (%s, %s, %s, %s, %s)
        """
        
        message_id = execute_query(query, (
            data['from'],
            data['to_patient_id'],
            data['sujet'],
            data['corps'],
            data.get('date', '2025-03-13')  # Date actuelle
        ))
        
        if message_id:
            return jsonify({'success': True, 'data': {'id': message_id}})
        else:
            return jsonify({'success': False, 'message': 'Erreur lors de l\'envoi'}), 500
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erreur: {str(e)}'}), 500

# Route de test
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'OK', 'message': 'Backend Flask fonctionne!'})

# Middleware pour les headers de sécurité
@app.after_request
def add_security_headers(response):
    return security_headers(response)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3001)
