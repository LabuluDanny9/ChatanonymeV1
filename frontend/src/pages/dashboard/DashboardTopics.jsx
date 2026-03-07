/**
 * Sujets — Style Reddit/Discord
 * Cards, recherche, bouton Écrire à l'admin
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, ArrowRight, Search, MessageCircle } from 'lucide-react';
import api from '../../lib/api';
import { decodeHtmlEntities } from '../../lib/textUtils';
import { SkeletonCard } from '../../components/ui/Skeleton';

export default function DashboardTopics() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const limit = 12;

  useEffect(() => {
    api
      .get('/api/topics', { params: { limit, offset: page * limit } })
      .then(({ data }) => {
        setTopics(data.topics || []);
        setTotal(data.total || 0);
        setError(null);
      })
      .catch(() => setError('Impossible de charger les sujets'))
      .finally(() => setLoading(false));
  }, [page]);

  const handleWriteAboutTopic = (topic) => {
    navigate('/dashboard/chat', { state: { topicId: topic.id, topicTitle: topic.title } });
  };

  const filteredTopics = search.trim()
    ? topics.filter(
        (t) =>
          (t.title || '').toLowerCase().includes(search.toLowerCase()) ||
          (t.content || '').toLowerCase().includes(search.toLowerCase())
      )
    : topics;

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  if (loading && page === 0) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-app-surface rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-app-card/50 rounded-2xl animate-pulse border border-app-border" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-app-text">Forum</h1>
        <p className="text-app-muted text-sm mt-1">Discussions et sujets publics</p>
      </motion.div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted" strokeWidth={1.5} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher des sujets..."
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-app-card border border-app-border text-app-text placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-app-purple/50"
        />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-xl bg-app-danger/20 text-app-danger border border-app-danger/30"
        >
          {error}
        </motion.div>
      )}

      {filteredTopics.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-app-purple/10 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-app-purple/60" strokeWidth={1.5} />
          </div>
          <p className="text-app-muted">
            {search ? 'Aucun sujet ne correspond à votre recherche.' : 'Aucun sujet pour le moment.'}
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredTopics.map((t) => (
            <motion.div key={t.id} variants={item} className="flex flex-col">
              <div className="flex-1 rounded-2xl bg-app-card/50 backdrop-blur-sm border border-app-border p-6 transition-all hover:border-app-purple/30 group">
                <div className="w-12 h-12 rounded-xl bg-app-purple/20 flex items-center justify-center mb-4 group-hover:bg-app-purple/30 transition-colors">
                  <FileText className="w-6 h-6 text-app-purple" strokeWidth={1.5} />
                </div>
                <Link to={`/dashboard/topics/${t.id}`} className="block">
                  <h3 className="font-semibold text-app-text mb-2 line-clamp-2 group-hover:text-app-purple transition-colors">
                    {t.title}
                  </h3>
                  <p className="text-sm text-app-muted line-clamp-2">
                    {decodeHtmlEntities(t.content || '').slice(0, 120)}
                    {(t.content?.length || 0) > 120 ? '...' : ''}
                  </p>
                  <div className="flex items-center gap-2 mt-4 text-xs text-app-muted">
                    <MessageCircle className="w-4 h-4" />
                    {t.comments_count ?? 0} commentaire{(t.comments_count ?? 0) !== 1 ? 's' : ''}
                  </div>
                  <p className="text-xs text-app-muted/80 mt-2">
                    {new Date(t.published_at).toLocaleDateString('fr-FR')}
                  </p>
                </Link>
                <motion.button
                  type="button"
                  onClick={() => handleWriteAboutTopic(t)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-app-purple/20 text-app-purple hover:bg-app-purple/30 transition-colors text-sm font-medium"
                >
                  Écrire à l'administrateur
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {total > limit && !search && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center gap-4 flex-wrap"
        >
          <motion.button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-xl bg-app-card border border-app-border text-app-text text-sm disabled:opacity-50 hover:bg-app-surface"
          >
            Précédent
          </motion.button>
          <span className="text-sm text-app-muted">
            {page * limit + 1}-{Math.min((page + 1) * limit, total)} / {total}
          </span>
          <motion.button
            type="button"
            disabled={(page + 1) * limit >= total}
            onClick={() => setPage((p) => p + 1)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-xl bg-app-card border border-app-border text-app-text text-sm disabled:opacity-50 hover:bg-app-surface"
          >
            Suivant
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
