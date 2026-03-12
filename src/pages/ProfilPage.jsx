import React from "react";
import { LogOut } from "lucide-react";
import { C } from "../constants/designTokens.js";
import { ROLES } from "../constants/status.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Btn, Card, SectionTitle } from "../components/ui/Base.jsx";

export const ProfilPage = ({ onLogout }) => {
  const { user } = useAuth();
  const rc = ROLES[user.role];

  const fields = [
    ["Nom", user.nom],
    ["Prénom", user.prenom],
    ["Email", user.email],
    ...(user.role === "secretaire" ? [["Poste", user.poste]] : []),
    ...(user.role === "medecin" ? [["Spécialité", user.specialite]] : []),
    ...(user.role === "patient"
      ? [
          ["Téléphone", user.telephone],
          ["Groupe sanguin", user.groupeSanguin],
        ]
      : []),
  ];

  return (
    <div>
      <SectionTitle>Mon profil</SectionTitle>
      <Card
        style={{
          padding: "26px 22px",
          marginBottom: 14,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 78,
            height: 78,
            borderRadius: "50%",
            background: C.grad,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 900,
            fontSize: 28,
            margin: "0 auto 12px",
          }}
        >
          {user.prenom[0]}
          {user.nom[0]}
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: C.navy,
            fontFamily: "Georgia,serif",
          }}
        >
          {user.prenom} {user.nom}
        </div>
        <span
          style={{
            display: "inline-block",
            marginTop: 8,
            background: rc.bg,
            color: rc.color,
            borderRadius: 99,
            padding: "4px 16px",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {rc.label}
        </span>
      </Card>

      <Card style={{ padding: "18px 22px", marginBottom: 16 }}>
        {fields.map(([k, v]) => (
          <div
            key={k}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "11px 0",
              borderBottom: `1px solid ${C.border}`,
              fontSize: 14,
            }}
          >
            <span style={{ color: C.gray500, fontWeight: 600 }}>{k}</span>
            <span style={{ color: C.navy, fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </Card>

      <Btn full variant="danger" onClick={onLogout} icon={LogOut}>
        Se déconnecter
      </Btn>
    </div>
  );
};

