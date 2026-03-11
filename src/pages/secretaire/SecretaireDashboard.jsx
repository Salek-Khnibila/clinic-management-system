import React from "react";
import { AlertTriangle, ArrowRight, Calendar, Clock, ClipboardList, Stethoscope, Users } from "lucide-react";
import { C } from "../../constants/designTokens.js";
import { MEDECINS_DB, PATIENTS_DB } from "../../constants/data.js";
import { useApp } from "../../contexts/AppContext.jsx";
import { Avatar, Card, SectionTitle, StatCard, StatusBadge } from "../../components/ui/Base.js";

export const SecretaireDashboard = ({ onNavigate }) => {
  const { rdvs } = useApp();
  const enAtt = rdvs.filter((r) => r.statut === "en attente").length;

  return (
    <div>
      <div
        style={{
          background: C.grad,
          borderRadius: 16,
          padding: "26px 22px",
          marginBottom: 22,
          color: "#fff",
        }}
      >
        <div
          style={{
            fontSize: 11,
            opacity: 0.7,
            textTransform: "uppercase",
            letterSpacing: 2,
            marginBottom: 8,
          }}
        >
          Espace Secrétaire
        </div>
        <h1
          style={{
            margin: "0 0 4px",
            fontSize: 22,
            fontWeight: 900,
            fontFamily: "Georgia,serif",
          }}
        >
          Tableau de bord
        </h1>
        <p style={{ margin: 0, opacity: 0.75, fontSize: 13 }}>
          Vue d'ensemble du cabinet médical
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
          gap: 12,
          marginBottom: 22,
        }}
      >
        <StatCard
          label="Patients"
          value={PATIENTS_DB.length}
          Icon={Users}
          color={C.tealDk}
          onClick={() => onNavigate("planning")}
        />
        <StatCard
          label="Médecins"
          value={MEDECINS_DB.length}
          Icon={Stethoscope}
          color={C.navy}
        />
        <StatCard
          label="Total RDV"
          value={rdvs.length}
          Icon={Calendar}
          color={C.green}
          onClick={() => onNavigate("planning")}
        />
        <StatCard
          label="En attente"
          value={enAtt}
          Icon={Clock}
          color={C.amber}
          sub={enAtt > 0 ? "Action requise" : ""}
          onClick={() => onNavigate("planning")}
        />
      </div>

      {enAtt > 0 && (
        <Card
          style={{
            padding: "14px 18px",
            marginBottom: 16,
            background: C.amberLt,
            border: `1px solid ${C.amber}44`,
            cursor: "pointer",
          }}
          onClick={() => onNavigate("planning")}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `${C.amber}22`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle size={19} color={C.amber} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 14,
                  color: "#92400E",
                }}
              >
                {enAtt} rendez-vous à valider
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: C.amber,
                }}
              >
                Cliquez pour accéder au planning
              </div>
            </div>
            <ArrowRight size={17} color={C.amber} />
          </div>
        </Card>
      )}

      <SectionTitle>RDV récents</SectionTitle>
      {rdvs.slice(0, 5).map((rdv) => {
        const p = PATIENTS_DB.find((x) => x.id === rdv.patient_id);
        const m = MEDECINS_DB.find((x) => x.id === rdv.medecin_id);
        return (
          <Card
            key={rdv.id}
            style={{
              padding: "12px 17px",
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Avatar
              name={`${p?.prenom} ${p?.nom}`}
              color={C.tealDk}
              size={36}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 13,
                  color: C.navy,
                }}
              >
                {p?.prenom} {p?.nom}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: C.gray500,
                  display: "flex",
                  gap: 8,
                  marginTop: 2,
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <Stethoscope size={10} />
                  Dr. {m?.nom}
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <Clock size={10} />
                  {rdv.heure}
                </span>
              </div>
            </div>
            <StatusBadge statut={rdv.statut} />
          </Card>
        );
      })}
    </div>
  );
};

