import { useState } from "react";
import { AlertTriangle, CheckCircle, UserPlus } from "lucide-react";
import { C } from "../../constants/designTokens.js";
import { Card, SectionTitle } from "../../components/ui/Base.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";

const INITIAL_FORM = {
  prenom: "", nom: "", email: "", password: "",
  telephone: "", specialite: "", ville: "", tarif: "", experience: "",
};

export const SecretaireMedecins = () => {
  const { createUser } = useAuth();
  const [form, setForm]       = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const [success, setSuccess] = useState("");

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const submit = async () => {
    setErr(""); setSuccess("");
    const required = ["prenom", "nom", "email", "password", "specialite", "ville"];
    const missing  = required.filter((f) => !form[f].trim());
    if (missing.length) {
      setErr(`Champs manquants : ${missing.join(", ")}`);
      return;
    }
    setLoading(true);
    const result = await createUser({ ...form, role: "medecin" });
    setLoading(false);
    if (result.success) {
      setSuccess("Compte médecin créé avec succès !");
      setForm(INITIAL_FORM);
    } else {
      setErr(result.message || "Erreur lors de la création.");
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: `1.5px solid ${C.border}`, fontSize: 14, color: C.navy,
    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block", fontSize: 11, fontWeight: 700, color: C.gray500,
    textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 6,
  };

  return (
    <div>
      <SectionTitle sub="Créez des comptes pour les médecins de la clinique">
        Gestion des médecins
      </SectionTitle>

      <Card style={{ padding: "24px 28px", maxWidth: 560 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <UserPlus size={20} color={C.tealDk} />
          <span style={{ fontWeight: 800, fontSize: 16, color: C.navy }}>Nouveau médecin</span>
        </div>

        {/* Informations personnelles */}
        <div style={{ fontSize: 12, fontWeight: 700, color: C.tealDk, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.7 }}>
          Informations personnelles
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          {[["Prénom *", "prenom"], ["Nom *", "nom"]].map(([lbl, field]) => (
            <div key={field}>
              <label style={labelStyle}>{lbl}</label>
              <input value={form[field]} onChange={set(field)} placeholder={lbl.replace(" *", "")} style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = C.teal)}
                onBlur={(e) => (e.target.style.borderColor = C.border)} />
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Email *</label>
          <input type="email" value={form.email} onChange={set("email")} placeholder="dr.nom@clinique.com" style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = C.teal)}
            onBlur={(e) => (e.target.style.borderColor = C.border)} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Mot de passe *</label>
          <input type="password" value={form.password} onChange={set("password")} placeholder="••••••••" style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = C.teal)}
            onBlur={(e) => (e.target.style.borderColor = C.border)} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Téléphone</label>
          <input value={form.telephone} onChange={set("telephone")} placeholder="06XXXXXXXX" style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = C.teal)}
            onBlur={(e) => (e.target.style.borderColor = C.border)} />
        </div>

        {/* Informations médicales */}
        <div style={{ height: 1, background: C.border, margin: "4px 0 16px" }} />
        <div style={{ fontSize: 12, fontWeight: 700, color: C.tealDk, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.7 }}>
          Informations médicales
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          {[["Spécialité *", "specialite", "Cardiologie"], ["Ville *", "ville", "Casablanca"]].map(([lbl, field, ph]) => (
            <div key={field}>
              <label style={labelStyle}>{lbl}</label>
              <input value={form[field]} onChange={set(field)} placeholder={ph} style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = C.teal)}
                onBlur={(e) => (e.target.style.borderColor = C.border)} />
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[["Tarif", "tarif", "300 MAD"], ["Expérience", "experience", "5 ans"]].map(([lbl, field, ph]) => (
            <div key={field}>
              <label style={labelStyle}>{lbl}</label>
              <input value={form[field]} onChange={set(field)} placeholder={ph} style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = C.teal)}
                onBlur={(e) => (e.target.style.borderColor = C.border)} />
            </div>
          ))}
        </div>

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
            fontFamily: "inherit", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 8,
          }}>
          <UserPlus size={16} />
          {loading ? "Création..." : "Créer le compte médecin"}
        </button>
      </Card>
    </div>
  );
};