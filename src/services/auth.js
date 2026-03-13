import api from './api';

// Authentication services
export const authService = {
  // Login user
  login: async (email, password, role) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        role,
      });
      
      const { user, token, refreshToken } = response.data;
      
      // Store tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, message };
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Get current user from storage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      // Decode JWT to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await api.post('/auth/refresh', { refreshToken });
      const { token } = response.data;
      localStorage.setItem('token', token);
      return token;
    } catch (error) {
      throw error;
    }
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Request failed';
      return { success: false, message };
    }
  },

  // Reset password
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
