/**
 * Client API - Axios instance avec base URL et intercepteurs
 */

import axios from 'axios';

// En dev sans URL : proxy (package.json). Sinon REACT_APP_API_URL.
const API_URL = process.env.REACT_APP_API_URL || '';

export const getApiBaseUrl = () => api.defaults.baseURL || API_URL || (typeof window !== 'undefined' ? window.location.origin : '');

/** Extrait un message d'erreur lisible (évite d'afficher un objet - React error #31) */
function toErrorString(val, fallback) {
  if (val == null) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && typeof val.message === 'string') return val.message;
  return fallback;
}

export const getErrorMessage = (err, fallback = 'Une erreur est survenue') => {
  const status = err?.response?.status;
  if (status === 404) {
    return 'Service indisponible. Réessayez plus tard ou contactez l\'administrateur.';
  }
  if (status === 503) {
    return toErrorString(err?.response?.data?.error, 'Service temporairement indisponible. Réessayez plus tard.');
  }
  if (status >= 500) {
    return toErrorString(err?.response?.data?.error, 'Erreur serveur. Réessayez plus tard.');
  }
  const data = err?.response?.data;
  if (typeof data === 'string') return data;
  const msg = data?.error ?? data?.message;
  if (typeof msg === 'string') return msg;
  if (msg && typeof msg === 'object' && msg.message) return msg.message;
  if (typeof err?.message === 'string') return err.message;
  return fallback;
};

const api = axios.create({
  baseURL: API_URL || '',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Intercepteur : s'assurer que le token est toujours envoyé pour les routes protégées
api.interceptors.request.use((config) => {
  const url = (config.baseURL || '') + (config.url || '');
  const isApiCall = url.includes('/api/');
  const needsAuth = isApiCall && (
    url.includes('/api/admin') ||
    url.includes('/reply-private') ||
    url.includes('/api/messages') ||
    url.includes('/api/users') ||
    url.includes('/comments') // delete, like, create comment
  );
  if (needsAuth && !config.headers.Authorization) {
    try {
      const adminStored = localStorage.getItem('chatanonyme_admin');
      const userStored = localStorage.getItem('chatanonyme_user');
      let token = null;
      if (url.includes('/api/admin')) {
        if (adminStored) {
          const parsed = JSON.parse(adminStored);
          token = parsed?.token;
        }
      } else {
        if (userStored) {
          const parsed = JSON.parse(userStored);
          token = parsed?.token;
        }
        if (!token && adminStored) {
          const parsed = JSON.parse(adminStored);
          token = parsed?.token;
        }
      }
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {}
  }
  return config;
});

// Token anonyme (stocké en mémoire ou localStorage)
api.setAnonymousToken = (token) => {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
};

api.setAdminToken = (token) => {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
};

// Intercepteur : token expiré ou invalide → déconnexion et redirection
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const msg = typeof err.response?.data?.error === 'string' ? err.response.data.error : '';
    const isSessionError = msg === 'Token invalide ou expiré' || msg === 'Session expirée';
    const hadAuth = err.config?.headers?.Authorization;
    if (status === 401 && isSessionError && hadAuth) {
      localStorage.removeItem('chatanonyme_user');
      localStorage.removeItem('chatanonyme_admin');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/connexion';
    }
    return Promise.reject(err);
  }
);

export default api;
