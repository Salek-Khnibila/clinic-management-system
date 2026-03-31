// src/pages/ProfilPage.jsx

import { useState } from "react";
import { Eye, EyeOff, KeyRound, LogOut, Shield, ShieldCheck } from "lucide-react";
import { C } from "../constants/designTokens.js";
import { ROLES } from "../constants/status.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Btn, Card, PasswordStrengthBar, SectionTitle, useToast } from "../components/ui/Base.jsx";
import api from "../services/api.js";

export const ProfilPage = ({ onLogout }) => {
  const { user } = useAuth();
  const toast    = useToast();
  const rc       = ROLES?.[user.role] || { label: user.role, bg: C.tealLt, color: C.tealDk };

  // ── État changement de mot de passe ──────────────────────────────────────
  const [showPwd,     setShowPwd]     = useState(false);
  const [oldPwd,      setOldPwd]      = useState("");
  const [newPwd,      setNewPwd]      = useState("");
  const [confirmPwd,  setConfirmPwd]  = useState("");
  const [showOld,     setShowOld]     = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [pwdLoading,  setPwdLoading]  = useState(false);
  const [pwdErr,      setPwdErr]      = useState("");
  const [pwdSuccess,  setPwdSuccess]  = useState("");

  // ── Champs affichés selon le rôle ─────────────────────────────────────────
  const fields = [
    ["Nom",    user.nom],
    ["Prénom", user.prenom],
    ["Email",  user.email],
    ...(user.role === "admin"      ? [["Rôle", "Administrateur système"]] : []),
    ...(user.role === "secretaire" ? [["Poste", user.poste || "Secrétaire médicale"]] : []),
    ...(user.role === "medecin"    ? [["Spécialité", user.specialite]] : []),
    ...(user.role === "patient"    ? [
      ["Téléphone",      user.telephone],
      ["Groupe sanguin", user.groupe_sanguin || user.groupeSanguin],
    ] : []),
  ];

  // ── Route de changement de mot de passe selon le rôle ────────────────────
  // L'admin a sa propre route qui vérifie en plus qu'il est bien l'admin canonique.
  // Tous les autres rôles utilisent la route auth générique.
  const pwdEndpoint = user.role === "admin"
    ? "/admin/profile/password"
    : "/auth/change-password";

  // ── Validation locale ─────────────────────────────────────────────────────
  const validateNewPassword = (pwd) => {
    if (pwd.length < 8)     return "Au moins 8 caractères requis.";
    if (!/[A-Z]/.test(pwd)) return "Au moins une majuscule requise.";
    if (!/[0-9]/.test(pwd)) return "Au moins un chiffre requis.";
    return null;
  };

  const handleChangePassword = async () => {
    setPwdErr(""); setPwdSuccess("");
    if (!oldPwd || !newPwd || !confirmPwd) {
      setPwdErr("Veuillez remplir tous les champs."); return;
    }
    if (newPwd !== confirmPwd) {
      setPwdErr("Les nouveaux mots de passe ne correspondent pas."); return;
    }
    const validErr = validateNewPassword(newPwd);
    if (validErr) { setPwdErr(validErr); return; }

    setPwdLoading(true);
    try {
      await api.put(pwdEndpoint, { old_password: oldPwd, new_password: newPwd });
      setPwdSuccess("Mot de passe modifié avec succès !");
      toast.success("Mot de passe mis à jour.");
      setOldPwd(""); setNewPwd(""); setConfirmPwd("");
      setTimeout(() => { setPwdSuccess(""); setShowPwd(false); }, 3000);
    } catch (e) {
      const msg = e.response?.data?.message || "Erreur lors de la modification.";
      setPwdErr(msg);
      toast.error(msg);
    } finally {
      setPwdLoading(false);
    }
  };

  // ── Styles partagés ───────────────────────────────────────────────────────
  const inputStyle = {
    width: "100%", padding: "10px 40px 10px 14px", borderRadius: 10,
    border: `1.5px solid ${C.border}`, fontSize: 14, color: C.navy,
    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
    transition: "border 0.2s",
  };
  const lbl = {
    display: "block", fontSize: 11, fontWeight: 700, color: C.gray500,
    textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 6,
  };

  return (
    <div style={{ margin: "0 auto" }}>
      <SectionTitle>Mon profil</SectionTitle>

      {/* ── Avatar + identité ─────────────────────────────────────────────── */}
      <Card style={{ padding: "26px 22px", marginBottom: 14, textAlign: "center" }}>
        {user.role === "admin" ? (
          // Avatar distinctif pour l'admin : icône bouclier au lieu des initiales
          <div style={{
            width: 78, height: 78, borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.navy}, ${C.tealDk})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px",
            boxShadow: `0 4px 16px ${C.tealDk}44`,
          }}>
            <ShieldCheck size={36} color="#fff" strokeWidth={1.8} />
          </div>
        ) : (
          <div style={{
            width: 78, height: 78, borderRadius: "50%", background: C.grad,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 900, fontSize: 28, margin: "0 auto 12px",
          }}>
            {user.prenom?.[0]}{user.nom?.[0]}
          </div>
        )}
        <div style={{ fontSize: 20, fontWeight: 900, color: C.navy, fontFamily: "Georgia,serif" }}>
          {user.prenom} {user.nom}
        </div>
        <span style={{
          display: "inline-block", marginTop: 8, background: rc.bg, color: rc.color,
          borderRadius: 99, padding: "4px 16px", fontSize: 12, fontWeight: 700,
        }}>
          {rc.label}
        </span>
      </Card>

      {/* ── Informations ─────────────────────────────────────────────────── */}
      <Card style={{ padding: "18px 22px", marginBottom: 14 }}>
        {fields.filter(([, v]) => v).map(([k, v], i, arr) => (
          <div key={k} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "11px 0",
            borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
            fontSize: 14,
          }}>
            <span style={{ color: C.gray500, fontWeight: 600 }}>{k}</span>
            <span style={{ color: C.navy, fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </Card>

      {/* ── Changement de mot de passe ────────────────────────────────────── */}
      <Card style={{ padding: "18px 22px", marginBottom: 14 }}>
        <button
          onClick={() => { setShowPwd(!showPwd); setPwdErr(""); setPwdSuccess(""); }}
          style={{
            width: "100%", display: "flex", alignItems: "center",
            justifyContent: "space-between", background: "none", border: "none",
            cursor: "pointer", fontFamily: "inherit", padding: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: C.tealLt,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <KeyRound size={17} color={C.tealDk} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: C.navy }}>
              Changer le mot de passe
            </span>
          </div>
          <span style={{ fontSize: 18, color: C.gray400, lineHeight: 1 }}>
            {showPwd ? "−" : "+"}
          </span>
        </button>

        {showPwd && (
          <div style={{ marginTop: 18 }}>

            {/* Mot de passe actuel */}
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Mot de passe actuel</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showOld ? "text" : "password"}
                  value={oldPwd}
                  onChange={(e) => { setOldPwd(e.target.value); setPwdErr(""); }}
                  placeholder="••••••••"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = C.teal)}
                  onBlur={(e)  => (e.target.style.borderColor = C.border)}
                />
                <button onClick={() => setShowOld(!showOld)} tabIndex={-1}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.gray400 }}>
                  {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Nouveau mot de passe */}
            <div style={{ marginBottom: 8 }}>
              <label style={lbl}>Nouveau mot de passe</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showNew ? "text" : "password"}
                  value={newPwd}
                  onChange={(e) => { setNewPwd(e.target.value); setPwdErr(""); }}
                  placeholder="••••••••"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = C.teal)}
                  onBlur={(e)  => (e.target.style.borderColor = C.border)}
                />
                <button onClick={() => setShowNew(!showNew)} tabIndex={-1}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.gray400 }}>
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrengthBar password={newPwd} />
            </div>

            {/* Confirmation */}
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Confirmer le nouveau mot de passe</label>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => { setConfirmPwd(e.target.value); setPwdErr(""); }}
                  placeholder="••••••••"
                  style={{
                    ...inputStyle,
                    borderColor: confirmPwd && confirmPwd !== newPwd ? C.red : C.border,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = confirmPwd !== newPwd ? C.red : C.teal)}
                  onBlur={(e)  => (e.target.style.borderColor = confirmPwd !== newPwd ? C.red : C.border)}
                />
                {confirmPwd && (
                  <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>
                    {confirmPwd === newPwd ? "✅" : "❌"}
                  </span>
                )}
              </div>
            </div>

            {/* Messages */}
            {pwdErr && (
              <div style={{
                background: C.redLt, color: C.red, borderRadius: 9,
                padding: "9px 12px", fontSize: 13, fontWeight: 600,
                marginBottom: 12, display: "flex", gap: 7, alignItems: "center",
              }}>
                <Shield size={14} style={{ flexShrink: 0 }} /> {pwdErr}
              </div>
            )}
            {pwdSuccess && (
              <div style={{
                background: C.tealLt, color: C.tealDk, borderRadius: 9,
                padding: "9px 12px", fontSize: 13, fontWeight: 600,
                marginBottom: 12, display: "flex", gap: 7, alignItems: "center",
              }}>
                <ShieldCheck size={14} /> {pwdSuccess}
              </div>
            )}

            <Btn full onClick={handleChangePassword} disabled={pwdLoading} icon={KeyRound}>
              {pwdLoading ? "Modification..." : "Confirmer le changement"}
            </Btn>
          </div>
        )}
      </Card>

      {/* ── Déconnexion ───────────────────────────────────────────────────── */}
      <Btn full variant="danger" onClick={onLogout} icon={LogOut}>
        Se déconnecter
      </Btn>
    </div>
  );
};