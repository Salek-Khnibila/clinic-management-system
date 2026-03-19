import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { C } from "../../constants/designTokens.js";

import { useApp } from "../../contexts/AppContext.jsx";
import { Avatar, Card, MiniCalendar, SectionTitle, StatusBadge } from "../../components/ui/Base.jsx";

export const MedecinPlanning = ({ user: propUser }) => {
  const { rdvs, user: contextUser, refreshData } = useApp();
  const user = propUser || contextUser; // Use context user if prop not provided
  
  // Refresh data when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      refreshData();
    }
  }, [user?.id, refreshData]);
  
  // Debug logs
  console.log("USER (Planning):", user);
  console.log("RDVS (Planning):", rdvs);
  
  const mesRdv = rdvs.filter((r) => r.medecin_id === user.id);
  console.log("MES RDV FILTRÉS (Planning):", mesRdv);
  
  const [sel, setSel] = useState("2025-03-10");
  const rdvJour = mesRdv.filter((r) => r.date === sel);

  return (
    <div>
      <SectionTitle sub="Gérez votre emploi du temps">
        Mon planning
      </SectionTitle>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: 20,
        }}
      >
        <MiniCalendar selected={sel} onSelect={setSel} />
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: C.gray500,
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Calendar size={14} color={C.tealDk} />
            {rdvJour.length} RDV · {sel}
          </div>
          {rdvJour.length === 0 && (
            <Card style={{ padding: "40px", textAlign: "center" }}>
              <Calendar
                size={32}
                color={C.gray400}
                style={{ margin: "0 auto 12px", display: "block" }}
              />
              <div style={{ color: C.gray500 }}>Pas de RDV ce jour.</div>
            </Card>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {rdvJour.map((rdv) => {
              return (
                <Card
                  key={rdv.id}
                  style={{
                    padding: "13px 17px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      background: C.tealLt,
                      borderRadius: 8,
                      padding: "7px 10px",
                      textAlign: "center",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 900,
                        color: C.tealDk,
                      }}
                    >
                      {rdv.heure}
                    </div>
                  </div>
                  <Avatar
                    name={`${rdv.patient_prenom} ${rdv.patient_nom}`}
                    color={C.tealDk}
                    size={34}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: C.navy,
                      }}
                    >
                      {rdv.patient_prenom} {rdv.patient_nom}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: C.gray500,
                        marginTop: 2,
                      }}
                    >
                      {rdv.motif}
                    </div>
                  </div>
                  <StatusBadge statut={rdv.statut} />
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

