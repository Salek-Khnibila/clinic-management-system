// src/components/doctor/DoctorCard.jsx
// Modification : ajout de la prop onSelect (clic sur la carte → panel)
// Le bouton "Prendre RDV" continue d'appeler onBook directement.

import { MapPin, Star, Stethoscope } from "lucide-react";
import { C } from "../../constants/designTokens.js";

export const DoctorCard = ({ med, onBook, onSelect }) => {
  const note = med.note || 0;
  const avis = med.avis || 0;

  return (
    <div
      onClick={() => onSelect && onSelect(med)}   // ← clic carte = ouvre panel
      style={{
        background: C.white, borderRadius: 14, border: `1px solid ${C.border}`,
        padding: "16px 18px", boxShadow: C.shadow,
        cursor: onSelect ? "pointer" : "default",
        transition: "box-shadow 0.15s, transform 0.15s",
      }}
      onMouseEnter={(e) => {
        if (onSelect) {
          e.currentTarget.style.boxShadow = C.shadowH || "0 6px 20px rgba(0,0,0,0.1)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = C.shadow;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
        {/* Avatar */}
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: `linear-gradient(135deg, ${C.navy}, ${C.tealDk})`,
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
              ? `${Number(med.tarif).toLocaleString("fr-FR")} MAD`
              : <span style={{ color: C.gray400, fontWeight: 400, fontStyle: "italic" }}>Tarif N/C</span>}
          </div>
          <div style={{ fontSize: 11, color: C.gray400 }}>
            {med.experience !== null && med.experience !== undefined && med.experience !== ""
              ? `${med.experience} ans`
              : <span style={{ fontStyle: "italic" }}>Expérience N/C</span>}
          </div>
        </div>
      </div>

      {/* Étoiles — support décimal */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 3 }}>
          {[1, 2, 3, 4, 5].map((s) => {
            const fill = Math.min(1, Math.max(0, note - (s - 1)));
            const id = `star-card-${med.id}-${s}`;
            return (
              <svg key={s} width={13} height={13} viewBox="0 0 24 24">
                <defs>
                  <clipPath id={id}>
                    <rect x="0" y="0" width={24 * fill} height="24" />
                  </clipPath>
                </defs>
                {/* Contour gris visible */}
                <polygon
                  points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                  fill="#E8EDF4"
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {/* Remplissage doré clipé */}
                <polygon
                  points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                  fill="#F59E0B"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  clipPath={`url(#${id})`}
                />
              </svg>
            );
          })}
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
          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: C.tealLt, color: C.tealDk }}>
            {med.dispo}
          </span>
        )}
        {onBook && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // ← empêche d'ouvrir le panel en même temps
              onBook(med);
            }}
            style={{
              padding: "8px 16px", borderRadius: 9, border: "none",
              background: C.gradBtn, color: "#fff", fontWeight: 700,
              fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              marginLeft: "auto",
            }}
          >
            Prendre RDV
          </button>
        )}
      </div>
    </div>
  );
};