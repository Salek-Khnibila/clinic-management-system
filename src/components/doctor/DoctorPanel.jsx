// src/components/doctor/DoctorPanel.jsx
//
// Sur grand écran : panel latéral glissant (slide-in depuis la droite)
// Sur mobile      : page plein écran qui remplace la liste
//
// Props :
//   med        — objet médecin complet
//   onClose    — ferme le panel
//   onBook     — ouvre le BookingWizard
//   user       — utilisateur connecté (patient)
//   rdvs       — liste des RDVs du patient (pour vérifier s'il peut évaluer)

import { useEffect, useState } from "react";
import {
  ArrowLeft, Calendar, CheckCircle, MapPin, MessageSquare,
  Send, Star, Stethoscope, X,
} from "lucide-react";
import { C } from "../../constants/designTokens.js";
import { Btn, Card, useToast } from "../ui/Base.jsx";
import api from "../../services/api.js";

// ── Étoiles interactives ────────────────────────────────────────────────────
const StarRating = ({ value, onChange, disabled }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={28}
          fill={(hovered || value) >= s ? "#F59E0B" : "none"}
          color={(hovered || value) >= s ? "#F59E0B" : C.gray300}
          strokeWidth={1.5}
          style={{ cursor: disabled ? "default" : "pointer", transition: "all 0.1s" }}
          onMouseEnter={() => !disabled && setHovered(s)}
          onMouseLeave={() => !disabled && setHovered(0)}
          onClick={() => !disabled && onChange(s)}
        />
      ))}
    </div>
  );
};

// ── Étoiles lecture seule (affichage avis) ──────────────────────────────────
const StarDisplay = ({ value, size = 13 }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} size={size}
        fill={s <= Math.round(value) ? "#F59E0B" : "none"}
        color={s <= Math.round(value) ? "#F59E0B" : C.gray300}
        strokeWidth={1.5}
      />
    ))}
  </div>
);

