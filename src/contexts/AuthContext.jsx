import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/auth.js";

const AuthCtx = createContext(null);

export const useAuth = () => useContext(AuthCtx);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
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

  const login = async (email, password, role) => {
    setLoading(true);
    try {
      const result = await authService.login(email, password, role);
      if (result.success) {
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
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

  const register = async (userData) => {
    setLoading(true);
    try {
      const result = await authService.register(userData);
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      return { success: false, message: "Registration failed. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCtx.Provider value={{ user, login, logout, register, loading, isAuthenticated: !!user }}>
      {children}
    </AuthCtx.Provider>
  );
};

