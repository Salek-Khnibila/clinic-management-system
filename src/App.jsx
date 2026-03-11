import React from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import { AppProvider } from "./contexts/AppContext.jsx";
import { AppLayout } from "./AppLayout.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";

const AppInner = () => {
  const { user, login, logout } = useAuth();
  if (!user) {
    return <LoginPage onLogin={login} />;
  }
  return <AppLayout onLogout={logout} />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppInner />
      </AppProvider>
    </AuthProvider>
  );
}

