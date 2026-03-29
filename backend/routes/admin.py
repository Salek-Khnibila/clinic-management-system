from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from db import execute_query

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def _require_admin():
    """Vérifie que l'utilisateur connecté est admin."""
    claims = get_jwt()
    return claims.get('role') == 'admin'


# ── GET /api/admin/users  (liste secrétaires + médecins) ──────────────────────
@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    if not _require_admin():
        return jsonify({'success': False, 'message': 'Access denied'}), 403
    users = execute_query("""
        SELECT id, prenom, nom, email, role, telephone, specialite, ville, created_at
        FROM users
        WHERE role IN ('secretaire', 'medecin')
        ORDER BY role, nom, prenom
    """)
    return jsonify({'success': True, 'data': [
        {**u, 'created_at': u['created_at'].isoformat() if u.get('created_at') else None}
        for u in (users or [])
    ]})


# ── DELETE /api/admin/users/<id> ──────────────────────────────────────────────
@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    if not _require_admin():
        return jsonify({'success': False, 'message': 'Access denied'}), 403

    user = execute_query(
        "SELECT id, role FROM users WHERE id = %s", (user_id,), fetch_one=True
    )
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    # 🔒 On ne peut supprimer que des secrétaires ou médecins
    if user['role'] not in ('secretaire', 'medecin'):
        return jsonify({'success': False, 'message': 'Cannot delete this account type'}), 403

    execute_query("DELETE FROM users WHERE id = %s", (user_id,))
    return jsonify({'success': True, 'message': 'User deleted successfully'})