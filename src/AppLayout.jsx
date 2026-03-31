import { useState } from "react";
import { LogOut, ShieldCheck } from "lucide-react";
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
import { AdminUsers } from "./pages/admin/AdminUsers.jsx";
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
      if (page === "users") return <AdminUsers />;
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
            {/* Navigation desktop — icônes uniquement avec tooltip */}
            {!isMobile && (
              <nav style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                {navItems.map((item) => {
                  const active = page === item.id;
                  const hasUnread = item.id === "rdv" && unreadPatient > 0;
                  const Icon = item.Icon;
                  return (
                    <div key={item.id} style={{ position: "relative" }}
                      onMouseEnter={(e) => {
                        const tip = e.currentTarget.querySelector('.nav-tooltip');
                        if (tip) tip.style.opacity = "1";
                      }}
                      onMouseLeave={(e) => {
                        const tip = e.currentTarget.querySelector('.nav-tooltip');
                        if (tip) tip.style.opacity = "0";
                      }}>
                      <button onClick={() => setPage(item.id)}
                        title={item.label}
                        style={{
                          position: "relative",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          width: 40, height: 40, borderRadius: 10, border: "none", marginRight: "5px",
                          background: active ? C.tealLt : "transparent",
                          color: active ? C.tealDk : C.gray500,
                          cursor: "pointer", fontFamily: "inherit",
                          transition: "all 0.15s",
                        }}>
                        <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                        {hasUnread && (
                          <span style={{
                            position: "absolute", top: 6, right: 6,
                            width: 7, height: 7, borderRadius: "50%",
                            background: C.red,
                          }} />
                        )}
                      </button>
                      {/* Tooltip */}
                      <div className="nav-tooltip" style={{
                        position: "absolute", top: "calc(100% + 8px)", left: "50%",
                        transform: "translateX(-50%)",
                        background: C.navy, color: "#fff",
                        fontSize: 11, fontWeight: 600, padding: "4px 10px",
                        borderRadius: 6, whiteSpace: "nowrap",
                        opacity: 0, transition: "opacity 0.15s",
                        pointerEvents: "none", zIndex: 300,
                      }}>
                        {item.label}
                      </div>
                    </div>
                  );
                })}
              </nav>
            )}

            {/* Avatar + déconnexion */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                onClick={() => setPage("profil")}
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: user.role === "admin"
                    ? `linear-gradient(135deg, ${C.navy}, ${C.tealDk})`
                    : C.grad,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 800, fontSize: 12,
                  cursor: "pointer", marginRight: isMobile ? "10px" : 0,
                }}>
                {user.role === "admin"
                  ? <ShieldCheck size={17} strokeWidth={1.8} />
                  : <>{user.prenom[0]}{user.nom[0]}</>
                }
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