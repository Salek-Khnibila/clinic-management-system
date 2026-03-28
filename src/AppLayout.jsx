import { useState } from "react";
import { LogOut } from "lucide-react";
import { C } from "./constants/designTokens.js";
import { NAV } from "./constants/nav.js";
import { useAuth } from "./contexts/AuthContext.jsx";
import { useApp } from "./contexts/AppContext.jsx";
import { useMobile } from "./hooks/useMobile.js";
import { Logo } from "./components/ui/Logo.jsx";
import { LoadingSpinner } from "./components/ui/LoadingSpinner.jsx";
import { PatientAccueil } from "./pages/patient/PatientAccueil.jsx";
import { PatientRdvPage } from "./pages/patient/PatientRdvPage.jsx";
import { MedecinAccueil } from "./pages/medecin/MedecinAccueil.jsx";
import { MedecinPlanning } from "./pages/medecin/MedecinPlanning.jsx";
import { SecretaireDashboard } from "./pages/secretaire/SecretaireDashboard.jsx";
import { SecretairePlanning } from "./pages/secretaire/SecretairePlanning.jsx";
import { SecretaireMessagerie } from "./pages/secretaire/SecretaireMessagerie.jsx";
import { SecretaireMedecins } from "./pages/secretaire/SecretaireMedecins.jsx";
import { AdminDashboard } from "./pages/admin/AdminDashboard.jsx";
import { ProfilPage } from "./pages/ProfilPage.jsx";

export const AppLayout = ({ onLogout }) => {
  const { user, loading: authLoading } = useAuth();
  const { messages, loading: appLoading } = useApp();
  const isMobile = useMobile();
  const [page, setPage] = useState("home");

  if (authLoading || appLoading) {
    return (
      <div style={{
        minHeight: "100vh", background: C.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter',system-ui,sans-serif",
      }}>
        <LoadingSpinner size={60} text="Initialisation de l'application..." />
      </div>
    );
  }

  const navItems = NAV[user.role] || [];
  const unreadPatient = messages.filter(
    (m) => !m.lu && m.to_patient_id === user.id
  ).length;

  const renderPage = () => {
    if (page === "profil") return <ProfilPage onLogout={onLogout} />;

    // ── Admin ─────────────────────────────────────────────────────────────────
    if (user.role === "admin") {
      return <AdminDashboard />;
    }

    // ── Patient ───────────────────────────────────────────────────────────────
    if (user.role === "patient") {
      if (page === "rdv") return <PatientRdvPage user={user} />;
      return <PatientAccueil user={user} />;
    }

    // ── Médecin ───────────────────────────────────────────────────────────────
    if (user.role === "medecin") {
      if (page === "planning") return <MedecinPlanning user={user} />;
      return <MedecinAccueil user={user} />;
    }

    // ── Secrétaire ────────────────────────────────────────────────────────────
    if (user.role === "secretaire") {
      if (page === "planning")   return <SecretairePlanning />;
      if (page === "messagerie") return <SecretaireMessagerie />;
      if (page === "medecins")   return <SecretaireMedecins />;
      return <SecretaireDashboard onNavigate={setPage} />;
    }

    return null;
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      fontFamily: "'Segoe UI',system-ui,sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <header style={{
        background: C.white, borderBottom: `1px solid ${C.border}`,
        position: "sticky", top: 0, zIndex: 200,
        boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: isMobile ? "0 16px" : "0 24px",
          height: 64, display: "flex",
          alignItems: "center", justifyContent: "space-between", gap: isMobile ? 12 : 20,
        }}>
          <Logo size={32} full={true} />

          <div style={{ display: "flex", alignItems: "center" }}>
            {/* Navigation desktop */}
            {!isMobile && (
              <nav style={{ display: "flex", gap: "10px", alignItems: "center", minWidth: 0, overflow: "hidden" }}>
                {navItems.map((item) => {
                  const active = page === item.id;
                  const hasUnread = item.id === "rdv" && unreadPatient > 0;
                  const Icon = item.Icon;
                  return (
                    <button key={item.id} onClick={() => setPage(item.id)}
                      style={{
                        position: "relative", display: "flex", alignItems: "center", gap: 7,
                        padding: "8px 15px", borderRadius: 8, border: "none",
                        background: active ? C.tealLt : "transparent",
                        color: active ? C.tealDk : C.gray500,
                        fontWeight: active ? 700 : 500, fontSize: 14,
                        cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                        whiteSpace: "nowrap",
                      }}>
                      <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
                      {item.label}
                      {hasUnread && (
                        <span style={{
                          position: "absolute", top: 4, right: 4,
                          width: 8, height: 8, borderRadius: "50%",
                          background: C.red, transform: "translate(50%, -50%)",
                        }} />
                      )}
                    </button>
                  );
                })}
              </nav>
            )}

            {/* Avatar + déconnexion */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                onClick={() => setPage("profil")}
                style={{
                  width: 36, height: 36, borderRadius: "50%", background: C.grad,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 800, fontSize: 12,
                  cursor: "pointer", marginRight: isMobile ? "10px" : 0,
                }}>
                {user.prenom[0]}{user.nom[0]}
              </div>
              {!isMobile && (
                <button onClick={onLogout}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 9px", borderRadius: 8,
                    border: `1px solid ${C.border}`, background: C.white,
                    color: C.gray500, fontSize: 13, fontWeight: 600,
                    cursor: "pointer", fontFamily: "inherit", minWidth: 100,
                  }}>
                  <LogOut size={13} />
                  Déconnexion
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main style={{
        flex: 1, maxWidth: 1200, margin: "0 auto", width: "100%",
        padding: isMobile ? "14px 12px 82px" : "26px 24px",
        boxSizing: "border-box",
      }}>
        {renderPage()}
      </main>

      {/* Navigation mobile */}
      {isMobile && (
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: C.white, borderTop: `1px solid ${C.border}`,
          display: "flex", zIndex: 200,
          boxShadow: "0 -2px 12px rgba(0,0,0,0.07)",
        }}>
          {navItems.map((item) => {
            const active = page === item.id;
            const hasUnread = item.id === "rdv" && unreadPatient > 0;
            const Icon = item.Icon;
            return (
              <button key={item.id} onClick={() => setPage(item.id)}
                style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 3, padding: "9px 0 11px",
                  border: "none", background: "transparent",
                  cursor: "pointer", fontFamily: "inherit", position: "relative",
                }}>
                <div style={{
                  width: 32, height: 28, borderRadius: 8,
                  background: active ? C.tealLt : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                }}>
                  <Icon size={18} color={active ? C.tealDk : C.gray400} strokeWidth={active ? 2.2 : 1.8} />
                </div>
                <span style={{ fontSize: 9, fontWeight: active ? 800 : 500, color: active ? C.tealDk : C.gray400 }}>
                  {item.label}
                </span>
                {hasUnread && (
                  <span style={{
                    position: "absolute", top: 7, right: "25%",
                    width: 8, height: 8, borderRadius: "50%", background: C.red,
                  }} />
                )}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};