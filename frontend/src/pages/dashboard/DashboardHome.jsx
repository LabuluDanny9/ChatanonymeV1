/**
 * Page Accueil utilisateur — Votre espace confidentiel
 * Cards: dernier message, nouveau sujet, non lus, statut connexion
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, FileText, Mail, Wifi, ArrowRight } from 'lucide-react';
import api from '../../lib/api';
import { SkeletonCard } from '../../components/ui/Skeleton';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.3 },
  }),
};

export default function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [lastMessage, setLastMessage] = useState(null);
  const [recentTopic, setRecentTopic] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [online, setOnline] = useState(true);

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
    Promise.all([
      api.get('/api/messages').catch(() => ({ data: { messages: [] } })),
      api.get('/api/topics', { params: { limit: 1 } }).catch(() => ({ data: { topics: [] } })),
    ]).then(([msgRes, topicRes]) => {
      const messages = msgRes.data?.messages || [];
      const topics = topicRes.data?.topics || [];
      const adminMessages = messages.filter((m) => m.sender_type === 'admin');
      const unread = adminMessages.filter((m) => !m.is_read).length;
      setLastMessage(adminMessages[adminMessages.length - 1]);
      setRecentTopic(topics[0] || null);
      setUnreadCount(unread);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-slate-800">Votre espace confidentiel</h1>
        <p className="text-chat-muted mt-1">Bienvenue. Vos échanges restent sécurisés et anonymes.</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Link to="/dashboard/chat">
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-2xl bg-white border border-chat-border p-6 h-full transition-all hover:border-chat-primary/50 hover:shadow-soft group"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <MessageCircle className="w-6 h-6 text-chat-primary" strokeWidth={1.5} />
                </div>
                <ArrowRight className="w-5 h-5 text-chat-muted group-hover:text-chat-primary transition-colors" />
              </div>
              <h3 className="font-semibold text-slate-800 mt-4">Dernier message</h3>
              <p className="text-sm text-chat-muted mt-1 line-clamp-2">
                {lastMessage ? (lastMessage.content || '').slice(0, 60) + '...' : 'Aucun message'}
              </p>
            </motion.div>
          </Link>
        </motion.div>

        <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
          <Link to={recentTopic ? `/topics/${recentTopic.id}` : '/dashboard/topics'}>
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-2xl bg-white border border-chat-border p-6 h-full transition-all hover:border-chat-primary/50 hover:shadow-soft group"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <FileText className="w-6 h-6 text-chat-primary" strokeWidth={1.5} />
                </div>
                <ArrowRight className="w-5 h-5 text-chat-muted group-hover:text-chat-primary transition-colors" />
              </div>
              <h3 className="font-semibold text-slate-800 mt-4">Nouveau sujet</h3>
              <p className="text-sm text-chat-muted mt-1 line-clamp-2">
                {recentTopic?.title || 'Aucun sujet récent'}
              </p>
            </motion.div>
          </Link>
        </motion.div>

        <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
          <Link to="/dashboard/chat">
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-2xl bg-white border border-chat-border p-6 h-full transition-all hover:border-chat-primary/50 hover:shadow-soft group"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors relative">
                  <Mail className="w-6 h-6 text-chat-primary" strokeWidth={1.5} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-chat-danger text-xs text-white flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <ArrowRight className="w-5 h-5 text-chat-muted group-hover:text-chat-primary transition-colors" />
              </div>
              <h3 className="font-semibold text-slate-800 mt-4">Messages non lus</h3>
              <p className="text-sm text-chat-muted mt-1">{unreadCount} message{unreadCount > 1 ? 's' : ''}</p>
            </motion.div>
          </Link>
        </motion.div>

        <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="rounded-2xl bg-white border border-chat-border p-6 h-full"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Wifi className="w-6 h-6 text-chat-primary" strokeWidth={1.5} />
            </div>
            <h3 className="font-semibold text-slate-800 mt-4">Statut connexion</h3>
            <p className="text-sm text-chat-muted mt-1 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${online ? 'bg-green-400' : 'bg-amber-400'}`} />
              {online ? 'Connecté' : 'Hors ligne'}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
