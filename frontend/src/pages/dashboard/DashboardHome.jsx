/**
 * Fil d'actualité — Style Reddit/Twitter
 * Posts, trending, activité récente
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  FileText,
  Mail,
  Wifi,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';
import api from '../../lib/api';
import { decodeHtmlEntities } from '../../lib/textUtils';
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
  const [topics, setTopics] = useState([]);
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
      api.get('/api/topics', { params: { limit: 5 } }).catch(() => ({ data: { topics: [] } })),
    ]).then(([msgRes, topicRes]) => {
      const messages = msgRes.data?.messages || [];
      const allTopics = topicRes.data?.topics || [];
      const adminMessages = messages.filter((m) => m.sender_type === 'admin');
      const unread = adminMessages.filter((m) => !m.is_read).length;
      setLastMessage(adminMessages[adminMessages.length - 1]);
      setRecentTopic(allTopics[0] || null);
      setTopics(allTopics.slice(0, 5));
      setUnreadCount(unread);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-8 w-48 bg-app-surface rounded-xl animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-app-card/50 rounded-2xl animate-pulse border border-app-border" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-app-card/50 rounded-2xl animate-pulse border border-app-border" />
            ))}
          </div>
          <div className="h-64 bg-app-card/50 rounded-2xl animate-pulse border border-app-border" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Fil central */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-app-text">Fil d'actualité</h1>
            <p className="text-app-muted mt-1">Bienvenue. Vos échanges restent sécurisés et anonymes.</p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
              <Link to="/dashboard/chat">
                <motion.div
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="rounded-2xl bg-app-card/50 border border-app-border p-6 h-full transition-all hover:border-app-purple/30 backdrop-blur-sm group"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-app-purple/20 flex items-center justify-center group-hover:bg-app-purple/30 transition-colors">
                      <MessageCircle className="w-6 h-6 text-app-purple" strokeWidth={1.5} />
                    </div>
                    <ArrowRight className="w-5 h-5 text-app-muted group-hover:text-app-purple transition-colors" />
                  </div>
                  <h3 className="font-semibold text-app-text mt-4">Dernier message</h3>
                  <p className="text-sm text-app-muted mt-1 line-clamp-2">
                    {lastMessage ? decodeHtmlEntities(lastMessage.content || '').slice(0, 60) + '...' : 'Aucun message'}
                  </p>
                </motion.div>
              </Link>
            </motion.div>

            <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
              <Link to={recentTopic ? `/dashboard/topics/${recentTopic.id}` : '/dashboard/topics'}>
                <motion.div
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="rounded-2xl bg-app-card/50 border border-app-border p-6 h-full transition-all hover:border-app-purple/30 backdrop-blur-sm group"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-app-purple/20 flex items-center justify-center group-hover:bg-app-purple/30 transition-colors">
                      <FileText className="w-6 h-6 text-app-purple" strokeWidth={1.5} />
                    </div>
                    <ArrowRight className="w-5 h-5 text-app-muted group-hover:text-app-purple transition-colors" />
                  </div>
                  <h3 className="font-semibold text-app-text mt-4">Nouveau sujet</h3>
                  <p className="text-sm text-app-muted mt-1 line-clamp-2">
                    {recentTopic?.title || 'Aucun sujet récent'}
                  </p>
                </motion.div>
              </Link>
            </motion.div>

            <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
              <Link to="/dashboard/chat">
                <motion.div
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="rounded-2xl bg-app-card/50 border border-app-border p-6 h-full transition-all hover:border-app-purple/30 backdrop-blur-sm group"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-app-purple/20 flex items-center justify-center relative group-hover:bg-app-purple/30 transition-colors">
                      <Mail className="w-6 h-6 text-app-purple" strokeWidth={1.5} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-app-danger text-xs text-white flex items-center justify-center font-bold">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-app-muted group-hover:text-app-purple transition-colors" />
                  </div>
                  <h3 className="font-semibold text-app-text mt-4">Messages non lus</h3>
                  <p className="text-sm text-app-muted mt-1">{unreadCount} message{unreadCount > 1 ? 's' : ''}</p>
                </motion.div>
              </Link>
            </motion.div>

            <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-2xl bg-app-card/50 border border-app-border p-6 h-full backdrop-blur-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-app-purple/20 flex items-center justify-center">
                  <Wifi className="w-6 h-6 text-app-purple" strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-app-text mt-4">Statut connexion</h3>
                <p className="text-sm text-app-muted mt-1 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${online ? 'bg-app-success' : 'bg-app-warning'}`} />
                  {online ? 'Connecté' : 'Hors ligne'}
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* Posts récents (sujets) */}
          <div className="space-y-4">
            <h2 className="font-semibold text-app-text flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-app-purple" /> Discussions récentes
            </h2>
            {topics.length === 0 ? (
              <div className="rounded-2xl bg-app-card/30 border border-app-border p-12 text-center">
                <FileText className="w-16 h-16 text-app-muted/50 mx-auto mb-4" strokeWidth={1} />
                <p className="text-app-muted">Aucune discussion pour le moment</p>
                <Link to="/dashboard/topics" className="mt-4 inline-block text-app-purple hover:underline">
                  Voir le forum
                </Link>
              </div>
            ) : (
              topics.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/dashboard/topics/${t.id}`}>
                    <article className="rounded-2xl bg-app-card/50 border border-app-border p-4 hover:border-app-purple/30 transition-all group">
                      <h3 className="font-medium text-app-text group-hover:text-app-purple transition-colors line-clamp-1">
                        {t.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-app-muted">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {t.comments_count ?? 0} commentaire{(t.comments_count ?? 0) !== 1 ? 's' : ''}
                        </span>
                        <span>{new Date(t.published_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Panneau droit — Trending */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-app-card/50 border border-app-border p-6 backdrop-blur-sm sticky top-24"
          >
            <h2 className="font-semibold text-app-text flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-app-purple" /> Sujets tendance
            </h2>
            <div className="space-y-3">
              {topics.slice(0, 5).map((t, i) => (
                <Link
                  key={t.id}
                  to={`/dashboard/topics/${t.id}`}
                  className="block p-3 rounded-xl bg-app-surface/50 border border-app-border hover:border-app-purple/30 transition-colors group"
                >
                  <p className="text-sm font-medium text-app-text group-hover:text-app-purple transition-colors line-clamp-2">
                    {t.title}
                  </p>
                  <p className="text-xs text-app-muted mt-1">
                    {(t.comments_count ?? 0)} commentaire{(t.comments_count ?? 0) !== 1 ? 's' : ''}
                  </p>
                </Link>
              ))}
              {topics.length === 0 && (
                <p className="text-sm text-app-muted">Aucun sujet pour le moment</p>
              )}
            </div>
            <Link
              to="/dashboard/topics"
              className="mt-4 block text-center text-sm text-app-purple hover:underline"
            >
              Voir tout le forum
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
