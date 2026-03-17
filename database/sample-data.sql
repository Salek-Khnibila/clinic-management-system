-- Sample Data for Gestion Clinique

USE gestion_clinique;

-- Clear existing data
DELETE FROM messages;
DELETE FROM appointments;
DELETE FROM users;

-- Insert users
INSERT INTO users (prenom, nom, email, password, role, telephone, groupe_sanguin, specialite, ville, tarif, experience, note, avis, dispo) VALUES
('Admin', 'System', 'admin@gestionclinique.com', '$2b$12$zHJMgbQfRrRubHBZ5iYrx.KmMuL6bJt5kZ7XRA91iMXHgCOwn1Aby', 'secretaire', '0612345678', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('Dr', 'Smith', 'dr.smith@gestionclinique.com', '$2b$12$CXxNZWGhyOVzFhSL.NrcVuiRR0RZQ7Mo6SD4axgozver7XM7ty4WG', 'medecin', '0612345679', NULL, 'Cardiologie', 'Casablanca', '300 MAD', 10, 4.5, 25, 'Lundi-Vendredi'),
('Dr', 'Johnson', 'dr.johnson@gestionclinique.com', '$2b$12$CXxNZWGhyOVzFhSL.NrcVuiRR0RZQ7Mo6SD4axgozver7XM7ty4WG', 'medecin', '0612345680', NULL, 'Dermatologie', 'Rabat', '250 MAD', 8, 4.2, 18, 'Mardi-Samedi'),
('Alice', 'Dupont', 'alice.dupont@email.com', '$2b$12$1SOF/aoH1zj1EZ1l9U.ISOabpebK0MokwiLdopRKnv3ggyqzTV6W.', 'patient', '0612345681', 'AB+', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('Bob', 'Martin', 'bob.martin@email.com', '$2b$12$1SOF/aoH1zj1EZ1l9U.ISOabpebK0MokwiLdopRKnv3ggyqzTV6W.', 'patient', '0612345682', 'O-', NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- Insert appointments
INSERT INTO appointments (patient_id, medecin_id, date, heure, motif, statut) VALUES
(4, 2, '2025-03-15', '09:00', 'Consultation cardiologique', 'confirmé'),
(5, 3, '2025-03-16', '14:00', 'Consultation dermatologique', 'en attente');

-- Insert messages
INSERT INTO messages (sender, to_patient_id, sujet, corps, date) VALUES
('secretaire', 4, 'Rappel RDV', 'Rappel de votre rendez-vous.', '2025-03-13'),
('secretaire', 5, 'Confirmation', 'RDV confirmé.', '2025-03-13');
