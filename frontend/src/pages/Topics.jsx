/**
 * Forum — Style Reddit/Discord
 * Sujets, recherche, filtres
 */

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Search, MessageCircle, ThumbsUp, Globe } from 'lucide-react';
import api from '../lib/api';
import { decodeHtmlEntities } from '../lib/textUtils';

const FILTERS = [
  { id: 'recent', label: 'Récents' },
  { id: 'discussed', label: 'Plus discutés' },
  { id: 'popular', label: 'Populaires' },
];

export default function Topics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('recent');

  useEffect(() => {
    api
      .get('/api/topics', { params: { limit: 50, offset: 0 } })
      .then(({ data }) => {
        setTopics(data.topics || []);
        setError(null);
      })
      .catch(() => setError('Impossible de charger les sujets'))
      .finally(() => setLoading(false));
  }, []);

  const filteredTopics = useMemo(() => {
    let list = [...topics];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          (t.title || '').toLowerCase().includes(q) ||
          (t.content || '').toLowerCase().includes(q)
      );
    }
    if (filter === 'discussed' || filter === 'popular') {
      list.sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0));
    } else {
      list.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
    }
    return list;
  }, [topics, search, filter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg py-6">
        <div className="max-w-[680px] mx-auto px-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-app-card/50 rounded-2xl p-6 space-y-4 border border-app-border animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-app-surface animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-app-surface rounded animate-pulse" />
                  <div className="h-3 w-24 bg-app-surface rounded animate-pulse" />
                </div>
              </div>
              <div className="h-5 w-3/4 bg-app-surface rounded animate-pulse" />
              <div className="h-4 w-full bg-app-surface rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg text-app-text">
      <div className="bg-app-surface/80 backdrop-blur-sm border-b border-app-border sticky top-0 z-10">
        <div className="max-w-[680px] mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-app-text mb-4">Forum</h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Rechercher des publications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-app-card border border-app-border text-app-text placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-app-purple/50 focus:border-app-purple text-[15px]"
            />
          </div>
          <div className="flex gap-2 mt-3">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-xl text-[14px] font-medium transition-colors ${
                  filter === f.id
                    ? 'bg-app-purple text-white'
                    : 'bg-app-card border border-app-border text-app-muted hover:text-app-text hover:border-app-purple/30'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[680px] mx-auto px-4 py-6">
        {error && (
          <div className="p-4 rounded-xl bg-app-danger/20 text-app-danger border border-app-danger/30 mb-4">{error}</div>
        )}

        {filteredTopics.length === 0 ? (
          <div className="bg-app-card/50 rounded-2xl p-12 text-center border border-app-border">
            <FileText className="w-16 h-16 text-app-muted mx-auto mb-4 opacity-50" strokeWidth={1} />
            <p className="text-app-muted">
              {search ? 'Aucune publication ne correspond à votre recherche.' : 'Aucune publication pour le moment.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTopics.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/topics/${t.id}`}>
                  <article className="bg-app-card/50 rounded-2xl overflow-hidden border border-app-border hover:border-app-purple/30 transition-all">
                    <div className="p-4 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-app-purple/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img src="/logo.png" alt="ChatAnonyme" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-app-text">ChatAnonyme</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-app-purple/20 text-app-purple">
                            Admin
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-app-muted text-[13px] mt-0.5">
                          <span>{new Date(t.published_at).toLocaleDateString('fr-FR')}</span>
                          <span>·</span>
                          <Globe className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                    <div className="px-4 pb-4">
                      <h2 className="text-[17px] font-semibold text-app-text mb-2 line-clamp-2">
                        {t.title}
                      </h2>
                      <p className="text-app-muted text-[15px] line-clamp-2">
                        {decodeHtmlEntities(t.content || '').slice(0, 150)}
                        {(t.content?.length || 0) > 150 ? '...' : ''}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-app-muted text-[13px]">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {t.comments_count ?? 0} commentaire{(t.comments_count ?? 0) !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          J'aime
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
