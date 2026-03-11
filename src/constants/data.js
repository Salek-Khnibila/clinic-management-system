export const USERS_DB = {
  patient: {
    role: "patient",
    prenom: "Ahmed",
    nom: "Alami",
    email: "patient@clinique.ma",
    password: "1234",
    telephone: "0612 345 678",
    groupeSanguin: "A+",
    patient_id: 1,
  },
  medecin: {
    role: "medecin",
    prenom: "Hassan",
    nom: "Karim",
    email: "medecin@clinique.ma",
    password: "1234",
    specialite: "Cardiologie",
    medecin_id: 1,
  },
  secretaire: {
    role: "secretaire",
    prenom: "Samira",
    nom: "Benali",
    email: "secretaire@clinique.ma",
    password: "1234",
    poste: "Secrétaire Médicale",
  },
};

export const MEDECINS_DB = [
  {
    id: 1,
    prenom: "Hassan",
    nom: "Karim",
    specialite: "Cardiologie",
    ville: "Casablanca",
    note: 4.8,
    avis: 124,
    dispo: true,
    tarif: "300 MAD",
    exp: "15 ans",
  },
  {
    id: 2,
    prenom: "Laila",
    nom: "Mansouri",
    specialite: "Pédiatrie",
    ville: "Rabat",
    note: 4.9,
    avis: 89,
    dispo: true,
    tarif: "250 MAD",
    exp: "10 ans",
  },
  {
    id: 3,
    prenom: "Omar",
    nom: "Bennani",
    specialite: "Dermatologie",
    ville: "Casablanca",
    note: 4.7,
    avis: 203,
    dispo: false,
    tarif: "200 MAD",
    exp: "8 ans",
  },
  {
    id: 4,
    prenom: "Fatima",
    nom: "Zerouali",
    specialite: "Ophtalmologie",
    ville: "Marrakech",
    note: 4.6,
    avis: 67,
    dispo: true,
    tarif: "280 MAD",
    exp: "12 ans",
  },
  {
    id: 5,
    prenom: "Youssef",
    nom: "Chraibi",
    specialite: "Neurologie",
    ville: "Fès",
    note: 4.9,
    avis: 156,
    dispo: true,
    tarif: "350 MAD",
    exp: "20 ans",
  },
  {
    id: 6,
    prenom: "Nadia",
    nom: "Tazi",
    specialite: "Gynécologie",
    ville: "Rabat",
    note: 4.8,
    avis: 98,
    dispo: true,
    tarif: "320 MAD",
    exp: "13 ans",
  },
];

export const PATIENTS_DB = [
  {
    id: 1,
    prenom: "Ahmed",
    nom: "Alami",
    tel: "0612 345 678",
    email: "patient@clinique.ma",
    gs: "A+",
  },
  {
    id: 2,
    prenom: "Sara",
    nom: "Benali",
    tel: "0698 765 432",
    email: "sara@gmail.com",
    gs: "B+",
  },
  {
    id: 3,
    prenom: "Youssef",
    nom: "Chraibi",
    tel: "0655 443 322",
    email: "youssef@gmail.com",
    gs: "O+",
  },
  {
    id: 4,
    prenom: "Fatima",
    nom: "Idrissi",
    tel: "0677 889 900",
    email: "fatima@gmail.com",
    gs: "AB-",
  },
];

export const INIT_RDV = [
  {
    id: 1,
    date: "2025-03-10",
    heure: "09:00",
    motif: "Douleur thoracique",
    statut: "confirmé",
    patient_id: 1,
    medecin_id: 1,
    arrivee: "en salle",
  },
  {
    id: 2,
    date: "2025-03-10",
    heure: "10:30",
    motif: "Suivi tension",
    statut: "confirmé",
    patient_id: 2,
    medecin_id: 1,
    arrivee: "en attente",
  },
  {
    id: 3,
    date: "2025-03-11",
    heure: "14:00",
    motif: "Fièvre enfant",
    statut: "en attente",
    patient_id: 3,
    medecin_id: 2,
    arrivee: "absent",
  },
  {
    id: 4,
    date: "2025-03-12",
    heure: "11:00",
    motif: "Contrôle annuel",
    statut: "confirmé",
    patient_id: 4,
    medecin_id: 1,
    arrivee: "en attente",
  },
  {
    id: 5,
    date: "2025-03-13",
    heure: "15:30",
    motif: "Bilan cardiaque",
    statut: "annulé",
    patient_id: 1,
    medecin_id: 1,
    arrivee: "absent",
  },
];

export const INIT_MSGS = [
  {
    id: 1,
    from: "secretaire",
    to_patient_id: 1,
    sujet: "Rappel RDV",
    corps:
      "Bonjour Ahmed, nous vous rappelons votre rendez-vous demain à 09h00 avec Dr. Karim. Merci de confirmer votre présence.",
    date: "2025-03-09",
    lu: true,
  },
  {
    id: 2,
    from: "secretaire",
    to_patient_id: 2,
    sujet: "RDV confirmé",
    corps:
      "Bonjour Sara, votre rendez-vous du 10 mars à 10h30 avec Dr. Karim est bien confirmé.",
    date: "2025-03-08",
    lu: false,
  },
];

export const SPECS = [
  "Cardiologie",
  "Pédiatrie",
  "Dermatologie",
  "Ophtalmologie",
  "Neurologie",
  "Généraliste",
  "Gynécologie",
  "Orthopédie",
];

export const VILLES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fès",
  "Tanger",
  "Agadir",
];

export const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export const DAYS = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

export const CRN_M = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
];

export const CRN_A = [
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

export const TEMPLATES = [
  {
    label: "Rappel RDV",
    sujet: "Rappel de votre rendez-vous",
    corps:
      "Bonjour, nous vous rappelons votre prochain rendez-vous. Merci de confirmer votre présence ou de nous contacter en cas d'empêchement.",
  },
  {
    label: "RDV confirmé",
    sujet: "Votre rendez-vous est confirmé",
    corps:
      "Bonjour, votre rendez-vous a bien été confirmé. Nous vous attendons à l'heure indiquée. Veuillez apporter votre carnet de santé.",
  },
  {
    label: "RDV annulé",
    sujet: "Annulation de votre rendez-vous",
    corps:
      "Bonjour, nous avons le regret de vous informer que votre rendez-vous a été annulé. Veuillez nous contacter pour reprogrammer une consultation.",
  },
  {
    label: "Documents requis",
    sujet: "Documents requis pour votre consultation",
    corps:
      "Bonjour, afin de préparer au mieux votre consultation, merci de nous apporter vos dernières analyses et ordonnances en cours.",
  },
];

