-- ============================================
-- Sample Data Insertion
-- ============================================

USE gestion_clinique;

-- Insert sample users (passwords are bcrypt hashes for "1234")
INSERT INTO users (prenom, nom, email, password, role, telephone, groupe_sanguin) VALUES
('Ahmed', 'Alami', 'patient@clinique.ma', '$2b$12$LQv3c1yqBWVHxkd0LdQaO6q9q9q9q9q9q9q9q9q9q9q9q9q', 'patient', '0612 345 678', 'A+'),
('Sara', 'Benali', 'sara@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LdQaO6q9q9q9q9q9q9q9q9q9q9q9q9q', 'patient', '0698 765 432', 'B+'),
('Hassan', 'Karim', 'medecin@clinique.ma', '$2b$12$LQv3c1yqBWVHxkd0LdQaO6q9q9q9q9q9q9q9q9q9q9q9q', 'medecin', NULL, NULL, 'Cardiologie', 'Casablanca', '300 MAD', '15 ans', 4.8, 124, TRUE),
('Laila', 'Mansouri', 'laila@clinique.ma', '$2b$12$LQv3c1yqBWVHxkd0LdQaO6q9q9q9q9q9q9q9q9q9q9q9q', 'medecin', NULL, NULL, 'Pédiatrie', 'Rabat', '250 MAD', '10 ans', 4.9, 89, TRUE),
('Samira', 'Benali', 'secretaire@clinique.ma', '$2b$12$LQv3c1yqBWVHxkd0LdQaO6q9q9q9q9q9q9q9q9q9q9q9q', 'secretaire', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, FALSE);

-- Insert sample appointments
INSERT INTO appointments (date, heure, motif, statut, patient_id, medecin_id, arrivee) VALUES
('2025-03-10', '09:00', 'Douleur thoracique', 'confirmé', 1, 3, 'en salle'),
('2025-03-10', '10:30', 'Suivi tension', 'confirmé', 2, 3, 'en attente'),
('2025-03-11', '14:00', 'Fièvre enfant', 'en attente', 3, 4, 'absent'),
('2025-03-12', '11:00', 'Contrôle annuel', 'confirmé', 4, 3, 'en attente'),
('2025-03-13', '15:30', 'Bilan cardiaque', 'annulé', 1, 3, 'absent');

-- Insert sample messages
INSERT INTO messages (`from`, to_patient_id, sujet, corps, date, lu) VALUES
('secretaire', 1, 'Rappel RDV', 'Bonjour Ahmed, nous vous rappelons votre rendez-vous demain à 09h00 avec Dr. Karim. Merci de confirmer votre présence.', '2025-03-09', TRUE),
('secretaire', 2, 'RDV confirmé', 'Bonjour Sara, votre rendez-vous du 10 mars à 10h30 avec Dr. Karim est bien confirmé.', '2025-03-08', FALSE);
