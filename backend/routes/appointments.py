from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from db import execute_query, serialize_row

appointments_bp = Blueprint("appointments", __name__, url_prefix="/api/appointments")

VALID_STATUTS = ('en_attente', 'confirme', 'annule', 'reporte')
VALID_ARRIVEE = ('en_attente', 'en_salle', 'absent')

SELECT_FULL = """
    SELECT a.*,
           p.prenom AS patient_prenom, p.nom AS patient_nom, p.telephone AS patient_telephone,
           m.prenom AS medecin_prenom, m.nom AS medecin_nom, m.specialite
    FROM appointments a
    LEFT JOIN users p ON a.patient_id = p.id
    LEFT JOIN users m ON a.medecin_id = m.id
"""


def _get_claims():
    """Returns (user_id:int, role:str) from JWT — never from request body."""
    claims  = get_jwt()
    user_id = int(get_jwt_identity())
    role    = claims.get('role', '')
    return user_id, role


# ── GET /api/appointments  (secretaire only) ──────────────────────────────────
@appointments_bp.route('', methods=['GET'])
@jwt_required()
def get_all():
    _, role = _get_claims()
    # 🔒 Only the secretary can view all appointments
    if role != 'secretaire':
        return jsonify({'success': False, 'message': 'Access denied'}), 403
    rdvs = execute_query(SELECT_FULL + " ORDER BY a.date DESC, a.heure DESC")
    return jsonify({'success': True, 'data': [serialize_row(r) for r in (rdvs or [])]})


