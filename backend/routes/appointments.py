from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from db import execute_query, serialize_row

appointments_bp = Blueprint("appointments", __name__, url_prefix="/api/appointments")

VALID_STATUTS = ('en_attente', 'confirme', 'annule', 'reporte')
VALID_ARRIVEE = ('en_attente', 'en_salle', 'absent')

SELECT_FULL = """
    SELECT a.*,
           p.prenom AS patient_prenom, p.nom AS patient_nom,
           m.prenom AS medecin_prenom, m.nom AS medecin_nom, m.specialite
    FROM appointments a
    LEFT JOIN users p ON a.patient_id = p.id
    LEFT JOIN users m ON a.medecin_id = m.id
"""


def _get_claims():
    """Retourne (user_id:int, role:str) depuis le JWT — jamais depuis le body."""
    claims  = get_jwt()
    user_id = int(get_jwt_identity())
    role    = claims.get('role', '')
    return user_id, role


# ── GET /api/appointments  (secrétaire uniquement) ───────────────────────────
@appointments_bp.route('', methods=['GET'])
@jwt_required()
def get_all():
    _, role = _get_claims()
    # 🔒 Seule la secrétaire peut voir tous les RDV
    if role != 'secretaire':
        return jsonify({'success': False, 'message': 'Access denied'}), 403
    rdvs = execute_query(SELECT_FULL + " ORDER BY a.date DESC, a.heure DESC")
    return jsonify({'success': True, 'data': [serialize_row(r) for r in (rdvs or [])]})


