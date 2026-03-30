import { useState } from "react";
import { Eye, EyeOff, KeyRound, LogOut, Shield } from "lucide-react";
import { C } from "../constants/designTokens.js";
import { ROLES } from "../constants/status.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Btn, Card, SectionTitle } from "../components/ui/Base.jsx";
import api from "../services/api.js";

export const ProfilPage = ({ onLogout }) => {
  const { user } = useAuth();
  const rc = ROLES[user.role] || { label: user.role, bg: C.tealLt, color: C.tealDk };

  // ── État changement de mot de passe ──────────────────────────────────────
  const [showPwd, setShowPwd]       = useState(false);
  const [oldPwd, setOldPwd]         = useState("");
  const [newPwd, setNewPwd]         = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showOld, setShowOld]       = useState(false);
  const [showNew, setShowNew]       = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdErr, setPwdErr]         = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");

  const fields = [
    ["Nom",    user.nom],
    ["Prénom", user.prenom],
    ["Email",  user.email],
    ...(user.role === "secretaire" ? [["Poste", user.poste || "Secrétaire médicale"]] : []),
    ...(user.role === "medecin"    ? [["Spécialité", user.specialite]] : []),
    ...(user.role === "patient"    ? [
      ["Téléphone",     user.telephone],
      ["Groupe sanguin", user.groupe_sanguin || user.groupeSanguin],
    ] : []),
  ];

  // ── Validation locale du nouveau mot de passe ────────────────────────────
  const validateNewPassword = (pwd) => {
    if (pwd.length < 8)          return "At least 8 characters required";
    if (!/[A-Z]/.test(pwd))      return "At least one uppercase letter required";
    if (!/[0-9]/.test(pwd))      return "At least one number required";
    return null;
  };

  const handleChangePassword = async () => {
    setPwdErr(""); setPwdSuccess("");

    if (!oldPwd || !newPwd || !confirmPwd) {
      setPwdErr("Please fill in all fields."); return;
    }
    if (newPwd !== confirmPwd) {
      setPwdErr("New passwords do not match."); return;
    }
    const validErr = validateNewPassword(newPwd);
    if (validErr) { setPwdErr(validErr); return; }

    setPwdLoading(true);
    try {
      await api.put('/auth/change-password', {
        old_password: oldPwd,
        new_password: newPwd,
      });
      setPwdSuccess("Password changed successfully!");
      setOldPwd(""); setNewPwd(""); setConfirmPwd("");
      setTimeout(() => { setPwdSuccess(""); setShowPwd(false); }, 3000);
    } catch (e) {
      setPwdErr(e.response?.data?.message || "Error changing password.");
    } finally {
      setPwdLoading(false);
    }
  };

  // ── Indicateur de force du mot de passe ──────────────────────────────────
  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8)         score++;
    if (pwd.length >= 12)        score++;
    if (/[A-Z]/.test(pwd))       score++;
    if (/[0-9]/.test(pwd))       score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };
  const strength      = getStrength(newPwd);
  const strengthLabel = ["", "Très faible", "Faible", "Moyen", "Fort", "Très fort"][strength];
  const strengthColor = ["", C.red, C.red, C.amber, C.green, C.tealDk][strength];

  const inputStyle = {
    width: "100%", padding: "10px 40px 10px 14px", borderRadius: 10,
    border: `1.5px solid ${C.border}`, fontSize: 14, color: C.navy,
    outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border 0.2s",
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <SectionTitle>Mon profil</SectionTitle>

      {/* Avatar + nom */}
      <Card style={{ padding: "26px 22px", marginBottom: 14, textAlign: "center" }}>
        <div style={{
          width: 78, height: 78, borderRadius: "50%", background: C.grad,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 900, fontSize: 28, margin: "0 auto 12px",
        }}>
          {user.prenom?.[0]}{user.nom?.[0]}
        </div>
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

      {/* Informations */}
      <Card style={{ padding: "18px 22px", marginBottom: 14 }}>
        {fields.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} style={{
            display: "flex", justifyContent: "space-between",
            padding: "11px 0", borderBottom: `1px solid ${C.border}`, fontSize: 14,
          }}>
            <span style={{ color: C.gray500, fontWeight: 600 }}>{k}</span>
            <span style={{ color: C.navy, fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </Card>

      {/* Changement de mot de passe */}
      <Card style={{ padding: "18px 22px", marginBottom: 14 }}>
        <button onClick={() => { setShowPwd(!showPwd); setPwdErr(""); setPwdSuccess(""); }}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0,
          }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.tealLt, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <KeyRound size={17} color={C.tealDk} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: C.navy }}>Changer le mot de passe</span>
          </div>
          <span style={{ fontSize: 18, color: C.gray400 }}>{showPwd ? "−" : "+"}</span>
        </button>

        {showPwd && (
          <div style={{ marginTop: 18 }}>
            {/* Ancien mot de passe */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.gray500, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 6 }}>
                Mot de passe actuel
              </label>
              <div style={{ position: "relative" }}>
                <input type={showOld ? "text" : "password"} value={oldPwd} onChange={(e) => setOldPwd(e.target.value)}
                  placeholder="••••••••" style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = C.teal)}
                  onBlur={(e) => (e.target.style.borderColor = C.border)} />
                <button onClick={() => setShowOld(!showOld)} tabIndex={-1}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.gray400 }}>
                  {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Nouveau mot de passe */}
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.gray500, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 6 }}>
                Nouveau mot de passe
              </label>
              <div style={{ position: "relative" }}>
                <input type={showNew ? "text" : "password"} value={newPwd} onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="••••••••" style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = C.teal)}
                  onBlur={(e) => (e.target.style.borderColor = C.border)} />
                <button onClick={() => setShowNew(!showNew)} tabIndex={-1}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.gray400 }}>
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Barre de force */}
              {newPwd.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} style={{
                        flex: 1, height: 4, borderRadius: 99,
                        background: i <= strength ? strengthColor : C.border,
                        transition: "background 0.2s",
                      }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: strengthColor, fontWeight: 600 }}>{strengthLabel}</div>
                  <div style={{ fontSize: 11, color: C.gray400, marginTop: 3 }}>
                    Min. 8 caractères, 1 majuscule, 1 chiffre
                  </div>
                </div>
              )}
            </div>

            {/* Confirmation */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.gray500, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 6 }}>
                Confirmer le nouveau mot de passe
              </label>
              <div style={{ position: "relative" }}>
                <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="••••••••"
                  style={{ ...inputStyle, borderColor: confirmPwd && confirmPwd !== newPwd ? C.red : C.border }}
                  onFocus={(e) => (e.target.style.borderColor = confirmPwd !== newPwd ? C.red : C.teal)}
                  onBlur={(e) => (e.target.style.borderColor = confirmPwd !== newPwd ? C.red : C.border)} />
                {confirmPwd && (
                  <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>
                    {confirmPwd === newPwd ? "✅" : "❌"}
                  </span>
                )}
              </div>
            </div>

            {/* Messages */}
            {pwdErr && (
              <div style={{ background: C.redLt, color: C.red, borderRadius: 9, padding: "9px 12px", fontSize: 13, fontWeight: 600, marginBottom: 12, display: "flex", gap: 7, alignItems: "center" }}>
                <Shield size={14} /> {pwdErr}
              </div>
            )}
            {pwdSuccess && (
              <div style={{ background: C.tealLt, color: C.tealDk, borderRadius: 9, padding: "9px 12px", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
                ✅ {pwdSuccess}
              </div>
            )}

            <button onClick={handleChangePassword} disabled={pwdLoading}
              style={{
                width: "100%", padding: "11px", borderRadius: 10,
                background: pwdLoading ? C.gray300 : C.gradBtn,
                color: "#fff", fontWeight: 800, fontSize: 14,
                border: "none", cursor: pwdLoading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}>
              {pwdLoading ? "Modification..." : "Confirmer le changement"}
            </button>
          </div>
        )}
      </Card>

      {/* Déconnexion */}
      <Btn full variant="danger" onClick={onLogout} icon={LogOut}>
        Se déconnecter
      </Btn>
    </div>
  );
};