// ── Composant principal ─────────────────────────────────────────────────────
export const DoctorPanel = ({ med, onClose, onBook, user, rdvs, isMobile }) => {
  const toast = useToast();

  // ── Avis existants ────────────────────────────────────────────────────────
  const [reviews,       setReviews]       = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // ── Formulaire d'évaluation ───────────────────────────────────────────────
  const [note,       setNote]       = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [myReview,    setMyReview]    = useState(null); // avis déjà posté

  // ── Éligibilité : avoir au moins 1 RDV confirmé avec ce médecin ───────────
  const canReview = rdvs.some(
    (r) => r.medecin_id === med.id && r.statut === "confirme"
  );

  // ── Chargement des avis ───────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setReviewsLoading(true);
      try {
        const res = await api.get(`/reviews/doctor/${med.id}`);
        const data = res.data.data || [];
        setReviews(data);
        const mine = data.find((r) => r.patient_id === user.id);
        if (mine) setMyReview(mine);
      } catch {
        // silencieux — les avis sont optionnels
      } finally {
        setReviewsLoading(false);
      }
    };
    load();
  }, [med.id, user.id]);

  // ── Soumission de l'avis ──────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (note === 0) { toast.warning("Choisissez une note entre 1 et 5 étoiles."); return; }
    if (!commentaire.trim()) { toast.warning("Ajoutez un commentaire."); return; }
    setSubmitting(true);
    try {
      const res = await api.post("/reviews", {
        medecin_id:  med.id,
        note,
        commentaire: commentaire.trim(),
      });
      if (res.data.success) {
        toast.success("Votre avis a été publié !");
        const newReview = res.data.data;
        setMyReview(newReview);
        setReviews((prev) => [newReview, ...prev.filter((r) => r.patient_id !== user.id)]);
        setNote(0); setCommentaire("");
      } else {
        toast.error(res.data.message || "Erreur lors de la publication.");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur lors de la publication.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Moyenne calculée côté client (plus fraîche que DB) ───────────────────
  const avgNote = reviews.length
    ? (reviews.reduce((s, r) => s + r.note, 0) / reviews.length).toFixed(1)
    : null;

  // ── Styles communs ────────────────────────────────────────────────────────
  const lbl = {
    display: "block", fontSize: 11, fontWeight: 700, color: C.gray500,
    textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 6,
  };

  // ── Contenu du panel (partagé mobile/desktop) ─────────────────────────────
  const content = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* En-tête */}
      <div style={{
        padding: "20px 20px 16px",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
      }}>
        <button onClick={onClose} style={{
          width: 34, height: 34, borderRadius: 9,
          border: `1px solid ${C.border}`, background: C.white,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0,
        }}>
          {isMobile ? <ArrowLeft size={16} color={C.gray500} /> : <X size={15} color={C.gray500} />}
        </button>
        <span style={{ fontWeight: 800, fontSize: 15, color: C.navy }}>
          Profil du médecin
        </span>
      </div>

      {/* Corps scrollable */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>

        {/* ── Carte identité ────────────────────────────────────────────── */}
        <Card style={{ padding: "20px", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {/* Avatar grand format */}
            <div style={{
              width: 80, height: 80, borderRadius: 16, flexShrink: 0,
              background: `linear-gradient(135deg, ${C.navy}, ${C.tealDk})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 900, fontSize: 22,
            }}>
              {med.prenom?.[0]}{med.nom?.[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 900, fontSize: 17, color: C.navy, fontFamily: "Georgia,serif" }}>
                Dr. {med.prenom} {med.nom}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                <Stethoscope size={13} color={C.tealDk} />
                <span style={{ fontSize: 13, color: C.tealDk, fontWeight: 700 }}>{med.specialite}</span>
              </div>
              {med.ville && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                  <MapPin size={12} color={C.gray400} />
                  <span style={{ fontSize: 12, color: C.gray400 }}>{med.ville}</span>
                </div>
              )}
              {/* Note globale */}
              {avgNote && (
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 8 }}>
                  <StarDisplay value={parseFloat(avgNote)} size={14} />
                  <span style={{ fontSize: 12, color: C.gray500, fontWeight: 600 }}>
                    {avgNote} ({reviews.length} avis)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Infos secondaires */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 10, marginTop: 16,
          }}>
            {[
              ["Tarif",      med.tarif      ? `${Number(med.tarif).toLocaleString("fr-FR")} MAD` : "N/C"],
              ["Expérience", med.experience ? `${med.experience}` : "N/C"],
              ["Disponibilité", med.dispo || "Sur rendez-vous"],
              ["Email",      med.email || "—"],
            ].map(([k, v]) => (
              <div key={k} style={{
                background: C.bg, borderRadius: 9, padding: "10px 12px",
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.gray400, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 3 }}>
                  {k}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Bouton RDV */}
          <Btn full icon={Calendar} onClick={() => onBook(med)} style={{ marginTop: 16 }}>
            Prendre rendez-vous
          </Btn>
        </Card>

        {/* ── Section évaluation ────────────────────────────────────────── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: C.navy, fontFamily: "Georgia,serif", marginBottom: 12 }}>
            Évaluations
          </div>

          {/* Formulaire — visible seulement si éligible et pas encore posté */}
          {canReview && !myReview && (
            <Card style={{ padding: "16px", marginBottom: 14 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
                paddingBottom: 12, borderBottom: `1px solid ${C.border}`,
              }}>
                <MessageSquare size={15} color={C.tealDk} />
                <span style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>
                  Donner mon avis
                </span>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Note</label>
                <StarRating value={note} onChange={setNote} disabled={submitting} />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Commentaire</label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder="Partagez votre expérience..."
                  rows={3}
                  disabled={submitting}
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 9,
                    border: `1.5px solid ${C.border}`, fontSize: 13,
                    color: C.navy, outline: "none", fontFamily: "inherit",
                    resize: "none", boxSizing: "border-box", transition: "border 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = C.teal)}
                  onBlur={(e)  => (e.target.style.borderColor = C.border)}
                />
              </div>

              <Btn full icon={Send} onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Publication..." : "Publier mon avis"}
              </Btn>
            </Card>
          )}

          {/* Avis déjà posté */}
          {myReview && (
            <Card style={{ padding: "14px", marginBottom: 14, borderLeft: `4px solid ${C.tealDk}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                <CheckCircle size={14} color={C.tealDk} />
                <span style={{ fontSize: 12, fontWeight: 700, color: C.tealDk }}>
                  Votre avis a été publié
                </span>
              </div>
              <StarDisplay value={myReview.note} />
              <p style={{ fontSize: 13, color: C.gray700, margin: "8px 0 0", lineHeight: 1.5 }}>
                {myReview.commentaire}
              </p>
            </Card>
          )}

          {/* Message si pas éligible */}
          {!canReview && !myReview && (
            <div style={{
              background: C.amberLt, border: `1px solid ${C.amber}44`,
              borderRadius: 10, padding: "12px 14px",
              fontSize: 12, color: C.amber, fontWeight: 600, marginBottom: 14,
              display: "flex", gap: 8, alignItems: "center",
            }}>
              <Calendar size={14} style={{ flexShrink: 0 }} />
              Vous pourrez évaluer ce médecin après votre premier rendez-vous confirmé.
            </div>
          )}

          {/* Liste des avis */}
          {reviewsLoading ? (
            <div style={{ textAlign: "center", color: C.gray400, padding: "20px 0", fontSize: 13 }}>
              Chargement des avis...
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: "center", color: C.gray400, padding: "20px 0", fontSize: 13 }}>
              Aucun avis pour le moment.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {reviews.map((r) => (
                <Card key={r.id} style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      {/* Avatar patient anonymisé */}
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: C.grad,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontWeight: 800, fontSize: 11, flexShrink: 0,
                      }}>
                        {r.patient_prenom?.[0]}{r.patient_nom?.[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>
                          {r.patient_prenom} {r.patient_nom?.[0]}.
                        </div>
                        <div style={{ fontSize: 11, color: C.gray400 }}>{r.created_at?.slice(0, 10)}</div>
                      </div>
                    </div>
                    <StarDisplay value={r.note} size={12} />
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: C.gray700, lineHeight: 1.5 }}>
                    {r.commentaire}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ── Rendu mobile : plein écran ────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{
        position: "fixed", inset: 0, background: C.bg,
        zIndex: 400, overflowY: "auto",
        fontFamily: "'Segoe UI',system-ui,sans-serif",
      }}>
        {content}
      </div>
    );
  }

  // ── Rendu desktop : panel latéral glissant ────────────────────────────────
  return (
    <>
      {/* Overlay semi-transparent */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(13,33,55,0.35)",
          zIndex: 399,
          backdropFilter: "blur(2px)",
          animation: "fadeIn 0.2s ease",
        }}
      />
      {/* Panel */}
      <div style={{
        position: "fixed",top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "80%", height: "90vh", 
        background: "rgb(255, 255, 255)", 
        zIndex: "400", borderRadius: "15px",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
        animation: "slideInRight 0.25s ease",
        fontFamily: "'Segoe UI',system-ui,sans-serif",
      }}>
        <style>{`
          @keyframes fadeIn      { from { opacity: 0 }              to { opacity: 1 } }
          @keyframes slideInRight{ from { transform: translateX(40px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
        `}</style>
        {content}
      </div>
    </>
  );
};