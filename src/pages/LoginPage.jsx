import { useState } from "react";
import { AlertTriangle, ArrowRight, CheckCircle, Shield, User } from "lucide-react";
import { C } from "../constants/designTokens.js";
import { ROLES } from "../constants/status.js";
import { Logo } from "../components/ui/Logo.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

export const LoginPage = () => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [role, setRole] = useState("patient");
  const [err, setErr] = useState("");


  const submit = async () => {
    if (!email || !pass) {
      setErr("Veuillez remplir tous les champs.");
      return;
    }

    setErr("");

    try {
      const result = await login(email, pass, role);
      if (result.success) {
        // Login successful, onLogin will be called by AuthProvider
      } else {
        setErr(result.message || "Identifiants incorrects.");
      }
    } catch (error) {
      setErr("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "'Segoe UI',system-ui,sans-serif",
      }}
    >
      <div
        style={{
          flex: 1,
          background: C.grad,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 48,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            color: "#fff",
            maxWidth: 380,
          }}
        >
          <Logo size={72} />
          <div
            style={{
              marginTop: 18,
              fontSize: 12,
              letterSpacing: 3,
              textTransform: "uppercase",
              opacity: 0.7,
              fontWeight: 600,
            }}
          >
            SIMPLIFIER · OPTIMISER · AMÉLIORER
          </div>
          <div style={{ marginTop: 40 }}>
            {[
              [
                "Prise de RDV en ligne",
                "Réservez en quelques clics",
              ],
              [
                "Synchronisation en temps réel",
                "Patient, Médecin et Secrétaire liés",
              ],
              [
                "Messagerie intégrée",
                "Secrétaire contacte les patients directement",
              ],
            ].map(([t, s]) => (
              <div
                key={t}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  marginBottom: 18,
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: "rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <CheckCircle size={17} color="#fff" />
                </div>
                <div>
                  <div
                    style={{ fontWeight: 700, fontSize: 14 }}
                  >
                    {t}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      opacity: 0.7,
                      marginTop: 2,
                    }}
                  >
                    {s}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          width: 460,
          background: C.white,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "44px 40px",
          overflowY: "auto",
        }}
      >
        <div style={{ marginBottom: 28 }}>
          <Logo size={34} full />
        </div>
        <h2
          style={{
            margin: "0 0 5px",
            fontSize: 24,
            fontWeight: 900,
            color: C.navy,
            fontFamily: "Georgia,serif",
          }}
        >
          Connexion
        </h2>
        <p
          style={{
            margin: "0 0 26px",
            color: C.gray500,
            fontSize: 14,
          }}
        >
          Accédez à votre espace personnel
        </p>


        {[
          ["Email", "email", email, setEmail, "votre@email.ma", User],
          ["Mot de passe", "password", pass, setPass, "••••••••", Shield],
        ].map(([lbl, type, val, setter, ph, Ic]) => (
          <div key={lbl} style={{ marginBottom: 14 }}>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                color: C.gray500,
                textTransform: "uppercase",
                letterSpacing: 0.7,
                marginBottom: 7,
              }}
            >
              {lbl}
            </label>
            <div style={{ position: "relative" }}>
              <Ic
                size={15}
                color={C.gray400}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                type={type}
                value={val}
                onChange={(e) => setter(e.target.value)}
                placeholder={ph}
                style={{
                  width: "100%",
                  paddingLeft: 36,
                  paddingRight: 13,
                  paddingTop: 11,
                  paddingBottom: 11,
                  borderRadius: 9,
                  border: `1.5px solid ${C.border}`,
                  fontSize: 14,
                  color: C.navy,
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  transition: "border 0.2s",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = C.teal)
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = C.border)
                }
              />
            </div>
          </div>
        ))}

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 700,
              color: C.gray500,
              textTransform: "uppercase",
              letterSpacing: 0.7,
              marginBottom: 7,
            }}
          >
            Rôle
          </label>
          <div style={{ display: "flex", gap: 7 }}>
            {["patient", "medecin", "secretaire"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  flex: 1,
                  padding: "10px 5px",
                  borderRadius: 9,
                  border: `1.5px solid ${
                    role === r ? C.tealDk : C.border
                  }`,
                  background:
                    role === r ? C.tealLt : C.white,
                  color:
                    role === r ? C.tealDk : C.gray500,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
              >
                {ROLES[r].label}
              </button>
            ))}
          </div>
        </div>

        {err && (
          <div
            style={{
              background: C.redLt,
              color: C.red,
              borderRadius: 9,
              padding: "11px 13px",
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 14,
              display: "flex",
              gap: 7,
              alignItems: "center",
            }}
          >
            <AlertTriangle size={14} />
            {err}
          </div>
        )}

        <button
          onClick={submit}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: 10,
            background: C.gradBtn,
            color: "#fff",
            fontWeight: 800,
            fontSize: 15,
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.88";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {loading ? (
            "Connexion..."
          ) : (
            <>
              <span>Se connecter</span>
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

