/**
 * Écoute Socket.IO — notifications temps réel (messages, forum, annonces)
 */

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import api from '../lib/api';
import { decodeHtmlEntities } from '../lib/textUtils';
import { getMessagePreview } from '../lib/messagePreview';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useToast } from '../context/ToastContext';

import { SOCKET_API_URL, getSocketOptions, WS_ENABLED } from '../lib/socketConfig';

function sameUser(a, b) {
  if (a == null || b == null) return false;
  return String(a) === String(b);
}

export default function NotificationSocketListener() {
  const { user, admin } = useAuth();
  const { addNotification } = useNotifications();
  const toast = useToast();

  useEffect(() => {
    if (!WS_ENABLED) return;
    if (!user && !admin) return;
    const token = api.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    if (!token) return;

    const meId = user?.id ?? admin?.id;

    const socket = io(SOCKET_API_URL, getSocketOptions(token));

    const onMessageNew = (payload) => {
      const msg = payload?.message;
      if (!msg) return;
      if (user && msg.sender_type === 'admin') {
        const body = getMessagePreview(msg);
        addNotification({
          type: 'message',
          title: 'Nouveau message',
          body: body || 'Message de l’administrateur',
          linkTo: '/dashboard/chat',
        });
        toast.info('Nouveau message de l’administrateur');
      }
    };

    const onBroadcastNew = (b) => {
      const text = decodeHtmlEntities(b?.content || b?.title || '').trim();
      const preview = text.slice(0, 120) + (text.length > 120 ? '…' : '');
      addNotification({
        type: 'broadcast',
        title: 'Annonce',
        body: preview || 'Nouvelle annonce',
        linkTo: '/dashboard',
      });
      toast.info('Nouvelle annonce');
    };

    const onForumNotification = (payload) => {
      if (!payload || !payload.kind) return;

      if (payload.kind === 'comment') {
        if (sameUser(payload.authorId, meId)) return;
        const title = decodeHtmlEntities(payload.topicTitle || 'Forum');
        const excerpt = decodeHtmlEntities(payload.excerpt || '').slice(0, 140);
        addNotification({
          type: 'forum',
          title: 'Nouveau commentaire',
          body: `${title} — ${excerpt || payload.authorName || ''}`,
          topicId: payload.topicId,
          linkTo: `/topics/${payload.topicId}`,
        });
        toast.info('Nouveau commentaire sur le forum');
        return;
      }

      if (payload.kind === 'topic') {
        if (payload.skipForPublisher && admin) return;
        const title = decodeHtmlEntities(payload.topicTitle || 'Nouveau sujet');
        const excerpt = decodeHtmlEntities(payload.excerpt || '').slice(0, 100);
        addNotification({
          type: 'forum',
          title: 'Nouvelle publication',
          body: excerpt ? `${title} — ${excerpt}` : title,
          topicId: payload.topicId,
          linkTo: `/topics/${payload.topicId}`,
        });
        toast.info('Nouvelle publication sur le forum');
      }
    };

    socket.on('message:new', onMessageNew);
    socket.on('broadcast:new', onBroadcastNew);
    socket.on('notification:forum', onForumNotification);

    return () => {
      socket.off('message:new', onMessageNew);
      socket.off('broadcast:new', onBroadcastNew);
      socket.off('notification:forum', onForumNotification);
      socket.disconnect();
    };
  }, [user, admin, addNotification, toast]);

  return null;
}
