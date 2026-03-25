/**
 * Paramètres administrateur — Profil, sécurité, préférences, restrictions plateforme (principal)
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Moon, Key, Globe } from 'lucide-react';
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
  const [platform, setPlatform] = useState(null);
  const [savingFeature, setSavingFeature] = useState(null);

  useEffect(() => {
    api
      .get('/api/admin/platform-settings')
      .then(({ data }) => setPlatform({ features: data.features || {}, canEdit: data.canEdit }))
      .catch(() => setPlatform(null));
  }, []);

  const togglePlatformFeature = async (key) => {
    if (!platform?.canEdit || !platform.features) return;
    const nextVal = !platform.features[key];
    setSavingFeature(key);
    try {
      const { data } = await api.patch('/api/admin/platform-settings', { [key]: nextVal });
      setPlatform((p) => (p ? { ...p, features: data.features || p.features } : p));
      toast.success('Paramètres enregistrés');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Enregistrement impossible'));
    } finally {
      setSavingFeature(null);
    }
  };

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

      {/* Restrictions plateforme — visible par tous les admins, modifiable par le principal */}
      {platform?.features && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl bg-admin-card/50 border border-admin-border p-6 backdrop-blur-sm"
        >
          <h2 className="font-semibold text-admin-text flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-admin-purple" /> Fonctionnalités de la plateforme
          </h2>
          <p className="text-sm text-admin-muted mb-6">
            {platform.canEdit
              ? 'Activez ou désactivez les fonctionnalités côté utilisateurs. Tous les administrateurs voient le même tableau de bord ; seuls ces réglages restent réservés au compte principal.'
              : 'Seul l’administrateur principal peut modifier ces options. Vous pouvez consulter l’état actuel.'}
          </p>
          <div className="space-y-3">
            {[
              { key: 'forum', label: 'Forum (sujets et commentaires)', desc: 'Accès public aux sujets' },
              { key: 'privateChat', label: 'Messages privés', desc: 'Chat utilisateur avec l’équipe' },
              { key: 'broadcasts', label: 'Messages collectifs', desc: 'Annonces reçues dans l’espace utilisateur' },
              { key: 'registrations', label: 'Inscriptions', desc: 'Création de nouveaux comptes utilisateurs' },
            ].map(({ key, label, desc }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-4 p-4 rounded-xl bg-admin-surface/50 border border-admin-border"
              >
                <div>
                  <p className="font-medium text-admin-text">{label}</p>
                  <p className="text-sm text-admin-muted">{desc}</p>
                </div>
                <button
                  type="button"
                  disabled={!platform.canEdit || savingFeature === key}
                  onClick={() => togglePlatformFeature(key)}
                  className={`relative w-12 h-7 rounded-full shrink-0 transition-colors ${
                    platform.features[key] ? 'bg-admin-purple' : 'bg-admin-border'
                  } ${!platform.canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
                  aria-pressed={!!platform.features[key]}
                >
                  <motion.span
                    layout
                    className="absolute top-1 w-5 h-5 rounded-full bg-white shadow"
                    animate={{ left: platform.features[key] ? 'calc(100% - 1.5rem)' : '0.25rem' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

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
