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
    if (supabase && !identifier.includes('@')) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${identifier}${SUPABASE_EMAIL_DOMAIN}`,
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
  }, []);

  const registerUser = useCallback(async (pseudo, password, phone, email, photo) => {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: `${pseudo.trim()}${SUPABASE_EMAIL_DOMAIN}`,
        password,
        options: { data: { pseudo: pseudo.trim(), email: email?.trim() || null, photo: photo || null } },
      });
      if (error) throw error;
      if (!data.session) {
        throw new Error('Vérifiez votre email pour confirmer l\'inscription. Ou désactivez "Confirm email" dans Supabase Auth.');
      }
      const token = data.session.access_token;
      const userData = userFromSupabaseSession(data.session);
      userTokenRef.current = token;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem(STORAGE_USER, JSON.stringify({ token, user: userData }));
      setUser(userData);
      setAdmin(null);
      return { token, user: userData };
    }
    const { data } = await api.post('/api/auth/register', { pseudo, password, phone, email, photo });
    userTokenRef.current = data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    localStorage.setItem(STORAGE_USER, JSON.stringify({ token: data.token, user: data.user }));
    setUser(data.user);
    setAdmin(null);
    return data;
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
