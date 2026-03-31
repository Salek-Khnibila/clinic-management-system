import { useState, useEffect } from "react";
import {
  Clock,
  Inbox,
  MapPin,
  RefreshCw,
  Search,
  Stethoscope,
  X,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { C } from "../../constants/designTokens.js";
import {
  MONTHS,
  SPECS,
  VILLES,
} from "../../constants/data.js";
import { SPEC_ICONS } from "../../constants/status.js";
import { useApp } from "../../contexts/AppContext.jsx";
import { useMobile } from "../../hooks/useMobile.js";
import { BookingWizard } from "../../components/booking/BookingWizard.jsx";
import { DoctorCard } from "../../components/doctor/DoctorCard.jsx";
import {
  Btn,
  Card,
  Modal,
  SectionTitle,
  StatusBadge,
  useToast,
} from "../../components/ui/Base.jsx";

export const PatientAccueil = ({ user }) => {
  const { rdvs, addRdv, annulerRdv, messages, doctors, refreshData } = useApp();
  const isMobile = useMobile();
  const toast = useToast();

  // ── TOUS les useState AVANT tout return conditionnel ──────────────────────
  const [search, setSearch]             = useState("");
  const [spec, setSpec]                 = useState("");
  const [ville, setVille]               = useState("");
  const [bookMed, setBookMed]           = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling]     = useState(false);
  const [cancelErr, setCancelErr]       = useState("");

  useEffect(() => {
    if (user?.id) refreshData();
  }, [user?.id, refreshData]);

  // ── Garde rôle APRÈS tous les hooks ──────────────────────────────────────
  if (!user || user.role !== 'patient') {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>This page is reserved for patients.</p>
      </div>
    );
  }

  const myMsgs = messages.filter((m) => m.to_patient_id === user.id);
  const unread = myMsgs.filter((m) => !m.lu).length;

  const filtered = doctors.filter(
    (m) =>
      (!spec || m.specialite === spec) &&
      (!ville || m.ville === ville) &&
      (!search ||
        `${m.prenom} ${m.nom} ${m.specialite}`
          .toLowerCase()
          .includes(search.toLowerCase()))
  );

  const prochains = rdvs
    .filter(
      (r) =>
        r.patient_id === user.id &&
        (r.statut === "confirme" || r.statut === "en_attente")
    )
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.heure.localeCompare(a.heure);
    })
    .slice(0, 2);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true); setCancelErr("");
    const result = await annulerRdv(cancelTarget.id);
    setCancelling(false);
    if (result.success) {
      toast.success("Rendez-vous annulé avec succès.");
      setCancelTarget(null);
    } else {
      toast.error(result.message || "Failed to cancel appointment.");
      setCancelErr(result.message || "Failed to cancel appointment.");
    }
  };

  // Responsive styles
  const containerStyle = { padding: isMobile ? "16px 12px" : "28px 24px" };
  const headerStyle = { background: C.grad, borderRadius: 16, padding: isMobile ? "20px 16px" : "28px 24px", marginBottom: isMobile ? 16 : 22, position: "relative", overflow: "hidden" };
  const titleStyle = { margin: "0 0 4px", fontSize: isMobile ? 18 : 22, fontWeight: 900, color: "#fff", fontFamily: "Georgia,serif" };
  const rdvGridStyle = { display: isMobile ? "flex" : "grid", flexDirection: isMobile ? "column" : "row", gridTemplateColumns: isMobile ? "none" : "repeat(auto-fill,minmax(260px,1fr))", gap: isMobile ? 8 : 9 };

  return (
    <div style={containerStyle}>
      {unread > 0 && (
        <div style={{ background: C.tealLt, border: `1px solid ${C.teal}44`, borderRadius: 10, padding: isMobile ? "9px 12px" : "11px 16px", marginBottom: isMobile ? 12 : 16, display: "flex", alignItems: "center", gap: 10 }}>
          <Inbox size={isMobile ? 15 : 17} color={C.tealDk} />
          <span style={{ fontSize: isMobile ? 12 : 13, fontWeight: 700, color: C.tealDk }}>
            You have {unread} unread message{unread > 1 ? "s" : ""} from the secretary
          </span>
        </div>
      )}

      <div style={headerStyle}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: isMobile ? 10 : 11, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, fontWeight: 600 }}>
            Your health, our priority
          </div>
          <h1 style={titleStyle}>Hello, {user.prenom} 👋</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.8, marginBottom: 18 }}>
            <Stethoscope size={isMobile ? 12 : 13} />
            <span style={{ fontSize: isMobile ? 12 : 13 }}>Patient Space</span>
            <Btn variant="ghost" size="sm" icon={RefreshCw} onClick={refreshData} style={{ marginLeft: "auto" }}>
              Refresh
            </Btn>
          </div>
          <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 9, padding: isMobile ? "8px 12px" : "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <Search size={isMobile ? 15 : 17} color={C.tealDk} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Doctor, specialty..."
              style={{ flex: 1, border: "none", background: "transparent", fontSize: isMobile ? 13 : 14, color: C.navy, outline: "none", fontFamily: "inherit" }} />
          </div>
        </div>
      </div>

      {/* Specialty filters */}
      <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 4, marginBottom: 18 }}>
        <button onClick={() => setSpec("")}
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 99, border: `1.5px solid ${!spec ? C.tealDk : C.border}`, background: !spec ? C.tealLt : C.white, color: !spec ? C.tealDk : C.gray500, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
          <Stethoscope size={12} strokeWidth={2} /> All
        </button>
        {SPECS.map((s) => {
          const I = SPEC_ICONS[s] || Stethoscope;
          const active = spec === s;
          return (
            <button key={s} onClick={() => setSpec(active ? "" : s)}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 99, border: `1.5px solid ${active ? C.tealDk : C.border}`, background: active ? C.tealLt : C.white, color: active ? C.tealDk : C.gray500, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
              <I size={12} strokeWidth={2} /> {s}
            </button>
          );
        })}
      </div>

      {/* City filter */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
        <div style={{ position: "relative" }}>
          <MapPin size={13} color={C.gray400} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <select value={ville} onChange={(e) => setVille(e.target.value)}
            style={{ paddingLeft: 28, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 8, border: `1.5px solid ${ville ? C.tealDk : C.border}`, fontSize: 12, color: ville ? C.tealDk : C.gray500, background: ville ? C.tealLt : C.white, fontFamily: "inherit", cursor: "pointer", outline: "none" }}>
            <option value="">All cities</option>
            {VILLES.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        {(spec || ville || search) && (
          <button onClick={() => { setSpec(""); setVille(""); setSearch(""); }}
            style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 11px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, color: C.gray500, background: C.white, cursor: "pointer", fontFamily: "inherit" }}>
            <X size={12} /> Clear
          </button>
        )}
        <span style={{ marginLeft: "auto", fontSize: 12, color: C.gray400, fontWeight: 600 }}>
          {filtered.length} doctor{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Upcoming appointments */}
      {prochains.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.navy, marginBottom: 10, fontFamily: "Georgia,serif" }}>
            Upcoming Appointments
          </div>
          <div style={rdvGridStyle}>
            {prochains.map((rdv) => (
              <Card key={rdv.id} left={C.tealDk}
                style={{ padding: isMobile ? "10px 12px" : "13px 16px", display: "flex", alignItems: "center", gap: isMobile ? 8 : 11, width: isMobile ? "100%" : "auto" }}>
                <div style={{ width: isMobile ? 36 : 42, height: isMobile ? 36 : 42, borderRadius: 10, background: C.tealLt, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: isMobile ? 13 : 15, fontWeight: 900, color: C.tealDk, lineHeight: 1 }}>
                    {rdv.date.split("-")[2]}
                  </span>
                  <span style={{ fontSize: isMobile ? 8 : 9, color: C.gray400 }}>
                    {MONTHS[parseInt(rdv.date.split("-")[1]) - 1].slice(0, 3)}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: isMobile ? 12 : 13, color: C.navy }}>
                    Dr. {rdv.medecin_prenom} {rdv.medecin_nom}
                  </div>
                  <div style={{ fontSize: isMobile ? 10 : 11, color: C.gray500, display: "flex", gap: 7, marginTop: 2 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Clock size={isMobile ? 9 : 10} /> {rdv.heure}
                    </span>
                    {rdv.medecin_specialite && <span style={{ color: C.gray400 }}>• {rdv.medecin_specialite}</span>}
                  </div>
                </div>
                <StatusBadge statut={rdv.statut} />
                {/* Cancel button on upcoming cards */}
                <button
                  onClick={() => { setCancelTarget(rdv); setCancelErr(""); }}
                  title="Cancel appointment"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 7, border: `1px solid ${C.red}33`, background: C.redLt, color: C.red, cursor: "pointer", flexShrink: 0 }}>
                  <X size={13} />
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}

      <SectionTitle sub={`${filtered.length} doctor${filtered.length !== 1 ? "s" : ""} available`}>
        Doctors
      </SectionTitle>

      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {filtered.map((m) => (
          <DoctorCard key={m.id} med={m} onBook={setBookMed} />
        ))}
      </div>

      {bookMed && (
        <Modal title="Book an appointment" onClose={() => setBookMed(null)}>
          <BookingWizard
            med={bookMed}
            onConfirm={async (r) => {
              setBookMed(null);
              const result = await addRdv({ ...r, patient_id: user.id });
              if (result.success) {
                toast.success("Rendez-vous pris avec succès !");
              } else {
                toast.error(result.message || "Impossible de prendre ce rendez-vous.");
              }
            }}
            onClose={() => setBookMed(null)}
          />
        </Modal>
      )}

      {/* ── Cancel Confirmation Modal ─────────────────────────────────────── */}
      {cancelTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 20 }}>
          <div style={{ background: C.white, borderRadius: 16, padding: "28px 24px", maxWidth: 400, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: C.redLt, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertTriangle size={22} color={C.red} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: C.navy }}>Cancel Appointment?</div>
                <div style={{ fontSize: 12, color: C.gray500 }}>This action cannot be undone</div>
              </div>
            </div>
            <div style={{ background: C.gray50, borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
              <div style={{ fontWeight: 700, color: C.navy }}>Dr. {cancelTarget.medecin_prenom} {cancelTarget.medecin_nom}</div>
              <div style={{ fontSize: 12, color: C.gray500, marginTop: 4, display: "flex", gap: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Calendar size={11} /> {cancelTarget.date}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={11} /> {cancelTarget.heure}
                </span>
              </div>
            </div>
            {cancelErr && (
              <div style={{ background: C.redLt, color: C.red, borderRadius: 8, padding: "9px 12px", fontSize: 13, fontWeight: 600, marginBottom: 14, display: "flex", gap: 7, alignItems: "center" }}>
                <AlertTriangle size={13} /> {cancelErr}
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setCancelTarget(null)}
                style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, color: C.gray500, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                Keep it
              </button>
              <button onClick={handleCancel} disabled={cancelling}
                style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: C.red, color: "#fff", fontWeight: 700, fontSize: 14, cursor: cancelling ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, opacity: cancelling ? 0.7 : 1 }}>
                <X size={15} /> {cancelling ? "Cancelling..." : "Cancel Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};