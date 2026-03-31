import { useState } from "react";
import { CheckCircle, FileText, Inbox, Mail, MessageSquare, Phone, PlusCircle, Search, Send, X } from "lucide-react";
import { C } from "../../constants/designTokens.js";
import { TEMPLATES } from "../../constants/data.js";
import { useApp } from "../../contexts/AppContext.jsx";
import { useMobile } from "../../hooks/useMobile.js";
import { Avatar, Btn, Card, SectionTitle, useToast } from "../../components/ui/Base.jsx";

export const SecretaireMessagerie = () => {
  const { messages, sendMessage, patients } = useApp();
  const isMobile = useMobile();
  const toast = useToast();
  const [selP, setSelP]     = useState(null);
  const [sujet, setSujet]   = useState("");
  const [corps, setCorps]   = useState("");
  const [sent, setSent]     = useState(false);
  const [sendErr, setSendErr] = useState("");
  const [compose, setCompose] = useState(false);
  const [search, setSearch] = useState("");
  const [tmpl, setTmpl]     = useState("");
  const [showList, setShowList] = useState(true); // mobile: toggle liste/panel
  const [sending, setSending] = useState(false);

  const pats    = patients.filter((p) => `${p.prenom} ${p.nom}`.toLowerCase().includes(search.toLowerCase()));
  const msgsOf  = (p) => messages.filter((m) => m.to_patient_id === p.id);

  const applyTmpl = (t) => {
    if (!t) return;
    const f = TEMPLATES.find((x) => x.label === t);
    if (f) { setSujet(f.sujet); setCorps(f.corps); }
    setTmpl(t);
  };

  const handleSend = async () => {
    if (!selP) {
      toast.warning("Sélectionnez d'abord un patient.");
      return;
    }
    if (!sujet.trim()) {
      toast.warning("Le sujet est requis.");
      return;
    }
    if (!corps.trim()) {
      toast.warning("Le message ne peut pas être vide.");
      return;
    }

    setSending(true);
    setSendErr("");
    const result = await sendMessage({
      sender: 'secretaire', to_patient_id: selP.id,
      sujet: sujet.trim(), corps: corps.trim(),
      date: new Date().toISOString().split('T')[0],
    });
    setSending(false);

    if (result.success) {
      toast.success(`Message envoyé à ${selP.prenom} ${selP.nom}.`);
      setSent(true);
      setTimeout(() => { setSent(false); setCompose(false); setSujet(""); setCorps(""); setTmpl(""); }, 2200);
    } else {
      toast.error(result.message || "Erreur lors de l'envoi.");
      setSendErr(result.message || "Erreur lors de l'envoi.");
    }
  };

  const selectPatient = (p) => {
    setSelP(p); setCompose(false); setSent(false);
    if (isMobile) setShowList(false);
  };

  const inp = {
    width: "100%", padding: "10px 13px", borderRadius: 9,
    border: `1.5px solid ${C.border}`, fontSize: 14, color: C.navy,
    outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border 0.2s",
  };

  // ── Layout mobile : vue liste OU vue panel (pas les deux en même temps)
  if (isMobile) {
    return (
      <div>
        <SectionTitle sub="Contactez directement les patients">Messagerie patients</SectionTitle>

        {/* Bouton retour sur mobile */}
        {!showList && selP && (
          <button onClick={() => setShowList(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 13, color: C.gray500, cursor: "pointer", fontFamily: "inherit" }}>
            ← Retour à la liste
          </button>
        )}

        {/* Liste patients mobile */}
        {showList && (
          <div>
            <div style={{ position: "relative", marginBottom: 11 }}>
              <Search size={13} color={C.gray400} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un patient..."
                style={{ ...inp, paddingLeft: 30 }}
                onFocus={(e) => (e.target.style.borderColor = C.teal)}
                onBlur={(e) => (e.target.style.borderColor = C.border)} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pats.map((p) => {
                const count = msgsOf(p).length;
                return (
                  <div key={p.id} onClick={() => selectPatient(p)}
                    style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 14px", borderRadius: 10, cursor: "pointer", background: C.white, border: `1.5px solid ${C.border}` }}>
                    <Avatar name={`${p.prenom} ${p.nom}`} color={C.gray400} size={38} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: C.navy }}>{p.prenom} {p.nom}</div>
                      <div style={{ fontSize: 11, color: C.gray400, display: "flex", alignItems: "center", gap: 3 }}>
                        <Phone size={10} /> {p.telephone}
                      </div>
                    </div>
                    {count > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.tealDk, background: C.tealLt, borderRadius: 99, padding: "2px 7px" }}>{count}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Panel messages mobile */}
        {!showList && selP && <PanelMessages selP={selP} msgsOf={msgsOf} compose={compose} setCompose={setCompose} sujet={sujet} setSujet={setSujet} corps={corps} setCorps={setCorps} sent={sent} sendErr={sendErr} tmpl={tmpl} applyTmpl={applyTmpl} handleSend={handleSend} setTmpl={setTmpl} inp={inp} isMobile={isMobile} sending={sending} />}
      </div>
    );
  }

  // ── Layout desktop : côte à côte ──────────────────────────────────────────
  return (
    <div>
      <SectionTitle sub="Contactez directement les patients du cabinet">Messagerie patients</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "270px 1fr", gap: 20, alignItems: "start" }}>
        {/* Liste patients desktop */}
        <div>
          <div style={{ position: "relative", marginBottom: 11 }}>
            <Search size={13} color={C.gray400} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..."
              style={{ ...inp, paddingLeft: 30 }}
              onFocus={(e) => (e.target.style.borderColor = C.teal)}
              onBlur={(e) => (e.target.style.borderColor = C.border)} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {pats.map((p) => {
              const count = msgsOf(p).length;
              const sel   = selP?.id === p.id;
              return (
                <div key={p.id} onClick={() => selectPatient(p)}
                  style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 13px", borderRadius: 10, cursor: "pointer", background: sel ? C.tealLt : C.white, border: `1.5px solid ${sel ? C.tealDk : C.border}`, transition: "all 0.15s" }}>
                  <Avatar name={`${p.prenom} ${p.nom}`} color={sel ? C.tealDk : C.gray400} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: sel ? C.navy : C.gray700 }}>{p.prenom} {p.nom}</div>
                    <div style={{ fontSize: 11, color: C.gray400, display: "flex", alignItems: "center", gap: 3 }}>
                      <Phone size={10} /> {p.telephone}
                    </div>
                  </div>
                  {count > 0 && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.tealDk, background: C.tealLt, borderRadius: 99, padding: "2px 7px" }}>{count}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel droit desktop */}
        <div>
          {!selP ? (
            <Card style={{ padding: "60px", textAlign: "center" }}>
              <MessageSquare size={40} color={C.gray400} style={{ margin: "0 auto 14px", display: "block" }} />
              <div style={{ fontWeight: 700, fontSize: 15, color: C.navy, marginBottom: 6 }}>Sélectionnez un patient</div>
              <div style={{ color: C.gray500, fontSize: 13 }}>Choisissez un patient pour voir ses messages ou en envoyer un nouveau.</div>
            </Card>
          ) : (
            <PanelMessages selP={selP} msgsOf={msgsOf} compose={compose} setCompose={setCompose} sujet={sujet} setSujet={setSujet} corps={corps} setCorps={setCorps} sent={sent} sendErr={sendErr} tmpl={tmpl} applyTmpl={applyTmpl} handleSend={handleSend} setTmpl={setTmpl} inp={inp} isMobile={isMobile} sending={sending} />
          )}
        </div>
      </div>
    </div>
  );
};

