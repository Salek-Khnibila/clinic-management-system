import logging
from datetime import datetime
import os
from functools import wraps

# Créer le dossier de logs s'il n'existe pas
os.makedirs('logs', exist_ok=True)

# Configuration des logs (temporairement sans fichier)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()  # Uniquement console pour le moment
    ]
)

security_logger = logging.getLogger('security')

def log_security_event(event_type, user_id=None, ip_address=None, details=None):
    """Logger les événements de sécurité"""
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'event_type': event_type,
        'user_id': user_id,
        'ip_address': ip_address,
        'details': details
    }
    
    security_logger.info(f"SECURITY_EVENT: {log_entry}")
    
    # Événements critiques à surveiller
    critical_events = [
        'LOGIN_FAILED',
        'UNAUTHORIZED_ACCESS',
        'SQL_INJECTION_ATTEMPT',
        'XSS_ATTEMPT',
        'BRUTE_FORCE_DETECTED'
    ]
    
    if event_type in critical_events:
        security_logger.warning(f"CRITICAL_SECURITY_EVENT: {log_entry}")

def rate_limit(max_requests=100, window_seconds=3600):
    """Décorateur de rate limiting basique"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Implémentation basique - en production utiliser Redis
            from flask import request, jsonify
            
            client_ip = request.remote_addr
            current_time = datetime.now().timestamp()
            
            # Logique de rate limiting simplifiée
            # En production: stocker les requêtes par IP dans Redis
            
            log_security_event('RATE_LIMIT_CHECK', ip_address=client_ip)
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def validate_input(input_data, input_type='string'):
    """Validation des entrées contre les attaques courantes"""
    if not input_data:
        return True
    
    # Patterns d'attaques à détecter
    dangerous_patterns = [
        r'<script.*?>.*?</script>',  # XSS
        r"[';].*DROP\s+TABLE",       # SQL Injection
        r'\.\./.*',                    # Path Traversal
        r'<\?php.*?\?>',               # PHP Injection
        r'<%.*%>',                     # Template Injection
    ]
    
    import re
    
    for pattern in dangerous_patterns:
        if re.search(pattern, input_data, re.IGNORECASE):
            log_security_event('INPUT_VALIDATION_FAILED', 
                             details=f"Pattern detected: {pattern}, Input: {input_data[:50]}")
            return False
    
    return True

def get_client_ip():
    """Récupérer l'IP client avec support proxy"""
    from flask import request
    
    # Headers à vérifier pour l'IP réelle
    ip_headers = [
        'X-Forwarded-For',
        'X-Real-IP',
        'X-Client-IP',
        'CF-Connecting-IP',  # Cloudflare
        'True-Client-IP'     # Cloudflare
    ]
    
    for header in ip_headers:
        if header in request.headers:
            ip = request.headers[header].split(',')[0].strip()
            if ip:
                return ip
    
    return request.remote_addr

def log_request_response(f):
    """Logger les requêtes/réponses pour audit"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        from flask import request, g
        
        # Logger la requête
        start_time = datetime.now()
        client_ip = get_client_ip()
        
        log_security_event('REQUEST_START',
                         ip_address=client_ip,
                         details={
                             'method': request.method,
                             'endpoint': request.endpoint,
                             'path': request.path,
                             'user_agent': request.headers.get('User-Agent', '')[:100]
                         })
        
        # Exécuter la fonction
        response = f(*args, **kwargs)
        
        # Logger la réponse
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        log_security_event('REQUEST_END',
                         ip_address=client_ip,
                         details={
                             'duration': duration,
                             'status_code': getattr(response, 'status_code', 200)
                         })
        
        return response
    
    return decorated_function

def security_headers(response):
    """Ajouter les headers de sécurité"""
    security_headers_list = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    }
    
    for header, value in security_headers_list.items():
        response.headers[header] = value
    
    return response

def detect_brute_force(ip_address, max_attempts=5, window_minutes=15):
    """Détection basique de brute force"""
    # En production, utiliser une base de données ou Redis
    # Implémentation simplifiée pour démonstration
    
    current_time = datetime.now()
    
    # Logique de détection
    # Stocker les tentatives par IP avec timestamp
    
    log_security_event('BRUTE_FORCE_CHECK', ip_address=ip_address)
    
    # Retourne True si brute force détecté
    return False  # Placeholder

# Créer le dossier de logs s'il n'existe pas
os.makedirs('logs', exist_ok=True)
