from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from db import execute_query

patients_bp = Blueprint("patients", __name__, url_prefix="/api/patients")


def _get_claims():
    claims  = get_jwt()
    user_id = int(get_jwt_identity())
    role    = claims.get('role', '')
    return user_id, role


@patients_bp.route('', methods=['GET'])
@jwt_required()
def get_all():
    _, role = _get_claims()
    # 🔒 Only secretary and doctor can list all patients
    if role not in ('secretaire', 'medecin'):
        return jsonify({'success': False, 'message': 'Access denied'}), 403
    patients = execute_query(
        "SELECT id, prenom, nom, email, telephone, groupe_sanguin FROM users WHERE role='patient' ORDER BY nom, prenom"
    )
    return jsonify({'success': True, 'data': patients or []})


@patients_bp.route('/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_by_id(patient_id):
    current_id, role = _get_claims()
    # 🔒 A patient can only view their own profile
    if role == 'patient' and current_id != patient_id:
        return jsonify({'success': False, 'message': 'Access denied'}), 403
    patient = execute_query(
        "SELECT id, prenom, nom, email, telephone, groupe_sanguin FROM users WHERE id=%s AND role='patient'",
        (patient_id,), fetch_one=True
    )
    if not patient:
        return jsonify({'success': False, 'message': 'Patient not found'}), 404
    return jsonify({'success': True, 'data': patient})


@patients_bp.route('/<int:patient_id>', methods=['PUT'])
@jwt_required()
def update(patient_id):
    current_id, role = _get_claims()
    # 🔒 A patient can only update their own profile
    if role == 'patient' and current_id != patient_id:
        return jsonify({'success': False, 'message': 'Access denied'}), 403

    data = request.get_json(silent=True) or {}
    # 🔒 Allowed fields — never password or role
    ALLOWED = {'prenom', 'nom', 'telephone', 'groupe_sanguin'}
    fields, params = [], []
    for key, value in data.items():
        if key in ALLOWED:
            fields.append(f"{key} = %s")
            params.append(value)

    if not fields:
        return jsonify({'success': False, 'message': 'No valid fields provided'}), 400

    params.append(patient_id)
    rows = execute_query(
        f"UPDATE users SET {', '.join(fields)} WHERE id=%s AND role='patient'", params
    )
    if rows:
        return jsonify({'success': True, 'message': 'Profile updated'})
    return jsonify({'success': False, 'message': 'Patient not found'}), 404