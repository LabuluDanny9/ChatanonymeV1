/**
 * Chat utilisateur — Conversation privée avec admin
 * Layout: Topbar, Messages, Input sticky
 * Design corporate premium
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Lock, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { getErrorMessage, toErrorDisplay } from '../lib/api';
import { io } from 'socket.io-client';
import ChatBubble from '../components/ChatBubble';
import { useToast } from '../context/ToastContext';
import { SOCKET_API_URL, getSocketOptions } from '../lib/socketConfig';

export default function Chat() {
  const { user } = useAuth();
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [typing, setTyping] = useState(false);
  const [online, setOnline] = useState(true);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [content]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    window.addEventListener('online', () => setOnline(true));
    window.addEventListener('offline', () => setOnline(false));
    setOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', () => setOnline(true));
      window.removeEventListener('offline', () => setOnline(false));
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const token = api.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    if (!token) return;
    const socket = io(SOCKET_API_URL, getSocketOptions(token));
    socket.on('message:new', (payload) => {
      setMessages((prev) => [...prev, payload.message]);
      setTimeout(scrollToBottom, 100);
    });
    socket.on('typing:admin', () => setTyping(true));
    socket.on('typing:admin:stop', () => setTyping(false));
    return () => socket.disconnect();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    api
      .get('/api/messages')
      .then(({ data }) => {
        setMessages(data.messages || []);
        setTimeout(scrollToBottom, 100);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Erreur chargement');
        toast.error('Impossible de charger les messages');
      });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      const { data } = await api.post('/api/messages', { content: content.trim() });
      setMessages((prev) => [...prev, data]);
      setContent('');
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      const msg = getErrorMessage(err, 'Envoi impossible');
      setError(msg);
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] sm:h-[calc(100vh-120px)] min-h-[400px] rounded-2xl overflow-hidden bg-corum-blue border border-white/10 shadow-xl">
      {/* Topbar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-corum-night/80 backdrop-blur-xl border-b border-white/10 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-corum-turquoise/20 flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5 text-corum-turquoise" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-corum-offwhite">Conversation sécurisée</h3>
          <p className="text-xs text-corum-gray truncate">Échanges chiffrés avec l'administration</p>
        </div>
        {!online && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg"
          >
            Hors ligne
          </motion.span>
        )}
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-corum-blue/50"
      >
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-corum-red/10 text-corum-red text-sm mb-4 flex items-center gap-2"
          >
            {toErrorDisplay(error)}
          </motion.div>
        )}
        {messages.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-corum-turquoise/10 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-corum-turquoise/60" strokeWidth={1.5} />
            </div>
            <p className="text-corum-gray text-sm">Aucun message</p>
            <p className="text-corum-gray/80 text-xs mt-1">Envoyez le premier.</p>
          </motion.div>
        )}
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            isAdmin={msg.sender_type === 'admin'}
            isRead={msg.is_read}
            createdAt={msg.created_at}
            variant="admin"
          />
        ))}
        {typing && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="px-4 py-2 rounded-2xl bg-white/10 flex items-center gap-2">
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    className="w-2 h-2 rounded-full bg-corum-turquoise"
                  />
                ))}
              </span>
              <span className="text-xs text-corum-gray">Administrateur en train d'écrire...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input sticky */}
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-corum-night/60 backdrop-blur-xl border-t border-white/10 shrink-0"
      >
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 2000))}
              onKeyDown={handleKeyDown}
              placeholder="Votre message..."
              rows={1}
              className="w-full min-h-[44px] max-h-32 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-corum-offwhite placeholder-corum-gray/70 focus:outline-none focus:ring-2 focus:ring-corum-turquoise/50 focus:border-corum-turquoise/50 transition-all duration-300 resize-none"
              maxLength={2000}
              disabled={sending}
            />
          </div>
          <motion.button
            type="submit"
            disabled={sending || !content.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-xl bg-corum-turquoise text-corum-blue font-medium disabled:opacity-50 disabled:cursor-not-allowed shrink-0 transition-all duration-300 focus:ring-2 focus:ring-corum-turquoise/50"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
        <p className="text-xs text-corum-gray/70 mt-2">{content.length}/2000</p>
      </form>
    </div>
  );
}
