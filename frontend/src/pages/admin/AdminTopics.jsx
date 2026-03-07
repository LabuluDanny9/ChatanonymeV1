/**
 * Sujets / Forum — Interface ultra-moderne SaaS
 * Cards, éditeur riche, aperçu en direct
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Eye, MessageCircle } from 'lucide-react';
import api from '../../lib/api';
import { decodeHtmlEntities } from '../../lib/textUtils';
import { useToast } from '../../context/ToastContext';

export default function AdminTopics() {
  const toast = useToast();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ title: '', content: '' });

  const fetchTopics = () => {
    api.get('/api/admin/topics').then(({ data }) => {
      setTopics(data.topics || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleCreate = () => {
    setModal('create');
    setForm({ title: '', content: '' });
  };

  const handleEdit = (t) => {
    setModal('edit');
    setForm({ id: t.id, title: t.title, content: decodeHtmlEntities(t.content || '') });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      if (modal === 'create') {
        await api.post('/api/admin/topics', { title: form.title.trim(), content: form.content.trim() });
        toast.success('Sujet créé');
      } else {
        await api.put(`/api/admin/topics/${form.id}`, { title: form.title.trim(), content: form.content.trim() });
        toast.success('Sujet modifié');
      }
      setModal(null);
      fetchTopics();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce sujet ?')) return;
    try {
      await api.delete(`/api/admin/topics/${id}`);
      fetchTopics();
      toast.success('Sujet supprimé');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur');
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-10 w-48 bg-admin-surface rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-admin-card/50 rounded-2xl animate-pulse border border-admin-border" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-admin-text">Forum / Sujets</h1>
          <p className="text-admin-muted mt-1">Gérez les sujets et discussions</p>
        </motion.div>
        <motion.button
          type="button"
          onClick={handleCreate}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-admin-purple text-white font-medium hover:bg-admin-purple/90 shadow-admin-glow"
        >
          <Plus className="w-5 h-5" /> Nouveau sujet
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {topics.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className="p-6 rounded-2xl bg-admin-card/50 border border-admin-border backdrop-blur-sm hover:border-admin-purple/30 transition-all shadow-admin-card"
          >
            <h3 className="font-semibold text-admin-text mb-2">{t.title}</h3>
            <p className="text-sm text-admin-muted mb-4 line-clamp-3">{decodeHtmlEntities(t.content || '—')}</p>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-xs text-admin-muted">{new Date(t.published_at).toLocaleString('fr-FR')}</p>
              <span className="flex items-center gap-1.5 text-xs font-medium text-admin-purple bg-admin-purple/20 px-2 py-1 rounded-lg">
                <MessageCircle className="w-3.5 h-3.5" />
                {(t.comments_count ?? 0)} commentaire{(t.comments_count ?? 0) !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link
                to={`/admin/topics/${t.id}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-admin-purple/20 text-admin-purple hover:bg-admin-purple/30 text-sm font-medium"
              >
                <Eye className="w-4 h-4" /> Voir
              </Link>
              <motion.button
                type="button"
                onClick={() => handleEdit(t)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-admin-surface text-admin-muted hover:bg-admin-blue/20 hover:text-admin-blue text-sm font-medium"
              >
                <Pencil className="w-4 h-4" /> Modifier
              </motion.button>
              <motion.button
                type="button"
                onClick={() => handleDelete(t.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-admin-surface text-admin-danger hover:bg-admin-danger/20 text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" /> Supprimer
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal éditeur */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-admin-card border border-admin-border shadow-admin-glow flex flex-col"
          >
            <div className="p-6 border-b border-admin-border">
              <h2 className="text-xl font-bold text-admin-text">
                {modal === 'create' ? 'Nouveau sujet' : 'Modifier le sujet'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-auto p-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-admin-muted mb-2">Titre</label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                        className="w-full rounded-xl bg-admin-surface border border-admin-border px-4 py-3 text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-purple/50 focus:border-admin-purple"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-muted mb-2">Contenu</label>
                      <textarea
                        value={form.content}
                        onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                        className="w-full rounded-xl bg-admin-surface border border-admin-border px-4 py-3 text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-purple/50 focus:border-admin-purple min-h-[160px]"
                        rows={6}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-admin-muted mb-2">Aperçu</label>
                    <div className="rounded-xl bg-admin-surface border border-admin-border p-4 min-h-[200px]">
                      <h3 className="font-semibold text-admin-text mb-2">{form.title || 'Titre...'}</h3>
                      <p className="text-sm text-admin-muted whitespace-pre-wrap">{form.content || 'Contenu...'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-admin-border flex justify-end gap-3">
                <motion.button
                  type="button"
                  onClick={() => setModal(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2 rounded-xl bg-admin-surface text-admin-muted hover:bg-admin-border font-medium"
                >
                  Annuler
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 rounded-xl bg-admin-purple text-white font-medium hover:bg-admin-purple/90"
                >
                  {modal === 'create' ? 'Créer' : 'Enregistrer'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
