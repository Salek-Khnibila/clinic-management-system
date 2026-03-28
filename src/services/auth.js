import api from './api';

// Authentication services
export const authService = {

  // 🔒 Login — envoie seulement email + password, le rôle est détecté par le serveur
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token, refreshToken } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  },

  // Inscription publique — patients uniquement
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, message };
    }
  },

  // 🔒 Création de compte protégée (admin → secrétaire/médecin | secrétaire → médecin)
  createUser: async (userData) => {
    try {
      const response = await api.post('/auth/create-user', userData);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Creation failed';
      return { success: false, message };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Récupère l'utilisateur depuis le localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Vérifie si le token est valide et non expiré
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  },

  // Rafraîchit le token d'accès
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post('/auth/refresh', { refreshToken });
    const { token } = response.data;
    localStorage.setItem('token', token);
    return token;
  },

  // Demande de réinitialisation de mot de passe
  requestPasswordReset: async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Request failed';
      return { success: false, message };
    }
  },

  // Réinitialisation du mot de passe
  resetPassword: async (token, newPassword) => {
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Reset failed';
      return { success: false, message };
    }
  },
};