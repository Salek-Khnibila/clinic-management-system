import { Calendar, ClipboardList, Home, LayoutDashboard, MessageSquare, User, UserPlus, Users } from "lucide-react";

export const NAV = {
  patient: [
    { id: "home",     label: "Accueil",   Icon: Home },
    { id: "rdv",      label: "Mes RDV",   Icon: Calendar },
    { id: "profil",   label: "Profil",    Icon: User },
  ],
  medecin: [
    { id: "home",     label: "Accueil",   Icon: Home },
    { id: "planning", label: "Planning",  Icon: Calendar },
    { id: "profil",   label: "Profil",    Icon: User },
  ],
  secretaire: [
    { id: "home",       label: "Dashboard",  Icon: LayoutDashboard },
    { id: "planning",   label: "Planning",   Icon: ClipboardList },
    { id: "messagerie", label: "Messagerie", Icon: MessageSquare },
    { id: "medecins",   label: "Médecins",   Icon: UserPlus },
    { id: "profil",     label: "Profil",     Icon: User },
  ],
  admin: [
    { id: "home",  label: "Créer un compte",      Icon: UserPlus },
    { id: "users", label: "Gérer les utilisateurs", Icon: Users },
  ],
};