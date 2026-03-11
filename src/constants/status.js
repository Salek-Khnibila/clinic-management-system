import {
  CheckCircle,
  Clock,
  RefreshCw,
  XCircle,
  Heart,
  Baby,
  Shield,
  Eye,
  Brain,
  Stethoscope,
  Activity,
  Bone,
} from "lucide-react";
import { C } from "./designTokens.js";

export const STATUS = {
  confirmé: { bg: C.greenLt, text: C.green, Icon: CheckCircle, label: "Confirmé" },
  "en attente": { bg: C.amberLt, text: C.amber, Icon: Clock, label: "En attente" },
  annulé: { bg: C.redLt, text: C.red, Icon: XCircle, label: "Annulé" },
  reporté: { bg: C.purpleLt, text: C.purple, Icon: RefreshCw, label: "Reporté" },
};

export const ARRIVEE = {
  "en salle": { bg: "#D1FAE5", text: "#059669", label: "En salle" },
  "en attente": { bg: C.amberLt, text: C.amber, label: "En attente" },
  absent: { bg: C.redLt, text: C.red, label: "Absent" },
};

export const ROLES = {
  patient: { label: "Patient", color: C.teal, bg: C.tealLt },
  medecin: { label: "Médecin", color: C.navy, bg: "#E8EDF4" },
  secretaire: { label: "Secrétaire", color: C.purple, bg: C.purpleLt },
};

export const SPEC_ICONS = {
  Cardiologie: Heart,
  Pédiatrie: Baby,
  Dermatologie: Shield,
  Ophtalmologie: Eye,
  Neurologie: Brain,
  Généraliste: Stethoscope,
  Gynécologie: Activity,
  Orthopédie: Bone,
};

