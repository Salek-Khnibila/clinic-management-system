"""
app.py — Flask application factory (hardened)
Security additions vs original:
  - JWT_SECRET_KEY is required — app refuses to start without a real secret
  - CORS origins read from ALLOWED_ORIGINS env var (no localhost in production)
  - HTTPS redirect enforced via Talisman when FLASK_ENV=production
  - JWT access token shortened to 15 minutes (refresh token unchanged at 7 days)
  - Global error handlers return English messages only
"""

import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))


def _get_jwt_secret() -> str:
    """
    Return the JWT secret key.
    🔒 Raises SystemExit if the key is missing or is the insecure default,
       preventing accidental deployment with a known secret.
    """
    secret = os.getenv('JWT_SECRET_KEY', '')
    insecure_defaults = {
        '',
        'change-me-in-production-min-32-chars!!',
        'your-secret-key',
        'secret',
    }
    if secret in insecure_defaults:
        print(
            '[FATAL] JWT_SECRET_KEY is not set or is using the insecure default value.\n'
            'Set a strong random secret in your .env file before starting the server.\n'
            'Example: openssl rand -hex 32',
            file=sys.stderr,
        )
        sys.exit(1)
    if len(secret) < 32:
        print(
            '[FATAL] JWT_SECRET_KEY must be at least 32 characters long.',
            file=sys.stderr,
        )
        sys.exit(1)
    return secret


def _get_cors_origins() -> list[str]:
    """
    Return allowed CORS origins from the ALLOWED_ORIGINS env var.
    In development, falls back to localhost.
    🔒 In production, ALLOWED_ORIGINS must be set explicitly.
    """
    env = os.getenv('FLASK_ENV', 'development')
    origins_env = os.getenv('ALLOWED_ORIGINS', '')

    if origins_env:
        return [o.strip() for o in origins_env.split(',') if o.strip()]

    if env == 'production':
        print(
            '[WARNING] ALLOWED_ORIGINS is not set in production mode. '
            'CORS will be disabled for all origins.',
            file=sys.stderr,
        )
        return []

    # Development fallback
    return [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ]


def create_app():
    app = Flask(__name__)

    # ── JWT ───────────────────────────────────────────────────────────────────
    app.config['JWT_SECRET_KEY']            = _get_jwt_secret()
    # 🔒 Shortened from 24h → 15 minutes (refresh token unchanged)
    app.config['JWT_ACCESS_TOKEN_EXPIRES']  = timedelta(minutes=15)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=7)

    # ── Extensions ────────────────────────────────────────────────────────────
    allowed_origins = _get_cors_origins()
    CORS(app, resources={r'/api/*': {'origins': allowed_origins}})
    JWTManager(app)

    # ── HTTPS enforcement (production only) ───────────────────────────────────
    env = os.getenv('FLASK_ENV', 'development')
    if env == 'production':
        try:
            from flask_talisman import Talisman
            Talisman(
                app,
                force_https=True,
                strict_transport_security=True,
                strict_transport_security_max_age=31536000,
                content_security_policy=False,   # We set CSP in security_utils instead
            )
        except ImportError:
            print(
                '[WARNING] flask-talisman is not installed. '
                'HTTPS will not be enforced by the application. '
                'Make sure your reverse proxy (Nginx/Caddy) handles TLS.',
                file=sys.stderr,
            )

    # ── Security headers (all environments) ───────────────────────────────────
    @app.after_request
    def add_security_headers(response):
        try:
            from security_utils import security_headers
            return security_headers(response)
        except Exception:
            return response

    # ── Blueprints ────────────────────────────────────────────────────────────
    from routes.auth         import auth_bp
    from routes.appointments import appointments_bp
    from routes.doctors      import doctors_bp
    from routes.patients     import patients_bp
    from routes.messages     import messages_bp
    from routes.admin        import admin_bp
    from routes.reviews      import reviews_bp

    for bp in (auth_bp, appointments_bp, doctors_bp, patients_bp, messages_bp, admin_bp, reviews_bp):
        app.register_blueprint(bp)

    # ── Global error handlers ─────────────────────────────────────────────────
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({'success': False, 'message': 'Bad request'}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({'success': False, 'message': 'Authentication required'}), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({'success': False, 'message': 'Access denied'}), 403

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'success': False, 'message': 'Resource not found'}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({'success': False, 'message': 'Method not allowed'}), 405

    @app.errorhandler(415)
    def unsupported_media(e):
        return jsonify({'success': False, 'message': 'Content-Type must be application/json'}), 415

    @app.errorhandler(429)
    def too_many_requests(e):
        return jsonify({'success': False, 'message': 'Too many requests. Please slow down.'}), 429

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

    # ── Health check ──────────────────────────────────────────────────────────
    @app.route('/api/health')
    def health():
        from db import get_db_connection
        db_ok = get_db_connection() is not None
        return jsonify({
            'status':   'OK',
            'database': 'connected' if db_ok else 'disconnected',
            'message':  'Flask backend operational',
        })

    return app


if __name__ == '__main__':
    app = create_app()
    debug = os.getenv('FLASK_DEBUG', 'True') == 'True'
    # 🔒 Never bind to 0.0.0.0 in production — use a WSGI server (gunicorn)
    app.run(
        debug=debug,
        host='127.0.0.1' if not debug else '0.0.0.0',
        port=5000,
    )