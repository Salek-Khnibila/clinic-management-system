from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
import bcrypt
from db import execute_query
from security_utils import log_security_event, rate_limit, validate_input, get_client_ip, detect_brute_force, log_request_response
from validators import validate_email, validate_password, validate_user_creation, sanitize_text

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def _make_user_response(user: dict) -> dict:
    """Retourne uniquement les champs publics d'un utilisateur."""
    return {
        'id':     user['id'],
        'prenom': user['prenom'],
        'nom':    user['nom'],
        'email':  user['email'],
        'role':   user['role'],
    }


# ── POST /api/auth/login ──────────────────────────────────────────────────────
@auth_bp.route('/login', methods=['POST'])
@rate_limit(max_requests=10, window_seconds=300)
@log_request_response
def login():
    try:
        client_ip = get_client_ip()

        if detect_brute_force(client_ip):
            log_security_event('BRUTE_FORCE_DETECTED', ip_address=client_ip)
            return jsonify({'success': False, 'message': 'Too many attempts. Please try again later.'}), 429

        data     = request.get_json(silent=True) or {}
        email    = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not all([validate_input(email), validate_input(password)]):
            log_security_event('INPUT_VALIDATION_FAILED', ip_address=client_ip)
            return jsonify({'success': False, 'message': 'Invalid data'}), 400

        if not email or not password:
            return jsonify({'success': False, 'message': 'Email and password required'}), 400

        # 🔒 Le rôle est détecté automatiquement côté serveur — jamais envoyé par le client
        user = execute_query(
            "SELECT * FROM users WHERE email = %s",
            (email,), fetch_one=True
        )

        if not user or not bcrypt.checkpw(password.encode(), user['password'].encode()):
            log_security_event('LOGIN_FAILED', ip_address=client_ip, details={'email': email})
            # 🔒 Message identique pour éviter l'énumération des utilisateurs
            return jsonify({'success': False, 'message': 'Incorrect credentials'}), 401

        claims   = {'email': user['email'], 'role': user['role'], 'prenom': user['prenom'], 'nom': user['nom']}
        identity = str(user['id'])

        access_token  = create_access_token(identity=identity, additional_claims=claims)
        refresh_token = create_refresh_token(identity=identity, additional_claims=claims)

        log_security_event('LOGIN_SUCCESS', user_id=user['id'], ip_address=client_ip)
        return jsonify({
            'success':      True,
            'user':         _make_user_response(user),
            'token':        access_token,
            'refreshToken': refresh_token,
        })

    except Exception as e:
        log_security_event('LOGIN_ERROR', ip_address=get_client_ip(), details={'error': str(e)})
        return jsonify({'success': False, 'message': 'Server error'}), 500


# ── POST /api/auth/register  (inscription patient publique) ───────────────────
@auth_bp.route('/register', methods=['POST'])
def register():
    """Inscription publique — patients uniquement."""
    try:
        data = request.get_json(silent=True) or {}

        # 🔒 Validation stricte des entrées
        errors = validate_user_creation(data, 'patient')
        if errors:
            return jsonify({'success': False, 'message': errors[0], 'errors': errors}), 400

        # 🔒 Seuls les patients peuvent s'inscrire publiquement
        role = data.get('role', 'patient')
        if role != 'patient':
            return jsonify({'success': False, 'message': 'Public registration is for patients only.'}), 403

        email = data['email'].strip().lower()

        existing = execute_query("SELECT id FROM users WHERE email = %s", (email,), fetch_one=True)
        if existing:
            return jsonify({'success': False, 'message': 'This email address is already in use.'}), 409

        hashed = bcrypt.hashpw(data['password'].encode(), bcrypt.gensalt(rounds=12)).decode()

        user_id = execute_query("""
            INSERT INTO users (prenom, nom, email, password, role, telephone, groupe_sanguin)
            VALUES (%s, %s, %s, %s, 'patient', %s, %s)
        """, (
            sanitize_text(data['prenom'], 100),
            sanitize_text(data['nom'], 100),
            email,
            hashed,
            data.get('telephone', ''),
            data.get('groupe_sanguin'),
        ))

        if user_id:
            return jsonify({'success': True, 'message': 'Account successfully created'}), 201
        return jsonify({'success': False, 'message': 'Error during creation'}), 500

    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500


