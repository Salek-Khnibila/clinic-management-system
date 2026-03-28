# Script de vérification des messages français restants
import os
import re

# Messages français à rechercher
french_patterns = [
    r'Données?[^a-zA-Z]',  # Données, Donnee
    r'Rendez-vous[^a-zA-Z]',  # Rendez-vous
    r'Erreur[^a-zA-Z]',  # Erreur
    r'introuvable[^a-zA-Z]',  # introuvable
    r'mis à jour[^a-zA-Z]',  # mis à jour
    r'création[^a-zA-Z]',  # création
    r'suppression[^a-zA-Z]',  # suppression
    r'Identifiants[^a-zA-Z]',  # Identifiants
    r'incorrects?[^a-zA-Z]',  # incorrect, incorrects
    r'requis[^a-zA-Z]',  # requis
    r'manquant[s]?[^a-zA-Z]',  # manquant, manquants
    r'valide[^a-zA-Z]',  # valide
    r'fourni[^a-zA-Z]',  # fourni
    r'Champs[^a-zA-Z]',  # Champs
    r'envoi[^a-zA-Z]',  # envoi
    r'Login[^a-zA-Z]',  # Login
    r'successful[^a-zA-Z]',  # successful
    r'Profil[^a-zA-Z]',  # Profil
    r'Patient[^a-zA-Z]',  # Patient
    r'Médecin[^a-zA-Z]',  # Médecin
    r'Trop[^a-zA-Z]',  # Trop
    r'tentatives[^a-zA-Z]',  # tentatives
    r'Réessayez[^a-zA-Z]',  # Réessayez
    r'plus tard[^a-zA-Z]',  # plus tard
    r'Déjà[^a-zA-Z]',  # Déjà
    r'déjà[^a-zA-Z]',  # déjà
    r'Confirmation[^a-zA-Z]',  # Confirmation
    r'Rappel[^a-zA-Z]',  # Rappel
    r'RDV[^a-zA-Z]',  # RDV
    r'confirmé[^a-zA-Z]',  # confirmé
    r'annulé[^a-zA-Z]',  # annulé
    r'reporté[^a-zA-Z]',  # reporté
    r'en attente[^a-zA-Z]',  # en attente
    r'en salle[^a-zA-Z]',  # en salle
    r'absent[^a-zA-Z]',  # absent
]

def check_file(file_path):
    """Check for French messages in a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        french_found = []
        line_number = 0
        
        for line in content.split('\n'):
            line_number += 1
            for pattern in french_patterns:
                matches = re.findall(pattern, line, re.IGNORECASE)
                if matches:
                    french_found.append(f"Line {line_number}: {line.strip()}")
                    break
        
        if french_found:
            print(f"\n❌ {file_path}")
            for match in french_found[:5]:  # Limit to 5 matches per file
                print(f"   {match}")
            return True
        else:
            return False
            
    except Exception as e:
        print(f"❌ Error reading {file_path}: {e}")
        return False

# Scan all relevant files
print("🔍 Scanning for remaining French messages...")
print("=" * 60)

total_files = 0
files_with_french = 0

# Scan Python files
print("\n📁 Python Files:")
for root, dirs, files in os.walk('D:/POO/backend'):
    for file in files:
        if file.endswith('.py'):
            total_files += 1
            if check_file(os.path.join(root, file)):
                files_with_french += 1

# Scan JavaScript/JSX files
print("\n📁 JavaScript/JSX Files:")
for root, dirs, files in os.walk('D:/POO/src'):
    for file in files:
        if file.endswith(('.js', '.jsx')):
            total_files += 1
            if check_file(os.path.join(root, file)):
                files_with_french += 1

# Scan SQL files
print("\n📁 SQL Files:")
for root, dirs, files in os.walk('D:/POO/database'):
    for file in files:
        if file.endswith('.sql'):
            total_files += 1
            if check_file(os.path.join(root, file)):
                files_with_french += 1

print("\n" + "=" * 60)
print(f"📊 SUMMARY:")
print(f"   Total files scanned: {total_files}")
print(f"   Files with French: {files_with_french}")
print(f"   Files clean: {total_files - files_with_french}")

if files_with_french == 0:
    print("\n✅ ALL FILES CLEAN - No French messages found!")
else:
    print(f"\n⚠️  {files_with_french} files still contain French messages")