# ── GET /api/appointments/user/<id> ──────────────────────────────────────────
@appointments_bp.route('/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_appointments(user_id):
    current_id, role = _get_claims()

    # 🔒 A user can only view their own appointments
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

    # 🔒 Doctor cannot create appointments
    if role == 'medecin':
        return jsonify({'success': False, 'message': 'Access denied'}), 403

    required = ['medecin_id', 'date', 'heure', 'motif']
    missing  = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({'success': False, 'message': f"Missing fields: {', '.join(missing)}"}), 400

    # 🔒 patient_id is forced from JWT for patients (cannot be forged)
    if role == 'patient':
        patient_id = current_id
    else:
        if not data.get('patient_id'):
            return jsonify({'success': False, 'message': 'patient_id is required'}), 400
        patient_id = int(data['patient_id'])

    medecin_id = int(data['medecin_id'])

    # Existence checks
    medecin = execute_query("SELECT id FROM users WHERE id = %s AND role = 'medecin'", (medecin_id,), fetch_one=True)
    if not medecin:
        return jsonify({'success': False, 'message': 'Doctor not found'}), 404

    patient = execute_query("SELECT id FROM users WHERE id = %s AND role = 'patient'", (patient_id,), fetch_one=True)
    if not patient:
        return jsonify({'success': False, 'message': 'Patient not found'}), 404

    # ── 🔒 Check 1: Max 3 active appointments per patient ────────────────────
    MAX_ACTIVE_RDV = 3
    active_count = execute_query("""
        SELECT COUNT(*) AS cnt FROM appointments
        WHERE patient_id = %s AND statut IN ('en_attente', 'confirme')
    """, (patient_id,), fetch_one=True)

    if active_count and active_count['cnt'] >= MAX_ACTIVE_RDV:
        return jsonify({
            'success': False,
            'message': f'Limit of {MAX_ACTIVE_RDV} active appointments reached. Please cancel an existing appointment before creating a new one.',
            'code': 'MAX_RDV_REACHED'
        }), 409

    # ── 🔒 Check 2: Progressive minimum delay between patient appointments ────
    # Delay = number_of_active_appointments × 1 hour
    if active_count and active_count['cnt'] > 0:
        from datetime import datetime, timedelta
        delay_hours = int(active_count['cnt'])
        last_rdv = execute_query("""
            SELECT date, heure FROM appointments
            WHERE patient_id = %s AND statut IN ('en_attente', 'confirme')
            ORDER BY date DESC, heure DESC LIMIT 1
        """, (patient_id,), fetch_one=True)

        if last_rdv:
            h = last_rdv['heure']
            last_heure_str = f"{h.seconds // 3600:02}:{(h.seconds % 3600) // 60:02}" if hasattr(h, 'seconds') else str(h)[:5]
            last_dt  = datetime.strptime(f"{last_rdv['date']} {last_heure_str}", "%Y-%m-%d %H:%M")
            new_dt   = datetime.strptime(f"{data['date']} {data['heure']}", "%Y-%m-%d %H:%M")
            if abs(new_dt - last_dt) < timedelta(hours=delay_hours):
                return jsonify({
                    'success': False,
                    'message': f'A minimum delay of {delay_hours}h is required between your appointments (you have {delay_hours} active appointment(s)).',
                    'code': 'DELAY_REQUIRED'
                }), 409

    # ── 🔒 Check 3: Exact slot conflict for doctor ────────────────────────────
    existing = execute_query(
        "SELECT id FROM appointments WHERE medecin_id=%s AND date=%s AND heure=%s AND statut != 'annule'",
        (medecin_id, data['date'], data['heure']), fetch_one=True
    )
    if existing:
        return jsonify({'success': False, 'message': 'This time slot is already reserved for this doctor.', 'code': 'SLOT_TAKEN'}), 409

    # ── 🔒 Check 4: Doctor schedule conflict (30 min buffer) ─────────────────
    try:
        from datetime import datetime, timedelta
        new_dt       = datetime.strptime(f"{data['date']} {data['heure']}", "%Y-%m-%d %H:%M")
        buffer_start = (new_dt - timedelta(minutes=29)).strftime("%H:%M")
        buffer_end   = (new_dt + timedelta(minutes=29)).strftime("%H:%M")
        conflict = execute_query("""
            SELECT id FROM appointments
            WHERE medecin_id = %s AND date = %s AND statut != 'annule'
              AND TIME(heure) > %s AND TIME(heure) < %s
        """, (medecin_id, data['date'], buffer_start, buffer_end), fetch_one=True)
        if conflict:
            return jsonify({
                'success': False,
                'message': 'This time slot is too close to another appointment (30 minutes minimum between consultations).',
                'code': 'CONFLICT'
            }), 409
    except Exception:
        pass

    appt_id = execute_query("""
        INSERT INTO appointments (date, heure, motif, statut, patient_id, medecin_id, arrivee)
        VALUES (%s, %s, %s, 'en_attente', %s, %s, 'en_attente')
    """, (data['date'], data['heure'], data['motif'].strip(), patient_id, medecin_id))

    if appt_id:
        rdv = execute_query(SELECT_FULL + " WHERE a.id = %s", (appt_id,), fetch_one=True)
        return jsonify({'success': True, 'data': serialize_row(rdv)}), 201

    return jsonify({'success': False, 'message': 'Error creating appointment'}), 500


# ── PUT /api/appointments/<id> ────────────────────────────────────────────────
@appointments_bp.route('/<int:appt_id>', methods=['PUT'])
@jwt_required()
def update(appt_id):
    current_id, role = _get_claims()
    data = request.get_json(silent=True) or {}

    appt = execute_query("SELECT * FROM appointments WHERE id = %s", (appt_id,), fetch_one=True)
    if not appt:
        return jsonify({'success': False, 'message': 'Appointment not found'}), 404

    # 🔒 Strict role-based permissions
    if role == 'patient':
        if current_id != appt['patient_id']:
            return jsonify({'success': False, 'message': 'Access denied'}), 403
        # Patient can only cancel their appointment
        allowed_keys = {'statut'}
        if set(data.keys()) - allowed_keys:
            return jsonify({'success': False, 'message': 'Action not allowed for a patient'}), 403
        if data.get('statut') != 'annule':
            return jsonify({'success': False, 'message': 'A patient can only cancel an appointment'}), 403

    elif role == 'medecin':
        if current_id != appt['medecin_id']:
            return jsonify({'success': False, 'message': 'Access denied'}), 403
        # Doctor can confirm, reschedule, update arrival
        allowed_keys = {'statut', 'arrivee', 'date', 'heure'}
        if set(data.keys()) - allowed_keys:
            return jsonify({'success': False, 'message': 'Action not allowed for a doctor'}), 403

    elif role != 'secretaire':
        return jsonify({'success': False, 'message': 'Access denied'}), 403

    # Dynamic UPDATE query
    fields, params = [], []

    if 'statut' in data:
        if data['statut'] not in VALID_STATUTS:
            return jsonify({'success': False, 'message': 'Invalid status'}), 400
        fields.append("statut = %s"); params.append(data['statut'])

    if 'arrivee' in data and role in ('medecin', 'secretaire'):
        if data['arrivee'] not in VALID_ARRIVEE:
            return jsonify({'success': False, 'message': 'Invalid arrival status'}), 400
        fields.append("arrivee = %s"); params.append(data['arrivee'])

    if 'date' in data and role in ('medecin', 'secretaire'):
        fields.append("date = %s"); params.append(data['date'])

    if 'heure' in data and role in ('medecin', 'secretaire'):
        fields.append("heure = %s"); params.append(data['heure'])

    if 'motif' in data and role == 'secretaire':
        fields.append("motif = %s"); params.append(data['motif'].strip())

    if not fields:
        return jsonify({'success': False, 'message': 'No valid fields provided'}), 400

    params.append(appt_id)
    execute_query(f"UPDATE appointments SET {', '.join(fields)} WHERE id = %s", params)
    return jsonify({'success': True, 'message': 'Appointment updated'})


# ── DELETE /api/appointments/<id>  (secretaire only) ─────────────────────────
@appointments_bp.route('/<int:appt_id>', methods=['DELETE'])
@jwt_required()
def delete(appt_id):
    _, role = _get_claims()
    # 🔒 Only the secretary can permanently delete
    if role != 'secretaire':
        return jsonify({'success': False, 'message': 'Access denied'}), 403
    rows = execute_query("DELETE FROM appointments WHERE id = %s", (appt_id,))
    if rows:
        return jsonify({'success': True, 'message': 'Appointment deleted'})
    return jsonify({'success': False, 'message': 'Appointment not found'}), 404