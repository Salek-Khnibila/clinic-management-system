import bcrypt

def generate_bcrypt_hash(password="1234"):
    """Génère un hash bcrypt pour le mot de passe"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

if __name__ == "__main__":
    # Générer un hash pour "1234"
    hash_1234 = generate_bcrypt_hash("1234")
    print(f"Hash pour '1234': {hash_1234}")
    
    # Vérifier que le hash fonctionne
    verification = bcrypt.checkpw("1234".encode('utf-8'), hash_1234.encode('utf-8'))
    print(f"Vérification: {verification}")
    
    # Générer plusieurs hashes pour différents utilisateurs (même mot de passe)
    print("\nHashes pour les utilisateurs:")
    users = ['patient@clinique.ma', 'sara@gmail.com', 'medecin@clinique.ma', 'laila@clinique.ma', 'secretaire@clinique.ma']
    for user in users:
        unique_hash = generate_bcrypt_hash("1234")
        print(f"{user}: {unique_hash}")