# ── GET /api/appointments/user/<id> ──────────────────────────────────────────
@appointments_bp.route('/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_appointments(user_id):
    current_id, role = _get_claims()

    # 🔒 Un utilisateur ne peut voir que ses propres RDV
    if role != 'secretaire' and current_id != user_id:
        return jsonify({'success': False, 'message': 'Access denied'}), 403

    if role == 'secretaire':
        rdvs = execute_query(SELECT_FULL + " ORDER BY a.date DESC, a.heure DESC")
    elif role == 'patient':
        rdvs = execute_query(
            SELECT_FULL + " WHERE a.patient_id = %s ORDER BY a.date DESC, a.heure DESC",
            (current_id,)
        )
    elif role == 'medecin':
        rdvs = execute_query(
            SELECT_FULL + " WHERE a.medecin_id = %s ORDER BY a.date DESC, a.heure DESC",
            (current_id,)
        )
    else:
        return jsonify({'success': False, 'message': 'Unknown role'}), 403

    return jsonify({'success': True, 'data': [serialize_row(r) for r in (rdvs or [])]})


# ── GET /api/appointments/slots/<medecin_id>/<date> ───────────────────────────
@appointments_bp.route('/slots/<int:medecin_id>/<string:rdv_date>', methods=['GET'])
@jwt_required()
def get_available_slots(medecin_id, rdv_date):
    booked = execute_query(
        "SELECT heure FROM appointments WHERE medecin_id = %s AND date = %s AND statut != 'annule'",
        (medecin_id, rdv_date)
    )
    booked_str = []
    for r in (booked or []):
        h = r['heure']
        if hasattr(h, 'seconds'):
            total = h.seconds
            booked_str.append(f"{total // 3600:02}:{(total % 3600) // 60:02}")
        else:
            booked_str.append(str(h)[:5])

    all_slots = [
        '08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
        '14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30',
    ]
    return jsonify({'success': True, 'data': [s for s in all_slots if s not in booked_str]})


# ── POST /api/appointments ────────────────────────────────────────────────────
@appointments_bp.route('', methods=['POST'])
@jwt_required()
def create():
    current_id, role = _get_claims()
    data = request.get_json(silent=True) or {}

    # 🔒 Médecin ne peut pas créer de RDV
    if role == 'medecin':
        return jsonify({'success': False, 'message': 'Access denied'}), 403

    required = ['medecin_id', 'date', 'heure', 'motif']
    missing  = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({'success': False, 'message': f"Missing fields: {', '.join(missing)}"}), 400

    # 🔒 patient_id forcé depuis le JWT pour un patient (non falsifiable)
    if role == 'patient':
        patient_id = current_id
    else:
        if not data.get('patient_id'):
            return jsonify({'success': False, 'message': 'patient_id requis'}), 400
        patient_id = int(data['patient_id'])

    medecin_id = int(data['medecin_id'])

    # Vérifications d'existence
    medecin = execute_query("SELECT id FROM users WHERE id = %s AND role = 'medecin'", (medecin_id,), fetch_one=True)
    if not medecin:
        return jsonify({'success': False, 'message': 'Doctor not found'}), 404

    patient = execute_query("SELECT id FROM users WHERE id = %s AND role = 'patient'", (patient_id,), fetch_one=True)
    if not patient:
        return jsonify({'success': False, 'message': 'Patient not found'}), 404

    # Vérification doublon
    existing = execute_query(
        "SELECT id FROM appointments WHERE medecin_id=%s AND date=%s AND heure=%s AND statut != 'annule'",
        (medecin_id, data['date'], data['heure']), fetch_one=True
    )
    if existing:
        return jsonify({'success': False, 'message': 'This time slot is already booked'}), 409

    appt_id = execute_query("""
        INSERT INTO appointments (date, heure, motif, statut, patient_id, medecin_id, arrivee)
        VALUES (%s, %s, %s, 'en_attente', %s, %s, 'en_attente')
    """, (data['date'], data['heure'], data['motif'].strip(), patient_id, medecin_id))

    if appt_id:
        rdv = execute_query(SELECT_FULL + " WHERE a.id = %s", (appt_id,), fetch_one=True)
        return jsonify({'success': True, 'data': serialize_row(rdv)}), 201

    return jsonify({'success': False, 'message': 'Error during creation'}), 500


# ── PUT /api/appointments/<id> ────────────────────────────────────────────────
@appointments_bp.route('/<int:appt_id>', methods=['PUT'])
@jwt_required()
def update(appt_id):
    current_id, role = _get_claims()
    data = request.get_json(silent=True) or {}

    appt = execute_query("SELECT * FROM appointments WHERE id = %s", (appt_id,), fetch_one=True)
    if not appt:
        return jsonify({'success': False, 'message': 'RDV not found'}), 404

    # 🔒 Permissions strictes par rôle
    if role == 'patient':
        if current_id != appt['patient_id']:
            return jsonify({'success': False, 'message': 'Access denied'}), 403
        # Patient peut seulement annuler son RDV
        allowed_keys = {'statut'}
        if set(data.keys()) - allowed_keys:
            return jsonify({'success': False, 'message': 'Aunauthorized action for a patient'}), 403
        if data.get('statut') != 'annule':
            return jsonify({'success': False, 'message': 'Un patient ne peut qu\'annuler un RDV'}), 403

    elif role == 'medecin':
        if current_id != appt['medecin_id']:
            return jsonify({'success': False, 'message': 'Access denied'}), 403
        # Médecin peut confirmer, reporter, modifier arrivée
        allowed_keys = {'statut', 'arrivee', 'date', 'heure'}
        if set(data.keys()) - allowed_keys:
            return jsonify({'success': False, 'message': 'Action non autorisée pour un médecin'}), 403

    elif role != 'secretaire':
        return jsonify({'success': False, 'message': 'Access denied'}), 403

    # Construction de la requête UPDATE dynamique
    fields, params = [], []

    if 'statut' in data:
        if data['statut'] not in VALID_STATUTS:
            return jsonify({'success': False, 'message': f'Statut invalide'}), 400
        fields.append("statut = %s"); params.append(data['statut'])

    if 'arrivee' in data and role in ('medecin', 'secretaire'):
        if data['arrivee'] not in VALID_ARRIVEE:
            return jsonify({'success': False, 'message': 'Arrivée invalide'}), 400
        fields.append("arrivee = %s"); params.append(data['arrivee'])

    if 'date' in data and role in ('medecin', 'secretaire'):
        fields.append("date = %s"); params.append(data['date'])

    if 'heure' in data and role in ('medecin', 'secretaire'):
        fields.append("heure = %s"); params.append(data['heure'])

    if 'motif' in data and role == 'secretaire':
        fields.append("motif = %s"); params.append(data['motif'].strip())

    if not fields:
        return jsonify({'success': False, 'message': 'Aucun champ valide fourni'}), 400

    params.append(appt_id)
    execute_query(f"UPDATE appointments SET {', '.join(fields)} WHERE id = %s", params)
    return jsonify({'success': True, 'message': 'Rendez-vous mis à jour'})


# ── DELETE /api/appointments/<id>  (secrétaire uniquement) ───────────────────
@appointments_bp.route('/<int:appt_id>', methods=['DELETE'])
@jwt_required()
def delete(appt_id):
    _, role = _get_claims()
    # 🔒 Seule la secrétaire peut supprimer définitivement
    if role != 'secretaire':
        return jsonify({'success': False, 'message': 'Access denied'}), 403
    rows = execute_query("DELETE FROM appointments WHERE id = %s", (appt_id,))
    if rows:
        return jsonify({'success': True, 'message': 'RDV supprimé'})
    return jsonify({'success': False, 'message': 'RDV not found'}), 404
