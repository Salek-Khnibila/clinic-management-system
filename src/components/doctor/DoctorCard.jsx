import { Calendar, CheckCircle, ClipboardList, Clock, MapPin, Stethoscope } from "lucide-react";
import { C } from "../../constants/designTokens.js";
import { SPEC_ICONS } from "../../constants/status.js";
import { Card, Btn, Stars } from "../ui/Base.jsx";

export const DoctorCard = ({ med, onBook }) => {
  const SI = SPEC_ICONS[med.specialite] || Stethoscope;
  return (
    <Card hover style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            style={{
              width: 62,
              height: 62,
              borderRadius: 12,
              background: C.grad,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            {med.prenom[0]}
            {med.nom[0]}
          </div>
          <div
            style={{
              position: "absolute",
              bottom: -4,
              right: -4,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: med.dispo ? C.green : C.gray400,
              border: "2px solid #fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {med.dispo ? (
              <CheckCircle size={11} color="#fff" strokeWidth={2.5} />
            ) : (
              <Clock size={10} color="#fff" />
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
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 15,
                  color: C.navy,
                  fontFamily: "Georgia,serif",
                }}
              >
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
                <SI size={12} color={C.tealDk} strokeWidth={2} />
                <span
                  style={{
                    fontSize: 12,
                    color: C.tealDk,
                    fontWeight: 700,
                  }}
                >
                  {med.specialite}
                </span>
              </div>
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: C.tealDk,
                background: C.tealLt,
                padding: "3px 10px",
                borderRadius: 6,
              }}
            >
              {med.tarif}
            </span>
          </div>
          <div style={{ marginTop: 8 }}>
            <Stars note={med.note} />
          </div>
          <div
            style={{
              display: "flex",
              gap: 14,
              marginTop: 7,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: C.gray500,
              }}
            >
              <MapPin size={11} />
              {med.ville}
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: C.gray500,
              }}
            >
              <ClipboardList size={11} />
              {med.avis} avis
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: C.gray500,
              }}
            >
              <Calendar size={11} />
              {med.exp}
            </span>
          </div>
          <div
            style={{
              marginTop: 12,
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
                  fontSize: 12,
                  color: C.gray400,
                  fontWeight: 600,
                  padding: "8px 14px",
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

