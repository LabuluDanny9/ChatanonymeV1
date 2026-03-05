/**
 * Écoute les événements socket pour les notifications temps réel
 */

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useToast } from '../context/ToastContext';

const API_URL = process.env.REACT_APP_API_URL || '';
const WS_PATH = process.env.REACT_APP_WS_PATH || '/ws';

export default function NotificationSocketListener() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const toast = useToast();

  useEffect(() => {
    if (!user) return;
    const token = api.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    if (!token) return;

    const socket = io(API_URL, { path: WS_PATH, auth: { token } });

    socket.on('message:new', (payload) => {
      if (payload.message?.sender_type === 'admin') {
        addNotification({
          type: 'message',
          title: 'Nouveau message',
          body: (payload.message.content || '').slice(0, 80) + (payload.message.content?.length > 80 ? '...' : ''),
        });
        toast.info('Nouveau message de l\'administrateur');
      }
    });

    socket.on('broadcast:new', (b) => {
      addNotification({ type: 'topic', title: 'Nouveau sujet', body: b.title || 'Un nouveau sujet a été publié' });
      toast.info('Nouveau sujet publié');
    });

    return () => socket.disconnect();
  }, [user, addNotification, toast]);

  return null;
}
