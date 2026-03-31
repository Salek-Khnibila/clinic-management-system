import { useState } from "react";
import { AlertTriangle, CheckCircle, Eye, EyeOff, UserPlus, Users } from "lucide-react";
import { C } from "../../constants/designTokens.js";
import { Card, PasswordStrengthBar, SectionTitle, useToast } from "../../components/ui/Base.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useMobile } from "../../hooks/useMobile.js";
import { SPECS, VILLES } from "../../constants/data.js";

const INITIAL_FORM = {
  prenom: "", nom: "", email: "", password: "",
  role: "secretaire", telephone: "",
  specialite: "", ville: "", tarif: "", experience: "",
};

export const AdminDashboard = () => {
  const { createUser } = useAuth();
  const isMobile = useMobile();
  const toast = useToast();
  const [form, setForm]       = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState([]);
  const [success, setSuccess] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const submit = async () => {
    setErrors([]); setSuccess("");
    const required = ["prenom", "nom", "email", "password"];
    if (form.role === "medecin") required.push("specialite", "ville", "tarif", "experience");
    const missing = required.filter((f) => !form[f].trim());
    if (missing.length) {
      setErrors([`Champs manquants : ${missing.join(", ")}`]);
      return;
    }
    setLoading(true);
    const result = await createUser(form);
    setLoading(false);
    if (result.success) {
      setSuccess(`Compte ${form.role} créé avec succès !`);
      toast.success("Compte créé !");
      setForm(INITIAL_FORM);
      setTimeout(() => setSuccess(""), 4000);
    } else {
      // ✅ errors[] en priorité, sinon message seul (ex: email déjà utilisé)
      if (result.errors && result.errors.length > 0) {
        setErrors(result.errors);
      } else if (result.message) {
        setErrors([result.message]);
      } else {
        setErrors(["Erreur lors de la création."]);
      }
      toast.error("Échec de la création du compte.");
    }
  };

  const inp = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: `1.5px solid ${C.border}`, fontSize: 14, color: C.navy,
    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };
  const lbl = {
    display: "block", fontSize: 11, fontWeight: 700, color: C.gray500,
    textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 6,
  };
  const grid2 = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    gap: 12, marginBottom: 12,
  };

  return (
    <div style={{ padding: isMobile ? "8px 0" : 0 }}>
      <SectionTitle sub="Gérez les comptes de la clinique">Administration</SectionTitle>

      <Card style={{ padding: isMobile ? "14px 16px" : "16px 20px", display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: C.tealLt, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Users size={22} color={C.tealDk} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: C.navy }}>Espace Admin</div>
          <div style={{ fontSize: 12, color: C.gray500, marginTop: 2 }}>Gestion centralisée des comptes secrétaires et médecins</div>
        </div>
      </Card>

      <Card style={{ padding: isMobile ? "18px 16px" : "24px 28px", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <UserPlus size={20} color={C.tealDk} />
          <span style={{ fontWeight: 800, fontSize: 16, color: C.navy }}>Créer un compte</span>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={lbl}>Type de compte</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["secretaire", "medecin"].map((r) => (
              <button key={r} onClick={() => setForm((p) => ({ ...p, role: r }))}
                style={{
                  flex: 1, padding: "10px", borderRadius: 9,
                  border: `1.5px solid ${form.role === r ? C.tealDk : C.border}`,
                  background: form.role === r ? C.tealLt : C.white,
                  color: form.role === r ? C.tealDk : C.gray500,
                  fontWeight: 700, fontSize: isMobile ? 13 : 14,
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                }}>
                {r === "secretaire" ? "Secrétaire" : "Médecin"}
              </button>
            ))}
          </div>
        </div>

        <div style={grid2}>
          {[["Prénom", "prenom"], ["Nom", "nom"]].map(([l, f]) => (
            <div key={f}>
              <label style={lbl}>{l}</label>
              <input value={form[f]} onChange={set(f)} placeholder={l} style={inp}
                onFocus={(e) => (e.target.style.borderColor = C.teal)}
                onBlur={(e) => (e.target.style.borderColor = C.border)} />
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Email</label>
          <input type="email" value={form.email} onChange={set("email")}
            placeholder="email@clinique.com" style={inp}
            onFocus={(e) => (e.target.style.borderColor = C.teal)}
            onBlur={(e) => (e.target.style.borderColor = C.border)} />
        </div>

        {/* ── Mot de passe avec indicateur de force ── */}
        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Mot de passe</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPwd ? "text" : "password"}
              value={form.password}
              onChange={set("password")}
              placeholder="••••••••"
              style={{ ...inp, paddingRight: 40 }}
              onFocus={(e) => (e.target.style.borderColor = C.teal)}
              onBlur={(e) => (e.target.style.borderColor = C.border)}
            />
            <button
              onClick={() => setShowPwd(!showPwd)}
              tabIndex={-1}
              style={{
                position: "absolute", right: 12, top: "50%",
                transform: "translateY(-50%)",
                background: "none", border: "none",
                cursor: "pointer", color: C.gray400, padding: 0,
              }}
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <PasswordStrengthBar password={form.password} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Téléphone</label>
          <input value={form.telephone} onChange={set("telephone")}
            placeholder="06XXXXXXXX" style={inp}
            onFocus={(e) => (e.target.style.borderColor = C.teal)}
            onBlur={(e) => (e.target.style.borderColor = C.border)} />
        </div>

        {form.role === "medecin" && (
          <>
            <div style={{ height: 1, background: C.border, margin: "16px 0" }} />
            <div style={{ fontSize: 12, fontWeight: 700, color: C.tealDk, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.7 }}>
              Informations médicales
            </div>

            <div style={grid2}>
              {/* Spécialité */}
              <div>
                <label style={lbl}>Spécialité *</label>
                <select value={form.specialite} onChange={set("specialite")}
                  style={{ ...inp, color: form.specialite ? C.navy : C.gray400 }}
                  onFocus={(e) => (e.target.style.borderColor = C.teal)}
                  onBlur={(e) => (e.target.style.borderColor = C.border)}>
                  <option value="">-- Choisir --</option>
                  {SPECS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Ville */}
              <div>
                <label style={lbl}>Ville *</label>
                <select value={form.ville} onChange={set("ville")}
                  style={{ ...inp, color: form.ville ? C.navy : C.gray400 }}
                  onFocus={(e) => (e.target.style.borderColor = C.teal)}
                  onBlur={(e) => (e.target.style.borderColor = C.border)}>
                  <option value="">-- Choisir --</option>
                  {VILLES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            <div style={grid2}>
              {/* Tarif */}
              <div>
                <label style={lbl}>Tarif *</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="number" min="0" step="0.01"
                    value={form.tarif}
                    onChange={(e) => setForm((p) => ({ ...p, tarif: e.target.value }))}
                    placeholder="300"
                    style={{ ...inp, paddingRight: 52 }}
                    onFocus={(e) => (e.target.style.borderColor = C.teal)}
                    onBlur={(e) => (e.target.style.borderColor = C.border)}
                  />
                  <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, fontWeight: 700, color: C.gray400, pointerEvents: "none" }}>
                    MAD
                  </span>
                </div>
              </div>

              {/* Expérience */}
              <div>
                <label style={lbl}>Expérience *</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="number" min="0" max="60" step="1"
                    value={form.experience}
                    onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))}
                    placeholder="10"
                    style={{ ...inp, paddingRight: 44 }}
                    onFocus={(e) => (e.target.style.borderColor = C.teal)}
                    onBlur={(e) => (e.target.style.borderColor = C.border)}
                  />
                  <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, fontWeight: 700, color: C.gray400, pointerEvents: "none" }}>
                    ans
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {errors.length > 0 && (
          <div style={{ background: C.redLt, color: C.red, borderRadius: 9, padding: "10px 13px", fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
            {errors.map((line, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: i < errors.length - 1 ? 5 : 0 }}>
                <AlertTriangle size={14} style={{ flexShrink: 0 }} /> {line}
              </div>
            ))}
          </div>
        )}
        {success && (
          <div style={{ background: C.tealLt, color: C.tealDk, borderRadius: 9, padding: "10px 13px", fontSize: 13, fontWeight: 600, marginBottom: 14, display: "flex", gap: 7, alignItems: "center" }}>
            <CheckCircle size={14} /> {success}
          </div>
        )}

        <button onClick={submit} disabled={loading}
          style={{
            width: "100%", padding: "12px", borderRadius: 10,
            background: loading ? C.gray300 : C.gradBtn,
            color: "#fff", fontWeight: 800, fontSize: 15,
            border: "none", cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
          <UserPlus size={16} />
          {loading ? "Création..." : `Créer le compte ${form.role}`}
        </button>
      </Card>
    </div>
  );
};