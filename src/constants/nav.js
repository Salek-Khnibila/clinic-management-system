// src/constants/nav.js

import { Home, Calendar, LayoutDashboard, ClipboardList, MessageSquare, UserPlus, Users, User } from "lucide-react";

export const NAV = {
  patient: [
    { id: "home", label: "Accueil",  Icon: Home     },
    { id: "rdv",  label: "Mes RDV",  Icon: Calendar },
    // Profil accessible via l'avatar en haut à droite
  ],
  medecin: [
    { id: "home",     label: "Accueil",  Icon: Home     },
    { id: "planning", label: "Planning", Icon: Calendar },
    // Profil accessible via l'avatar en haut à droite
  ],
  secretaire: [
    { id: "home",       label: "Dashboard",  Icon: LayoutDashboard },
    { id: "planning",   label: "Planning",   Icon: ClipboardList   },
    { id: "messagerie", label: "Messagerie", Icon: MessageSquare   },
    // Profil accessible via l'avatar en haut à droite
  ],
  admin: [
    { id: "home",   label: "Nouveau compte", Icon: UserPlus },
    { id: "users",  label: "Annuaire",       Icon: Users    },
    { id: "profil", label: "Profil",         Icon: User     }, // ← seul l'admin garde l'entrée nav
    // car son avatar (ShieldCheck) n'est pas un bouton de navigation vers le profil
  ],
};