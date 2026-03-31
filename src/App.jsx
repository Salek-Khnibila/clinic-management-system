import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import { AppProvider } from "./contexts/AppContext.jsx";
import { AppLayout } from "./AppLayout.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";

import { ToastProvider } from "./components/ui/Base.jsx";

const AppInner = () => {
  const { user, logout } = useAuth();
  if (!user) {
    return <LoginPage />;
  }
  return <AppLayout onLogout={logout} />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ToastProvider>
          <AppInner />
        </ToastProvider>
      </AppProvider>
    </AuthProvider>
  );
}

