-- Modification des ENUM pour supprimer les accents
UPDATE appointments SET statut = 'confirme' WHERE statut = 'confirmé';
UPDATE appointments SET statut = 'annule' WHERE statut = 'annulé';
UPDATE appointments SET statut = 'en_attente' WHERE statut = 'en attente';
UPDATE appointments SET statut = 'reporte' WHERE statut = 'reporté';

UPDATE appointments SET arrivee = 'en_attente' WHERE arrivee = 'en attente';
UPDATE appointments SET arrivee = 'en_salle' WHERE arrivee = 'en salle';
ALTER TABLE appointments 
MODIFY statut ENUM('en_attente', 'confirme', 'annule', 'reporte') DEFAULT 'en_attente',
MODIFY arrivee ENUM('en_attente', 'en_salle', 'absent') DEFAULT 'en_attente';
