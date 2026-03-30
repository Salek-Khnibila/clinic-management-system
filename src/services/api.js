/**
 * api.js — Axios base instance (hardened)
 *
 * Security changes vs original:
 *  - withCredentials: true → cookies (httpOnly, Secure, SameSite) are sent automatically
 *  - Authorization header still used as fallback (localStorage token) for compatibility
 *    until the backend is updated to set httpOnly cookies on login
 *  - Sensitive tokens are never logged
 *  - isRefreshing guard prevents concurrent refresh races
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,          // 🔒 Send cookies on every request (httpOnly support)
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach JWT from localStorage ─────────────────────────
// When the backend is updated to set httpOnly cookies, remove this interceptor.
// Cookies will be sent automatically via withCredentials.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: transparent token refresh on 401 ───────────────────
let isRefreshing = false;
let failedQueue  = [];          // queue requests that arrived during a refresh

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const _logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  // 🔒 Use replace so the login page is not in browser history
  window.location.replace('/login');
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401, once, when we have a refresh token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        _logout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue the request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api.request(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${refreshToken}` },
          },
        );

        const { token } = response.data;
        localStorage.setItem('token', token);

        processQueue(null, token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api.request(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        _logout();
        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;