/**
 * Contexte d'authentification ChatAnonyme
 * Gère session utilisateur (pseudo) et session admin.
 * Inscription/connexion user via Supabase Auth (anon key) si configuré, sinon API.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../lib/api';
import { supabase } from '../lib/supabase';

const STORAGE_USER = 'chatanonyme_user';
const STORAGE_ADMIN = 'chatanonyme_admin';
const SUPABASE_EMAIL_DOMAIN = '@users.laparte.app';

/** Convertit le pseudo en partie locale valide pour email (a-z, 0-9, ., _, -) */
function toValidEmailLocalPart(pseudo) {
  const s = String(pseudo || '').trim();
  const normalized = s.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const safe = normalized.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  return safe || 'user';
}

const AuthContext = createContext(null);

function userFromSupabaseSession(session) {
  if (!session?.user) return null;
  const u = session.user;
  const pseudo = u.user_metadata?.pseudo || u.email?.split('@')[0] || 'user';
  const email = u.user_metadata?.email || null;
  return { id: u.id, pseudo, phone: null, email, photo: u.user_metadata?.photo || null };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const userTokenRef = useRef(null);
  const location = useLocation();

  const loginUser = useCallback(async (identifier, password) => {
    try {
      const { data } = await api.post('/api/auth/login', { identifier, password });
      if (data.type === 'admin') {
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        localStorage.setItem(STORAGE_ADMIN, JSON.stringify({ token: data.token, admin: data.admin }));
        setAdmin(data.admin);
        setUser(null);
        return { type: 'admin', admin: data.admin };
      }
      userTokenRef.current = data.token;
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      localStorage.setItem(STORAGE_USER, JSON.stringify({ token: data.token, user: data.user }));
      setUser(data.user);
      setAdmin(null);
      return { type: 'user', user: data.user };
    } catch (apiErr) {
      if (supabase && !identifier.includes('@')) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: `${toValidEmailLocalPart(identifier)}${SUPABASE_EMAIL_DOMAIN}`,
          password,
        });
        if (error) throw error;
        const token = data.session?.access_token;
        const userData = userFromSupabaseSession(data.session);
        userTokenRef.current = token;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem(STORAGE_USER, JSON.stringify({ token, user: userData }));
        setUser(userData);
        setAdmin(null);
        return { type: 'user', user: userData };
      }
      throw apiErr;
    }
  }, []);

  const registerUser = useCallback(async (pseudo, password, phone, email, photo) => {
    const payload = { pseudo, password, phone, email, photo };
    const emailLocal = toValidEmailLocalPart(pseudo);
    const supabaseEmail = `${emailLocal}${SUPABASE_EMAIL_DOMAIN}`;

    const tryApi = async () => api.post('/api/auth/register', payload);
    const trySupabase = async () => {
      const { data, error } = await supabase.auth.signUp({
        email: supabaseEmail,
        password,
        options: { data: { pseudo: pseudo.trim(), email: email?.trim() || null, photo: photo || null } },
      });
      if (error) throw error;
      if (data.session) {
        const token = data.session.access_token;
        const userData = userFromSupabaseSession(data.session);
        return { token, user: userData };
      }
      if (data.user) {
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
          email: supabaseEmail,
          password,
        });
        if (!signInErr && signInData?.session) {
          const token = signInData.session.access_token;
          const userData = userFromSupabaseSession(signInData.session);
          return { token, user: userData };
        }
        throw new Error('Compte créé. Connectez-vous avec votre pseudo et mot de passe.');
      }
      throw new Error('Inscription échouée. Réessayez dans quelques minutes.');
    };

    const applySuccess = (token, userData) => {
      userTokenRef.current = token;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem(STORAGE_USER, JSON.stringify({ token, user: userData }));
      setUser(userData);
      setAdmin(null);
      return { token, user: userData };
    };

    let lastErr = null;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const { data } = await tryApi();
        return applySuccess(data.token, data.user);
      } catch (apiErr) {
        lastErr = apiErr;
        if (attempt === 0 && (apiErr?.response?.status >= 500 || apiErr?.code === 'ECONNABORTED' || apiErr?.message?.includes('timeout'))) {
          await new Promise((r) => setTimeout(r, 800));
          continue;
        }
        break;
      }
    }

    if (supabase) {
      try {
        const result = await trySupabase();
        return applySuccess(result.token, result.user);
      } catch (supaErr) {
        const msg = supaErr?.message || '';
        if (msg.includes('already registered') || msg.includes('User already registered') || msg.includes('already exists')) {
          throw new Error('Ce pseudo est déjà utilisé.');
        }
        if (msg.includes('rate limit') || msg.includes('too many')) {
          throw new Error('Trop de tentatives. Réessayez dans quelques minutes.');
        }
        if (msg.includes('Compte créé')) throw supaErr;
        throw new Error(msg || lastErr?.response?.data?.error || lastErr?.message || 'Inscription impossible. Réessayez plus tard.');
      }
    }
    throw lastErr;
  }, []);

  const loginAdmin = useCallback(async (email, password) => {
    const { data } = await api.post('/api/auth/admin/login', { email, password });
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    localStorage.setItem(STORAGE_ADMIN, JSON.stringify({ token: data.token, admin: data.admin }));
    setAdmin(data.admin);
    setUser(null);
    return data;
  }, []);

  const setAdminSession = useCallback((token, adminData) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem(STORAGE_ADMIN, JSON.stringify({ token, admin: adminData }));
    setAdmin(adminData);
    setUser(null);
  }, []);

  const logout = useCallback(() => {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem(STORAGE_USER);
    localStorage.removeItem(STORAGE_ADMIN);
    setUser(null);
    setAdmin(null);
    userTokenRef.current = null;
  }, []);

  useEffect(() => {
    const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin';
    const adminStored = localStorage.getItem(STORAGE_ADMIN);
    const userStored = localStorage.getItem(STORAGE_USER);
    if (isAdminRoute && adminStored) {
      try {
        const { token } = JSON.parse(adminStored);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch {
        api.defaults.headers.common['Authorization'] = userTokenRef.current ? `Bearer ${userTokenRef.current}` : '';
      }
    } else if (userStored) {
      try {
        const { token } = JSON.parse(userStored);
        userTokenRef.current = token;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch {}
    }
  }, [location.pathname, user, admin]);

  useEffect(() => {
    const init = async () => {
      const adminStored = localStorage.getItem(STORAGE_ADMIN);
      const userStored = localStorage.getItem(STORAGE_USER);
      if (adminStored) {
        try {
          const { token, admin: a } = JSON.parse(adminStored);
          setAdmin(a);
          if (a && token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch {
          localStorage.removeItem(STORAGE_ADMIN);
        }
      }
      if (userStored && !adminStored) {
        try {
          const { token, user: u } = JSON.parse(userStored);
          setUser(u);
          userTokenRef.current = token;
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch {
          localStorage.removeItem(STORAGE_USER);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const updateAdminPhoto = useCallback((photo) => {
    setAdmin((prev) => (prev ? { ...prev, photo } : null));
    const stored = localStorage.getItem(STORAGE_ADMIN);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        localStorage.setItem(STORAGE_ADMIN, JSON.stringify({ ...parsed, admin: { ...parsed.admin, photo } }));
      } catch {}
    }
  }, []);

  const value = {
    user,
    admin,
    loading,
    loginUser,
    registerUser,
    loginAdmin,
    setAdminSession,
    logout,
    updateAdminPhoto,
    isAdmin: !!admin,
    isLoggedIn: !!user || !!admin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
