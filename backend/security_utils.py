"""
security_utils.py — Centralized security utilities
Covers: rate limiting, brute-force detection, input validation,
        security event logging, HTTP security headers (CSP included).
"""

import time
import re
import logging
import json
from collections import defaultdict
from functools import wraps
from datetime import datetime, timezone
from flask import request, jsonify, g

# ── Logging setup ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [SECURITY] %(levelname)s %(message)s',
    datefmt='%Y-%m-%dT%H:%M:%S',
)
security_logger = logging.getLogger('security')

# ── In-memory stores (replace with Redis in production) ───────────────────────
_rate_limit_store: dict[str, list[float]] = defaultdict(list)
_brute_force_store: dict[str, list[float]] = defaultdict(list)

# ── Constants ─────────────────────────────────────────────────────────────────
BRUTE_FORCE_MAX_ATTEMPTS = 5
BRUTE_FORCE_WINDOW_SECONDS = 300          # 5 minutes
ACCOUNT_LOCKOUT_SECONDS = 900             # 15 minutes after brute force

# ── IP helpers ────────────────────────────────────────────────────────────────
def get_client_ip() -> str:
    """Return the real client IP, respecting X-Forwarded-For from trusted proxies."""
    forwarded = request.headers.get('X-Forwarded-For', '')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.remote_addr or 'unknown'


# ── Input validation ──────────────────────────────────────────────────────────
_DANGEROUS_PATTERNS = re.compile(
    r'(<script|javascript:|on\w+=|\'|--|;|\bDROP\b|\bSELECT\b|\bINSERT\b'
    r'|\bUPDATE\b|\bDELETE\b|\bUNION\b|\bEXEC\b)',
    re.IGNORECASE,
)

def validate_input(value: str, max_length: int = 500) -> bool:
    """Return True if the string is safe (no SQLi/XSS patterns, within length)."""
    if not isinstance(value, str):
        return False
    if len(value) > max_length:
        return False
    if _DANGEROUS_PATTERNS.search(value):
        return False
    return True


# ── Date / time format validation ─────────────────────────────────────────────
_DATE_RE = re.compile(r'^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$')
_TIME_RE = re.compile(r'^(?:[01]\d|2[0-3]):[0-5]\d$')

def validate_date(value: str) -> bool:
    """Strict ISO date: YYYY-MM-DD."""
    if not isinstance(value, str) or not _DATE_RE.match(value):
        return False
    try:
        datetime.strptime(value, '%Y-%m-%d')
        return True
    except ValueError:
        return False

def validate_time(value: str) -> bool:
    """Strict time: HH:MM (24h)."""
    return bool(isinstance(value, str) and _TIME_RE.match(value))


# ── Password complexity ───────────────────────────────────────────────────────
def validate_password_complexity(password: str) -> tuple[bool, str]:
    """
    Returns (is_valid, error_message).
    Rules: ≥8 chars, ≥1 uppercase, ≥1 lowercase, ≥1 digit, ≥1 special char.
    """
    if not isinstance(password, str):
        return False, 'Password must be a string'
    if len(password) < 8:
        return False, 'Password must be at least 8 characters'
    if len(password) > 128:
        return False, 'Password must not exceed 128 characters'
    if not re.search(r'[A-Z]', password):
        return False, 'Password must contain at least one uppercase letter'
    if not re.search(r'[a-z]', password):
        return False, 'Password must contain at least one lowercase letter'
    if not re.search(r'\d', password):
        return False, 'Password must contain at least one digit'
    if not re.search(r'[!@#$%^&*(),.?":{}|<>\-_=+\[\]\\;\'`~/]', password):
        return False, 'Password must contain at least one special character (!@#$%^&* etc.)'
    return True, ''


