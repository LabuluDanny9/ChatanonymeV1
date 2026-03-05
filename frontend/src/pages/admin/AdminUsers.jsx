/**
 * Utilisateurs — Interface professionnelle
 * Table moderne, recherche, actions
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ban, Trash2, Search, MessageCircle } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';

const statusColors = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  banned: 'bg-red-100 text-red-700 border-red-200',
  deleted: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const limit = 20;

  const fetchUsers = () => {
    setLoading(true);
    api.get('/api/admin/users', { params: { limit, offset: page * limit } }).then(({ data }) => {
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const filteredUsers = search.trim()
    ? users.filter((u) =>
        (u.pseudo || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const handleBan = async (id) => {
    if (!window.confirm('Bannir cet utilisateur ?')) return;
    try {
      await api.post(`/api/admin/users/${id}/ban`);
      fetchUsers();
      toast.success('Utilisateur banni');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      fetchUsers();
      toast.success('Utilisateur supprimé');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-slate-800">Utilisateurs</h1>
        <p className="text-chat-muted mt-1">Gérez les comptes utilisateurs</p>
      </motion.div>

      {/* Recherche */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" strokeWidth={1.5} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par pseudo ou email..."
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-chat-border text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
        />
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-chat-border overflow-hidden bg-white shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-chat-border bg-slate-50">
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Pseudo / ID</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Statut</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Date création</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-chat-muted">
                    Chargement...
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-chat-border hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800">{u.pseudo || u.id?.slice(0, 8) || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${
                          statusColors[u.status] || statusColors.deleted
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-chat-muted">
                      {new Date(u.created_at).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.status === 'active' && (
                        <div className="flex justify-end gap-2">
                          <Link to="/admin/conversations">
                            <motion.span
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="inline-flex p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                              title="Voir conversation"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </motion.span>
                          </Link>
                          <motion.button
                            type="button"
                            onClick={() => handleBan(u.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 rounded-lg text-amber-600 hover:bg-amber-50"
                            title="Bannir"
                          >
                            <Ban className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            type="button"
                            onClick={() => handleDelete(u.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-chat-muted">
            {page * limit + 1}-{Math.min((page + 1) * limit, total)} / {total}
          </p>
          <div className="flex gap-2">
            <motion.button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-xl bg-white border border-chat-border text-slate-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Précédent
            </motion.button>
            <motion.button
              type="button"
              disabled={(page + 1) * limit >= total}
              onClick={() => setPage((p) => p + 1)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-xl bg-white border border-chat-border text-slate-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Suivant
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
