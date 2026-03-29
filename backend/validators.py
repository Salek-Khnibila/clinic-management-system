"""
Validators centralisés pour le backend Flask.
Utilisés dans toutes les routes pour valider les inputs avant traitement.
"""
import re
from typing import Optional


# ── Email ─────────────────────────────────────────────────────────────────────
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$')

def validate_email(email: str) -> Optional[str]:
    """Retourne un message d'erreur ou None si valide."""
    if not email or not isinstance(email, str):
        return "Email is required"
    email = email.strip().lower()
    if len(email) > 255:
        return "Email is too long"
    if not EMAIL_REGEX.match(email):
        return "Invalid email format"
    # Domaines jetables courants bloqués
    BLOCKED_DOMAINS = {'mailinator.com', 'tempmail.com', 'guerrillamail.com', 'trashmail.com', '10minutemail.com'}
    domain = email.split('@')[1] if '@' in email else ''
    if domain in BLOCKED_DOMAINS:
        return "Disposable email addresses are not allowed"
    return None


# ── Mot de passe ──────────────────────────────────────────────────────────────
def validate_password(password: str) -> Optional[str]:
    """Retourne un message d'erreur ou None si valide."""
    if not password or not isinstance(password, str):
        return "Password is required"
    if len(password) < 8:
        return "Password must be at least 8 characters"
    if len(password) > 128:
        return "Password is too long"
    if not re.search(r'[A-Z]', password):
        return "Password must contain at least one uppercase letter"
    if not re.search(r'[0-9]', password):
        return "Password must contain at least one number"
    return None


# ── Nom / Prénom ──────────────────────────────────────────────────────────────
def validate_name(name: str, field: str = "Name") -> Optional[str]:
    if not name or not isinstance(name, str):
        return f"{field} is required"
    name = name.strip()
    if len(name) < 2:
        return f"{field} must be at least 2 characters"
    if len(name) > 100:
        return f"{field} is too long"
    if not re.match(r"^[a-zA-ZÀ-ÿ\s'\-\.]+$", name):
        return f"{field} contains invalid characters"
    return None


# ── Téléphone ─────────────────────────────────────────────────────────────────
PHONE_REGEX = re.compile(r'^\+?[\d\s\-\(\)]{7,20}$')

def validate_phone(phone: str) -> Optional[str]:
    if not phone:
        return None  # Optionnel
    if not PHONE_REGEX.match(phone.strip()):
        return "Invalid phone number format"
    return None


# ── Rôle ──────────────────────────────────────────────────────────────────────
VALID_ROLES = {'patient', 'medecin', 'secretaire', 'admin'}

def validate_role(role: str, allowed: set = None) -> Optional[str]:
    allowed = allowed or VALID_ROLES
    if role not in allowed:
        return f"Invalid role. Allowed: {', '.join(sorted(allowed))}"
    return None


# ── Sanitize texte (contre XSS basique) ──────────────────────────────────────
def sanitize_text(text: str, max_len: int = 500) -> str:
    """Nettoie un texte en supprimant les balises HTML dangereuses."""
    if not text or not isinstance(text, str):
        return ""
    # Supprimer les balises HTML
    text = re.sub(r'<[^>]*>', '', text)
    # Supprimer les caractères de contrôle
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    return text.strip()[:max_len]


# ── Validation complète d'un utilisateur à la création ───────────────────────
def validate_user_creation(data: dict, role: str) -> list:
    """
    Valide tous les champs d'un nouvel utilisateur.
    Retourne une liste d'erreurs (vide si tout est OK).
    """
    errors = []

    err = validate_name(data.get('prenom', ''), 'First name')
    if err: errors.append(err)

    err = validate_name(data.get('nom', ''), 'Last name')
    if err: errors.append(err)

    err = validate_email(data.get('email', ''))
    if err: errors.append(err)

    err = validate_password(data.get('password', ''))
    if err: errors.append(err)

    if data.get('telephone'):
        err = validate_phone(data['telephone'])
        if err: errors.append(err)

    if role == 'medecin':
        if not data.get('specialite', '').strip():
            errors.append("Speciality is required for doctors")
        if not data.get('ville', '').strip():
            errors.append("City is required for doctors")

    return errors