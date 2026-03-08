/**
 * Dashboard Admin — Interface ultra-moderne SaaS
 * Mode sombre • Glassmorphism • Accents violet néon
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  MessageCircle,
  FileText,
  Megaphone,
  TrendingUp,
  Send,
  ShieldAlert,
  UserPlus,
  Ban,
  Trash2,
  Bell,
} from 'lucide-react';
import api, { getErrorMessage } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const AVATAR_OPTIONS = ['😊', '🎭', '🌟', '🔒', '🦋', '🌙', '🌸', '🦊', '🌈', '🦉', '🌻', '🐱'];

const StatCard = ({ icon: Icon, label, value, to, delay = 0, gradient }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
  >
    <Link to={to}>
      <div className="p-6 rounded-2xl bg-admin-card/50 border border-admin-border backdrop-blur-sm hover:border-admin-purple/30 transition-all duration-300 group shadow-admin-card">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-admin-purple" strokeWidth={1.5} />
        </div>
        <p className="text-3xl font-bold text-admin-text">{value ?? 0}</p>
        <p className="text-sm text-admin-muted mt-1">{label}</p>
      </div>
    </Link>
  </motion.div>
);

const QuickAction = ({ icon: Icon, label, to, color }) => (
  <Link to={to}>
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-3 p-4 rounded-xl bg-admin-surface/50 border border-admin-border hover:border-admin-purple/30 transition-colors"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" strokeWidth={1.5} />
      </div>
      <span className="text-sm font-medium text-admin-text">{label}</span>
    </motion.div>
  </Link>
);

export default function AdminDashboard() {
  const { admin, updateAdminPhoto } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoSending, setPhotoSending] = useState(false);
  const [avatarEmoji, setAvatarEmoji] = useState(
    admin?.photo && !admin.photo.startsWith('http') && admin.photo.length <= 4 ? admin.photo : AVATAR_OPTIONS[0]
  );

  useEffect(() => {
    api.get('/api/admin/stats').then(({ data }) => {
      setStats(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastContent.trim() || broadcastSending) return;
    setBroadcastSending(true);
    try {
      await api.post('/api/admin/broadcast', { content: broadcastContent.trim() });
      setBroadcastContent('');
      toast.success('Message envoyé à tous les utilisateurs');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Erreur'));
    } finally {
      setBroadcastSending(false);
    }
  };

  const handlePhotoSubmit = async (e) => {
    e.preventDefault();
    const photo = photoUrl.trim() || avatarEmoji;
    if (!photo || photoSending) return;
    setPhotoSending(true);
    try {
      const { data } = await api.put('/api/admin/photo', { photo });
      updateAdminPhoto(data.photo);
      toast.success('Avatar mis à jour');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Erreur'));
    } finally {
      setPhotoSending(false);
    }
  };

  const activityData = stats?.activityData || [];
  const maxActivity = Math.max(...activityData.map((d) => d.c), 1);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-48 bg-admin-surface rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-admin-card/50 rounded-2xl animate-pulse border border-admin-border" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-64 bg-admin-card/30 rounded-2xl animate-pulse border border-admin-border" />
          <div className="h-64 bg-admin-card/30 rounded-2xl animate-pulse border border-admin-border" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-admin-text">Tableau de bord</h1>
        <p className="text-admin-muted mt-1">Vue d'ensemble de la plateforme</p>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Utilisateurs"
          value={stats?.usersCount}
          to="/admin/users"
          delay={0.1}
          gradient="from-admin-purple/20 to-admin-purple/5"
        />
        <StatCard
          icon={MessageCircle}
          label="Conversations actives"
          value={stats?.openConversationsCount}
          to="/admin/conversations"
          delay={0.15}
          gradient="from-admin-blue/20 to-admin-blue/5"
        />
        <StatCard
          icon={TrendingUp}
          label="Messages aujourd'hui"
          value={stats?.messagesToday}
          to="/admin/conversations"
          delay={0.2}
          gradient="from-admin-purple/20 to-admin-purple/5"
        />
        <StatCard
          icon={FileText}
          label="Sujets publiés"
          value={stats?.topicsCount}
          to="/admin/topics"
          delay={0.25}
          gradient="from-admin-blue/20 to-admin-blue/5"
        />
      </div>

      {/* Graphiques + Activité récente */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 p-6 rounded-2xl bg-admin-card/30 border border-admin-border backdrop-blur-sm"
        >
          <h3 className="font-semibold text-admin-text mb-6">Activité (7 derniers jours)</h3>
          <div className="h-48 flex items-end gap-2">
            {activityData.length ? (
              activityData.map((d, i) => (
                <div key={d.d} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(4, (d.c / maxActivity) * 100)}%` }}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.05 }}
                    className="w-full rounded-t bg-gradient-to-t from-admin-purple to-admin-purple/60 hover:from-admin-purple/90 transition-colors min-h-[4px]"
                  />
                  <span className="text-xs text-admin-muted">
                    {new Date(d.d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center text-admin-muted text-sm">Aucune donnée</div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="p-6 rounded-2xl bg-admin-card/30 border border-admin-border backdrop-blur-sm"
        >
          <h3 className="font-semibold text-admin-text mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-admin-purple" /> Actions rapides
          </h3>
          <div className="space-y-3">
            <QuickAction icon={Ban} label="Bannir un utilisateur" to="/admin/users" color="bg-admin-danger/20 text-admin-danger" />
            <QuickAction icon={Trash2} label="Supprimer un post" to="/admin/topics" color="bg-admin-warning/20 text-admin-warning" />
            <QuickAction icon={ShieldAlert} label="Voir les signalements" to="/admin/reports" color="bg-admin-purple/20 text-admin-purple" />
            <QuickAction icon={UserPlus} label="Nouveaux inscrits" to="/admin/users" color="bg-admin-blue/20 text-admin-blue" />
          </div>
        </motion.div>
      </div>

      {/* Répartition + Message collectif */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-admin-card/30 border border-admin-border backdrop-blur-sm"
        >
          <h3 className="font-semibold text-admin-text mb-6">Répartition</h3>
          <div className="space-y-4">
            {[
              { label: 'Utilisateurs', value: stats?.usersCount ?? 0, color: 'bg-admin-purple' },
              { label: 'Conversations', value: stats?.conversationsCount ?? 0, color: 'bg-admin-blue' },
              { label: 'Sujets', value: stats?.topicsCount ?? 0, color: 'bg-admin-purple/60' },
            ].map((item, i) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-admin-muted">{item.label}</span>
                  <span className="text-admin-text font-medium">{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-admin-surface overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (item.value / Math.max(stats?.usersCount || 1, 1)) * 100)}%` }}
                    transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                    className={`h-full rounded-full ${item.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="p-6 rounded-2xl bg-admin-card/30 border border-admin-border backdrop-blur-sm"
        >
          <h3 className="font-semibold text-admin-text mb-3 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-admin-purple" strokeWidth={1.5} /> Message collectif
          </h3>
          <p className="text-sm text-admin-muted mb-4">Envoyez un message à tous les utilisateurs.</p>
          <form onSubmit={handleBroadcast} className="flex gap-3 flex-wrap">
            <input
              type="text"
              value={broadcastContent}
              onChange={(e) => setBroadcastContent(e.target.value)}
              placeholder="Votre message..."
              className="flex-1 min-w-[200px] rounded-xl bg-admin-surface border border-admin-border px-4 py-3 text-admin-text placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-admin-purple/50 focus:border-admin-purple disabled:opacity-50"
              disabled={broadcastSending}
            />
            <motion.button
              type="submit"
              disabled={broadcastSending || !broadcastContent.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-xl bg-admin-purple text-white font-medium disabled:opacity-50 hover:bg-admin-purple/90 flex items-center gap-2"
            >
              <Send className="w-5 h-5" /> Envoyer à tous
            </motion.button>
          </form>
        </motion.div>
      </div>

      {/* Avatar admin — déplacé en bas ou masqué pour alléger le dashboard principal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-2xl bg-admin-card/30 border border-admin-border backdrop-blur-sm"
      >
        <h3 className="font-medium text-admin-text mb-3 flex items-center gap-2">Avatar administrateur</h3>
        <form onSubmit={handlePhotoSubmit} className="flex flex-wrap items-end gap-4">
          <div className="flex flex-wrap gap-2">
            {AVATAR_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => { setAvatarEmoji(emoji); setPhotoUrl(''); }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all border ${
                  avatarEmoji === emoji ? 'bg-admin-purple/20 border-admin-purple' : 'bg-admin-surface border-admin-border hover:border-admin-purple/50'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <input
            type="url"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="Ou URL d'une image"
            className="rounded-xl bg-admin-surface border border-admin-border px-4 py-2.5 text-admin-text placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-admin-purple/50 w-64"
          />
          <motion.button
            type="submit"
            disabled={photoSending}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 rounded-xl bg-admin-purple text-white font-medium disabled:opacity-50 hover:bg-admin-purple/90"
          >
            {photoSending ? 'Enregistrement...' : 'Enregistrer'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
