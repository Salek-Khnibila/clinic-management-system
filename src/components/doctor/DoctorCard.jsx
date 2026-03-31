import { MapPin, Star, Stethoscope } from "lucide-react";
import { C } from "../../constants/designTokens.js";

export const DoctorCard = ({ med, onBook }) => {
  const note = med.note || 0;
  const avis = med.avis || 0;

  return (
    <div style={{
      background: C.white, borderRadius: 14, border: `1px solid ${C.border}`,
      padding: "16px 18px", boxShadow: C.shadow,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
        {/* Avatar */}
        <div style={{
          width: 48, height: 48, borderRadius: 12, background: C.grad,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 900, fontSize: 16, flexShrink: 0,
        }}>
          {med.prenom?.[0]}{med.nom?.[0]}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: C.navy, fontFamily: "Georgia,serif" }}>
            Dr. {med.prenom} {med.nom}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
            <Stethoscope size={12} color={C.tealDk} />
            <span style={{ fontSize: 12, color: C.tealDk, fontWeight: 600 }}>{med.specialite}</span>
          </div>
          {med.ville && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
              <MapPin size={11} color={C.gray400} />
              <span style={{ fontSize: 11, color: C.gray400 }}>{med.ville}</span>
            </div>
          )}
        </div>

        {/* Tarif / Expérience */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.navy }}>
            {med.tarif !== null && med.tarif !== undefined && med.tarif !== ""
              ? `${Number(med.tarif).toLocaleString('fr-FR')} MAD`
              : <span style={{ color: C.gray400, fontWeight: 400, fontStyle: "italic" }}>Tarif N/C</span>}
          </div>
          <div style={{ fontSize: 11, color: C.gray400 }}>
            {med.experience !== null && med.experience !== undefined && med.experience !== ""
              ? `${med.experience} ans`
              : <span style={{ fontStyle: "italic" }}>Expérience N/C</span>}
          </div>
        </div>
      </div>

      {/* Étoiles — lecture seule, aucune interactivité */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 2 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              fill={star <= Math.round(note) ? "#F59E0B" : "none"}
              color={star <= Math.round(note) ? "#F59E0B" : C.gray300}
              strokeWidth={1.5}
            />
          ))}
        </div>
        <span style={{ fontSize: 12, color: C.gray500 }}>
          {note > 0
            ? `${Number(note).toFixed(1)} (${avis} avis)`
            : "Pas encore évalué"}
        </span>
      </div>

      {/* Disponibilité + bouton */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        {med.dispo && (
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99,
            background: C.tealLt, color: C.tealDk,
          }}>
            {med.dispo}
          </span>
        )}
        {onBook && (
          <button onClick={() => onBook(med)}
            style={{
              padding: "8px 16px", borderRadius: 9, border: "none",
              background: C.gradBtn, color: "#fff", fontWeight: 700,
              fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              marginLeft: "auto",
            }}>
            Prendre RDV
          </button>
        )}
      </div>
    </div>
  );
};