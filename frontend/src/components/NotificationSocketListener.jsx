/**
 * Écoute les événements socket pour les notifications temps réel
 */

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import api from '../lib/api';
import { decodeHtmlEntities } from '../lib/textUtils';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useToast } from '../context/ToastContext';

import { SOCKET_API_URL, getSocketOptions, WS_ENABLED } from '../lib/socketConfig';

export default function NotificationSocketListener() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const toast = useToast();

  useEffect(() => {
    if (!user || !WS_ENABLED) return;
    const token = api.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    if (!token) return;

    const socket = io(SOCKET_API_URL, getSocketOptions(token));

    socket.on('message:new', (payload) => {
      if (payload.message?.sender_type === 'admin') {
        addNotification({
          type: 'message',
          title: 'Nouveau message',
          body: decodeHtmlEntities(payload.message.content || '').slice(0, 80) + (payload.message.content?.length > 80 ? '...' : ''),
        });
        toast.info('Nouveau message de l\'administrateur');
      }
    });

    socket.on('broadcast:new', (b) => {
      addNotification({ type: 'topic', title: 'Nouveau sujet', body: decodeHtmlEntities(b.title || 'Un nouveau sujet a été publié') });
      toast.info('Nouveau sujet publié');
    });

    return () => socket.disconnect();
  }, [user, addNotification, toast]);

  return null;
}
