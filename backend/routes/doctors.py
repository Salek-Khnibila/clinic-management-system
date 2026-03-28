from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from db import execute_query

doctors_bp = Blueprint("doctors", __name__, url_prefix="/api/doctors")

DOCTOR_FIELDS = "id, prenom, nom, email, specialite, ville, tarif, experience, note, avis, dispo"


@doctors_bp.route('', methods=['GET'])
@jwt_required()
def get_all():
    doctors = execute_query(f"SELECT {DOCTOR_FIELDS} FROM users WHERE role='medecin' ORDER BY nom, prenom")
    return jsonify({'success': True, 'data': doctors or []})


@doctors_bp.route('/<int:doctor_id>', methods=['GET'])
@jwt_required()
def get_by_id(doctor_id):
    doctor = execute_query(
        f"SELECT {DOCTOR_FIELDS} FROM users WHERE id=%s AND role='medecin'",
        (doctor_id,), fetch_one=True
    )
    if not doctor:
        return jsonify({'success': False, 'message': 'Médecin introuvable'}), 404
    return jsonify({'success': True, 'data': doctor})


@doctors_bp.route('/specialty/<string:specialty>', methods=['GET'])
@jwt_required()
def get_by_specialty(specialty):
    doctors = execute_query(
        f"SELECT {DOCTOR_FIELDS} FROM users WHERE role='medecin' AND specialite LIKE %s ORDER BY nom",
        (f'%{specialty}%',)
    )
    return jsonify({'success': True, 'data': doctors or []})


@doctors_bp.route('/city/<string:city>', methods=['GET'])
@jwt_required()
def get_by_city(city):
    doctors = execute_query(
        f"SELECT {DOCTOR_FIELDS} FROM users WHERE role='medecin' AND ville LIKE %s ORDER BY nom",
        (f'%{city}%',)
    )
    return jsonify({'success': True, 'data': doctors or []})


@doctors_bp.route('/search', methods=['GET'])
@jwt_required()
def search():
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify({'success': False, 'message': 'Missing parameter'}), 400
    p = f'%{q}%'
    doctors = execute_query(
        f"SELECT {DOCTOR_FIELDS} FROM users WHERE role='medecin' AND (nom LIKE %s OR prenom LIKE %s OR specialite LIKE %s OR ville LIKE %s) ORDER BY nom",
        (p, p, p, p)
    )
    return jsonify({'success': True, 'data': doctors or []})
