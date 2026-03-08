/**
 * Utilisateurs — Interface ultra-moderne SaaS
 * Table moderne, recherche, filtres, pagination
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ban, Trash2, Search, MessageCircle, User } from 'lucide-react';
import api, { getErrorMessage } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

const statusConfig = {
  active: { label: 'Actif', class: 'bg-admin-success/20 text-admin-success border-admin-success/30' },
  banned: { label: 'Banni', class: 'bg-admin-danger/20 text-admin-danger border-admin-danger/30' },
  deleted: { label: 'Supprimé', class: 'bg-admin-muted/20 text-admin-muted border-admin-border' },
};

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
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

  const filteredUsers = users.filter((u) => {
    const matchSearch = !search.trim() || 
      (u.pseudo || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.id || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleBan = async (id) => {
    if (!window.confirm('Bannir cet utilisateur ?')) return;
    try {
      await api.post(`/api/admin/users/${id}/ban`);
      fetchUsers();
      toast.success('Utilisateur banni');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Erreur'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      fetchUsers();
      toast.success('Utilisateur supprimé');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Erreur'));
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-admin-text">Utilisateurs</h1>
        <p className="text-admin-muted mt-1">Gérez les comptes utilisateurs</p>
      </motion.div>

      {/* Barre de recherche + filtres */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-admin-muted" strokeWidth={1.5} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par pseudo, email ou ID..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-admin-surface border border-admin-border text-admin-text placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-admin-purple/50 focus:border-admin-purple"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'banned'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filterStatus === s
                  ? 'bg-admin-purple text-white'
                  : 'bg-admin-surface border border-admin-border text-admin-muted hover:text-admin-text hover:border-admin-purple/30'
              }`}
            >
              {s === 'all' ? 'Tous' : statusConfig[s]?.label || s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-admin-border overflow-hidden bg-admin-card/30 backdrop-blur-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-admin-border bg-admin-surface/50">
                <th className="px-6 py-4 text-sm font-semibold text-admin-muted">Pseudo / ID</th>
                <th className="px-6 py-4 text-sm font-semibold text-admin-muted">Statut</th>
                <th className="px-6 py-4 text-sm font-semibold text-admin-muted">Date création</th>
                <th className="px-6 py-4 text-sm font-semibold text-admin-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 rounded-full border-2 border-admin-purple/30 border-t-admin-purple animate-spin" />
                      <span className="text-admin-muted">Chargement...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-admin-muted">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-admin-border hover:bg-admin-surface/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-admin-purple/20 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-admin-purple" strokeWidth={1.5} />
                        </div>
                        <div>
                          <span className="font-medium text-admin-text">{u.pseudo || u.id?.slice(0, 8) || '—'}</span>
                          {u.email && (
                            <p className="text-xs text-admin-muted truncate max-w-[180px]">{u.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-lg text-xs font-medium border ${
                          statusConfig[u.status]?.class || statusConfig.deleted.class
                        }`}
                      >
                        {statusConfig[u.status]?.label || u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-admin-muted">
                      {new Date(u.created_at).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {u.status === 'active' && (
                          <>
                            <Link to="/admin/conversations">
                              <motion.span
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex p-2 rounded-lg text-admin-blue hover:bg-admin-blue/20"
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
                              className="p-2 rounded-lg text-admin-warning hover:bg-admin-warning/20"
                              title="Bannir"
                            >
                              <Ban className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              type="button"
                              onClick={() => handleDelete(u.id)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 rounded-lg text-admin-danger hover:bg-admin-danger/20"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination */}
      {total > limit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between"
        >
          <p className="text-sm text-admin-muted">
            {page * limit + 1}-{Math.min((page + 1) * limit, total)} / {total}
          </p>
          <div className="flex gap-2">
            <motion.button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-xl bg-admin-surface border border-admin-border text-admin-text text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-admin-card"
            >
              Précédent
            </motion.button>
            <motion.button
              type="button"
              disabled={(page + 1) * limit >= total}
              onClick={() => setPage((p) => p + 1)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-xl bg-admin-surface border border-admin-border text-admin-text text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-admin-card"
            >
              Suivant
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
