import { useState } from "react";
import { AlertTriangle, CheckCircle, UserPlus, Users } from "lucide-react";
import { C } from "../../constants/designTokens.js";
import { Card, SectionTitle } from "../../components/ui/Base.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useMobile } from "../../hooks/useMobile.js";

const INITIAL_FORM = {
  prenom: "", nom: "", email: "", password: "",
  role: "secretaire", telephone: "",
  specialite: "", ville: "", tarif: "", experience: "",
};

export const AdminDashboard = () => {
  const { createUser } = useAuth();
  const isMobile = useMobile();
  const [form, setForm]       = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const [success, setSuccess] = useState("");

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const submit = async () => {
    setErr(""); setSuccess("");
    const required = ["prenom", "nom", "email", "password"];
    if (form.role === "medecin") required.push("specialite", "ville");
    const missing = required.filter((f) => !form[f].trim());
    if (missing.length) { setErr(`Champs manquants : ${missing.join(", ")}`); return; }
    setLoading(true);
    const result = await createUser(form);
    setLoading(false);
    if (result.success) { setSuccess(`Compte ${form.role} créé avec succès !`); setForm(INITIAL_FORM); }
    else setErr(result.message || "Erreur lors de la création.");
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

      {/* Banner */}
      <Card style={{ padding: isMobile ? "14px 16px" : "16px 20px", display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: C.tealLt, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Users size={22} color={C.tealDk} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: C.navy }}>Espace Admin</div>
          <div style={{ fontSize: 12, color: C.gray500, marginTop: 2 }}>Gestion centralisée des comptes secrétaires et médecins</div>
        </div>
      </Card>

      {/* Formulaire */}
      <Card style={{ padding: isMobile ? "18px 16px" : "24px 28px", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <UserPlus size={20} color={C.tealDk} />
          <span style={{ fontWeight: 800, fontSize: 16, color: C.navy }}>Créer un compte</span>
        </div>

        {/* Sélection rôle */}
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

        {/* Prénom + Nom */}
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

        {/* Email */}
        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Email</label>
          <input type="email" value={form.email} onChange={set("email")} placeholder="email@clinique.com" style={inp}
            onFocus={(e) => (e.target.style.borderColor = C.teal)}
            onBlur={(e) => (e.target.style.borderColor = C.border)} />
        </div>

        {/* Mot de passe */}
        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Mot de passe</label>
          <input type="password" value={form.password} onChange={set("password")} placeholder="••••••••" style={inp}
            onFocus={(e) => (e.target.style.borderColor = C.teal)}
            onBlur={(e) => (e.target.style.borderColor = C.border)} />
        </div>

        {/* Téléphone */}
        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Téléphone</label>
          <input value={form.telephone} onChange={set("telephone")} placeholder="06XXXXXXXX" style={inp}
            onFocus={(e) => (e.target.style.borderColor = C.teal)}
            onBlur={(e) => (e.target.style.borderColor = C.border)} />
        </div>

        {/* Champs médecin */}
        {form.role === "medecin" && (
          <>
            <div style={{ height: 1, background: C.border, margin: "16px 0" }} />
            <div style={{ fontSize: 12, fontWeight: 700, color: C.tealDk, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.7 }}>
              Informations médicales
            </div>
            <div style={grid2}>
              {[["Spécialité *", "specialite", "Cardiologie"], ["Ville *", "ville", "Casablanca"]].map(([l, f, ph]) => (
                <div key={f}>
                  <label style={lbl}>{l}</label>
                  <input value={form[f]} onChange={set(f)} placeholder={ph} style={inp}
                    onFocus={(e) => (e.target.style.borderColor = C.teal)}
                    onBlur={(e) => (e.target.style.borderColor = C.border)} />
                </div>
              ))}
            </div>
            <div style={grid2}>
              {[["Tarif", "tarif", "300 MAD"], ["Expérience", "experience", "5 ans"]].map(([l, f, ph]) => (
                <div key={f}>
                  <label style={lbl}>{l}</label>
                  <input value={form[f]} onChange={set(f)} placeholder={ph} style={inp}
                    onFocus={(e) => (e.target.style.borderColor = C.teal)}
                    onBlur={(e) => (e.target.style.borderColor = C.border)} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Messages */}
        {err && (
          <div style={{ background: C.redLt, color: C.red, borderRadius: 9, padding: "10px 13px", fontSize: 13, fontWeight: 600, marginBottom: 14, display: "flex", gap: 7, alignItems: "center" }}>
            <AlertTriangle size={14} /> {err}
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