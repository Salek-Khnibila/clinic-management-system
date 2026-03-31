from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from db import execute_query

doctors_bp = Blueprint("doctors", __name__, url_prefix="/api/doctors")

DOCTOR_FIELDS = "id, prenom, nom, email, specialite, ville, tarif, experience, dispo"

# Requête qui joint les reviews pour calculer note moyenne et nombre d'avis
def get_doctors_with_reviews(where_clause="", params=()):
    query = f"""
        SELECT
            u.id, u.prenom, u.nom, u.email,
            u.specialite, u.ville, u.tarif, u.experience, u.dispo,
            ROUND(COALESCE(AVG(r.note), 0), 1) AS note,
            COUNT(r.id)                         AS avis
        FROM users u
        LEFT JOIN reviews r ON r.medecin_id = u.id
        WHERE u.role = 'medecin'
        {where_clause}
        GROUP BY u.id
        ORDER BY u.nom, u.prenom
    """
    return execute_query(query, params)


@doctors_bp.route('', methods=['GET'])
@jwt_required()
def get_all():
    doctors = get_doctors_with_reviews()
    return jsonify({'success': True, 'data': doctors or []})


@doctors_bp.route('/<int:doctor_id>', methods=['GET'])
@jwt_required()
def get_by_id(doctor_id):
    doctors = get_doctors_with_reviews("AND u.id = %s", (doctor_id,))
    if not doctors:
        return jsonify({'success': False, 'message': 'Médecin introuvable'}), 404
    return jsonify({'success': True, 'data': doctors[0]})


@doctors_bp.route('/specialty/<string:specialty>', methods=['GET'])
@jwt_required()
def get_by_specialty(specialty):
    doctors = get_doctors_with_reviews("AND u.specialite LIKE %s", (f'%{specialty}%',))
    return jsonify({'success': True, 'data': doctors or []})


@doctors_bp.route('/city/<string:city>', methods=['GET'])
@jwt_required()
def get_by_city(city):
    doctors = get_doctors_with_reviews("AND u.ville LIKE %s", (f'%{city}%',))
    return jsonify({'success': True, 'data': doctors or []})


@doctors_bp.route('/search', methods=['GET'])
@jwt_required()
def search():
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify({'success': False, 'message': 'Missing parameter'}), 400
    p = f'%{q}%'
    doctors = get_doctors_with_reviews(
        "AND (u.nom LIKE %s OR u.prenom LIKE %s OR u.specialite LIKE %s OR u.ville LIKE %s)",
        (p, p, p, p)
    )
    return jsonify({'success': True, 'data': doctors or []})


# ── Endpoint pour soumettre un avis ──────────────────────────────────────────
@doctors_bp.route('/<int:doctor_id>/reviews', methods=['POST'])
@jwt_required()
def add_review(doctor_id):
    from flask_jwt_extended import get_jwt_identity
    patient_id = get_jwt_identity()
    data = request.get_json()
    note = data.get('note')
    commentaire = data.get('commentaire', '')

    if not note or not (1 <= int(note) <= 5):
        return jsonify({'success': False, 'message': 'Note invalide (1-5)'}), 400

    # Vérifie que le patient a eu un RDV confirmé avec ce médecin
    rdv = execute_query(
        "SELECT id FROM appointments WHERE patient_id=%s AND medecin_id=%s AND statut='confirme' LIMIT 1",
        (patient_id, doctor_id), fetch_one=True
    )
    if not rdv:
        return jsonify({'success': False, 'message': 'Vous devez avoir eu un rendez-vous confirmé'}), 403

    execute_query(
        """INSERT INTO reviews (medecin_id, patient_id, note, commentaire)
           VALUES (%s, %s, %s, %s)
           ON DUPLICATE KEY UPDATE note=%s, commentaire=%s""",
        (doctor_id, patient_id, note, commentaire, note, commentaire)
    )
    return jsonify({'success': True, 'message': 'Avis enregistré'})


# ── Endpoint pour lire les avis d'un médecin ─────────────────────────────────
@doctors_bp.route('/<int:doctor_id>/reviews', methods=['GET'])
@jwt_required()
def get_reviews(doctor_id):
    reviews = execute_query(
        """SELECT r.note, r.commentaire, r.created_at,
                  u.prenom, u.nom
           FROM reviews r
           JOIN users u ON u.id = r.patient_id
           WHERE r.medecin_id = %s
           ORDER BY r.created_at DESC""",
        (doctor_id,)
    )
    return jsonify({'success': True, 'data': reviews or []})