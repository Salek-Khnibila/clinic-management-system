USE gestion_clinique;

-- ── ÉTAPE 1 : Nettoyer les données existantes ─────────────────
-- Extraire uniquement la partie numérique de tarif
UPDATE users
SET tarif = REGEXP_REPLACE(tarif, '[^0-9.]', '')
WHERE tarif IS NOT NULL AND tarif != '';

-- Mettre NULL si la valeur est vide après nettoyage
UPDATE users
SET tarif = NULL
WHERE tarif = '';

-- Extraire uniquement la partie numérique de experience
UPDATE users
SET experience = REGEXP_REPLACE(experience, '[^0-9]', '')
WHERE experience IS NOT NULL AND experience != '';

-- Mettre NULL si la valeur est vide après nettoyage
UPDATE users
SET experience = NULL
WHERE experience = '';

UPDATE users SET specialite = 'Cardiologie'  WHERE specialite = 'Cardiolog';
UPDATE users SET specialite = NULL           WHERE specialite = 'C';
UPDATE users SET specialite = NULL           WHERE specialite = 'T';

-- ── ÉTAPE 2 : Changer les types ───────────────────────────────
ALTER TABLE users
  MODIFY COLUMN tarif DECIMAL(8,2) DEFAULT NULL;

ALTER TABLE users
  MODIFY COLUMN experience SMALLINT UNSIGNED DEFAULT NULL;

-- ── ÉTAPE 3 : Changer specialite et ville en ENUM ─────────────
ALTER TABLE users
  MODIFY COLUMN specialite ENUM(
    'Médecine générale','Cardiologie','Dermatologie',
    'Gynécologie','Pédiatrie','Ophtalmologie','Orthopédie',
    'Neurologie','Psychiatrie','Radiologie','Oncologie',
    'Urologie','Gastro-entérologie','Endocrinologie',
    'Pneumologie','Rhumatologie','ORL','Stomatologie',
    'Chirurgie générale','Anesthésiologie','Néphrologie',
    'Hématologie','Infectiologie','Médecine du travail',
    'Médecine sportive'
  ) DEFAULT NULL;

ALTER TABLE users
  MODIFY COLUMN ville ENUM(
    'Casablanca','Rabat','Tanger','Marrakech',
    'Fès','Agadir','Kénitra'
  ) DEFAULT NULL;

-- ── ÉTAPE 4 : Améliorer note et avis ─────────────────────────
ALTER TABLE users
  MODIFY COLUMN note DECIMAL(3,2) DEFAULT 0.00;

ALTER TABLE users
  MODIFY COLUMN avis SMALLINT UNSIGNED DEFAULT 0;

-- ── Vérification ──────────────────────────────────────────────
DESCRIBE users;
SELECT id, nom, specialite, ville, tarif, experience FROM users WHERE role = 'medecin';