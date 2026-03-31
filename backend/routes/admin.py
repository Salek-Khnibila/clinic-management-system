"""
routes/admin.py — Admin-only endpoints (hardened)
Changes vs original:
  - Password complexity enforced on change-password
  - Every password change logged via log_security_event
  - GET /users supports ?page and ?per_page query params (pagination)
  - Content-Type enforced on mutating endpoints
  - Admin email double-checked to prevent privilege escalation
"""

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from db import execute_query
from security_utils import log_security_event, sanitize_text
from validators import validate_password
import bcrypt

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

ADMIN_EMAIL = 'admin@clinique.com'


def _require_admin():
    """
    Returns the admin's user record if the caller is the unique admin,
    or None otherwise.
    🔒 Double-checks both role claim AND the actual email in the DB —
       a forged token claiming role=admin for a different user is rejected.
    """
    claims  = get_jwt()
    user_id = int(get_jwt_identity())

    if claims.get('role') != 'admin':
        return None

    user = execute_query(
        "SELECT id, email, role FROM users WHERE id = %s AND role = 'admin'",
        (user_id,), fetch_one=True
    )
    # Extra guard: only the canonical admin account
    if not user or user['email'] != ADMIN_EMAIL:
        return None

    return user


def _require_json():
    if not request.is_json:
        return jsonify({'success': False, 'message': 'Content-Type must be application/json'}), 415
    return None


# ── GET /api/admin/users  ─────────────────────────────────────────────────────
@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    if not _require_admin():
        return jsonify({'success': False, 'message': 'Access denied'}), 403

    # 🔒 Pagination — default 50 per page, max 100
    try:
        page     = max(1, int(request.args.get('page', 1)))
        per_page = min(100, max(1, int(request.args.get('per_page', 50))))
    except ValueError:
        page, per_page = 1, 50

    offset = (page - 1) * per_page

    users = execute_query("""
        SELECT id, prenom, nom, email, role, telephone, specialite, ville, created_at
        FROM users
        WHERE role IN ('secretaire', 'medecin')
        ORDER BY role, nom, prenom
        LIMIT %s OFFSET %s
    """, (per_page, offset))

    total_row = execute_query(
        "SELECT COUNT(*) AS cnt FROM users WHERE role IN ('secretaire', 'medecin')",
        fetch_one=True
    )
    total = total_row['cnt'] if total_row else 0

    return jsonify({
        'success': True,
        'data': [
            {**u, 'created_at': u['created_at'].isoformat() if u.get('created_at') else None}
            for u in (users or [])
        ],
        'pagination': {
            'page':       page,
            'per_page':   per_page,
            'total':      total,
            'total_pages': (total + per_page - 1) // per_page,
        },
    })


# ── DELETE /api/admin/users/<id> ──────────────────────────────────────────────
@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    admin = _require_admin()
    if not admin:
        return jsonify({'success': False, 'message': 'Access denied'}), 403

    user = execute_query(
        'SELECT id, role, email FROM users WHERE id = %s', (user_id,), fetch_one=True
    )
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    if user['role'] not in ('secretaire', 'medecin'):
        return jsonify({'success': False, 'message': 'Cannot delete this account type'}), 403

    execute_query('DELETE FROM users WHERE id = %s', (user_id,))

    log_security_event('USER_DELETED', user_id=admin['id'], details={
        'deleted_user_id':    user_id,
        'deleted_user_email': user['email'],
        'deleted_user_role':  user['role'],
    })

    return jsonify({'success': True, 'message': 'User deleted successfully'})


# ── PUT /api/admin/users/<id>/password ────────────────────────────────────────
@admin_bp.route('/users/<int:user_id>/password', methods=['PUT'])
@jwt_required()
def change_user_password(user_id):
    """
    Admin changes the password of a secretary or doctor.
    🔒 Password complexity enforced.
    🔒 Every change is audit-logged.
    """
    err = _require_json()
    if err:
        return err

    admin = _require_admin()
    if not admin:
        return jsonify({'success': False, 'message': 'Access denied'}), 403

    data         = request.get_json(silent=True) or {}
    new_password = data.get('new_password', '')

    if not new_password:
        return jsonify({'success': False, 'message': 'new_password is required'}), 400

    # 🔒 Enforce full complexity rules
    ok, msg = validate_password(new_password)
    if not ok:
        return jsonify({'success': False, 'message': msg}), 400

    user = execute_query(
        'SELECT id, role, email FROM users WHERE id = %s', (user_id,), fetch_one=True
    )
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    if user['role'] not in ('secretaire', 'medecin'):
        return jsonify({'success': False, 'message': 'Cannot modify this account type'}), 403

    hashed = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt(rounds=12)).decode()
    execute_query('UPDATE users SET password = %s WHERE id = %s', (hashed, user_id))

    # 🔒 Audit log — who changed whose password
    log_security_event('ADMIN_PASSWORD_CHANGED', user_id=admin['id'], details={
        'target_user_id':    user_id,
        'target_user_email': user['email'],
        'target_user_role':  user['role'],
    })

    return jsonify({'success': True, 'message': 'Password updated successfully'})
# Ajout à backend/routes/admin.py
# Collez cette route à la fin du fichier, après change_user_password()

# ── PUT /api/admin/profile/password ──────────────────────────────────────────
@admin_bp.route('/profile/password', methods=['PUT'])
@jwt_required()
def change_own_password():
    """
    L'admin change son propre mot de passe.
    Requiert l'ancien mot de passe pour confirmer l'identité.
    🔒 Vérifie l'ancien mot de passe avant d'appliquer le changement.
    🔒 Enforce la complexité du nouveau mot de passe.
    🔒 Audit-log systématique.
    """
    err = _require_json()
    if err:
        return err

    admin = _require_admin()
    if not admin:
        return jsonify({'success': False, 'message': 'Access denied'}), 403

    data         = request.get_json(silent=True) or {}
    old_password = data.get('old_password', '').strip()
    new_password = data.get('new_password', '').strip()

    if not old_password or not new_password:
        return jsonify({
            'success': False,
            'message': 'old_password et new_password sont requis'
        }), 400

    # Récupère le hash actuel depuis la DB
    row = execute_query(
        'SELECT password FROM users WHERE id = %s', (admin['id'],), fetch_one=True
    )
    if not row:
        return jsonify({'success': False, 'message': 'Compte introuvable'}), 404

    # 🔒 Vérification de l'ancien mot de passe
    if not bcrypt.checkpw(old_password.encode(), row['password'].encode()):
        log_security_event('ADMIN_WRONG_OLD_PASSWORD', user_id=admin['id'], details={})
        return jsonify({'success': False, 'message': 'Mot de passe actuel incorrect'}), 401

    # 🔒 Empêche la réutilisation du même mot de passe
    if bcrypt.checkpw(new_password.encode(), row['password'].encode()):
        return jsonify({
            'success': False,
            'message': 'Le nouveau mot de passe doit être différent de l\'actuel'
        }), 400

    # 🔒 Complexité
    ok, msg = validate_password(new_password)
    if not ok:
        return jsonify({'success': False, 'message': msg}), 400

    hashed = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt(rounds=12)).decode()
    execute_query('UPDATE users SET password = %s WHERE id = %s', (hashed, admin['id']))

    log_security_event('ADMIN_CHANGED_OWN_PASSWORD', user_id=admin['id'], details={
        'email': admin['email'],
    })

    return jsonify({'success': True, 'message': 'Mot de passe mis à jour avec succès'})