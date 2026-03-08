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

/** Garantit une chaîne pour l'affichage (évite React #31) */
export const toErrorDisplay = (val) => {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && typeof val.message === 'string') return val.message;
  return String(val);
};

const api = axios.create({
  baseURL: API_URL || '',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Intercepteur : TOUJOURS ajouter le token pour les routes protégées (priorité localStorage)
api.interceptors.request.use((config) => {
  const url = String((config.baseURL || '') + (config.url || ''));
  const isApiCall = url.includes('/api/');
  const isPublic = url.includes('/api/auth/') || url.includes('/api/config') || url.includes('/api/debug-setup') || url.includes('/api/health-db');
  if (!isApiCall || isPublic) return config;

  try {
    let token = (config.headers?.Authorization || api.defaults.headers?.common?.Authorization || '')
      .replace(/^Bearer\s+/i, '');
    if (!token) {
      const adminStored = localStorage.getItem('chatanonyme_admin');
      const userStored = localStorage.getItem('chatanonyme_user');
      if (url.includes('/api/admin')) {
        const p = adminStored ? JSON.parse(adminStored) : null;
        token = p?.token || '';
      } else {
        const pUser = userStored ? JSON.parse(userStored) : null;
        const pAdmin = adminStored ? JSON.parse(adminStored) : null;
        token = pUser?.token || pAdmin?.token || '';
      }
    }
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
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

// Intercepteur 401 : NE PAS rediriger automatiquement (évite déconnexion intempestive)
// Les erreurs sont propagées aux composants qui affichent le message
// L'utilisateur peut se déconnecter manuellement via le menu
api.resetAuthGracePeriod = () => {};
api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

export default api;
