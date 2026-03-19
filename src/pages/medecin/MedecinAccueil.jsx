import { useState } from "react";
import { Bell, Clock, FileText, Heart, Phone, Stethoscope, Users } from "lucide-react";
import { C } from "../../constants/designTokens.js";

import { useApp } from "../../contexts/AppContext.jsx";
import { Avatar, Btn, Card, Modal, SectionTitle, StatusBadge, StatCard } from "../../components/ui/Base.jsx";

export const MedecinAccueil = ({ user }) => {
  const { rdvs, patients } = useApp();
  const mesRdv = rdvs.filter((r) => r.medecin_id === (user.medecin_id || 1));
  const todayStr = new Date().toISOString().split("T")[0];
  const rdvAujourd = mesRdv.filter(
    (r) => r.date === "2025-03-10" || r.date === todayStr
  );
  const [motifMod, setMotifMod] = useState(null);

  const enAttente = mesRdv.filter((r) => r.statut === "en_attente").length;

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
          Espace Médecin
        </div>
        <h1
          style={{
            margin: "0 0 4px",
            fontSize: 22,
            fontWeight: 900,
            fontFamily: "Georgia,serif",
          }}
        >
          Dr. {user.prenom} {user.nom}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.8 }}>
          <Stethoscope size={13} />
          <span style={{ fontSize: 13 }}>{user.specialite}</span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))",
          gap: 12,
          marginBottom: 22,
        }}
      >
        <StatCard
          label="RDV aujourd'hui"
          value={rdvAujourd.length}
          Icon={Users}
          color={C.tealDk}
        />
        <StatCard
          label="Confirmés"
          value={mesRdv.filter((r) => r.statut === "confirme").length}
          Icon={Heart}
          color={C.green}
        />
        <StatCard
          label="En attente"
          value={enAttente}
          Icon={Clock}
          color={C.amber}
        />
      </div>

      {enAttente > 0 && (
        <div
          style={{
            background: C.amberLt,
            border: `1px solid ${C.amber}44`,
            borderRadius: 10,
            padding: "11px 16px",
            marginBottom: 18,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Bell size={17} color={C.amber} />
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#92400E",
            }}
          >
            {enAttente} nouveau{enAttente > 1 ? "x" : ""} RDV en attente
          </span>
        </div>
      )}

      <SectionTitle sub="Consultations du jour">Patients du jour</SectionTitle>

      {rdvAujourd.length === 0 && (
        <Card style={{ padding: "40px", textAlign: "center" }}>
          <Users
            size={32}
            color={C.gray400}
            style={{ margin: "0 auto 12px", display: "block" }}
          />
          <div style={{ color: C.gray500 }}>Aucun patient aujourd&apos;hui.</div>
        </Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rdvAujourd.map((rdv) => {
          const p = patients.find((x) => x.id === rdv.patient_id);
          return (
            <Card key={rdv.id} style={{ padding: "15px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                <Avatar
                  name={`${p?.prenom} ${p?.nom}`}
                  color={C.tealDk}
                  size={44}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 14,
                      color: C.navy,
                      fontFamily: "Georgia,serif",
                    }}
                  >
                    {p?.prenom} {p?.nom}
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 12,
                        color: C.gray500,
                      }}
                    >
                      <Clock size={11} />
                      {rdv.heure}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: C.red,
                        fontWeight: 700,
                      }}
                    >
                      <Heart
                        size={11}
                        fill={C.red}
                        style={{
                          display: "inline",
                          marginRight: 3,
                        }}
                      />
                      {p?.groupe_sanguin}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 7,
                    alignItems: "flex-end",
                  }}
                >
                  <StatusBadge statut={rdv.statut} />
                  <button
                    onClick={() => setMotifMod({ rdv, p })}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.tealDk,
                      background: C.tealLt,
                      border: `1px solid ${C.teal}33`,
                      borderRadius: 7,
                      padding: "5px 10px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <FileText size={11} />
                    Motif
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {motifMod && (
        <Modal
          title="Motif de consultation"
          onClose={() => setMotifMod(null)}
          width={420}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
              padding: "14px",
              background: C.gray50,
              borderRadius: 10,
              marginBottom: 16,
              border: `1px solid ${C.border}`,
            }}
          >
            <Avatar
              name={`${motifMod.p?.prenom} ${motifMod.p?.nom}`}
              color={C.tealDk}
              size={46}
            />
            <div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 15,
                  color: C.navy,
                }}
              >
                {motifMod.p?.prenom} {motifMod.p?.nom}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    color: C.gray500,
                  }}
                >
                  <Phone size={11} />
                   {motifMod.p?.telephone}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: C.red,
                    fontWeight: 700,
                  }}
                >
                  Groupe: {motifMod.p?.groupe_sanguin}
                </span>
              </div>
            </div>
          </div>
          <div
            style={{
              background: C.tealLt,
              borderRadius: 10,
              padding: "15px 17px",
              marginBottom: 16,
              border: `1px solid ${C.teal}22`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                fontWeight: 700,
                color: C.tealDk,
                textTransform: "uppercase",
                letterSpacing: 0.7,
                marginBottom: 9,
              }}
            >
              <FileText size={12} />
              Motif déclaré par le patient
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 15,
                color: C.navy,
                fontWeight: 600,
                lineHeight: 1.7,
              }}
            >
              {motifMod.rdv.motif}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                color: C.gray500,
              }}
            >
              <Clock size={12} />
              {motifMod.rdv.heure} · {motifMod.rdv.date}
            </span>
            <StatusBadge statut={motifMod.rdv.statut} />
          </div>
          <Btn full onClick={() => setMotifMod(null)}>
            Fermer
          </Btn>
        </Modal>
      )}
    </div>
  );
};

