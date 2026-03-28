import { Calendar, CheckCircle, ClipboardList, Clock, MapPin, Stethoscope } from "lucide-react";
import { C } from "../../constants/designTokens.js";
import { SPEC_ICONS } from "../../constants/status.js";
import { useMobile } from "../../hooks/useMobile.js";
import { Card, Btn, Stars } from "../ui/Base.jsx";

export const DoctorCard = ({ med, onBook }) => {
  const isMobile = useMobile();
  const SI = SPEC_ICONS[med.specialite] || Stethoscope;

  const cardStyle = {
    padding: isMobile ? "12px 14px" : "18px 20px",
  };

  const avatarStyle = {
    width: isMobile ? 48 : 62,
    height: isMobile ? 48 : 62,
    borderRadius: 12,
    background: C.grad,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 800,
    fontSize: isMobile ? 15 : 18,
  };

  const nameStyle = {
    fontWeight: 800,
    fontSize: isMobile ? 13 : 15,
    color: C.navy,
    fontFamily: "Georgia,serif",
  };

  const specialtyStyle = {
    fontSize: isMobile ? 11 : 12,
    color: C.tealDk,
    fontWeight: 700,
  };

  const tarifStyle = {
    fontSize: isMobile ? 12 : 13,
    fontWeight: 800,
    color: C.tealDk,
    background: C.tealLt,
    padding: "3px 10px",
    borderRadius: 6,
  };

  const detailStyle = {
    fontSize: isMobile ? 11 : 12,
    color: C.gray500,
  };

  return (
    <Card hover style={cardStyle}>
      <div style={{ display: "flex", gap: isMobile ? 12 : 14, alignItems: "flex-start" }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={avatarStyle}>
            {med.prenom[0]}
            {med.nom[0]}
          </div>
          <div
            style={{
              position: "absolute",
              bottom: -4,
              right: -4,
              width: isMobile ? 18 : 20,
              height: isMobile ? 18 : 20,
              borderRadius: "50%",
              background: med.dispo ? C.green : C.gray400,
              border: "2px solid #fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {med.dispo ? (
              <CheckCircle size={isMobile ? 10 : 11} color="#fff" strokeWidth={2.5} />
            ) : (
              <Clock size={isMobile ? 9 : 10} color="#fff" />
            )}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div style={nameStyle}>
                Dr. {med.prenom} {med.nom}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  marginTop: 3,
                }}
              >
                <SI size={isMobile ? 11 : 12} color={C.tealDk} strokeWidth={2} />
                <span style={specialtyStyle}>
                  {med.specialite}
                </span>
              </div>
            </div>
            <span style={tarifStyle}>
              {med.tarif}
            </span>
          </div>
          <div style={{ marginTop: isMobile ? 6 : 8 }}>
            <Stars note={med.note} />
          </div>
          <div
            style={{
              display: "flex",
              gap: isMobile ? 12 : 14,
              marginTop: 7,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                ...detailStyle,
              }}
            >
              <MapPin size={isMobile ? 10 : 11} />
              {med.ville}
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                ...detailStyle,
              }}
            >
              <ClipboardList size={isMobile ? 10 : 11} />
              {med.avis} avis
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                ...detailStyle,
              }}
            >
              <Calendar size={isMobile ? 10 : 11} />
              {med.exp}
            </span>
          </div>
          <div
            style={{
              marginTop: isMobile ? 10 : 12,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            {med.dispo ? (
              <Btn onClick={() => onBook(med)} icon={Calendar}>
                Prendre RDV
              </Btn>
            ) : (
              <span
                style={{
                  fontSize: isMobile ? 11 : 12,
                  color: C.gray400,
                  fontWeight: 600,
                  padding: isMobile ? "6px 12px" : "8px 14px",
                  background: C.gray100,
                  borderRadius: 8,
                }}
              >
                Indisponible
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

