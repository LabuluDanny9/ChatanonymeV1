/**
 * Chat WhatsApp-like — Voice, pièces jointes, emoji
 * Interface conversation utilisateur — layout optimisé
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Send, Mic, Paperclip, Smile, Shield, Image } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { io } from 'socket.io-client';
import ChatBubble from '../../components/ChatBubble';
import VoiceRecorder from '../../components/chat/VoiceRecorder';
import AttachmentPicker from '../../components/chat/AttachmentPicker';
import EmojiPicker from 'emoji-picker-react';
import { useToast } from '../../context/ToastContext';

import { SOCKET_API_URL, getSocketOptions } from '../../lib/socketConfig';

function formatDateSeparator(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function DashboardChat() {
  const { user } = useAuth();
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [adminAvatar, setAdminAvatar] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [typing, setTyping] = useState(false);
  const [online, setOnline] = useState(true);
  const [showVoice, setShowVoice] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [content]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showEmoji && emojiButtonRef.current && !emojiButtonRef.current.contains(e.target) &&
          !e.target.closest('[class*="EmojiPicker"]')) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmoji]);

  useEffect(() => {
    window.addEventListener('online', () => setOnline(true));
    window.addEventListener('offline', () => setOnline(false));
    setOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', () => setOnline(true));
      window.removeEventListener('offline', () => setOnline(false));
    };
  }, []);

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const token = api.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    if (!token) return;
    const socket = io(SOCKET_API_URL, getSocketOptions(token));
    socketRef.current = socket;
    socket.on('message:new', (payload) => {
      setMessages((prev) => [...prev, payload.message]);
      setTimeout(scrollToBottom, 100);
      api.post('/api/messages/mark-read').catch(() => {});
    });
    socket.on('message:deleted', (payload) => {
      setMessages((prev) => prev.filter((m) => m.id !== payload.messageId));
    });
    socket.on('message:updated', (payload) => {
      setMessages((prev) => prev.map((m) => (m.id === payload.message.id ? payload.message : m)));
    });
    socket.on('typing:admin', () => setTyping(true));
    socket.on('typing:admin:stop', () => setTyping(false));
    return () => socket.disconnect();
  }, [user]);

  const emitTyping = () => {
    if (socketRef.current) {
      socketRef.current.emit('typing:user');
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('typing:user:stop');
      }, 1500);
    }
  };

  useEffect(() => {
    api.get('/api/config').then(({ data }) => setAdminAvatar(data.adminAvatar || '')).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    api
      .get('/api/messages')
      .then(({ data }) => {
        setMessages(data.messages || []);
        setTimeout(scrollToBottom, 100);
        api.post('/api/messages/mark-read').catch(() => {});
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Erreur chargement');
        toast.error('Impossible de charger les messages');
      });
  }, [user]);

  const sendMessage = async (payload) => {
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      let body = {};
      if (typeof payload === 'string') {
        body = { content: payload };
      } else if (payload?.type && payload?.url) {
        // Pièce jointe ou vocal depuis upload API
        const meta = payload.metadata || { url: payload.url, filename: payload.filename, duration: payload.duration };
        body = {
          content: '',
          messageType: payload.type,
          metadata: { url: payload.url, filename: payload.filename, ...meta },
        };
      } else if (payload?.type === 'voice' && payload?.data) {
        // Vocal legacy (base64) — fallback si upload échoue
        body = { content: JSON.stringify(payload) };
      } else {
        body = { content: JSON.stringify(payload) };
      }
      const { data } = await api.post('/api/messages', body);
      setMessages((prev) => [...prev, data]);
      setContent('');
      setTimeout(scrollToBottom, 100);
      if (body.messageType && body.messageType !== 'text') {
        toast.success('Message envoyé');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Envoi impossible');
      toast.error(err.response?.data?.error || 'Envoi impossible');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || sending) return;
    await sendMessage(content.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceSend = async (voiceData) => {
    try {
      await sendMessage(voiceData);
      setShowVoice(false);
    } catch {
      // Garder le panneau ouvert pour réessayer
    }
  };

  const handleAttachSelect = async (attachData) => {
    setShowAttach(false);
    await sendMessage(attachData);
  };

  const handleEmojiSelect = (emoji) => {
    setContent((prev) => prev + emoji);
  };

  const handleDeleteMessage = (msgId) => {
    setDeleteModal(msgId);
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    try {
      await api.delete(`/api/messages/${deleteModal}`);
      setMessages((prev) => prev.filter((m) => m.id !== deleteModal));
      setDeleteModal(null);
      toast.success('Message supprimé');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur');
    }
  };

  const handleEditMessage = (msg) => {
    const text = (msg.message_type === 'text' || !msg.message_type) ? (msg.content || '') : '';
    setEditModal({ id: msg.id, content: text });
  };

  const confirmEdit = async () => {
    if (!editModal?.id || editModal.content === undefined) return;
    try {
      const { data } = await api.patch(`/api/messages/${editModal.id}`, { content: String(editModal.content || '').trim() });
      setMessages((prev) => prev.map((m) => (m.id === data.id ? data : m)));
      setEditModal(null);
      toast.success('Message modifié');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur');
    }
  };

  // Grouper les messages par date pour les séparateurs
  const messagesWithDates = messages.reduce((acc, msg) => {
    const dateKey = msg.created_at ? new Date(msg.created_at).toDateString() : 'other';
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(msg);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] lg:h-[calc(100vh-140px)] min-h-[400px] rounded-2xl overflow-hidden bg-app-card/50 border border-app-border backdrop-blur-sm">
      <div className="flex items-center gap-4 px-5 py-4 bg-app-surface/80 border-b border-app-border shrink-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-app-purple to-app-blue flex items-center justify-center overflow-hidden">
            {user?.photo && user.photo.trim().length <= 4 ? (
              <span className="text-2xl">{user.photo}</span>
            ) : (
              <Shield className="w-6 h-6 text-white" strokeWidth={1.5} />
            )}
          </div>
          {adminAvatar && (
            <div className="w-10 h-10 rounded-xl bg-app-purple/20 flex items-center justify-center overflow-hidden border-2 border-app-border" title="Administrateur">
              {adminAvatar.startsWith('http') ? (
                <img src={adminAvatar} alt="" className="w-full h-full object-cover" />
              ) : adminAvatar.trim().length <= 4 ? (
                <span className="text-xl">{adminAvatar}</span>
              ) : null}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-app-text text-lg">Conversation anonyme</h3>
          <p className="text-sm text-app-muted truncate">Échanges confidentiels — Texte, images, vocal</p>
        </div>
        <div className="flex items-center gap-2">
          {online ? (
            <span className="flex items-center gap-1.5 text-xs text-app-success bg-app-success/10 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-app-success animate-pulse" />
              En ligne
            </span>
          ) : (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs text-app-warning bg-app-warning/10 px-3 py-1.5 rounded-full"
            >
              Hors ligne
            </motion.span>
          )}
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-app-bg/50">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-app-danger/15 border border-app-danger/30 text-app-danger text-sm flex items-center gap-2"
          >
            {error}
          </motion.div>
        )}
        {messages.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-8 mx-4 rounded-2xl bg-gradient-to-br from-app-purple to-app-blue text-white"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold mb-6 text-center">Bienvenue dans <span className="font-extrabold">L'Aparté</span>.</h3>
            <div className="space-y-4 text-white/95 text-sm text-center max-w-lg">
              <p>Ici, le monde extérieur n'existe plus. Vous avancez sous un pseudo, totalement libre, sans le poids de votre nom ni la peur du jugement. C'est votre espace de vérité brute.</p>
              <p>Je suis votre seul interlocuteur. Mon rôle n'est pas de vous complaire, mais de vous répondre sans filtre. Dans nos échanges directs, j'offre la lucidité que l'on n'ose plus se dire en face. Pour échanger avec les autres, rejoignez nos forums thématiques.</p>
              <p>Déposez ce qui vous pèse, posez vos questions interdites : ici, la parole libère enfin.</p>
            </div>
            <p className="text-white font-semibold mt-8 text-lg">Par quoi voulez-vous commencer ?</p>
          </motion.div>
        )}
        {Object.entries(messagesWithDates).map(([dateKey, msgs]) => (
          <div key={dateKey} className="space-y-3">
            <div className="flex justify-center">
              <span className="text-xs font-medium text-app-muted bg-app-card px-3 py-1 rounded-full">
                {formatDateSeparator(msgs[0]?.created_at || dateKey)}
              </span>
            </div>
            {msgs.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                isAdmin={msg.sender_type === 'admin'}
                isRead={msg.is_read}
                createdAt={msg.created_at}
                variant="app"
                userAvatar={msg.sender_type === 'user' ? user?.photo : undefined}
                adminAvatar={msg.sender_type === 'admin' ? adminAvatar : undefined}
                onDelete={handleDeleteMessage}
                onEdit={handleEditMessage}
                canDelete={msg.sender_type === 'user'}
                canEdit={msg.sender_type === 'user' && (msg.message_type === 'text' || !msg.message_type)}
              />
            ))}
          </div>
        ))}
        {typing && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="px-4 py-3 rounded-2xl bg-app-card flex items-center gap-2 border border-app-border">
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    className="w-2 h-2 rounded-full bg-app-purple"
                  />
                ))}
              </span>
              <span className="text-xs text-app-muted">Administrateur en train d'écrire...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Panneaux Voice / Pièces jointes */}
      <AnimatePresence>
        {showVoice && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-4 bg-app-surface/50">
              <VoiceRecorder
                onSend={handleVoiceSend}
                onCancel={() => setShowVoice(false)}
              />
            </div>
          </motion.div>
        )}
        {showAttach && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-4 bg-app-surface/50">
              <AttachmentPicker
                onSelect={handleAttachSelect}
                onClose={() => setShowAttach(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone d’entrée + Emoji picker */}
      <div className="relative shrink-0 bg-app-surface/80 border-t border-app-border backdrop-blur-sm">
        {/* Emoji picker — positionné au-dessus du formulaire */}
        <AnimatePresence>
          {showEmoji && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute bottom-full left-4 right-4 sm:left-auto sm:right-4 sm:w-[320px] mb-2 z-50"
            >
              <EmojiPicker
                onEmojiClick={(d) => handleEmojiSelect(d.emoji)}
                theme="dark"
                width={320}
                height={320}
                previewConfig={{ showPreview: false }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex gap-2 sm:gap-3 items-end">
            {/* Actions (emoji, pièce jointe, vocal) */}
            <div className="flex items-center gap-1 shrink-0">
              <motion.button
                type="button"
                onClick={() => { setShowVoice(false); setShowEmoji(false); setShowAttach(!showAttach); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2.5 rounded-xl transition-colors ${showAttach ? 'text-chat-primary bg-blue-50' : 'text-chat-muted hover:text-chat-primary hover:bg-blue-50/50'}`}
                title="Envoyer une image"
              >
                <Image className="w-5 h-5" strokeWidth={1.5} />
              </motion.button>
              <motion.button
                type="button"
                ref={emojiButtonRef}
                onClick={() => { setShowAttach(false); setShowVoice(false); setShowEmoji(!showEmoji); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2.5 rounded-xl transition-colors ${showEmoji ? 'text-app-purple bg-app-purple/20' : 'text-app-muted hover:text-app-purple hover:bg-app-purple/10'}`}
                title="Emoji"
              >
                <Smile className="w-5 h-5" strokeWidth={1.5} />
              </motion.button>
              <motion.button
                type="button"
                onClick={() => { setShowVoice(false); setShowEmoji(false); setShowAttach(!showAttach); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2.5 rounded-xl transition-colors ${showAttach ? 'text-app-purple bg-app-purple/20' : 'text-app-muted hover:text-app-purple hover:bg-app-purple/10'}`}
                title="Fichiers (images, vidéos, documents)"
              >
                <Paperclip className="w-5 h-5" strokeWidth={1.5} />
              </motion.button>
              <motion.button
                type="button"
                onClick={() => { setShowAttach(false); setShowEmoji(false); setShowVoice(!showVoice); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2.5 rounded-xl transition-colors ${showVoice ? 'text-app-purple bg-app-purple/20' : 'text-app-muted hover:text-app-purple hover:bg-app-purple/10'}`}
                title="Message vocal"
              >
                <Mic className="w-5 h-5" strokeWidth={1.5} />
              </motion.button>
            </div>
            {/* Zone de texte */}
            <div className="flex-1 min-w-0">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => { setContent(e.target.value.slice(0, 2000)); emitTyping(); }}
                onKeyDown={handleKeyDown}
                placeholder="Écrivez votre message..."
                rows={1}
                className="w-full min-h-[44px] max-h-32 rounded-xl bg-app-card border border-app-border px-4 py-3 text-app-text placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-app-purple/50 focus:border-app-purple transition-all duration-300 resize-none"
                maxLength={2000}
                disabled={sending}
              />
            </div>
            <motion.button
              type="submit"
              disabled={sending || !content.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-app-purple text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed shrink-0 transition-all hover:bg-app-purple/90"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
          <p className="text-xs text-app-muted mt-2 ml-1">{content.length}/2000</p>
        </form>
      </div>

      {/* Modal suppression */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={() => setDeleteModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl bg-app-card border border-app-border p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-app-text mb-2">Supprimer le message</h3>
              <p className="text-sm text-app-muted mb-6">Ce message sera définitivement supprimé.</p>
              <div className="flex justify-end gap-3">
                <motion.button type="button" onClick={() => setDeleteModal(null)} className="px-4 py-2 rounded-xl bg-app-surface text-app-muted hover:text-app-text">Annuler</motion.button>
                <motion.button type="button" onClick={confirmDelete} className="px-4 py-2 rounded-xl bg-app-danger text-white">Supprimer</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal modification */}
      <AnimatePresence>
        {editModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={() => setEditModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl bg-app-card border border-app-border p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-app-text mb-2">Modifier le message</h3>
              <textarea
                value={editModal.content}
                onChange={(e) => setEditModal((prev) => ({ ...prev, content: e.target.value }))}
                className="w-full min-h-[100px] rounded-xl bg-app-surface border border-app-border px-4 py-3 text-app-text placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-app-purple/50 mb-4"
                placeholder="Nouveau contenu..."
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <motion.button type="button" onClick={() => setEditModal(null)} className="px-4 py-2 rounded-xl bg-app-surface text-app-muted hover:text-app-text">Annuler</motion.button>
                <motion.button type="button" onClick={confirmEdit} disabled={!editModal.content?.trim()} className="px-4 py-2 rounded-xl bg-app-purple text-white disabled:opacity-50 hover:bg-app-purple/90">Enregistrer</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
