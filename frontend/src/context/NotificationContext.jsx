/**
 * Notification Context — Temps réel
 * Nouveau message admin, nouveau sujet, réponse admin
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import api from '../lib/api';

const API_URL = process.env.REACT_APP_API_URL || '';
const WS_PATH = process.env.REACT_APP_WS_PATH || '/ws';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

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
