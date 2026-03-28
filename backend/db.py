import os
import mysql.connector
from datetime import datetime, date, timedelta
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))


def get_db_config():
    return {
        'host':     os.getenv('DB_HOST', '127.0.0.1'),
        'user':     os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', ''),
        'database': os.getenv('DB_NAME', 'gestion_clinique'),
        'port':     int(os.getenv('DB_PORT', 3306)),
    }


def get_db_connection():
    try:
        return mysql.connector.connect(**get_db_config())
    except Exception as e:
        print(f"[DB ERROR] {e}")
        return None


def serialize_value(value):
    """Convertit les types Python non-JSON en types sérialisables."""
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, timedelta):
        total = int(value.total_seconds())
        h, rem = divmod(total, 3600)
        m, s   = divmod(rem, 60)
        return f"{h:02}:{m:02}:{s:02}"
    return value


def serialize_row(row: dict) -> dict:
    return {k: serialize_value(v) for k, v in row.items()}


def execute_query(query: str, params=None, fetch_one: bool = False):
    """
    Exécute une requête SQL et retourne :
    - Pour SELECT           : liste de dicts (ou un seul dict si fetch_one=True)
    - Pour INSERT           : lastrowid (int)
    - Pour UPDATE/DELETE    : rowcount (int)
    Lève une exception en cas d'erreur.
    """
    connection = get_db_connection()
    if not connection:
        raise RuntimeError("Impossible de se connecter à la base de données")

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params or [])
        verb = query.strip().upper().split()[0]

        if verb in ('INSERT', 'UPDATE', 'DELETE'):
            connection.commit()
            return cursor.lastrowid if verb == 'INSERT' else cursor.rowcount
        else:
            return cursor.fetchone() if fetch_one else cursor.fetchall()
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        connection.close()
