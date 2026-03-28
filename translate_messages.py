# Script pour traduire tous les messages français en anglais
import os
import re

# Dictionnaire de traduction
translations = {
    # Messages d'erreur
    "Donnees invalides": "Invalid data",
    "Donnees manquantes": "Missing data",
    "Incorrect credentials": "Invalid credentials",
    "Email, password and role required": "Email, password and role required",
    "Too many attempts. Please try again later.": "Too many attempts. Please try again later.",
    "Rendez-vous introuvable": "Appointment not found",
    "Patient not found": "Patient not found", 
    "Médecin introuvable": "Doctor not found",
    "Erreur lors de la mise a jour": "Error during update",
    "Erreur SQL lors de la mise a jour": "SQL error during update",
    "Error during creation": "Error during creation",
    "Erreur lors de la suppression": "Error during deletion",
    "Erreur:": "Error:",
    "Aucun champ valide fourni": "No valid field provided",
    "Champs manquants:": "Missing fields:",
    "Champs requis manquants": "Required fields missing",
    "to_patient_id manquant": "to_patient_id missing",
    "Error sending'": "Error during sending",
    "Données JSON invalides": "Invalid JSON data",
    
    # Messages de succès
    "Rendez-vous mis a jour": "Appointment updated",
    "Rendez-vous deja a jour": "Appointment already up to date",
    "Rendez-vous supprime": "Appointment deleted",
    "Profil mis a jour": "Profile updated",
    "Rappel RDV": "Appointment reminder",
    "Confirmation": "Confirmation",
    "RDV confirme": "Appointment confirmed",
    "Login successful": "Login successful",
    
    # Messages génériques
    "success": "success",
    "message": "message",
    "data": "data"
}

def translate_file(file_path):
    """Translate all French messages in a file to English"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply translations
        for french, english in translations.items():
            content = content.replace(f"'{french}'", f"'{english}'")
            content = content.replace(f'"{french}"', f'"{english}"')
            content = content.replace(f"'{french}'", f"'{english}'")
            content = content.replace(f'"{french}"', f'"{english}"')
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Translated: {file_path}")
        else:
            print(f"⚪ No changes needed: {file_path}")
            
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")

# Process all Python files
print("🔍 Processing Python files...")
for root, dirs, files in os.walk('D:/POO/backend'):
    for file in files:
        if file.endswith('.py'):
            translate_file(os.path.join(root, file))

# Process all JavaScript/JSX files  
print("\n🔍 Processing JavaScript/JSX files...")
for root, dirs, files in os.walk('D:/POO/src'):
    for file in files:
        if file.endswith(('.js', '.jsx')):
            translate_file(os.path.join(root, file))

print("\n✅ Translation complete!")
