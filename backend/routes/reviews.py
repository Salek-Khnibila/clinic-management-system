from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from db import execute_query, serialize_row
 
reviews_bp = Blueprint("reviews", __name__, url_prefix="/api/reviews")
 
 
def _get_identity():
    return int(get_jwt_identity()), get_jwt().get("role", "")
 
 
# ── POST /api/reviews  ────────────────────────────────────────────────────────
# Soumet un avis. Réservé aux patients ayant un RDV confirmé avec ce médecin.
@reviews_bp.route("", methods=["POST"])
@jwt_required()
def create_review():
    user_id, role = _get_identity()
 
    if role != "patient":
        return jsonify({"success": False, "message": "Réservé aux patients"}), 403
 
    if not request.is_json:
        return jsonify({"success": False, "message": "JSON requis"}), 415
 
    data        = request.get_json(silent=True) or {}
    medecin_id  = data.get("medecin_id")
    note        = data.get("note")
    commentaire = (data.get("commentaire") or "").strip()
 
    # ── Validation ────────────────────────────────────────────────────────────
    if not medecin_id or not note or not commentaire:
        return jsonify({"success": False, "message": "medecin_id, note et commentaire sont requis"}), 400
 
    try:
        note = int(note)
    except (TypeError, ValueError):
        return jsonify({"success": False, "message": "La note doit être un entier"}), 400
 
    if note < 1 or note > 5:
        return jsonify({"success": False, "message": "La note doit être entre 1 et 5"}), 400
 
    if len(commentaire) > 1000:
        return jsonify({"success": False, "message": "Commentaire trop long (max 1000 caractères)"}), 400
 
    # ── Vérification éligibilité : RDV confirmé requis ────────────────────────
    rdv = execute_query(
        """SELECT id FROM appointments
           WHERE patient_id = %s AND medecin_id = %s AND statut = 'confirme'
           LIMIT 1""",
        (user_id, medecin_id), fetch_one=True
    )
    if not rdv:
        return jsonify({
            "success": False,
            "message": "Vous devez avoir un rendez-vous confirmé pour évaluer ce médecin"
        }), 403
 
    # ── Vérification doublon ──────────────────────────────────────────────────
    existing = execute_query(
        "SELECT id FROM reviews WHERE patient_id = %s AND medecin_id = %s",
        (user_id, medecin_id), fetch_one=True
    )
    if existing:
        return jsonify({"success": False, "message": "Vous avez déjà évalué ce médecin"}), 409
 
    # ── Insertion ─────────────────────────────────────────────────────────────
    new_id = execute_query(
        """INSERT INTO reviews (patient_id, medecin_id, note, commentaire)
           VALUES (%s, %s, %s, %s)""",
        (user_id, medecin_id, note, commentaire)
    )
 
    # ── Mise à jour note moyenne + compteur avis sur users ────────────────────
    execute_query(
        """UPDATE users
           SET note = (
               SELECT ROUND(AVG(r.note), 1)
               FROM reviews r WHERE r.medecin_id = %s
           ),
           avis = (
               SELECT COUNT(*) FROM reviews r WHERE r.medecin_id = %s
           )
           WHERE id = %s""",
        (medecin_id, medecin_id, medecin_id)
    )
 
    # ── Retourne l'avis complet avec infos patient ────────────────────────────
    review = execute_query(
        """SELECT rv.*, u.prenom AS patient_prenom, u.nom AS patient_nom
           FROM reviews rv
           JOIN users u ON rv.patient_id = u.id
           WHERE rv.id = %s""",
        (new_id,), fetch_one=True
    )
 
    return jsonify({"success": True, "data": serialize_row(review)}), 201
 
 
# ── GET /api/reviews/doctor/<id>  ─────────────────────────────────────────────
# Retourne tous les avis d'un médecin, du plus récent au plus ancien.
@reviews_bp.route("/doctor/<int:medecin_id>", methods=["GET"])
@jwt_required()
def get_doctor_reviews(medecin_id):
    reviews = execute_query(
        """SELECT rv.id, rv.note, rv.commentaire, rv.created_at,
                  rv.patient_id,
                  u.prenom AS patient_prenom, u.nom AS patient_nom
           FROM reviews rv
           JOIN users u ON rv.patient_id = u.id
           WHERE rv.medecin_id = %s
           ORDER BY rv.created_at DESC""",
        (medecin_id,)
    )
    return jsonify({
        "success": True,
        "data": [serialize_row(r) for r in (reviews or [])]
    })
 
 
# ── GET /api/reviews/my/<medecin_id>  ────────────────────────────────────────
# Vérifie si le patient connecté a déjà évalué ce médecin.
@reviews_bp.route("/my/<int:medecin_id>", methods=["GET"])
@jwt_required()
def get_my_review(medecin_id):
    user_id, role = _get_identity()
    if role != "patient":
        return jsonify({"success": False, "message": "Réservé aux patients"}), 403
 
    review = execute_query(
        "SELECT * FROM reviews WHERE patient_id = %s AND medecin_id = %s",
        (user_id, medecin_id), fetch_one=True
    )
    return jsonify({"success": True, "data": serialize_row(review) if review else None})
