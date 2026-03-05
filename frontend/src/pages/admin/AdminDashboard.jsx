/**
 * Dashboard Admin — Interface professionnelle
 * KPIs, graphiques, message collectif
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, MessageCircle, FileText, Megaphone, Image, TrendingUp, Send } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const KPICard = ({ icon: Icon, label, value, to, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    whileHover={{ y: -2, transition: { duration: 0.2 } }}
  >
    <Link to={to}>
      <div className="p-6 rounded-xl bg-white border border-chat-border shadow-sm hover:shadow-soft hover:border-blue-200 transition-all duration-300 group">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
          <Icon className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
        </div>
        <p className="text-3xl font-bold text-slate-800">{value ?? 0}</p>
        <p className="text-sm text-chat-muted mt-1">{label}</p>
      </div>
    </Link>
  </motion.div>
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
      toast.error(e.response?.data?.error || 'Erreur');
    } finally {
      setBroadcastSending(false);
    }
  };

  const handlePhotoSubmit = async (e) => {
    e.preventDefault();
    if (!photoUrl.trim() || photoSending) return;
    setPhotoSending(true);
    try {
      const { data } = await api.put('/api/admin/photo', { photo: photoUrl.trim() });
      updateAdminPhoto(data.photo);
      toast.success('Photo mise à jour');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur');
    } finally {
      setPhotoSending(false);
    }
  };

  const activityData = stats?.activityData || [];
  const maxActivity = Math.max(...activityData.map((d) => d.c), 1);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-slate-800">Tableau de bord</h1>
        <p className="text-chat-muted mt-1">Vue d'ensemble de la plateforme</p>
      </motion.div>

      {/* Photo admin */}
      {!admin?.photo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-white border border-chat-border shadow-sm"
        >
          <h3 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
            <Image className="w-5 h-5 text-blue-600" strokeWidth={1.5} /> Photo de profil
          </h3>
          <form onSubmit={handlePhotoSubmit} className="flex gap-3 flex-wrap">
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="URL de votre photo"
              className="flex-1 min-w-[200px] rounded-xl bg-slate-50 border border-chat-border px-4 py-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
            <motion.button
              type="submit"
              disabled={photoSending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-50 hover:bg-blue-700"
            >
              Enregistrer
            </motion.button>
          </form>
        </motion.div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard icon={Users} label="Utilisateurs" value={stats?.usersCount} to="/admin/users" delay={0.1} />
        <KPICard icon={MessageCircle} label="Conversations actives" value={stats?.openConversationsCount} to="/admin/conversations" delay={0.15} />
        <KPICard icon={TrendingUp} label="Messages aujourd'hui" value={stats?.messagesToday} to="/admin/conversations" delay={0.2} />
        <KPICard icon={FileText} label="Sujets publiés" value={stats?.topicsCount} to="/admin/topics" delay={0.25} />
      </div>

      {/* Graphiques */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl bg-white border border-chat-border shadow-sm"
        >
          <h3 className="font-medium text-slate-800 mb-6">Activité (7 derniers jours)</h3>
          <div className="h-48 flex items-end gap-2">
            {activityData.length ? (
              activityData.map((d, i) => (
                <div key={d.d} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-blue-500 hover:bg-blue-600 transition-colors min-h-[4px]"
                    style={{ height: `${Math.max(4, (d.c / maxActivity) * 100)}%` }}
                  />
                  <span className="text-xs text-chat-muted">
                    {new Date(d.d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center text-chat-muted text-sm">Aucune donnée</div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="p-6 rounded-xl bg-white border border-chat-border shadow-sm"
        >
          <h3 className="font-medium text-slate-800 mb-6">Répartition</h3>
          <div className="space-y-4">
            {[
              { label: 'Utilisateurs', value: stats?.usersCount ?? 0, color: 'bg-blue-500' },
              { label: 'Conversations', value: stats?.conversationsCount ?? 0, color: 'bg-blue-400' },
              { label: 'Sujets', value: stats?.topicsCount ?? 0, color: 'bg-blue-300' },
            ].map((item, i) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-chat-muted">{item.label}</span>
                  <span className="text-slate-800 font-medium">{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (item.value / Math.max(stats?.usersCount || 1, 1)) * 100)}%` }}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                    className={`h-full rounded-full ${item.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Message collectif */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-xl bg-white border border-chat-border shadow-sm"
      >
        <h3 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-blue-600" strokeWidth={1.5} /> Message collectif
        </h3>
        <p className="text-sm text-chat-muted mb-4">Envoyez un message à tous les utilisateurs.</p>
        <form onSubmit={handleBroadcast} className="flex gap-3 flex-wrap">
          <input
            type="text"
            value={broadcastContent}
            onChange={(e) => setBroadcastContent(e.target.value)}
            placeholder="Votre message..."
            className="flex-1 min-w-[200px] rounded-xl bg-slate-50 border border-chat-border px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:opacity-50"
            disabled={broadcastSending}
          />
          <motion.button
            type="submit"
            disabled={broadcastSending || !broadcastContent.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-50 hover:bg-blue-700 flex items-center gap-2"
          >
            <Send className="w-5 h-5" /> Envoyer à tous
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
