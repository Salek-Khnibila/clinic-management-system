# Gestion Clinique (React + Vite)

Application de démonstration pour la gestion d'un petit cabinet médical avec trois rôles : **patient**, **médecin** et **secrétaire**.

## Démarrage

```bash
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:5173`.

## Structure principale

- **`src/constants`** : design tokens, données statiques (utilisateurs de démo, rendez‑vous, etc.) et configuration de la navigation.
- **`src/contexts`** : contextes globaux (`AuthContext`, `AppContext`) pour l'authentification et les données partagées (RDV, messages).
- **`src/hooks`** : hooks personnalisés (`useMobile`) pour la gestion du responsive.
- **`src/components`** :
  - `components/ui` : composants UI réutilisables (`Logo`, `Card`, `Btn`, `Modal`, `MiniCalendar`, etc.).
  - `components/booking` : flux de réservation de rendez‑vous.
  - `components/doctor` : carte médecin.
- **`src/pages`** :
  - `pages/patient` : vues patient (accueil, mes RDV / messagerie).
  - `pages/medecin` : vues médecin (accueil, planning).
  - `pages/secretaire` : vues secrétaire (dashboard, planning, messagerie).
  - `ProfilPage`, `LoginPage` : profil et page de connexion.
- **`AppLayout`** : layout principal (header, navigation, contenu, navigation mobile).
- **`App`** : racine React qui assemble les providers de contexte et le layout.

