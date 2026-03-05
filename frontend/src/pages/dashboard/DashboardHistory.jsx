/**
 * Historique — Timeline conversations, sujets traités
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, FileText, Search } from 'lucide-react';
import api from '../../lib/api';
import Skeleton from '../../components/ui/Skeleton';

export default function DashboardHistory() {
  const [messages, setMessages] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/api/messages').catch(() => ({ data: { messages: [] } })),
      api.get('/api/topics', { params: { limit: 20 } }).catch(() => ({ data: { topics: [] } })),
    ]).then(([msgRes, topicRes]) => {
      setMessages(msgRes.data?.messages || []);
      setTopics(topicRes.data?.topics || []);
    }).finally(() => setLoading(false));
  }, []);

  const filteredMessages = messages.filter(
    (m) => !search || (m.content || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={32} width={200} />
        <Skeleton height={48} className="mb-4" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height={80} />
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
        <h1 className="text-2xl font-bold text-corum-offwhite">Historique</h1>
        <p className="text-corum-gray text-sm mt-1">Conversations et sujets traités</p>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-corum-gray" strokeWidth={1.5} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-corum-night/60 border border-white/10 text-corum-offwhite placeholder-corum-gray focus:outline-none focus:ring-2 focus:ring-corum-turquoise/50"
        />
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-corum-offwhite mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-corum-turquoise" strokeWidth={1.5} />
            Conversations
          </h2>
          {filteredMessages.length === 0 ? (
            <div className="rounded-2xl bg-corum-night/60 border border-white/10 p-8 text-center">
              <p className="text-corum-gray">Aucune conversation</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMessages.slice(0, 20).map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-xl bg-corum-night/60 border border-white/10 p-4 flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-corum-turquoise/20 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5 text-corum-turquoise" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-corum-offwhite line-clamp-2">{msg.content}</p>
                    <p className="text-xs text-corum-gray mt-1">
                      {new Date(msg.created_at).toLocaleString('fr-FR')} •{' '}
                      {msg.sender_type === 'admin' ? 'Admin' : 'Vous'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-corum-offwhite mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-corum-turquoise" strokeWidth={1.5} />
            Sujets
          </h2>
          {topics.length === 0 ? (
            <div className="rounded-2xl bg-corum-night/60 border border-white/10 p-8 text-center">
              <p className="text-corum-gray">Aucun sujet</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {topics.slice(0, 8).map((t) => (
                <Link key={t.id} to={`/dashboard/topics/${t.id}`}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="rounded-xl bg-corum-night/60 border border-white/10 p-4 h-full hover:border-corum-turquoise/30 transition-colors"
                  >
                    <h3 className="font-medium text-corum-offwhite line-clamp-2">{t.title}</h3>
                    <p className="text-xs text-corum-gray mt-1">
                      {new Date(t.published_at).toLocaleDateString('fr-FR')}
                    </p>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
