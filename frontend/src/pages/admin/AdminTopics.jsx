/**
 * Sujets — Interface professionnelle
 * Cards, éditeur, aperçu en direct
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../../lib/api';
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
    setForm({ id: t.id, title: t.title, content: t.content || '' });
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
      <div className="space-y-6">
        <div className="h-10 w-48 bg-slate-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-slate-800">Sujets</h1>
          <p className="text-chat-muted mt-1">Gérez les sujets publiés</p>
        </motion.div>
        <motion.button
          type="button"
          onClick={handleCreate}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
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
            whileHover={{ y: -2 }}
            className="p-6 rounded-xl bg-white border border-chat-border shadow-sm hover:shadow-soft hover:border-blue-200 transition-all"
          >
            <h3 className="font-semibold text-slate-800 mb-2">{t.title}</h3>
            <p className="text-sm text-chat-muted mb-4 line-clamp-3">{t.content || '—'}</p>
            <p className="text-xs text-chat-muted mb-4">{new Date(t.published_at).toLocaleString('fr-FR')}</p>
            <div className="flex gap-2">
              <motion.button
                type="button"
                onClick={() => handleEdit(t)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600 text-sm font-medium"
              >
                <Pencil className="w-4 h-4" /> Modifier
              </motion.button>
              <motion.button
                type="button"
                onClick={() => handleDelete(t.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-red-600 hover:bg-red-50 text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" /> Supprimer
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal éditeur */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl bg-white border border-chat-border shadow-xl flex flex-col"
          >
            <div className="p-6 border-b border-chat-border">
              <h2 className="text-xl font-bold text-slate-800">
                {modal === 'create' ? 'Nouveau sujet' : 'Modifier le sujet'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-auto p-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Titre</label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                        className="w-full rounded-xl bg-slate-50 border border-chat-border px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Contenu</label>
                      <textarea
                        value={form.content}
                        onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                        className="w-full rounded-xl bg-slate-50 border border-chat-border px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 min-h-[160px]"
                        rows={6}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Aperçu</label>
                    <div className="rounded-xl bg-slate-50 border border-chat-border p-4 min-h-[200px]">
                      <h3 className="font-semibold text-slate-800 mb-2">{form.title || 'Titre...'}</h3>
                      <p className="text-sm text-chat-muted whitespace-pre-wrap">{form.content || 'Contenu...'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-chat-border flex justify-end gap-3">
                <motion.button
                  type="button"
                  onClick={() => setModal(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium"
                >
                  Annuler
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
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
