// src/components/doctor/DoctorPanel.jsx
//
// Sur grand écran : modal centrée
// Sur mobile      : page plein écran qui remplace la liste
//
// Props :
//   med        — objet médecin complet
//   onClose    — ferme le panel
//   onBook     — ouvre le BookingWizard
//   user       — utilisateur connecté (patient)
//   rdvs       — liste des RDVs du patient (pour vérifier s'il peut évaluer)
//   isMobile   — booléen responsive

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

// ── Étoiles lecture seule (support décimal) ─────────────────────────────────
const StarDisplay = ({ value, size = 12 }) => {
  const numericValue = Number(value) || 0;
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((s) => {
        const fill = Math.min(1, Math.max(0, numericValue - (s - 1)));
        const id = `star-panel-${s}-${size}-${numericValue}`;
        return (
          <svg key={s} width={size} height={size} viewBox="0 0 24 24">
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
  );
};

// ── Composant principal ─────────────────────────────────────────────────────
export const DoctorPanel = ({ med, onClose, onBook, user, rdvs, isMobile }) => {
  const toast = useToast();

  // ── Avis existants ────────────────────────────────────────────────────────
  const [reviews,        setReviews]        = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // ── Moyenne et total — lus depuis meta de l'API (source unique de vérité) ─
  const [avgNote,     setAvgNote]     = useState(null);
  const [totalAvis,   setTotalAvis]   = useState(0);

  // ── Formulaire d'évaluation ───────────────────────────────────────────────
  const [note,        setNote]        = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [myReview,    setMyReview]    = useState(null);

  // ── Confirmation temporaire après soumission ──────────────────────────────
  const [showConfirmation, setShowConfirmation] = useState(false);

  // ── Éligibilité ───────────────────────────────────────────────────────────
  const canReview = rdvs.some(
    (r) => r.medecin_id === med.id && r.statut === "confirme"
  );

  // ── Chargement des avis ───────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setReviewsLoading(true);
      try {
        const res  = await api.get(`/reviews/doctor/${med.id}`);
        const data = res.data.data  || [];
        const meta = res.data.meta  || {};

        setReviews(data);

        // Moyenne et total proviennent directement du backend
        setAvgNote(meta.avg_note ?? null);
        setTotalAvis(meta.total  ?? data.length);

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
    if (note === 0)          { toast.warning("Choisissez une note entre 1 et 5 étoiles."); return; }
    if (!commentaire.trim()) { toast.warning("Ajoutez un commentaire.");                   return; }

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

        // Mise à jour locale de la liste
        const updatedReviews = [newReview, ...reviews.filter((r) => r.patient_id !== user.id)];
        setReviews(updatedReviews);

        // Recalcul local de la moyenne pour refléter immédiatement le nouvel avis
        const newTotal = updatedReviews.length;
        const newAvg   = newTotal > 0
          ? Math.round((updatedReviews.reduce((s, r) => s + r.note, 0) / newTotal) * 10) / 10
          : null;
        setAvgNote(newAvg);
        setTotalAvis(newTotal);

        setMyReview(newReview);
        setNote(0);
        setCommentaire("");

        // Bannière auto-dismiss après 4 secondes
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 4000);
      } else {
        toast.error(res.data.message || "Erreur lors de la publication.");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur lors de la publication.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Styles communs ────────────────────────────────────────────────────────
  const lbl = {
    display: "block", fontSize: 11, fontWeight: 700, color: C.gray500,
    textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 6,
  };

  // ── Contenu partagé mobile / desktop ─────────────────────────────────────
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

              {/* Note globale — depuis meta API */}
              {avgNote !== null && (
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 8 }}>
                  <StarDisplay value={avgNote} size={14} />
                  <span style={{ fontSize: 12, color: C.gray500, fontWeight: 600 }}>
                    {avgNote.toFixed(1)} ({totalAvis} avis)
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
              ["Tarif",         med.tarif      ? `${Number(med.tarif).toLocaleString("fr-FR")} MAD` : "N/C"],
              ["Expérience",    med.experience ? `${med.experience}` : "N/C"],
              ["Disponibilité", med.dispo      || "Sur rendez-vous"],
              ["Email",         med.email      || "—"],
            ].map(([k, v]) => (
              <div key={k} style={{ background: C.bg, borderRadius: 9, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.gray400, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 3 }}>
                  {k}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{v}</div>
              </div>
            ))}
          </div>

          <Btn full icon={Calendar} onClick={() => onBook(med)} style={{ marginTop: 16 }}>
            Prendre rendez-vous
          </Btn>
        </Card>

        {/* ── Section évaluation ────────────────────────────────────────── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: C.navy, fontFamily: "Georgia,serif", marginBottom: 12 }}>
            Évaluations
          </div>

          {/* Formulaire */}
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

          {/* Bannière de confirmation — disparaît après 4s */}
          {showConfirmation && (
            <Card style={{ padding: "14px", marginBottom: 14, borderLeft: `4px solid ${C.tealDk}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                <CheckCircle size={14} color={C.tealDk} />
                <span style={{ fontSize: 12, fontWeight: 700, color: C.tealDk }}>
                  Votre avis a été publié
                </span>
              </div>
              {myReview && (
                <>
                  <StarDisplay value={myReview.note} />
                  <p style={{ fontSize: 13, color: C.gray700, margin: "8px 0 0", lineHeight: 1.5 }}>
                    {myReview.commentaire}
                  </p>
                </>
              )}
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
                          {r.patient_prenom} {r.patient_nom?.[0]}
                        </div>
                        <div style={{ fontSize: 11, color: C.gray400 }}>{r.created_at?.slice(0, 10)}</div>
                      </div>
                    </div>
                    <StarDisplay value={r.note} size={12} />
                  </div>
                  <p style={{ margin: "0 0 0 10px", fontSize: 13, color: C.gray700, lineHeight: 1.5 }}>
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

  // ── Rendu mobile ──────────────────────────────────────────────────────────
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

  // ── Rendu desktop — modal centrée ─────────────────────────────────────────
  return (
    <>
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
      <div style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "80%",
        height: "90vh",
        background: "#ffffff",
        zIndex: 400,
        borderRadius: 15,
        boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
        fontFamily: "'Segoe UI',system-ui,sans-serif",
        animation: "panelAppear 0.25s ease",
      }}>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes panelAppear {
            from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); }
            to   { opacity: 1; transform: translate(-50%, -50%) scale(1);    }
          }
        `}</style>
        {content}
      </div>
    </>
  );
};