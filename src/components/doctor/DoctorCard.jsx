import { useState } from "react";
import { MapPin, Star, Stethoscope } from "lucide-react";
import { C } from "../../constants/designTokens.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import api from "../../services/api.js";

export const DoctorCard = ({ med, onBook }) => {
  const { user } = useAuth();
  const [hovered, setHovered]     = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [note, setNote]           = useState(med.note || 0);
  const [avis, setAvis]           = useState(med.avis || 0);
  const [reviewing, setReviewing] = useState(false);
  const [reviewErr, setReviewErr] = useState("");

  const isPatient = user?.role === "patient";

  const submitReview = async (stars) => {
    if (!isPatient || submitted) return;
    setReviewing(true); setReviewErr("");
    try {
      const res = await api.post(`/doctors/${med.id}/review`, { note: stars });
      setNote(res.data.data.note);
      setAvis(res.data.data.avis);
      setSubmitted(true);
    } catch (e) {
      setReviewErr(e.response?.data?.message || "Erreur lors de l'évaluation.");
      setTimeout(() => setReviewErr(""), 3000);
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div style={{
      background: C.white, borderRadius: 14, border: `1px solid ${C.border}`,
      padding: "16px 18px", boxShadow: C.shadow,
      transition: "box-shadow 0.15s",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
        {/* Avatar médecin */}
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

        {/* Infos tarif/expérience */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          {med.tarif && <div style={{ fontSize: 13, fontWeight: 800, color: C.navy }}>{med.tarif}</div>}
          {med.experience && <div style={{ fontSize: 11, color: C.gray400 }}>{med.experience}</div>}
        </div>
      </div>

      {/* Étoiles */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 2 }}>
          {[1,2,3,4,5].map((star) => {
            const filled  = star <= (hovered || Math.round(note));
            const canRate = isPatient && !submitted && !reviewing;
            return (
              <button key={star}
                onClick={() => canRate && submitReview(star)}
                onMouseEnter={() => canRate && setHovered(star)}
                onMouseLeave={() => canRate && setHovered(0)}
                disabled={!canRate}
                style={{
                  background: "none", border: "none", padding: 2,
                  cursor: canRate ? "pointer" : "default",
                  transform: hovered === star && canRate ? "scale(1.2)" : "scale(1)",
                  transition: "transform 0.1s",
                }}>
                <Star
                  size={16}
                  fill={filled ? "#F59E0B" : "none"}
                  color={filled ? "#F59E0B" : C.gray300}
                  strokeWidth={1.5}
                />
              </button>
            );
          })}
        </div>
        <span style={{ fontSize: 12, color: C.gray500 }}>
          {note > 0 ? `${Number(note).toFixed(1)} (${avis} avis)` : "Pas encore évalué"}
        </span>
        {submitted && (
          <span style={{ fontSize: 11, color: C.tealDk, fontWeight: 700 }}>✅ Merci !</span>
        )}
        {reviewErr && (
          <span style={{ fontSize: 11, color: C.red, fontWeight: 600 }}>{reviewErr}</span>
        )}
        {isPatient && !submitted && !reviewing && (
          <span style={{ fontSize: 10, color: C.gray400, marginLeft: "auto" }}>Cliquez pour évaluer</span>
        )}
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
        {onBook && isPatient && (
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