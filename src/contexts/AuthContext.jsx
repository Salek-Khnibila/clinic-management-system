import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/auth.js";

const AuthCtx = createContext(null);

export const useAuth = () => useContext(AuthCtx);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifie l'authentification au premier montage
  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // 🔒 Login sans rôle — le serveur détecte automatiquement le rôle
  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      if (result.success) {
        setUser(result.user);
        return { success: true };
      }
      return { success: false, message: result.message };
    } catch (error) {
      return { success: false, message: "Login failed. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Inscription patient uniquement
  const register = async (userData) => {
    setLoading(true);
    try {
      const result = await authService.register(userData);
      if (result.success) {
        return { success: true, data: result.data };
      }
      return { success: false, message: result.message };
    } catch (error) {
      return { success: false, message: "Registration failed. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  // 🔒 Création de compte protégée (admin/secrétaire)
  const createUser = async (userData) => {
    setLoading(true);
    try {
      const result = await authService.createUser(userData);
      if (result.success) {
        return { success: true, data: result.data };
      }
      return { success: false, message: result.message };
    } catch (error) {
      return { success: false, message: "Creation failed. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCtx.Provider value={{
      user,
      login,
      logout,
      register,
      createUser,
      loading,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthCtx.Provider>
  );
};