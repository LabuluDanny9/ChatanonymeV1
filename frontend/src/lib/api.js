/**
 * Client API - Axios instance avec base URL et intercepteurs
 */

import axios from 'axios';
import { supabase } from './supabase';

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
  const data = err?.response?.data;
  const msg = typeof data?.error === 'string' ? data.error : data?.message;

  if (status === 401) {
    if (msg === 'Utilisateur introuvable' || msg === 'Administrateur introuvable') {
      return 'Compte non synchronisé. Déconnectez-vous et reconnectez-vous. Si le problème persiste, exécutez migration-supabase-auth-trigger.sql dans Supabase.';
    }
    if (!msg || /token|session|expiré|reconnecter/i.test(msg)) {
      return 'Session expirée. Veuillez vous reconnecter.';
    }
    return msg;
  }
  if (status === 404) {
    return 'Service indisponible. Réessayez plus tard ou contactez l\'administrateur.';
  }
  if (status === 503) {
    return toErrorString(msg, 'Service temporairement indisponible. Réessayez plus tard.');
  }
  if (status >= 500) {
    return toErrorString(msg, 'Erreur serveur. Réessayez plus tard.');
  }
  if (typeof data === 'string') return data;
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
  timeout: 30000,
});

/** Force la synchronisation du token depuis localStorage (avant envoi critique)
 * @param {string} [type] - 'admin' pour routes admin, 'user' pour user, sinon auto
 */
export const ensureAuthToken = (type) => {
  try {
    const userStored = localStorage.getItem('chatanonyme_user');
    const adminStored = localStorage.getItem('chatanonyme_admin');
    let token = null;
    if (type === 'admin' && adminStored) {
      token = JSON.parse(adminStored)?.token;
    } else if (type === 'user' && userStored) {
      token = JSON.parse(userStored)?.token;
    } else {
      const p = adminStored ? JSON.parse(adminStored) : (userStored ? JSON.parse(userStored) : null);
      token = p?.token;
    }
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  } catch {}
};

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

// Intercepteur 401 : tente de rafraîchir le token Supabase (user) avant de propager l'erreur
api.resetAuthGracePeriod = () => {};
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err?.response?.status;
    const config = err?.config;
    const isRetry = config?.__retried401;
    if (status !== 401 || isRetry || !config) return Promise.reject(err);

    // Uniquement pour session user (Supabase) — admin utilise JWT API (7j)
    const userStored = localStorage.getItem('chatanonyme_user');
    if (!userStored || !supabase) return Promise.reject(err);

    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error || !data?.session?.access_token) return Promise.reject(err);
      const token = data.session.access_token;
      const parsed = JSON.parse(userStored);
      const userData = parsed?.user || {
        id: data.session.user?.id,
        pseudo: data.session.user?.user_metadata?.pseudo || data.session.user?.email?.split('@')[0] || 'user',
        photo: data.session.user?.user_metadata?.photo || null,
      };
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('chatanonyme_user', JSON.stringify({ token, user: userData }));
      config.__retried401 = true;
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      return api(config);
    } catch {
      return Promise.reject(err);
    }
  }
);

export default api;
