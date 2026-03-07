/**
 * Paramètres utilisateur — Compte, confidentialité, préférences
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Moon, Shield, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function DashboardSettings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-app-text">Paramètres</h1>
        <p className="text-app-muted mt-1">Gérez votre compte et vos préférences</p>
      </motion.div>

      {/* Compte */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-app-card/50 border border-app-border p-6 backdrop-blur-sm"
      >
        <h2 className="font-semibold text-app-text flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-app-purple" /> Compte
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-app-muted mb-2">Pseudo</label>
            <input
              type="text"
              value={user?.pseudo || ''}
              disabled
              className="w-full rounded-xl bg-app-surface/50 border border-app-border px-4 py-3 text-app-muted cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-app-muted mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full rounded-xl bg-app-surface/50 border border-app-border px-4 py-3 text-app-muted cursor-not-allowed"
            />
          </div>
        </div>
      </motion.div>

      {/* Sécurité */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-app-card/50 border border-app-border p-6 backdrop-blur-sm"
      >
        <h2 className="font-semibold text-app-text flex items-center gap-2 mb-6">
          <Lock className="w-5 h-5 text-app-purple" /> Sécurité
        </h2>
        <div className="flex items-center justify-between p-4 rounded-xl bg-app-surface/50 border border-app-border">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-app-muted" />
            <div>
              <p className="font-medium text-app-text">Changer le mot de passe</p>
              <p className="text-sm text-app-muted">Mettez à jour votre mot de passe régulièrement</p>
            </div>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-app-card border border-app-border text-app-text hover:bg-app-border/30 transition-colors text-sm"
          >
            Modifier
          </button>
        </div>
      </motion.div>

      {/* Confidentialité */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl bg-app-card/50 border border-app-border p-6 backdrop-blur-sm"
      >
        <h2 className="font-semibold text-app-text flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-app-purple" /> Confidentialité
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-app-surface/50 border border-app-border">
            <span className="text-app-text">Contrôles d'anonymat</span>
            <span className="text-sm text-app-muted">Activé</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-app-surface/50 border border-app-border">
            <span className="text-app-text">Bloquer des utilisateurs</span>
            <button type="button" className="text-sm text-app-purple hover:underline">Gérer</button>
          </div>
        </div>
      </motion.div>

      {/* Préférences */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl bg-app-card/50 border border-app-border p-6 backdrop-blur-sm"
      >
        <h2 className="font-semibold text-app-text flex items-center gap-2 mb-6">
          <Bell className="w-5 h-5 text-app-purple" /> Préférences
        </h2>
        <div className="space-y-4">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-app-surface/50 border border-app-border hover:border-app-purple/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-app-muted" />
              <div className="text-left">
                <p className="font-medium text-app-text">Mode sombre / clair</p>
                <p className="text-sm text-app-muted">{theme === 'dark' ? 'Mode sombre actif' : 'Mode clair actif'}</p>
              </div>
            </div>
            <span className="text-app-muted text-sm">Basculer</span>
          </button>
          <div className="flex items-center justify-between p-4 rounded-xl bg-app-surface/50 border border-app-border">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-app-muted" />
              <div className="text-left">
                <p className="font-medium text-app-text">Notifications</p>
                <p className="text-sm text-app-muted">Réponses, mentions, messages</p>
              </div>
            </div>
            <button type="button" className="text-sm text-app-purple hover:underline">Configurer</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
