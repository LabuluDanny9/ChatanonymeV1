/**
 * Paramètres administrateur — Profil, sécurité, préférences
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Moon, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api, { getErrorMessage } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

const AVATAR_OPTIONS = ['😊', '🎭', '🌟', '🔒', '🦋', '🌙', '🌸', '🦊', '🌈', '🦉', '🌻', '🐱'];

export default function AdminSettings() {
  const { admin, updateAdminPhoto } = useAuth();
  const toast = useToast();
  const [photoUrl, setPhotoUrl] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState(
    admin?.photo && !admin.photo.startsWith('http') && admin.photo.length <= 4 ? admin.photo : AVATAR_OPTIONS[0]
  );
  const [sending, setSending] = useState(false);

  const handlePhotoSubmit = async (e) => {
    e.preventDefault();
    const photo = photoUrl.trim() || avatarEmoji;
    if (!photo || sending) return;
    setSending(true);
    try {
      const { data } = await api.put('/api/admin/photo', { photo });
      updateAdminPhoto(data.photo);
      toast.success('Avatar mis à jour');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Erreur'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-admin-text">Paramètres</h1>
        <p className="text-admin-muted mt-1">Gérez votre profil et vos préférences</p>
      </motion.div>

      {/* Profil */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-admin-card/50 border border-admin-border p-6 backdrop-blur-sm"
      >
        <h2 className="font-semibold text-admin-text flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-admin-purple" /> Informations du profil
        </h2>
        <form onSubmit={handlePhotoSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-admin-muted mb-2">Avatar</label>
            <div className="flex flex-wrap gap-2 mb-4">
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
              className="w-full rounded-xl bg-admin-surface border border-admin-border px-4 py-3 text-admin-text placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-admin-purple/50 focus:border-admin-purple"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-admin-muted mb-2">Email</label>
            <input
              type="email"
              value={admin?.email || ''}
              disabled
              className="w-full rounded-xl bg-admin-surface/50 border border-admin-border px-4 py-3 text-admin-muted cursor-not-allowed"
            />
          </div>
          <motion.button
            type="submit"
            disabled={sending}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-xl bg-admin-purple text-white font-medium hover:bg-admin-purple/90 disabled:opacity-50"
          >
            {sending ? 'Enregistrement...' : 'Enregistrer'}
          </motion.button>
        </form>
      </motion.div>

      {/* Sécurité */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-admin-card/50 border border-admin-border p-6 backdrop-blur-sm"
      >
        <h2 className="font-semibold text-admin-text flex items-center gap-2 mb-6">
          <Lock className="w-5 h-5 text-admin-purple" /> Sécurité
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-admin-surface/50 border border-admin-border">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-admin-muted" />
              <div>
                <p className="font-medium text-admin-text">Changer le mot de passe</p>
                <p className="text-sm text-admin-muted">Mettez à jour votre mot de passe régulièrement</p>
              </div>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-admin-card border border-admin-border text-admin-text hover:bg-admin-border/30 transition-colors text-sm"
            >
              Modifier
            </button>
          </div>
        </div>
      </motion.div>

      {/* Préférences */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl bg-admin-card/50 border border-admin-border p-6 backdrop-blur-sm"
      >
        <h2 className="font-semibold text-admin-text flex items-center gap-2 mb-6">
          <Bell className="w-5 h-5 text-admin-purple" /> Préférences
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-admin-surface/50 border border-admin-border">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-admin-muted" />
              <div>
                <p className="font-medium text-admin-text">Mode sombre</p>
                <p className="text-sm text-admin-muted">Interface optimisée pour l'administration</p>
              </div>
            </div>
            <div className="w-12 h-6 rounded-full bg-admin-purple/30 flex items-center px-1">
              <motion.div
                layout
                className="w-5 h-5 rounded-full bg-admin-purple shadow-lg"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
