import axios from 'axios';

// With the Vite proxy configured, VITE_API_URL should be '/api'
// This routes all API calls through Vite → Flask without CORS issues
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT access token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// On 401 — try refresh token once, then logout
let isRefreshing = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken && !isRefreshing) {
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Send the refresh token in the Authorization header as a Bearer token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` },
          });

          const { token } = response.data;
          localStorage.setItem('token', token);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api.request(originalRequest);
        } catch {
          // Refresh failed — log the user out
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        } finally {
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
