# Gestion Clinique - Documentation Complète

## Table des Matières
1. [Introduction et Description du Projet](#introduction)
2. [Instructions d'Installation](#installation)
3. [Architecture et Choix de Conception](#architecture)
4. [UML et Modélisation](#uml)
5. [Base de Données](#database)
6. [Sécurité](#securite)
7. [API Documentation](#api)
8. [Déploiement](#deploiement)
9. [Équipe de Développement](#equipe)
10. [Difficultés et Solutions](#difficultes)

## Introduction et Description du Projet

La Gestion Clinique est une application web moderne pour la gestion complète d'un cabinet médical. Elle permet aux patients de prendre rendez-vous en ligne, aux médecins de gérer leur planning, et aux secrétaires d'administrer l'ensemble du système.

### Fonctionnalités Principales
- **Prise de rendez-vous en ligne** avec système de créneaux disponibles
- **Gestion multi-rôles** (Patient/Médecin/Secrétaire)
- **Interface responsive** adaptée mobile et desktop
- **Authentification sécurisée** avec tokens JWT
- **Messagerie intégrée** pour communication secrétaire-patient
- **Planning temps réel** avec statuts des arrivées
- **Gestion des profils** patients et médecins

## Instructions d'Installation

### Prérequis
- Node.js 18+ et npm
- MySQL 8.0+ ou PostgreSQL 13+
- Git pour le contrôle de version

### Installation Frontend
```bash
# Cloner le dépôt
git clone https://github.com/essalehyabderrahman/share199.git
cd share199

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec votre configuration

# Démarrer le serveur de développement
npm run dev
```

### Installation Base de Données
```bash
# Créer la base de données
mysql -u root -p < database/schema.sql

# Insérer les données d'exemple
mysql -u root -p gestion_clinique < database/sample-data.sql
```

## Architecture et Choix de Conception
  - `ProfilPage`, `LoginPage` : profil et page de connexion.
- **`AppLayout`** : layout principal (header, navigation, contenu, navigation mobile).
- **`App`** : racine React qui assemble les providers de contexte et le layout.

