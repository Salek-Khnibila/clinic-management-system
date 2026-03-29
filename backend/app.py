import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

def create_app():
    app = Flask(__name__)

    # ── JWT ───────────────────────────────────────────────────────────────────
    app.config['JWT_SECRET_KEY']            = os.getenv('JWT_SECRET_KEY', 'change-me-in-production-min-32-chars!!')
    app.config['JWT_ACCESS_TOKEN_EXPIRES']  = timedelta(hours=24)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=7)

    # ── Extensions ────────────────────────────────────────────────────────────
    CORS(app, resources={r"/api/*": {"origins": [
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ]}})
    JWTManager(app)

    # ── JWT error handlers ────────────────────────────────────────────────────
    from flask_jwt_extended import JWTManager as _JWTManager
    jwt = _JWTManager()

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

    for bp in (auth_bp, appointments_bp, doctors_bp, patients_bp, messages_bp, admin_bp):
        app.register_blueprint(bp)

    # ── Global error handlers ─────────────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "message": "Resource not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"success": False, "message": "Method not allowed"}), 405

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"success": False, "message": "Internal server error"}), 500

    # ── Health check ──────────────────────────────────────────────────────────
    @app.route('/api/health')
    def health():
        from db import get_db_connection
        db_ok = get_db_connection() is not None
        return jsonify({
            'status': 'OK',
            'database': 'connected' if db_ok else 'disconnected',
            'message': 'Flask backend operational',
        })

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(
        debug=os.getenv('FLASK_DEBUG', 'True') == 'True',
        host='0.0.0.0',
        port=5000
    )