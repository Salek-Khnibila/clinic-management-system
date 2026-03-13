# Hash les mots de passe pour les données d'exemple
import bcrypt

def hash_passwords():
    passwords = {
        'patient@clinique.ma': '1234',
        'sara@gmail.com': '1234',
        'medecin@clinique.ma': '1234',
        'laila@clinique.ma': '1234',
        'secretaire@clinique.ma': '1234'
    }
    
    for email, password in passwords.items():
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        print(f"Email: {email}")
        print(f"Hash: {hashed.decode('utf-8')}")
        print()

if __name__ == '__main__':
    hash_passwords()