// Composant panel messages partagé mobile/desktop
const PanelMessages = ({ selP, msgsOf, compose, setCompose, sujet, setSujet, corps, setCorps, sent, sendErr, tmpl, applyTmpl, handleSend, setTmpl, inp, isMobile, sending }) => {
  const msgs = msgsOf(selP);

  if (!compose) return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <Avatar name={`${selP.prenom} ${selP.nom}`} color={C.tealDk} size={42} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: C.navy }}>{selP.prenom} {selP.nom}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: C.gray500 }}>
              <Mail size={11} /> {selP.email}
            </div>
          </div>
        </div>
        <Btn icon={PlusCircle} onClick={() => { setCompose(true); setSujet(""); setCorps(""); setTmpl(""); }}>
          Nouveau message
        </Btn>
      </div>

      {msgs.length === 0 ? (
        <Card style={{ padding: "40px", textAlign: "center" }}>
          <Inbox size={28} color={C.gray400} style={{ margin: "0 auto 10px", display: "block" }} />
          <div style={{ color: C.gray500, fontSize: 13 }}>Aucun message envoyé à ce patient.</div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {msgs.map((msg) => (
            <Card key={msg.id} style={{ padding: "14px 17px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 9, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.navy }}>{msg.sujet}</div>
                  <div style={{ fontSize: 11, color: C.gray400, marginTop: 2 }}>Envoyé le {msg.date}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, background: msg.lu ? C.greenLt : C.amberLt, color: msg.lu ? C.green : C.amber, borderRadius: 99, padding: "3px 9px" }}>
                  {msg.lu ? "Lu" : "Non lu"}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: C.gray700, lineHeight: 1.6, padding: "10px 13px", background: C.gray50, borderRadius: 8 }}>
                {msg.corps}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Card style={{ padding: isMobile ? "16px" : "22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: C.navy, fontFamily: "Georgia,serif" }}>
          Nouveau message — <span style={{ color: C.tealDk }}>{selP.prenom} {selP.nom}</span>
        </div>
        <button onClick={() => setCompose(false)}
          style={{ border: "none", background: C.gray100, borderRadius: "50%", width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={14} color={C.gray500} />
        </button>
      </div>

      {/* Modèle */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.gray500, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 7 }}>Modèle (optionnel)</label>
        <div style={{ position: "relative" }}>
          <FileText size={13} color={C.gray400} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} />
          <select value={tmpl} onChange={(e) => applyTmpl(e.target.value)}
            style={{ width: "100%", paddingLeft: 30, paddingRight: 12, paddingTop: 10, paddingBottom: 10, borderRadius: 9, border: `1.5px solid ${C.border}`, fontSize: 13, color: C.gray700, background: C.white, fontFamily: "inherit", cursor: "pointer", outline: "none" }}>
            <option value="">-- Choisir un modèle --</option>
            {TEMPLATES.map((t) => <option key={t.label} value={t.label}>{t.label}</option>)}
          </select>
        </div>
      </div>

      {/* Sujet */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.gray500, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 7 }}>Sujet *</label>
        <input value={sujet} onChange={(e) => setSujet(e.target.value)} placeholder="Objet du message..." style={inp}
          onFocus={(e) => (e.target.style.borderColor = C.teal)}
          onBlur={(e) => (e.target.style.borderColor = C.border)} />
      </div>

      {/* Corps */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.gray500, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 7 }}>Message *</label>
        <textarea value={corps} onChange={(e) => setCorps(e.target.value)} placeholder="Rédigez votre message..." rows={isMobile ? 5 : 6}
          style={{ ...inp, resize: "vertical", lineHeight: 1.6 }}
          onFocus={(e) => (e.target.style.borderColor = C.teal)}
          onBlur={(e) => (e.target.style.borderColor = C.border)} />
      </div>

      {sent && (
        <div style={{ background: C.greenLt, color: C.green, borderRadius: 9, padding: "11px 14px", fontSize: 13, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle size={15} /> Message envoyé avec succès !
        </div>
      )}
      {sendErr && (
        <div style={{ background: C.redLt, color: C.red, borderRadius: 9, padding: "11px 14px", fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
          {sendErr}
        </div>
      )}

      <div style={{ display: "flex", gap: 9, flexWrap: isMobile ? "wrap" : "nowrap" }}>
        <Btn variant="ghost" onClick={() => setCompose(false)} disabled={sending} style={{ flex: 1, padding: "11px" }}>Annuler</Btn>
        <Btn variant="purple" icon={Send} onClick={handleSend} disabled={!sujet || !corps || sending} style={{ flex: 2, padding: "11px" }}>
          {sending ? "Envoi..." : "Envoyer le message"}
        </Btn>
      </div>
    </Card>
  );
};