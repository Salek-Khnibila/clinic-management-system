"""
validators.py — Input validation for all user-facing data.
Used by auth.py, appointments.py, and any route that accepts user input.
"""

import re
from datetime import datetime
from security_utils import validate_password_complexity

# ── Email ─────────────────────────────────────────────────────────────────────
_EMAIL_RE = re.compile(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$')

def validate_email(email: str) -> bool:
    if not isinstance(email, str):
        return False
    return bool(_EMAIL_RE.match(email.strip())) and len(email) <= 255


# ── Password (delegates to security_utils for complexity) ─────────────────────
def validate_password(password: str) -> tuple[bool, str]:
    """Returns (is_valid, error_message)."""
    return validate_password_complexity(password)


# ── Phone ─────────────────────────────────────────────────────────────────────
_PHONE_RE = re.compile(r'^[0-9+\-\s()]{6,20}$')

def validate_phone(phone: str) -> bool:
    if not phone:
        return True          # optional field
    return bool(_PHONE_RE.match(phone.strip()))


# ── Blood group ───────────────────────────────────────────────────────────────
_VALID_BLOOD = {'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'}

def validate_blood_group(value: str) -> bool:
    if not value:
        return True          # optional
    return value.strip().upper() in _VALID_BLOOD


# ── Text field ────────────────────────────────────────────────────────────────
def sanitize_text(value: str, max_length: int = 255) -> str:
    if not isinstance(value, str):
        return ''
    return value.strip()[:max_length]


# ── User creation ─────────────────────────────────────────────────────────────
def validate_user_creation(data: dict, role: str) -> list[str]:
    """
    Validate all fields required to create a user.
    Returns a list of error strings (empty = OK).
    """
    errors: list[str] = []

    # Required for every role
    if not data.get('prenom', '').strip():
        errors.append('First name is required')
    elif len(data['prenom']) > 100:
        errors.append('First name must not exceed 100 characters')

    if not data.get('nom', '').strip():
        errors.append('Last name is required')
    elif len(data['nom']) > 100:
        errors.append('Last name must not exceed 100 characters')

    email = data.get('email', '').strip()
    if not email:
        errors.append('Email is required')
    elif not validate_email(email):
        errors.append('Invalid email address')

    password = data.get('password', '')
    if not password:
        errors.append('Password is required')
    else:
        ok, msg = validate_password(password)
        if not ok:
            errors.append(msg)

    phone = data.get('telephone', '')
    if phone and not validate_phone(phone):
        errors.append('Invalid phone number format')

    # Patient-specific
    if role == 'patient':
        bg = data.get('groupe_sanguin', '')
        if bg and not validate_blood_group(bg):
            errors.append('Invalid blood group (must be A+, A-, B+, B-, AB+, AB-, O+, O-)')

    # Doctor-specific
    if role == 'medecin':
        if not data.get('specialite', '').strip():
            errors.append('Specialty is required for doctors')
        if not data.get('ville', '').strip():
            errors.append('City is required for doctors')

    return errors


# ── Appointment ───────────────────────────────────────────────────────────────
_DATE_RE = re.compile(r'^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$')
_TIME_RE = re.compile(r'^(?:[01]\d|2[0-3]):[0-5]\d$')

def validate_appointment_date(value: str) -> bool:
    """Strict ISO date YYYY-MM-DD, must be a real calendar date."""
    if not isinstance(value, str) or not _DATE_RE.match(value):
        return False
    try:
        datetime.strptime(value, '%Y-%m-%d')
        return True
    except ValueError:
        return False

def validate_appointment_time(value: str) -> bool:
    """Strict HH:MM 24h format."""
    return bool(isinstance(value, str) and _TIME_RE.match(value))