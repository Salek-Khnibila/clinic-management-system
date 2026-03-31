-- ============================================================
-- Gestion Clinique — Script d'initialisation de la base de données
-- Exécuter : mysql -u root -p < init_database.sql
-- ============================================================

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS gestion_clinique
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE gestion_clinique;

-- ============================================================
-- TABLE : users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    prenom         VARCHAR(100) NOT NULL,
    nom            VARCHAR(100) NOT NULL,
    email          VARCHAR(255) NOT NULL UNIQUE,
    password       VARCHAR(255) NOT NULL,
    role           ENUM('patient', 'medecin', 'secretaire', 'admin') NOT NULL,
    telephone      VARCHAR(20),
    groupe_sanguin VARCHAR(5),
    specialite     VARCHAR(100),
    ville          VARCHAR(100),
    tarif          VARCHAR(50),
    experience     VARCHAR(50),
    dispo          VARCHAR(50) DEFAULT 'Disponible',
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email      (email),
    INDEX idx_role       (role),
    INDEX idx_nom_prenom (nom, prenom)
);

-- ============================================================
-- TABLE : appointments
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    date       DATE NOT NULL,
    heure      TIME NOT NULL,
    motif      TEXT NOT NULL,
    statut     ENUM('en_attente', 'confirme', 'annule', 'reporte') DEFAULT 'en_attente',
    patient_id INT NOT NULL,
    medecin_id INT NOT NULL,
    arrivee    ENUM('en_attente', 'en_salle', 'absent') DEFAULT 'en_attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (medecin_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_patient      (patient_id),
    INDEX idx_medecin      (medecin_id),
    INDEX idx_date         (date),
    INDEX idx_statut       (statut),
    INDEX idx_patient_date (patient_id, date),
    INDEX idx_medecin_date (medecin_id, date)
);

-- ============================================================
-- TABLE : reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    patient_id    INT         NOT NULL,
    medecin_id    INT         NOT NULL,
    note          TINYINT     NOT NULL CHECK (note BETWEEN 1 AND 5),
    commentaire   TEXT        NOT NULL,
    created_at    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
    -- Un patient ne peut évaluer un médecin qu'une seule fois
    UNIQUE KEY uq_patient_medecin (patient_id, medecin_id),
 
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (medecin_id) REFERENCES users(id) ON DELETE CASCADE,
 
    INDEX idx_medecin (medecin_id),
    INDEX idx_patient (patient_id)
);

-- ============================================================
-- TABLE : messages
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    sender        VARCHAR(255) NOT NULL,
    to_patient_id INT NOT NULL,
    sujet         VARCHAR(255) NOT NULL,
    corps         TEXT NOT NULL,
    date          DATE NOT NULL,
    lu            BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (to_patient_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_to_patient (to_patient_id),
    INDEX idx_date       (date),
    INDEX idx_lu         (lu),
    INDEX idx_patient_lu (to_patient_id, lu)
);

-- ============================================================
-- TABLE : medical_records
-- ============================================================
CREATE TABLE IF NOT EXISTS medical_records (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    patient_id         INT NOT NULL,
    medecin_id         INT NOT NULL,
    date_consultation  DATE NOT NULL,
    diagnostic         TEXT,
    traitement         TEXT,
    ordonnance         TEXT,
    notes              TEXT,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (medecin_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_patient (patient_id),
    INDEX idx_medecin (medecin_id),
    INDEX idx_date    (date_consultation)
);

-- ============================================================
-- TABLE : refresh_tokens
-- ============================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    token      VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_token   (token),
    INDEX idx_user    (user_id),
    INDEX idx_expires (expires_at)
);

-- ============================================================
-- TABLE : availability_slots
-- ============================================================
CREATE TABLE IF NOT EXISTS availability_slots (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    medecin_id  INT NOT NULL,
    date        DATE NOT NULL,
    heure       TIME NOT NULL,
    disponible  BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (medecin_id) REFERENCES users(id) ON DELETE CASCADE,

    UNIQUE KEY unique_slot     (medecin_id, date, heure),
    INDEX idx_medecin_date     (medecin_id, date),
    INDEX idx_disponible       (disponible)
);

-- ============================================================
-- TRIGGER : un seul compte admin autorisé
-- ============================================================
DROP TRIGGER IF EXISTS enforce_single_admin;

DELIMITER $$
CREATE TRIGGER enforce_single_admin
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.role = 'admin' THEN
        IF (SELECT COUNT(*) FROM users WHERE role = 'admin') > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Un seul compte admin est autorisé.';
        END IF;
    END IF;
END$$
DELIMITER ;

-- ============================================================
-- COMPTE ADMIN PAR DÉFAUT
-- Mot de passe : Admin@1234
-- ⚠️  Changez ce mot de passe après la première connexion !
-- ============================================================
INSERT INTO users (prenom, nom, email, password, role)
SELECT 'Super', 'Admin', 'admin@clinique.com',
       '$2b$12$Iy2Vxx3rkhiTDh6ioRPYU.IMWe0pRf0spP46PffVwzrMwYjgSIpJO',
       'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE role = 'admin'
);

-- ============================================================
-- DONNÉES DE DÉMONSTRATION (optionnelles)
-- Décommentez si vous voulez des données de test
-- ============================================================


-- Médecins de démonstration
-- Mot de passe pour tous : Demo@1234
INSERT INTO users (prenom, nom, email, password, role, telephone, specialite, ville, tarif, experience, dispo) VALUES
('Dr', 'Smith',   'dr.smith@clinique.com',   '$2a$12$uCS5IfYza3wN.Umq3wdlyuAaKeVDoQ6h.BWj5hnBruxoRXB3g2hW6', 'medecin', '0612345679', 'Cardiologie',   'Casablanca', '300 MAD', '10 ans', 'Lundi-Vendredi'),
('Dr', 'Johnson', 'dr.johnson@clinique.com', '$2a$12$uCS5IfYza3wN.Umq3wdlyuAaKeVDoQ6h.BWj5hnBruxoRXB3g2hW6', 'medecin', '0612345680', 'Dermatologie',  'Rabat',       '250 MAD', '8 ans', 'Mardi-Samedi');

-- Secrétaire de démonstration
INSERT INTO users (prenom, nom, email, password, role, telephone) VALUES
('Marie', 'Dupuis', 'secretaire@clinique.com', '$2a$12$uCS5IfYza3wN.Umq3wdlyuAaKeVDoQ6h.BWj5hnBruxoRXB3g2hW6', 'secretaire', '0612345678');

-- Patients de démonstration
INSERT INTO users (prenom, nom, email, password, role, telephone, groupe_sanguin) VALUES
('Alice', 'Dupont', 'alice@email.com', '$2a$12$uCS5IfYza3wN.Umq3wdlyuAaKeVDoQ6h.BWj5hnBruxoRXB3g2hW6', 'patient', '0612345681', 'AB+'),
('Bob',   'Martin', 'bob@email.com',   '$2a$12$uCS5IfYza3wN.Umq3wdlyuAaKeVDoQ6h.BWj5hnBruxoRXB3g2hW6', 'patient', '0612345682', 'O-');


-- ============================================================
-- Vérification finale
-- ============================================================
SELECT
    CONCAT('✅ Base de données initialisée avec succès !') AS statut;

SELECT
    role,
    COUNT(*) AS total
FROM users
GROUP BY role;