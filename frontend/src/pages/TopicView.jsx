/**
 * Détail d'un sujet — Design corporate premium
 */

import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import Skeleton from '../components/ui/Skeleton';

export default function TopicView() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const backTo = isDashboard ? '/dashboard/topics' : '/topics';
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get(`/api/topics/${id}`)
      .then(({ data }) => {
        setTopic(data);
        setError(null);
      })
      .catch(() => setError('Sujet introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl py-8">
        <Skeleton height={24} width={120} className="mb-6" />
        <Skeleton height={32} className="mb-4" />
        <Skeleton height={16} width={180} className="mb-8" />
        <div className="rounded-2xl bg-corum-night/60 border border-white/10 p-8 space-y-4">
          <Skeleton height={16} />
          <Skeleton height={16} />
          <Skeleton height={16} width="80%" />
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <p className="text-corum-gray mb-4">{error || 'Sujet introuvable'}</p>
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 text-corum-turquoise hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux sujets
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl py-8"
    >
      <Link
        to={backTo}
        className="inline-flex items-center gap-2 text-sm text-corum-gray hover:text-corum-offwhite mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Sujets
      </Link>
      <h1 className="text-2xl font-bold text-corum-offwhite mb-2">{topic.title}</h1>
      <p className="text-sm text-corum-gray mb-8">
        {new Date(topic.published_at).toLocaleString('fr-FR')}
      </p>
      <div className="rounded-2xl bg-corum-night/60 backdrop-blur-xl border border-white/10 p-8">
        <div className="text-corum-offwhite whitespace-pre-wrap leading-relaxed">{topic.content}</div>
      </div>
      {isDashboard && (
        <motion.button
          type="button"
          onClick={() => navigate('/dashboard/chat', { state: { topicId: topic.id, topicTitle: topic.title } })}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-corum-turquoise/20 text-corum-turquoise hover:bg-corum-turquoise/30 transition-colors font-medium"
        >
          Écrire à l'administrateur à propos de ce sujet
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      )}
    </motion.article>
  );
}
