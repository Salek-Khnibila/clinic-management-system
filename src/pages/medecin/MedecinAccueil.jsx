import { useState, useEffect } from "react";
import { Bell, Clock, FileText, Heart, Phone, RefreshCw, Stethoscope, Users } from "lucide-react";
import { C } from "../../constants/designTokens.js";

import { useApp } from "../../contexts/AppContext.jsx";
import { useMobile } from "../../hooks/useMobile.js";
import { Avatar, Btn, Card, Modal, SectionTitle, StatusBadge, StatCard } from "../../components/ui/Base.jsx";

export const MedecinAccueil = ({ user: propUser }) => {
  const { rdvs, patients, user: contextUser, refreshData } = useApp();
  const user = propUser || contextUser; // Use context user if prop not provided
  const isMobile = useMobile();
  
  // Role-based validation
  if (!user || user.role !== 'medecin') {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>Accès non autorisé</h2>
        <p>Cette page est réservée aux médecins.</p>
      </div>
    );
  }
  
  // Refresh data when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      refreshData();
    }
  }, [user?.id, refreshData]);

  const mesRdv = rdvs?.filter((r) => r.medecin_id === user?.id) || [];

  const todayStr = new Date().toISOString().split("T")[0];
  const rdvAujourd = mesRdv.filter((r) => r.date === todayStr);
  const [motifMod, setMotifMod] = useState(null);

  const enAttente = mesRdv.filter((r) => r.statut === "en_attente").length;

  // Responsive styles
  const containerStyle = {
    padding: isMobile ? "16px 12px" : "26px 22px",
  };

  const headerStyle = {
    background: C.grad,
    borderRadius: 16,
    padding: isMobile ? "20px 16px" : "26px 22px",
    marginBottom: isMobile ? 16 : 22,
    color: "#fff",
  };

  const titleStyle = {
    margin: "0 0 4px",
    fontSize: isMobile ? 18 : 22,
    fontWeight: 900,
    fontFamily: "Georgia,serif",
  };

  const statsGrid = {
    display: "grid",
    gap: isMobile ? 10 : 12,
    gridTemplateColumns: isMobile
      ? "repeat(auto-fill,minmax(140px,1fr))"
      : "repeat(auto-fill,minmax(170px,1fr))",
    marginBottom: isMobile ? 16 : 22,
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div
          style={{
            fontSize: isMobile ? 10 : 11,
            opacity: 0.7,
            textTransform: "uppercase",
            letterSpacing: 2,
            marginBottom: 8,
          }}
        >
          Espace Médecin
        </div>
        <h1 style={titleStyle}>
          Dr. {user.prenom} {user.nom}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.8 }}>
          <Stethoscope size={isMobile ? 12 : 13} />
          <span style={{ fontSize: isMobile ? 12 : 13 }}>{user.specialite}</span>
          <Btn
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            onClick={refreshData}
            style={{ marginLeft: "auto" }}
          >
            Actualiser
          </Btn>
        </div>
      </div>

      <div style={statsGrid}>
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
            padding: isMobile ? "9px 12px" : "11px 16px",
            marginBottom: isMobile ? 14 : 18,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Bell size={isMobile ? 15 : 17} color={C.amber} />
          <span
            style={{
              fontSize: isMobile ? 12 : 13,
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
        <Card style={{ padding: isMobile ? "30px" : "40px", textAlign: "center" }}>
          <Users
            size={isMobile ? 28 : 32}
            color={C.gray400}
            style={{ margin: "0 auto 12px", display: "block" }}
          />
          <div style={{ color: C.gray500, fontSize: isMobile ? 14 : 16 }}>
            Aucun patient aujourd&apos;hui.
          </div>
        </Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 10 }}>
        {rdvAujourd.map((rdv) => {
          const p = patients.find((x) => x.id === rdv.patient_id);
          return (
            <Card key={rdv.id} style={{ padding: isMobile ? "12px 14px" : "15px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 13 }}>
                <Avatar
                  name={`${p?.prenom} ${p?.nom}`}
                  color={C.tealDk}
                  size={isMobile ? 38 : 44}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: isMobile ? 13 : 14,
                      color: C.navy,
                      fontFamily: "Georgia,serif",
                    }}
                  >
                    {p?.prenom} {p?.nom}
                  </div>
                  <div style={{ display: "flex", gap: isMobile ? 10 : 12, marginTop: 4 }}>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: isMobile ? 11 : 12,
                        color: C.gray500,
                      }}
                    >
                      <Clock size={isMobile ? 10 : 11} />
                      {rdv.heure}
                    </span>
                    <span
                      style={{
                        fontSize: isMobile ? 11 : 12,
                        color: C.red,
                        fontWeight: 700,
                      }}
                    >
                      <Heart
                        size={isMobile ? 10 : 11}
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
                      fontSize: isMobile ? 10 : 11,
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
                    <FileText size={isMobile ? 10 : 11} />
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

