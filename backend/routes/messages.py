from datetime import date
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from db import execute_query, serialize_row

messages_bp = Blueprint("messages", __name__, url_prefix="/api/messages")

SELECT_FULL = """
    SELECT m.*, p.prenom AS patient_prenom, p.nom AS patient_nom
    FROM messages m
    LEFT JOIN users p ON m.to_patient_id = p.id
"""


def _get_claims():
    claims  = get_jwt()
    user_id = int(get_jwt_identity())
    role    = claims.get('role', '')
    email   = claims.get('email', '')
    return user_id, role, email


# ── GET /api/messages  (secrétaire uniquement) ────────────────────────────────
@messages_bp.route('', methods=['GET'])
@jwt_required()
def get_all():
    _, role, _ = _get_claims()
    if role != 'secretaire':
        return jsonify({'success': False, 'message': 'Access denied'}), 403
    msgs = execute_query(SELECT_FULL + " ORDER BY m.date DESC")
    return jsonify({'success': True, 'data': [serialize_row(m) for m in (msgs or [])]})


# ── GET /api/messages/patient/<id> ────────────────────────────────────────────
@messages_bp.route('/patient/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_patient_messages(patient_id):
    current_id, role, _ = _get_claims()
    # 🔒 Patient : ses propres messages uniquement | Médecin : aucun accès
    if role == 'patient' and current_id != patient_id:
        return jsonify({'success': False, 'message': 'Access denied'}), 403
    if role == 'medecin':
        return jsonify({'success': False, 'message': 'Access denied'}), 403
    msgs = execute_query(
        SELECT_FULL + " WHERE m.to_patient_id = %s ORDER BY m.date DESC",
        (patient_id,)
    )
    return jsonify({'success': True, 'data': [serialize_row(m) for m in (msgs or [])]})


# ── POST /api/messages  (secrétaire UNIQUEMENT) ───────────────────────────────
@messages_bp.route('', methods=['POST'])
@jwt_required()
def send():
    _, role, sender_email = _get_claims()
    # 🔒 Seule la secrétaire peut envoyer des messages
    if role != 'secretaire':
        return jsonify({'success': False, 'message': 'Access denied'}), 403

    data = request.get_json(silent=True) or {}
    required = ['to_patient_id', 'sujet', 'corps']
    missing  = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({'success': False, 'message': f"Missing fields: {', '.join(missing)}"}), 400

    to_patient_id = int(data['to_patient_id'])
    patient = execute_query(
        "SELECT id FROM users WHERE id=%s AND role='patient'", (to_patient_id,), fetch_one=True
    )
    if not patient:
        return jsonify({'success': False, 'message': 'Recipient patient not found'}), 404

    msg_id = execute_query("""
        INSERT INTO messages (sender, to_patient_id, sujet, corps, date)
        VALUES (%s, %s, %s, %s, %s)
    """, (
        # 🔒 sender extrait du JWT, jamais du body
        sender_email,
        to_patient_id,
        data['sujet'].strip(),
        data['corps'].strip(),
        data.get('date') or date.today().isoformat(),
    ))

    if msg_id:
        msg = execute_query(SELECT_FULL + " WHERE m.id = %s", (msg_id,), fetch_one=True)
        return jsonify({'success': True, 'data': serialize_row(msg)}), 201
    return jsonify({'success': False, 'message': 'Error sending'}), 500


# ── PUT /api/messages/<id>/read ───────────────────────────────────────────────
@messages_bp.route('/<int:msg_id>/read', methods=['PUT'])
@jwt_required()
def mark_read(msg_id):
    current_id, role, _ = _get_claims()

    msg = execute_query("SELECT * FROM messages WHERE id=%s", (msg_id,), fetch_one=True)
    if not msg:
        return jsonify({'success': False, 'message': 'Message introuvable'}), 404

    # 🔒 Seul le destinataire ou la secrétaire peut marquer comme lu
    if role == 'patient' and current_id != msg['to_patient_id']:
        return jsonify({'success': False, 'message': 'Access denied'}), 403
    if role == 'medecin':
        return jsonify({'success': False, 'message': 'Access denied'}), 403

    execute_query("UPDATE messages SET lu = TRUE WHERE id = %s", (msg_id,))
    return jsonify({'success': True, 'message': 'Message marqué comme lu'})
