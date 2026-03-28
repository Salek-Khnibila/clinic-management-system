-- ============================================
-- Migration : Ajout du rôle admin
-- ============================================

USE gestion_clinique;

-- Étape 1 : Modifier l'ENUM pour inclure 'admin'
ALTER TABLE users 
MODIFY COLUMN role ENUM('patient', 'medecin', 'secretaire', 'admin') NOT NULL;

-- Étape 2 : Créer le compte admin unique
-- ⚠️ Change le mot de passe après la première connexion !
INSERT INTO users (prenom, nom, email, password, role)
VALUES (
    'Super',
    'Admin', 
    'admin@clinique.com',
    -- Mot de passe : Admin@1234 (bcrypt rounds=12)
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TsxCqCgLqnFoqRbC5J.pNqVMqIbW',
    'admin'
);

-- Étape 3 : Contrainte unicité admin (un seul admin possible)
-- On utilise un UNIQUE INDEX partiel simulé via un trigger
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