import { useEffect } from "react";
import { AlertTriangle, ArrowRight, Calendar, Clock, Phone, RefreshCw, Stethoscope, Users } from "lucide-react";
import { C } from "../../constants/designTokens.js";
import { useApp } from "../../contexts/AppContext.jsx";
import { useMobile } from "../../hooks/useMobile.js";
import { Avatar, Btn, Card, SectionTitle, StatCard, StatusBadge } from "../../components/ui/Base.jsx";

export const SecretaireDashboard = ({ onNavigate }) => {
  const { rdvs, doctors, patients, refreshData } = useApp();
  const isMobile = useMobile();
  const enAtt = rdvs.filter((r) => r.statut === "en_attente").length;

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Responsive styles
  const containerStyle = {
    padding: isMobile ? "12px 8px" : "26px 22px",
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
      : "repeat(auto-fill,minmax(160px,1fr))",
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
          Espace Secrétaire
        </div>
        <h1 style={titleStyle}>
          Tableau de bord
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.8 }}>
          <Stethoscope size={isMobile ? 12 : 13} />
          <span style={{ fontSize: isMobile ? 12 : 13 }}>
            Vue d&apos;ensemble du cabinet médical
          </span>
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
          label="Patients"
          value={patients.length}
          Icon={Users}
          color={C.tealDk}
          onClick={() => onNavigate("planning")}
        />
        <StatCard
          label="Médecins"
          value={doctors.length}
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
            padding: isMobile ? "12px 14px" : "14px 18px",
            marginBottom: isMobile ? 12 : 16,
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
              gap: isMobile ? 10 : 12,
            }}
          >
            <div
              style={{
                width: isMobile ? 35 : 40,
                height: isMobile ? 35 : 40,
                borderRadius: 10,
                background: `${C.amber}22`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle size={isMobile ? 17 : 19} color={C.amber} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: isMobile ? 13 : 14,
                  color: "#92400E",
                }}
              >
                {enAtt} rendez-vous à valider
              </div>
              <div
                style={{
                  fontSize: isMobile ? 11 : 12,
                  color: C.amber,
                }}
              >
                Cliquez pour accéder au planning
              </div>
            </div>
            <ArrowRight size={isMobile ? 15 : 17} color={C.amber} />
          </div>
        </Card>
      )}

      <SectionTitle>RDV récents</SectionTitle>
      {rdvs.slice(0, 5).map((rdv) => {
        return (
          <Card
            key={rdv.id}
            style={{
              padding: isMobile ? "10px 12px" : "12px 17px",
              marginBottom: isMobile ? 6 : 8,
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 10 : 12,
            }}
          >
            <Avatar
              name={`${rdv.patient_prenom} ${rdv.patient_nom}`}
              color={C.tealDk}
              size={isMobile ? 32 : 36}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: isMobile ? 12 : 13, color: C.navy }}>
                {rdv.patient_prenom} {rdv.patient_nom}
              </div>
              <div style={{
                fontSize: isMobile ? 10 : 11, color: C.gray500,
                display: "flex", gap: isMobile ? 6 : 8, marginTop: 2, flexWrap: "wrap",
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Stethoscope size={isMobile ? 9 : 10} />
                  Dr. {rdv.medecin_nom}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Clock size={isMobile ? 9 : 10} />
                  {rdv.heure}
                </span>
                {rdv.patient_telephone && (
                  <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Phone size={isMobile ? 9 : 10} />
                    {rdv.patient_telephone}
                  </span>
                )}
              </div>
            </div>
            <StatusBadge statut={rdv.statut} />
          </Card>
        );
      })}
    </div>
  );
};

