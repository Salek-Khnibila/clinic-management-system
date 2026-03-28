# UTF-8 Configuration for Flask
import sys
import io

# Force UTF-8 encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Flask UTF-8 settings
JSON_AS_ASCII = False
JSON_SORT_KEYS = False
JSONIFY_PRETTYPRINT_REGULAR = False
