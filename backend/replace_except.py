# Script pour remplacer les blocs except avec traceback
import re

# Lire le fichier
with open('D:/POO/backend/app.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern pour remplacer les blocs except
pattern = r'except Exception as e:\s*return jsonify\({\''success'': False, \'message\': f\'Erreur: \{str\(e\)\}\'}\), 500'

replacement = '''except Exception as e:
        import traceback
        print("===== ERREUR COMPLETE =====")
        traceback.print_exc()
        
        return jsonify({
            "message": str(e),
            "success": False
        }), 500'''

# Appliquer le remplacement
new_content = re.sub(pattern, replacement, content)

# Écrire le fichier modifié
with open('D:/POO/backend/app.py', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Remplacement terminé")