# ── POST /api/auth/create-user  (admin et secrétaire) ────────────────────────
@auth_bp.route('/create-user', methods=['POST'])
@jwt_required()
def create_user():
    """Admin → secrétaire/médecin | Secrétaire → médecin uniquement."""
    try:
        claims      = get_jwt()
        caller_role = claims.get('role', '')

        if caller_role not in ('admin', 'secretaire'):
            return jsonify({'success': False, 'message': 'Access denied'}), 403

        data        = request.get_json(silent=True) or {}
        target_role = data.get('role', '')

        if caller_role == 'admin' and target_role not in ('secretaire', 'medecin'):
            return jsonify({'success': False, 'message': 'Admin can only create secretaire or medecin accounts.'}), 403
        if caller_role == 'secretaire' and target_role != 'medecin':
            return jsonify({'success': False, 'message': 'Secretaire can only create medecin accounts.'}), 403

        # 🔒 Validation stricte
        errors = validate_user_creation(data, target_role)
        if errors:
            return jsonify({'success': False, 'message': errors[0], 'errors': errors}), 400

        email = data['email'].strip().lower()
        existing = execute_query("SELECT id FROM users WHERE email = %s", (email,), fetch_one=True)
        if existing:
            return jsonify({'success': False, 'message': 'This email address is already in use.'}), 409

        hashed = bcrypt.hashpw(data['password'].encode(), bcrypt.gensalt(rounds=12)).decode()

        user_id = execute_query("""
            INSERT INTO users (prenom, nom, email, password, role, telephone, specialite, ville, tarif, experience, dispo)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            sanitize_text(data['prenom'], 100),
            sanitize_text(data['nom'], 100),
            email, hashed, target_role,
            data.get('telephone', ''),
            sanitize_text(data.get('specialite', ''), 100) if target_role == 'medecin' else None,
            sanitize_text(data.get('ville', ''), 100)      if target_role == 'medecin' else None,
            data.get('tarif')      if target_role == 'medecin' else None,
            data.get('experience') if target_role == 'medecin' else None,
            data.get('dispo', 'Disponible') if target_role == 'medecin' else None,
        ))

        if user_id:
            log_security_event('USER_CREATED', details={
                'created_by_role': caller_role,
                'new_user_role':   target_role,
                'new_user_email':  email,
            })
            return jsonify({'success': True, 'message': f'Account {target_role} created successfully.'}), 201
        return jsonify({'success': False, 'message': 'Error during creation'}), 500

    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500


# ── POST /api/auth/refresh ────────────────────────────────────────────────────
@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        identity = get_jwt_identity()
        claims   = get_jwt()
        extra    = {k: claims[k] for k in ('email', 'role', 'prenom', 'nom') if k in claims}
        access_token = create_access_token(identity=identity, additional_claims=extra)
        return jsonify({'success': True, 'token': access_token})
    except Exception as e:
        return jsonify({'success': False, 'message': 'Server error'}), 500


# ── POST /api/auth/forgot-password ───────────────────────────────────────────
@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    return jsonify({'success': True, 'message': "If this email exists, a link has been sent."}), 200


# ── POST /api/auth/reset-password ────────────────────────────────────────────
@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    return jsonify({'success': True, 'message': 'Password reset.'}), 200


# ── PUT /api/auth/change-password  (utilisateur change son propre mot de passe) ──
@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    """
    Permet à n'importe quel utilisateur connecté de changer son propre mot de passe.
    Requiert l'ancien mot de passe pour confirmer l'identité.
    """
    try:
        user_id = int(get_jwt_identity())
        data    = request.get_json(silent=True) or {}

        old_password = data.get('old_password', '')
        new_password = data.get('new_password', '')

        if not old_password or not new_password:
            return jsonify({'success': False, 'message': 'Old and new passwords are required'}), 400

        if len(new_password) < 8:
            return jsonify({'success': False, 'message': 'New password must be at least 8 characters'}), 400

        # 🔒 Vérifier l'ancien mot de passe
        user = execute_query("SELECT * FROM users WHERE id = %s", (user_id,), fetch_one=True)
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404

        if not bcrypt.checkpw(old_password.encode(), user['password'].encode()):
            log_security_event('PASSWORD_CHANGE_FAILED', user_id=user_id, details={'reason': 'wrong old password'})
            return jsonify({'success': False, 'message': 'Current password is incorrect'}), 401

        # 🔒 Empêcher la réutilisation du même mot de passe
        if bcrypt.checkpw(new_password.encode(), user['password'].encode()):
            return jsonify({'success': False, 'message': 'New password must be different from current password'}), 400

        hashed = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt(rounds=12)).decode()
        execute_query("UPDATE users SET password = %s WHERE id = %s", (hashed, user_id))

        log_security_event('PASSWORD_CHANGED', user_id=user_id)
        return jsonify({'success': True, 'message': 'Password changed successfully'})

    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500