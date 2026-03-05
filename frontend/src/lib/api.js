/**
 * Client API - Axios instance avec base URL et intercepteurs
 */

import axios from 'axios';

// En dev sans URL : proxy (package.json). Sinon REACT_APP_API_URL.
const API_URL = process.env.REACT_APP_API_URL || '';

export const getApiBaseUrl = () => api.defaults.baseURL || API_URL || (typeof window !== 'undefined' ? window.location.origin : '');

const api = axios.create({
  baseURL: API_URL || '',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
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
    const msg = err.response?.data?.error || '';
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
