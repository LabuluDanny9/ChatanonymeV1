/**
 * Chat Admin centralisé - Interface 3 colonnes
 * Design SaaS institutionnel, sécurisé, intelligent
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { Send, Lock, X, User, Ban, Search, Trash2, Menu, ChevronRight, MessageCircle, Mic, Paperclip, Smile } from 'lucide-react';
import api, { getErrorMessage, ensureAuthToken } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ChatBubble from '../../components/ChatBubble';
import VoiceRecorder from '../../components/chat/VoiceRecorder';
import AttachmentPicker from '../../components/chat/AttachmentPicker';
import EmojiPicker from 'emoji-picker-react';

import { SOCKET_API_URL, getSocketOptions, WS_ENABLED } from '../../lib/socketConfig';

const statusLabels = { open: 'Ouverte', closed: 'Fermée', banned: 'Banni', active: 'Actif' };
const statusColors = { open: 'text-admin-success', closed: 'text-admin-muted', banned: 'text-admin-danger', active: 'text-admin-success' };

function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl bg-admin-card border border-admin-border shadow-admin-glow p-6 max-w-md w-full"
      >
        <h3 className="text-lg font-semibold text-admin-text mb-2">{title}</h3>
        <p className="text-sm text-admin-muted mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-xl bg-admin-surface text-admin-muted hover:bg-admin-border font-medium"
          >
            Annuler
          </motion.button>
          <motion.button
            type="button"
            onClick={onConfirm}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-xl bg-admin-danger text-white font-medium hover:bg-admin-danger/90"
          >
            Confirmer
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminConversations() {
  const { admin } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [unreadMap, setUnreadMap] = useState({});
  const [showListMobile, setShowListMobile] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(true);
  const [modal, setModal] = useState(null);
  const [typing, setTyping] = useState(false);
  const toast = useToast();
  const [showVoice, setShowVoice] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);
  const emojiButtonRef = useRef(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = '44px';
    ta.style.height = `${Math.min(ta.scrollHeight, 128)}px`;
  }, [reply]);
  const token = api.defaults.headers.common['Authorization']?.replace('Bearer ', '') ||
    (() => { try { return JSON.parse(localStorage.getItem('chatanonyme_admin') || '{}')?.token; } catch { return null; } })();

  const fetchConversations = useCallback(() => {
    ensureAuthToken('admin');
    api.get('/api/admin/conversations').then(({ data }) => {
      setConversations(data.conversations || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Polling liste conversations quand WebSocket désactivé (Vercel serverless)
  useEffect(() => {
    if (!WS_ENABLED) {
      const interval = setInterval(fetchConversations, 8000);
      return () => clearInterval(interval);
    }
  }, [WS_ENABLED, fetchConversations]);

  const refreshSelectedMessages = useCallback(() => {
    if (!selected || !token) return;
    ensureAuthToken('admin');
    api.get(`/api/admin/conversations/${selected.id}`).then(({ data }) => {
      setMessages(data.messages || []);
      setUnreadMap((prev) => ({ ...prev, [selected.id]: 0 }));
    }).catch(() => setMessages([]));
  }, [selected?.id, token]);

  useEffect(() => {
    refreshSelectedMessages();
  }, [refreshSelectedMessages]);

  // Polling quand WebSocket désactivé (Vercel serverless)
  useEffect(() => {
    if (!selected || !token || WS_ENABLED) return;
    const interval = setInterval(refreshSelectedMessages, 5000);
    return () => clearInterval(interval);
  }, [selected?.id, token, WS_ENABLED, refreshSelectedMessages]);

  useEffect(() => {
    if (!token || !WS_ENABLED) return; // Pas de WebSocket sur Vercel serverless (404 /ws)
    const socket = io(SOCKET_API_URL, getSocketOptions(token));
    socket.on('message:new', (payload) => {
      if (payload.conversationId === selected?.id) {
        setMessages((prev) => [...prev, payload.message]);
      } else {
        setUnreadMap((prev) => ({ ...prev, [payload.conversationId]: (prev[payload.conversationId] || 0) + 1 }));
      }
      fetchConversations();
    });
    socket.on('message:deleted', (payload) => {
      if (payload.conversationId === selected?.id) {
        setMessages((prev) => prev.filter((m) => m.id !== payload.messageId));
      }
    });
    socket.on('message:updated', (payload) => {
      if (payload.conversationId === selected?.id) {
        setMessages((prev) => prev.map((m) => (m.id === payload.message.id ? payload.message : m)));
      }
    });
    socket.on('messages:read', (payload) => {
      if (payload.conversationId === selected?.id) {
        api.get(`/api/admin/conversations/${selected.id}`).then(({ data }) => setMessages(data.messages || []));
      }
    });
    socket.on('typing:user', (payload) => {
      if (selected?.user_id === payload.userId) setTyping(true);
    });
    socket.on('typing:user:stop', (payload) => {
      if (selected?.user_id === payload.userId) setTyping(false);
    });
    return () => socket.disconnect();
  }, [token, selected?.id, selected?.user_id, fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.metaKey && e.key === 'Enter') {
        e.preventDefault();
        if (reply.trim() && selected?.status === 'open') handleReply(e);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reply, selected?.status]);

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

  const buildReplyBody = (payload) => {
    if (typeof payload === 'string') return { content: payload };
    if (payload?.type && payload?.url) {
      const meta = payload.metadata || { url: payload.url, filename: payload.filename, duration: payload.duration };
      return { content: '', messageType: payload.type, metadata: { url: payload.url, filename: payload.filename, ...meta } };
    }
    if (payload?.type === 'voice' && payload?.data) {
      return { content: JSON.stringify(payload) };
    }
    return { content: JSON.stringify(payload) };
  };

  const handleReply = async (e, payload, isRetry = false) => {
    e?.preventDefault?.();
    const body = payload !== undefined ? buildReplyBody(payload) : { content: reply.trim() };
    if (!selected || sending) return;
    if (!body.content?.trim() && !body.messageType) return;
    setSending(true);
    ensureAuthToken('admin');
    try {
      const { data } = await api.post(`/api/admin/conversations/${selected.id}/reply`, body);
      setMessages((prev) => [...prev, data]);
      setReply('');
    } catch (err) {
      if (!isRetry && err?.response?.status === 401) {
        ensureAuthToken('admin');
        await new Promise((r) => setTimeout(r, 300));
        return handleReply(e, payload, true);
      }
      toast.error(getErrorMessage(err, 'Erreur'));
    } finally {
      setSending(false);
    }
  };

  const handleVoiceSend = async (voiceData) => {
    setShowVoice(false);
    await handleReply(null, voiceData);
  };

  const handleAttachSelect = async (attachData) => {
    setShowAttach(false);
    await handleReply(null, attachData);
  };

  const handleEmojiSelect = (emoji) => {
    setReply((prev) => prev + emoji);
  };

  const handleClose = () => {
    setModal({ type: 'close', handler: async () => {
      try {
        ensureAuthToken('admin');
        await api.patch(`/api/admin/conversations/${selected.id}/close`);
        setSelected((s) => ({ ...s, status: 'closed' }));
        fetchConversations();
        setModal(null);
      } catch (e) {
        alert(getErrorMessage(e, 'Erreur'));
      }
    }});
  };

  const handleBan = () => {
    if (!selected?.user_id) return;
    setModal({ type: 'ban', handler: async () => {
      try {
        ensureAuthToken('admin');
        await api.post(`/api/admin/users/${selected.user_id}/ban`);
        setSelected((s) => ({ ...s, user_status: 'banned' }));
        fetchConversations();
        setModal(null);
      } catch (e) {
        alert(getErrorMessage(e, 'Erreur'));
      }
    }});
  };

  const handleDeleteMessage = (msgId) => {
    setModal({ type: 'deleteMsg', msgId, handler: async () => {
      try {
        ensureAuthToken('admin');
        await api.delete(`/api/admin/messages/${msgId}`);
        setMessages((prev) => prev.filter((m) => m.id !== msgId));
        setModal(null);
        toast.success('Message supprimé');
      } catch (e) {
        toast.error(getErrorMessage(e, 'Erreur'));
      }
    }});
  };

  const handleEditMessage = (msg) => {
    const text = (msg.message_type === 'text' || !msg.message_type) ? (msg.content || '') : '';
    setModal({ type: 'editMsg', msg, editContent: text });
  };

  const confirmEditMessage = async () => {
    const m = modal?.msg;
    if (!m || !modal.editContent?.trim()) return;
    try {
      ensureAuthToken('admin');
      const { data } = await api.patch(`/api/admin/messages/${m.id}`, { content: modal.editContent.trim() });
      setMessages((prev) => prev.map((msg) => (msg.id === data.id ? data : msg)));
      setModal(null);
      toast.success('Message modifié');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Erreur'));
    }
  };

  const filteredConversations = search.trim()
    ? conversations.filter((c) =>
        (c.pseudo || c.anonymous_id || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.id || '').toLowerCase().includes(search.toLowerCase())
      )
    : conversations;

  const selectConversation = (c) => {
    setSelected(c);
    setShowListMobile(false);
  };

  const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-6rem)] flex">
        <div className="w-[300px] bg-admin-surface animate-pulse rounded-r-xl" />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="animate-pulse text-admin-muted">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-10rem)] flex overflow-hidden rounded-2xl border border-admin-border bg-admin-card/30 backdrop-blur-sm shadow-admin-card">
      {/* 1️⃣ COLONNE GAUCHE — Liste conversations (300px) */}
      <aside
        className={`shrink-0 w-[300px] bg-admin-surface/50 border-r border-admin-border flex flex-col ${
          showListMobile ? 'fixed inset-y-0 left-0 z-40 lg:relative' : 'hidden lg:flex'
        }`}
      >
        <div className="p-4 border-b border-admin-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-muted" strokeWidth={1.5} />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher (⌘K)"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-admin-card border border-admin-border text-admin-text placeholder-admin-muted text-sm focus:outline-none focus:ring-2 focus:ring-admin-purple/50 focus:border-admin-purple"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((c) => (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => selectConversation(c)}
              initial={false}
              animate={{ x: selected?.id === c.id ? 4 : 0 }}
              transition={{ duration: 0.2 }}
              className={`w-full text-left px-4 py-3 border-b border-admin-border hover:bg-admin-card/50 transition-colors duration-200 ${
                selected?.id === c.id ? 'bg-admin-purple/10 border-l-2 border-l-admin-purple' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-admin-text truncate flex-1">
                  {c.pseudo || c.anonymous_id || c.id?.slice(0, 8) || '—'}
                </p>
                {unreadMap[c.id] > 0 && (
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="shrink-0 min-w-[18px] h-[18px] rounded-full bg-admin-purple text-white text-xs font-bold flex items-center justify-center"
                  >
                    {unreadMap[c.id]}
                  </motion.span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs ${statusColors[c.user_status] || statusColors[c.status] || 'text-admin-muted'}`}>
                  {c.user_status === 'banned' ? statusLabels.banned : (statusLabels[c.status] || c.status)}
                </span>
                <span className="text-xs text-admin-muted">•</span>
                <span className="text-xs text-admin-muted">{formatDate(c.updated_at)}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </aside>

      {/* Overlay mobile */}
      {showListMobile && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setShowListMobile(false)} aria-hidden />
      )}

      {/* 2️⃣ ZONE CENTRALE — Chat (style WhatsApp/Discord) */}
      <main className="flex-1 flex flex-col min-w-0 bg-admin-bg/50">
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-admin-muted p-6">
            <MessageCircle className="w-16 h-16 mb-4 opacity-30" strokeWidth={1} />
            <p className="text-center">Sélectionnez une conversation</p>
            <button
              type="button"
              onClick={() => setShowListMobile(true)}
              className="mt-4 lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-admin-purple/20 text-admin-purple"
            >
              <Menu className="w-4 h-4" /> Ouvrir la liste
            </button>
          </div>
        ) : (
          <>
            {/* Topbar */}
            <div className="shrink-0 px-4 py-3 border-b border-admin-border flex items-center justify-between gap-4 bg-admin-surface/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setShowListMobile(true)}
                  className="lg:hidden p-2 rounded-lg text-admin-muted hover:bg-admin-card"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                {(selected?.photo && selected.photo.trim().length <= 4) ? (
                  <div className="w-10 h-10 rounded-xl bg-admin-purple/20 flex items-center justify-center text-xl shrink-0">
                    {selected.photo}
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-admin-card flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-admin-muted" strokeWidth={1.5} />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium text-admin-text truncate">
                    {selected.pseudo || selected.anonymous_id || selected.id?.slice(0, 8) || 'Anonyme'}
                  </p>
                  <p className={`text-xs ${statusColors[selected.status] || 'text-admin-muted'}`}>
                    {statusLabels[selected.status] || selected.status}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {admin?.photo && (
                  <div className="w-9 h-9 rounded-xl bg-admin-purple/20 flex items-center justify-center overflow-hidden border border-admin-border" title="Vous">
                    {admin.photo.startsWith('http') ? (
                      <img src={admin.photo} alt="" className="w-full h-full object-cover" />
                    ) : admin.photo.trim().length <= 4 ? (
                      <span className="text-lg">{admin.photo}</span>
                    ) : (
                      <User className="w-5 h-5 text-admin-purple" strokeWidth={1.5} />
                    )}
                  </div>
                )}
                {selected.status === 'open' && (
                  <motion.button
                    type="button"
                    onClick={handleClose}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg text-admin-muted hover:text-admin-text hover:bg-admin-card"
                    title="Fermer"
                  >
                    <Lock className="w-4 h-4" />
                  </motion.button>
                )}
                {selected.user_id && (
                  <motion.button
                    type="button"
                    onClick={handleBan}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg text-admin-muted hover:text-admin-danger hover:bg-admin-danger/20"
                    title="Bannir"
                  >
                    <Ban className="w-4 h-4" />
                  </motion.button>
                )}
                <button
                  type="button"
                  onClick={() => setShowInfoPanel(!showInfoPanel)}
                  className="hidden lg:flex p-2 rounded-lg text-admin-muted hover:bg-admin-card"
                >
                  <User className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages — style WhatsApp/Discord */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-admin-bg/50 to-admin-surface/30">
              {messages.filter((m) => !m.deleted_at).map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-end gap-2 group"
                >
                  <div className="flex-1 min-w-0">
                    <ChatBubble
                      message={m}
                      isAdmin={m.sender_type === 'admin'}
                      isRead={m.is_read}
                      createdAt={m.created_at}
                      variant="admin"
                      userAvatar={m.sender_type === 'user' ? selected?.photo : undefined}
                      adminAvatar={m.sender_type === 'admin' ? admin?.photo : undefined}
                      onDelete={handleDeleteMessage}
                      onEdit={handleEditMessage}
                      canDelete
                      canEdit={(m.message_type === 'text' || !m.message_type)}
                    />
                  </div>
                </motion.div>
              ))}
              {typing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="px-4 py-3 rounded-2xl bg-admin-card/50 flex items-center gap-2 border border-admin-border">
                    <span className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                          className="w-2 h-2 rounded-full bg-admin-purple"
                        />
                      ))}
                    </span>
                    <span className="text-xs text-admin-muted">Utilisateur en train d'écrire...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Voice / Attachment panels — style unifié */}
            <AnimatePresence>
              {showVoice && selected.status === 'open' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden border-t border-admin-border"
                >
                  <div className="p-4 bg-admin-surface/60">
                    <VoiceRecorder onSend={handleVoiceSend} onCancel={() => setShowVoice(false)} />
                  </div>
                </motion.div>
              )}
              {showAttach && selected.status === 'open' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden border-t border-admin-border"
                >
                  <div className="p-4 bg-admin-surface/60">
                    <AttachmentPicker onSelect={handleAttachSelect} onClose={() => setShowAttach(false)} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Emoji picker */}
            <AnimatePresence>
              {showEmoji && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-full left-4 right-4 sm:left-auto sm:right-4 sm:w-[320px] mb-2 z-50"
                >
                  <EmojiPicker onEmojiClick={(d) => handleEmojiSelect(d.emoji)} theme="dark" width={320} height={320} previewConfig={{ showPreview: false }} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input zone — style WhatsApp/Discord */}
            {selected.status === 'open' && (
              <div className="relative shrink-0 bg-admin-surface/80 backdrop-blur-xl border-t border-admin-border">
                <form onSubmit={(e) => handleReply(e)} className="p-4">
                  <div className="flex gap-2 sm:gap-3 items-end">
                    <div className="flex items-center gap-1 shrink-0">
                      <motion.button
                        type="button"
                        ref={emojiButtonRef}
                        onClick={() => { setShowAttach(false); setShowVoice(false); setShowEmoji(!showEmoji); }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-2.5 rounded-xl transition-colors ${showEmoji ? 'text-admin-purple bg-admin-purple/20' : 'text-admin-muted hover:text-admin-purple hover:bg-admin-purple/10'}`}
                        title="Emoji"
                      >
                        <Smile className="w-5 h-5" strokeWidth={1.5} />
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => { setShowVoice(false); setShowEmoji(false); setShowAttach(!showAttach); }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-2.5 rounded-xl transition-colors ${showAttach ? 'text-admin-purple bg-admin-purple/20' : 'text-admin-muted hover:text-admin-purple hover:bg-admin-purple/10'}`}
                        title="Pièce jointe"
                      >
                        <Paperclip className="w-5 h-5" strokeWidth={1.5} />
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => { setShowAttach(false); setShowEmoji(false); setShowVoice(!showVoice); }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-2.5 rounded-xl transition-colors ${showVoice ? 'text-admin-purple bg-admin-purple/20' : 'text-admin-muted hover:text-admin-purple hover:bg-admin-purple/10'}`}
                        title="Message vocal"
                      >
                        <Mic className="w-5 h-5" strokeWidth={1.5} />
                      </motion.button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <textarea
                        ref={textareaRef}
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleReply(e);
                          }
                        }}
                        placeholder="Répondre... (⌘↵ envoyer)"
                        rows={1}
                        disabled={sending}
                        className="w-full min-h-[44px] max-h-32 rounded-xl bg-admin-card border border-admin-border px-4 py-3 text-admin-text placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-admin-purple/50 focus:border-admin-purple transition-all duration-300 resize-none"
                      />
                    </div>
                    <motion.button
                      type="submit"
                      disabled={sending || !reply.trim()}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 rounded-xl bg-admin-purple text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed shrink-0 transition-all hover:bg-admin-purple/90"
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                  <p className="text-xs text-admin-muted mt-2 ml-1">{reply.length.toLocaleString('fr-FR')} caractères</p>
                </form>
              </div>
            )}
          </>
        )}
      </main>

      {/* 3️⃣ COLONNE DROITE — User Info (280px) */}
      <AnimatePresence>
        {selected && showInfoPanel && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden lg:flex shrink-0 flex-col bg-admin-surface/50 border-l border-admin-border overflow-hidden"
          >
            <div className="p-4 border-b border-admin-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-admin-muted uppercase tracking-wider">Infos</span>
                <button
                  type="button"
                  onClick={() => setShowInfoPanel(false)}
                  className="p-1 rounded text-admin-muted hover:text-admin-text"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto">
              <div>
                <p className="text-xs text-admin-muted uppercase tracking-wider mb-1">ID utilisateur</p>
                <p className="text-sm text-admin-text font-mono truncate">{selected.user_id || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-admin-muted uppercase tracking-wider mb-1">Création</p>
                <p className="text-sm text-admin-text">
                  {selected.created_at ? new Date(selected.created_at).toLocaleString('fr-FR') : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-admin-muted uppercase tracking-wider mb-1">Messages</p>
                <p className="text-sm text-admin-text">{messages.length}</p>
              </div>
              <div>
                <p className="text-xs text-admin-muted uppercase tracking-wider mb-1">Statut</p>
                <p className={`text-sm ${statusColors[selected.status] || 'text-admin-text'}`}>
                  {statusLabels[selected.status] || selected.status}
                </p>
              </div>
              {selected.user_id && (
                <motion.button
                  type="button"
                  onClick={handleBan}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2 rounded-xl border border-admin-danger/50 text-admin-danger hover:bg-admin-danger/20 text-sm font-medium"
                >
                  Bannir l'utilisateur
                </motion.button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {modal?.type === 'close' && (
          <ConfirmModal
            open
            title="Fermer la conversation"
            message="Cette conversation sera marquée comme fermée."
            onConfirm={modal.handler}
            onCancel={() => setModal(null)}
          />
        )}
        {modal?.type === 'ban' && (
          <ConfirmModal
            open
            title="Bannir l'utilisateur"
            message="Cet utilisateur ne pourra plus accéder à la plateforme."
            onConfirm={modal.handler}
            onCancel={() => setModal(null)}
          />
        )}
        {modal?.type === 'deleteMsg' && (
          <ConfirmModal
            open
            title="Supprimer le message"
            message="Ce message sera définitivement supprimé."
            onConfirm={modal.handler}
            onCancel={() => setModal(null)}
          />
        )}
        {modal?.type === 'editMsg' && modal?.msg && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl bg-admin-card border border-admin-border shadow-admin-glow p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-admin-text mb-2">Modifier le message</h3>
              <textarea
                value={modal.editContent ?? ''}
                onChange={(e) => setModal((prev) => ({ ...prev, editContent: e.target.value }))}
                className="w-full min-h-[100px] rounded-xl bg-admin-surface border border-admin-border px-4 py-3 text-admin-text placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-admin-purple/50 mb-4"
                placeholder="Nouveau contenu..."
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <motion.button type="button" onClick={() => setModal(null)} whileTap={{ scale: 0.98 }} className="px-4 py-2 rounded-xl bg-admin-surface text-admin-muted hover:text-admin-text">Annuler</motion.button>
                <motion.button type="button" onClick={confirmEditMessage} whileTap={{ scale: 0.98 }} className="px-4 py-2 rounded-xl bg-admin-purple text-white hover:bg-admin-purple/90">Enregistrer</motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
