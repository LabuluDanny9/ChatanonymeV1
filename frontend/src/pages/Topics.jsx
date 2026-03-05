/**
 * Topics publics — Cards glassmorphism
 * Scroll reveal, hover lift, turquoise highlight
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import api from '../lib/api';
import { SkeletonCard } from '../components/ui/Skeleton';

export default function Topics() {
  const [topics, setTopics] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading && page === 0) {
    return (
      <div className="py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-corum-offwhite">Sujets</h2>
          <p className="text-corum-gray text-sm mt-1">Publications publiques</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-corum-offwhite">Sujets</h2>
        <p className="text-corum-gray text-sm mt-1">Publications publiques</p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-xl bg-corum-red/10 text-corum-red mb-6"
        >
          {error}
        </motion.div>
      )}

      {topics.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-corum-turquoise/10 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-corum-turquoise/60" strokeWidth={1.5} />
          </div>
          <p className="text-corum-gray">Aucun sujet pour le moment.</p>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {topics.map((t, i) => (
            <motion.div key={t.id} variants={item}>
              <Link to={`/topics/${t.id}`}>
                <motion.div
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="rounded-2xl bg-corum-night/60 backdrop-blur-xl border border-white/10 p-6 h-full transition-all duration-300 hover:border-corum-turquoise/30 hover:shadow-lg hover:shadow-corum-turquoise/5 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-corum-turquoise/10 flex items-center justify-center mb-4 group-hover:bg-corum-turquoise/20 transition-colors">
                    <FileText className="w-6 h-6 text-corum-turquoise" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-semibold text-corum-offwhite mb-2 line-clamp-2 group-hover:text-corum-turquoise/90 transition-colors">
                    {t.title}
                  </h3>
                  <p className="text-sm text-corum-gray line-clamp-2">
                    {t.content?.slice(0, 120)}
                    {(t.content?.length || 0) > 120 ? '...' : ''}
                  </p>
                  <p className="text-xs text-corum-gray/80 mt-4">
                    {new Date(t.published_at).toLocaleDateString('fr-FR')}
                  </p>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {total > limit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-10 flex justify-center items-center gap-4 flex-wrap"
        >
          <motion.button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-xl bg-corum-night/80 border border-white/10 text-corum-offwhite text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </motion.button>
          <span className="text-sm text-corum-gray">
            {page * limit + 1}-{Math.min((page + 1) * limit, total)} / {total}
          </span>
          <motion.button
            type="button"
            disabled={(page + 1) * limit >= total}
            onClick={() => setPage((p) => p + 1)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-xl bg-corum-night/80 border border-white/10 text-corum-offwhite text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
