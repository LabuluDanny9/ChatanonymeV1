/**
 * Administrateurs — Liste et ajout d'administrateurs
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Shield, Trash2 } from 'lucide-react';
import api, { getErrorMessage, ensureAuthToken } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function AdminAdmins() {
  const toast = useToast();
  const { admin: currentAdmin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const canManageAdmins = currentAdmin?.isPrimaryAdmin === true;

  const fetchAdmins = () => {
    ensureAuthToken('admin');
    api.get('/api/admin/admins').then(({ data }) => {
      setAdmins(data.admins || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email?.trim() || !form.password) {
      toast.error('Email et mot de passe requis');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    setSending(true);
    ensureAuthToken('admin');
    try {
      await api.post('/api/admin/admins', {
        email: form.email.trim(),
        password: form.password,
      });
      toast.success('Administrateur créé');
      setModal(false);
      setForm({ email: '', password: '', confirmPassword: '' });
      fetchAdmins();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erreur lors de la création'));
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id, email) => {
    if (!canManageAdmins) return;
    if (!window.confirm(`Retirer l’accès administrateur à ${email} ?`)) return;
    setDeletingId(id);
    ensureAuthToken('admin');
    try {
      await api.delete(`/api/admin/admins/${id}`);
      toast.success('Administrateur supprimé');
      fetchAdmins();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Suppression impossible'));
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-10 w-48 bg-admin-surface rounded-xl animate-pulse" />
        <div className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-admin-card/50 rounded-xl animate-pulse border border-admin-border" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-admin-text">Administrateurs</h1>
          <p className="text-admin-muted mt-1">Gérez les comptes administrateurs de la plateforme</p>
        </motion.div>
        {canManageAdmins && (
          <motion.button
            type="button"
            onClick={() => setModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-admin-purple text-white font-medium hover:bg-admin-purple/90 shadow-admin-glow"
          >
            <UserPlus className="w-5 h-5" /> Ajouter un administrateur
          </motion.button>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-admin-card/50 border border-admin-border overflow-hidden backdrop-blur-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-admin-border">
                <th className="text-left py-4 px-6 text-sm font-medium text-admin-muted">Email</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-admin-muted">Inscrit le</th>
                {canManageAdmins && (
                  <th className="text-right py-4 px-6 text-sm font-medium text-admin-muted w-24">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {admins.map((a, i) => (
                <motion.tr
                  key={a.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-admin-border/50 hover:bg-admin-surface/30 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="w-10 h-10 rounded-xl bg-admin-purple/20 flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-admin-purple" strokeWidth={1.5} />
                      </div>
                      <span className="font-medium text-admin-text">{a.email}</span>
                      {a.isPrimaryAdmin && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-admin-purple/20 text-admin-purple border border-admin-purple/30">
                          Principal
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-admin-muted">{formatDate(a.created_at)}</td>
                  {canManageAdmins && (
                    <td className="py-4 px-6 text-right">
                      {!a.isPrimaryAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDelete(a.id, a.email)}
                          disabled={deletingId === a.id}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-admin-danger hover:bg-admin-danger/10 border border-admin-danger/20 disabled:opacity-50"
                          title="Supprimer cet administrateur"
                        >
                          <Trash2 className="w-4 h-4" />
                          {deletingId === a.id ? '…' : 'Supprimer'}
                        </button>
                      )}
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {admins.length === 0 && (
          <div className="py-12 text-center text-admin-muted">
            Aucun administrateur. Cliquez sur « Ajouter un administrateur » pour en créer un.
          </div>
        )}
      </motion.div>

      {/* Modal ajout */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-admin-card border border-admin-border shadow-admin-glow p-6"
          >
            <h2 className="text-xl font-bold text-admin-text mb-2">Ajouter un administrateur</h2>
            <p className="text-sm text-admin-muted mb-6">
              Le nouvel administrateur pourra se connecter avec l'email et le mot de passe définis ci-dessous.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-admin-muted mb-2">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-xl bg-admin-surface border border-admin-border px-4 py-3 text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-purple/50 focus:border-admin-purple"
                  placeholder="admin@exemple.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-admin-muted mb-2">Mot de passe</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full rounded-xl bg-admin-surface border border-admin-border px-4 py-3 text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-purple/50 focus:border-admin-purple"
                  placeholder="Minimum 6 caractères"
                  minLength={6}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-admin-muted mb-2">Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  className="w-full rounded-xl bg-admin-surface border border-admin-border px-4 py-3 text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-purple/50 focus:border-admin-purple"
                  placeholder="Confirmer"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <motion.button
                  type="button"
                  onClick={() => { setModal(false); setForm({ email: '', password: '', confirmPassword: '' }); }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-xl bg-admin-surface text-admin-muted hover:bg-admin-border font-medium"
                >
                  Annuler
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={sending}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-xl bg-admin-purple text-white font-medium hover:bg-admin-purple/90 disabled:opacity-50"
                >
                  {sending ? 'Création...' : 'Créer'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
