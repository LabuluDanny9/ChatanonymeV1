/**
 * Notification Context — Temps réel + persistance légère (localStorage)
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'chatanonyme_notifications_v1';

const NotificationContext = createContext(null);

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, 50);
  } catch {
    return [];
  }
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => loadStored());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, 50)));
    } catch {
      /* quota */
    }
  }, [notifications]);

  const addNotification = useCallback((notif) => {
    const item = { id: Date.now() + Math.random(), ...notif, read: false, createdAt: new Date().toISOString() };
    setNotifications((prev) => [item, ...prev].slice(0, 50));
    return item;
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllRead,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    return {
      notifications: [],
      addNotification: () => {},
      markAsRead: () => {},
      markAllRead: () => {},
      unreadCount: 0,
    };
  }
  return ctx;
}
