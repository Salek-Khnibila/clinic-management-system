import { useState } from "react";
import { Calendar, Clock, ClipboardList, Filter, Phone, RefreshCw, Stethoscope, UserCheck, X, XCircle } from "lucide-react";
import { C } from "../../constants/designTokens.js";
import { STATUS } from "../../constants/status.js";
import { useApp } from "../../contexts/AppContext.jsx";
import { useMobile } from "../../hooks/useMobile.js";
import { ArriveeBadge, Btn, Card, Modal, SectionTitle, StatusBadge, useToast } from "../../components/ui/Base.jsx";

export const SecretairePlanning = () => {
  const { rdvs, doctors, validateRdv, annulerRdv, reporterRdv, setArrivee } = useApp();
  const isMobile = useMobile();
  const toast = useToast();
  const [fMed, setFMed]   = useState("");
  const [fStat, setFStat] = useState("");
  const [fDate, setFDate] = useState("");
  const [repMod, setRepMod] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [loadingId, setLoadingId] = useState(null);

  const handleValidate = async (id) => {
    setLoadingId(id);
    const result = await validateRdv(id);
    setLoadingId(null);
    if (result.success) {
      toast.success("Rendez-vous confirmé.");
    } else {
      toast.error(result.message || "Impossible de confirmer ce rendez-vous.");
    }
  };

  const handleAnnuler = async (id) => {
    setLoadingId(id);
    const result = await annulerRdv(id);
    setLoadingId(null);
    if (result.success) {
      toast.success("Rendez-vous annulé.");
    } else {
      toast.error(result.message || "Impossible d'annuler ce rendez-vous.");
    }
  };

  const handleReporter = async (id, date) => {
    setLoadingId(id);
    const result = await reporterRdv(id, date);
    setLoadingId(null);
    if (result.success) {
      toast.success("Rendez-vous reporté.");
      setRepMod(null);
    } else {
      toast.error(result.message || "Impossible de reporter ce rendez-vous.");
    }
  };

  const filtered = rdvs.filter(
    (r) =>
      (!fMed  || r.medecin_id === parseInt(fMed, 10)) &&
      (!fStat || r.statut === fStat) &&
      (!fDate || r.date === fDate)
  );
  const enAtt = rdvs.filter((r) => r.statut === "en_attente");

  const selectStyle = {
    paddingLeft: 26, paddingRight: 11, paddingTop: 8, paddingBottom: 8,
    borderRadius: 8, border: `1.5px solid ${C.border}`,
    fontSize: 12, color: C.gray700, background: C.white,
    fontFamily: "inherit", cursor: "pointer", outline: "none",
    width: isMobile ? "100%" : "auto",
  };

  return (
    <div>
      <SectionTitle sub={`${filtered.length} rendez-vous`}>Planning global</SectionTitle>

      {enAtt.length > 0 && (
        <div style={{
          background: C.amberLt, borderRadius: 10, padding: "11px 15px", marginBottom: 16,
          border: `1px solid ${C.amber}44`, display: "flex", alignItems: "center", gap: 10,
        }}>
          <Clock size={17} color={C.amber} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#92400E" }}>
            {enAtt.length} RDV en attente
          </span>
          <button onClick={() => setFStat("en_attente")}
            style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: C.amber, background: "transparent", border: "none", cursor: "pointer" }}>
            Filtrer →
          </button>
        </div>
      )}

      {/* Filtres */}
      <Card style={{ padding: "13px 15px", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {/* Filtre médecin */}
          <div style={{ position: "relative", flex: isMobile ? "1 1 100%" : "0 0 auto" }}>
            <Stethoscope size={13} color={C.gray400} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }} />
            <select value={fMed} onChange={(e) => setFMed(e.target.value)} style={selectStyle}>
              <option value="">Tous médecins</option>
              {doctors.map((m) => <option key={m.id} value={m.id}>Dr. {m.nom}</option>)}
            </select>
          </div>

          {/* Filtre statut */}
          <div style={{ position: "relative", flex: isMobile ? "1 1 100%" : "0 0 auto" }}>
            <Filter size={13} color={C.gray400} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }} />
            <select value={fStat} onChange={(e) => setFStat(e.target.value)} style={selectStyle}>
              <option value="">Tous statuts</option>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          {/* Filtre date */}
          <div style={{ position: "relative", flex: isMobile ? "1 1 100%" : "0 0 auto" }}>
            <Calendar size={13} color={C.gray400} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }} />
            <input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} style={selectStyle} />
          </div>

          {(fMed || fStat || fDate) && (
            <button onClick={() => { setFMed(""); setFStat(""); setFDate(""); }}
              style={{
                display: "flex", alignItems: "center", gap: 4, padding: "8px 11px",
                borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12,
                color: C.gray500, background: C.white, cursor: "pointer", fontFamily: "inherit",
                flex: isMobile ? "1 1 100%" : "0 0 auto", justifyContent: "center",
              }}>
              <X size={12} /> Reset
            </button>
          )}
        </div>
      </Card>

      {/* Liste RDV */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 && (
          <Card style={{ padding: "40px", textAlign: "center" }}>
            <ClipboardList size={32} color={C.gray400} style={{ margin: "0 auto 12px", display: "block" }} />
            <div style={{ color: C.gray500 }}>Aucun résultat.</div>
          </Card>
        )}

        {filtered.map((rdv) => (
          <Card key={rdv.id} left={STATUS[rdv.statut]?.text || C.gray400} style={{ padding: isMobile ? "12px 14px" : "15px 18px" }}>
            {/* En-tête RDV */}
            <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", gap: 12, marginBottom: 10, flexWrap: isMobile ? "wrap" : "nowrap" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: isMobile ? 13 : 14, color: C.navy }}>
                  {rdv.patient_prenom} {rdv.patient_nom}
                </div>
                <div style={{ fontSize: 11, color: C.gray500, display: "flex", gap: 10, marginTop: 3, flexWrap: "wrap" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Stethoscope size={10} /> Dr. {rdv.medecin_nom}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Calendar size={10} /> {rdv.date}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Clock size={10} /> {rdv.heure}
                  </span>
                  {rdv.patient_telephone && (
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Phone size={10} /> {rdv.patient_telephone}
                    </span>
                  )}
                </div>
              </div>
              <StatusBadge statut={rdv.statut} />
            </div>

            {/* Arrivée */}
            <div style={{
              display: "flex", alignItems: "center", gap: 9, marginBottom: 10,
              padding: "8px 11px", background: C.gray50, borderRadius: 8, flexWrap: "wrap",
            }}>
              <UserCheck size={13} color={C.gray500} />
              <span style={{ fontSize: 12, color: C.gray500, fontWeight: 600 }}>Arrivée :</span>
              <ArriveeBadge statut={rdv.arrivee || "en_attente"} />
              <select value={rdv.arrivee || "en_attente"} onChange={(e) => setArrivee(rdv.id, e.target.value)}
                style={{
                  marginLeft: "auto", padding: "4px 8px", borderRadius: 7,
                  border: `1px solid ${C.border}`, fontSize: 11, color: C.gray700,
                  outline: "none", fontFamily: "inherit", cursor: "pointer",
                }}>
                <option value="en_attente">En attente</option>
                <option value="en_salle">En salle</option>
                <option value="absent">Absent</option>
              </select>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {rdv.statut === "en_attente" && (
                <Btn variant="success" size="sm" icon={Clock} disabled={loadingId === rdv.id} onClick={() => handleValidate(rdv.id)}>
                  {loadingId === rdv.id ? "Valider..." : "Valider"}
                </Btn>
              )}
              {rdv.statut !== "annule" && (
                <Btn variant="ghost" size="sm" icon={RefreshCw} disabled={loadingId === rdv.id} onClick={() => { setRepMod(rdv); setNewDate(""); }}>
                  Reporter
                </Btn>
              )}
              {rdv.statut !== "annule" && (
                <Btn variant="danger" size="sm" icon={XCircle} disabled={loadingId === rdv.id} onClick={() => handleAnnuler(rdv.id)}>
                  {loadingId === rdv.id ? "Annuler..." : "Annuler"}
                </Btn>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Modal reporter */}
      {repMod && (
        <Modal title="Reporter le rendez-vous" onClose={() => setRepMod(null)} width={380}>
          <div style={{ background: C.gray50, borderRadius: 9, padding: "11px 13px", marginBottom: 14, fontSize: 13, color: C.gray700 }}>
            {repMod.patient_prenom} — {repMod.heure} · {repMod.date}
          </div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.gray500, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 7 }}>
            Nouvelle date
          </label>
          <div style={{ position: "relative", marginBottom: 18 }}>
            <Calendar size={13} color={C.gray400} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} />
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
              style={{ width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 10, paddingBottom: 10, borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: 14, color: C.navy, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            <Btn onClick={() => handleReporter(repMod.id, newDate)} disabled={!newDate || loadingId === repMod.id} style={{ flex: 1, padding: "11px" }}>
              {loadingId === repMod.id ? "Confirmer..." : "Confirmer"}
            </Btn>
            <Btn variant="ghost" onClick={() => setRepMod(null)} disabled={loadingId === repMod.id} style={{ flex: 1, padding: "11px" }}>
              Annuler
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};