# ── Rate limiting decorator ───────────────────────────────────────────────────
def rate_limit(max_requests: int = 10, window_seconds: int = 300):
    """
    Sliding-window rate limiter keyed by (IP, endpoint).
    Returns 429 when the limit is exceeded.
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            ip  = get_client_ip()
            key = f'{ip}:{request.endpoint}'
            now = time.time()

            timestamps = _rate_limit_store[key]
            # Drop entries outside the window
            timestamps[:] = [t for t in timestamps if now - t < window_seconds]

            if len(timestamps) >= max_requests:
                log_security_event(
                    'RATE_LIMIT_EXCEEDED',
                    ip_address=ip,
                    details={'endpoint': request.endpoint},
                )
                return jsonify({
                    'success': False,
                    'message': 'Too many requests. Please try again later.',
                    'retry_after': window_seconds,
                }), 429

            timestamps.append(now)
            return f(*args, **kwargs)
        return wrapper
    return decorator


# ── Brute-force detection ─────────────────────────────────────────────────────
def detect_brute_force(ip: str) -> bool:
    """
    Returns True (and blocks) if the IP has exceeded BRUTE_FORCE_MAX_ATTEMPTS
    failed login attempts within BRUTE_FORCE_WINDOW_SECONDS.
    """
    now = time.time()
    attempts = _brute_force_store[ip]
    attempts[:] = [t for t in attempts if now - t < BRUTE_FORCE_WINDOW_SECONDS]
    return len(attempts) >= BRUTE_FORCE_MAX_ATTEMPTS

def record_failed_attempt(ip: str) -> None:
    """Record one failed login attempt for the given IP."""
    _brute_force_store[ip].append(time.time())

def clear_failed_attempts(ip: str) -> None:
    """Clear failed attempts after a successful login."""
    _brute_force_store.pop(ip, None)


# ── Security event logging ────────────────────────────────────────────────────
def log_security_event(
    event_type: str,
    user_id: int | None = None,
    ip_address: str | None = None,
    details: dict | None = None,
) -> None:
    """
    Structured security audit log.
    In production, send this to a SIEM (Splunk, ELK, CloudWatch, etc.).
    """
    payload = {
        'timestamp':  datetime.now(timezone.utc).isoformat(),
        'event':      event_type,
        'user_id':    user_id,
        'ip_address': ip_address or get_client_ip(),
        'endpoint':   request.path if request else None,
        'method':     request.method if request else None,
        'details':    details or {},
    }
    security_logger.info(json.dumps(payload))


# ── Request / response logging decorator ─────────────────────────────────────
def log_request_response(f):
    """Log incoming requests and outgoing status codes for audited endpoints."""
    @wraps(f)
    def wrapper(*args, **kwargs):
        start = time.time()
        response = f(*args, **kwargs)
        duration_ms = round((time.time() - start) * 1000)
        status = response[1] if isinstance(response, tuple) else 200
        security_logger.debug(
            json.dumps({
                'type':     'REQUEST',
                'method':   request.method,
                'path':     request.path,
                'status':   status,
                'duration': duration_ms,
                'ip':       get_client_ip(),
            })
        )
        return response
    return wrapper


# ── HTTP security headers ─────────────────────────────────────────────────────
def security_headers(response):
    """
    Attach security headers to every response.
    Call this in an @app.after_request hook.
    """
    # Strict Content-Security-Policy
    csp = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "        # tighten once you have a nonce system
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: blob:; "
        "font-src 'self'; "
        "connect-src 'self'; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self';"
    )
    response.headers['Content-Security-Policy']   = csp
    response.headers['X-Content-Type-Options']    = 'nosniff'
    response.headers['X-Frame-Options']           = 'DENY'
    response.headers['X-XSS-Protection']          = '1; mode=block'
    response.headers['Referrer-Policy']           = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy']        = (
        'camera=(), microphone=(), geolocation=(), payment=()'
    )
    # HSTS — only send over HTTPS (Nginx / your proxy must enforce TLS first)
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'

    # Remove fingerprinting headers
    response.headers.pop('Server', None)
    response.headers.pop('X-Powered-By', None)

    return response


# ── Text sanitization ─────────────────────────────────────────────────────────
def sanitize_text(value: str, max_length: int = 255) -> str:
    """Strip leading/trailing whitespace and truncate to max_length."""
    if not isinstance(value, str):
        return ''
    return value.strip()[:max_length]