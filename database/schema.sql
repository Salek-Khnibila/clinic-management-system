-- ============================================
-- Database Schema for Clinic Management System
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS gestion_clinique CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gestion_clinique;

-- ============================================
-- Users Table
-- ============================================
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
    experience VARCHAR(50),
    note DECIMAL(3,1) DEFAULT 0.0,
    avis INT DEFAULT 0,
    dispo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_nom_prenom (nom, prenom)
);

-- ============================================
-- Appointments Table
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    heure TIME NOT NULL,
    motif TEXT NOT NULL,
    statut ENUM('en attente', 'confirmé', 'annulé', 'reporté') DEFAULT 'en attente',
    patient_id INT NOT NULL,
    medecin_id INT NOT NULL,
    arrivee ENUM('en attente', 'en salle', 'absent') DEFAULT 'en attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (medecin_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_patient (patient_id),
    INDEX idx_medecin (medecin_id),
    INDEX idx_date (date),
    INDEX idx_statut (statut),
    INDEX idx_patient_date (patient_id, date),
    INDEX idx_medecin_date (medecin_id, date)
);

-- ============================================
-- Messages Table
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `from` VARCHAR(50) NOT NULL,
    to_patient_id INT NOT NULL,
    sujet VARCHAR(255) NOT NULL,
    corps TEXT NOT NULL,
    date DATE NOT NULL,
    lu BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (to_patient_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_to_patient (to_patient_id),
    INDEX idx_date (date),
    INDEX idx_lu (lu),
    INDEX idx_patient_lu (to_patient_id, lu)
);

-- ============================================
-- Medical Records Table (Bonus)
-- ============================================
CREATE TABLE IF NOT EXISTS medical_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    medecin_id INT NOT NULL,
    date_consultation DATE NOT NULL,
    diagnostic TEXT,
    traitement TEXT,
    ordonnance TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (medecin_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_patient (patient_id),
    INDEX idx_medecin (medecin_id),
    INDEX idx_date (date_consultation)
);

-- ============================================
-- Refresh Tokens Table (for JWT)
-- ============================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user (user_id),
    INDEX idx_expires (expires_at)
);

-- ============================================
-- Availability Slots Table (Optional enhancement)
-- ============================================
CREATE TABLE IF NOT EXISTS availability_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medecin_id INT NOT NULL,
    date DATE NOT NULL,
    heure TIME NOT NULL,
    disponible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (medecin_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_slot (medecin_id, date, heure),
    INDEX idx_medecin_date (medecin_id, date),
    INDEX idx_disponible (disponible)
);
