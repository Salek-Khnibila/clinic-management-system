import mysql.connector
import os
import bcrypt
from dotenv import load_dotenv

load_dotenv()

# DB config
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'root0000'),
    'database': os.getenv('DB_NAME', 'gestion_clinique'),
    'port': int(os.getenv('DB_PORT', 3306))
}

# Connect
conn = mysql.connector.connect(**DB_CONFIG)
cursor = conn.cursor()

# Create tables
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prenom VARCHAR(100) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('patient', 'medecin', 'secretaire') NOT NULL,
    telephone VARCHAR(20),
    groupe_sanguin VARCHAR(5),
    specialite VARCHAR(100),
    ville VARCHAR(100),
    tarif VARCHAR(50),
    experience INT,
    note DECIMAL(3,1),
    avis INT,
    dispo VARCHAR(50)
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    medecin_id INT,
    date DATE NOT NULL,
    heure TIME NOT NULL,
    motif TEXT,
    statut ENUM('en attente', 'confirmé', 'annulé', 'reporté') DEFAULT 'en attente',
    notes TEXT,
    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (medecin_id) REFERENCES users(id)
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `from` VARCHAR(255) NOT NULL,
    to_patient_id INT,
    sujet VARCHAR(255),
    corps TEXT,
    date VARCHAR(20) DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (to_patient_id) REFERENCES users(id)
)
''')

# Sample data
users = [
    ('Admin', 'System', 'admin@gestionclinique.com', bcrypt.hashpw('admin123'.encode(), bcrypt.gensalt()).decode(), 'secretaire', '0612345678', 'O+', None, None, None, None, None, None, None),
    ('Dr', 'Smith', 'dr.smith@gestionclinique.com', bcrypt.hashpw('medecin123'.encode(), bcrypt.gensalt()).decode(), 'medecin', '0612345679', 'A+', 'Cardiologie', 'Casablanca', '300 MAD', 10, 4.5, 25, 'Lundi-Vendredi'),
    ('Dr', 'Johnson', 'dr.johnson@gestionclinique.com', bcrypt.hashpw('medecin123'.encode(), bcrypt.gensalt()).decode(), 'medecin', '0612345680', 'B+', 'Dermatologie', 'Rabat', '250 MAD', 8, 4.2, 18, 'Mardi-Samedi'),
    ('Alice', 'Dupont', 'alice.dupont@email.com', bcrypt.hashpw('patient123'.encode(), bcrypt.gensalt()).decode(), 'patient', '0612345681', 'AB+', None, None, None, None, None, None, None),
    ('Bob', 'Martin', 'bob.martin@email.com', bcrypt.hashpw('patient123'.encode(), bcrypt.gensalt()).decode(), 'patient', '0612345682', 'O-', None, None, None, None, None, None, None),
]

for user in users:
    cursor.execute('INSERT IGNORE INTO users (prenom, nom, email, password, role, telephone, groupe_sanguin, specialite, ville, tarif, experience, note, avis, dispo) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)', user)

# Sample appointments
appointments = [
    (4, 2, '2025-03-15', '09:00', 'Consultation cardiologique', 'confirmé'),
    (5, 3, '2025-03-16', '14:00', 'Consultation dermatologique', 'en attente'),
]

for appt in appointments:
    cursor.execute('INSERT INTO appointments (patient_id, medecin_id, date, heure, motif, statut) VALUES (%s, %s, %s, %s, %s, %s)', appt)

conn.commit()
conn.close()

print("Database setup complete!")