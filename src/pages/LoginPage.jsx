import { useState } from "react";
import { AlertTriangle, ArrowRight, Phone, Shield, User } from "lucide-react";
import { C } from "../constants/designTokens.js";
import { Logo } from "../components/ui/Logo.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useMobile } from "../hooks/useMobile.js";

export const LoginPage = () => {
  const { login, register, loading } = useAuth();
  const isMobile = useMobile();
  const [isLogin, setIsLogin]       = useState(true);
  const [nom, setNom]               = useState("");
  const [prenom, setPrenom]         = useState("");
  const [email, setEmail]           = useState("");
  const [pass, setPass]             = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [telephone, setTelephone]   = useState("");
  const [err, setErr]               = useState("");
  const [success, setSuccess]       = useState("");

  const submit = async () => {
    // Champs obligatoires
    if (!email || !pass) {
      setErr("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (!isLogin && (!nom || !prenom || !telephone)) {
      setErr("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    // Validation téléphone (10 chiffres)
    if (!isLogin && !/^[0-9]{10}$/.test(telephone)) {
      setErr("Le numéro de téléphone doit contenir exactement 10 chiffres.");
      return;
    }

    // Confirmation mot de passe
    if (!isLogin && pass !== confirmPass) {
      setErr("Les mots de passe ne correspondent pas.");
      return;
    }

    // Longueur mot de passe
    if (!isLogin && pass.length < 8) {
      setErr("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setErr("");
    setSuccess("");

    if (isLogin) {
      const result = await login(email, pass);
      if (!result.success) setErr(result.message || "Identifiants incorrects.");
    } else {
      const result = await register({ email, password: pass, nom, prenom, telephone });
      if (result.success) {
        setSuccess("Compte créé ! Connexion en cours...");
        await login(email, pass);
      } else {
        setErr(result.message || "Erreur lors de l'inscription.");
      }
    }
  };

  const inputStyle = {
    width: "100%",
    paddingLeft: 40,
    paddingRight: 16,
    paddingTop: isMobile ? 14 : 12,
    paddingBottom: isMobile ? 14 : 12,
    borderRadius: 12,
    border: `1.5px solid ${C.border}`,
    fontSize: isMobile ? 15 : 14,
    color: C.navy,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border 0.2s",
    opacity: loading ? 0.6 : 1,
    cursor: loading ? "not-allowed" : "text",
  };

  // Champs login
  const loginFields = [
    ["Email",        "email",    email, setEmail, "votre@email.ma", User  ],
    ["Mot de passe", "password", pass,  setPass,  "••••••••",       Shield],
  ];

  // Champs inscription
  const registerFields = [
    ["Prénom",                   "text",     prenom,      setPrenom,      "Votre prénom",    User  ],
    ["Nom",                      "text",     nom,         setNom,         "Votre nom",       User  ],
    ["Email",                    "email",    email,       setEmail,       "votre@email.ma",  User  ],
    ["Téléphone",                "tel",      telephone,   setTelephone,   "0612345678",      Phone ],
    ["Mot de passe",             "password", pass,        setPass,        "••••••••",        Shield],
    ["Confirmer le mot de passe","password", confirmPass, setConfirmPass, "••••••••",        Shield],
  ];

  const fields = isLogin ? loginFields : registerFields;

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      fontFamily: "'Inter',system-ui,sans-serif",
      background: C.white,
    }}>
      {/* Panneau gauche — desktop uniquement */}
      {!isMobile && (
        <div style={{
          flex: "0 0 40%",
          maxWidth: 480,
          backgroundImage: `linear-gradient(rgba(8,145,178,0.75), rgba(13,33,55,0.85)), url('https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=1200&auto=format&fit=crop')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "8vh 4vw",
          color: "#fff",
        }}>
          <div style={{ position: "absolute", top: "-10%", left: "-20%", width: "80%", paddingBottom: "80%", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%)" }} />
          <div style={{ position: "absolute", bottom: "-10%", right: "-20%", width: "90%", paddingBottom: "90%", borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 60%)" }} />
          <div style={{ zIndex: 1, position: "relative" }}>
            <div style={{ fontSize: 13, letterSpacing: 4, textTransform: "uppercase", opacity: 0.9, fontWeight: 800, color: C.tealLt }}>
              Gestion Clinique
            </div>
          </div>
          <div style={{ zIndex: 1, position: "relative" }}>
            <h1 style={{ fontSize: "clamp(32px,3.5vw,48px)", fontWeight: 900, fontFamily: "Georgia,serif", margin: "0 0 24px", lineHeight: 1.1 }}>
              L'excellence<br />médicale,<br />en ligne.
            </h1>
            <p style={{ fontSize: 17, opacity: 0.9, maxWidth: 360, lineHeight: 1.6, margin: 0 }}>
              Connectez-vous pour accéder à votre espace dédié, gérer vos rendez-vous et communiquer avec votre praticien.
            </p>
          </div>
        </div>
      )}

      {/* Panneau droit — formulaire */}
      <div style={{
        flex: 1,
        background: C.white,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: isMobile ? "48px 24px" : "60px 48px",
        overflowY: "auto",
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>

          <div style={{ marginBottom: 48, display: "flex", justifyContent: "flex-start" }}>
            <Logo size={72} full />
          </div>

          <div style={{ marginBottom: 40 }}>
            <h2 style={{
              margin: "0 0 8px",
              fontSize: isMobile ? 32 : 36,
              fontWeight: 900,
              color: C.navy,
              fontFamily: "'Inter',system-ui,sans-serif",
              letterSpacing: "-0.03em",
            }}>
              {isLogin ? "Connexion" : "Inscription"}
            </h2>
            <p style={{ margin: 0, color: C.gray500, fontSize: isMobile ? 15 : 16, lineHeight: 1.5 }}>
              {isLogin
                ? "Entrez vos identifiants pour accéder à votre espace."
                : "Créez votre compte patient en quelques clics."}
            </p>
          </div>

          {/* Champs */}
          {fields.map(([lbl, type, val, setter, ph, Ic]) => (
            <div key={lbl} style={{ marginBottom: 14 }}>
              <label style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                color: C.gray500,
                textTransform: "uppercase",
                letterSpacing: 0.7,
                marginBottom: 7,
              }}>
                {lbl}
              </label>
              <div style={{ position: "relative" }}>
                <Ic size={16} color={C.gray400} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type={type}
                  value={val}
                  onChange={(e) => { if (!loading) setter(e.target.value); }}
                  onKeyDown={(e) => { if (!loading && e.key === "Enter") submit(); }}
                  placeholder={ph}
                  disabled={loading}
                  style={inputStyle}
                  onFocus={(e) => { if (!loading) e.target.style.borderColor = C.teal; }}
                  onBlur={(e)  => (e.target.style.borderColor = C.border)}
                />
              </div>
            </div>
          ))}

          {/* Erreur */}
          {err && (
            <div style={{
              background: C.redLt, color: C.red,
              borderRadius: 9, padding: "11px 13px",
              fontSize: 13, fontWeight: 600,
              marginBottom: 14, display: "flex", gap: 7, alignItems: "center",
            }}>
              <AlertTriangle size={14} />
              {err}
            </div>
          )}

          {/* Succès */}
          {success && (
            <div style={{
              background: C.tealLt, color: C.tealDk,
              borderRadius: 9, padding: "11px 13px",
              fontSize: 13, fontWeight: 600, marginBottom: 14,
            }}>
              {success}
            </div>
          )}

          {/* Bouton submit */}
          <button
            onClick={submit}
            disabled={loading}
            style={{
              width: "100%",
              padding: isMobile ? "16px" : "14px",
              borderRadius: 12,
              background: loading ? C.gray400 : C.gradBtn,
              color: "#fff",
              fontWeight: 800,
              fontSize: 16,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "opacity 0.2s",
            }}
          >
            {loading
              ? (isLogin ? "Connexion..." : "Inscription...")
              : (<><span>{isLogin ? "Se connecter" : "S'inscrire"}</span><ArrowRight size={17} /></>)
            }
          </button>

          {/* Toggle login / register */}
          <div style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: C.gray500 }}>
            {isLogin ? "Nouveau patient ?" : "Vous avez déjà un compte ?"}
            <button
              onClick={() => {
                if (!loading) {
                  setIsLogin(!isLogin);
                  setErr(""); setSuccess("");
                  setNom(""); setPrenom("");
                  setTelephone(""); setConfirmPass("");
                }
              }}
              disabled={loading}
              style={{
                background: "none", border: "none",
                color: C.tealDk, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                marginLeft: 8, fontFamily: "inherit",
                opacity: loading ? 0.5 : 1,
              }}
            >
              {isLogin ? "Créer un compte" : "Se connecter"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};