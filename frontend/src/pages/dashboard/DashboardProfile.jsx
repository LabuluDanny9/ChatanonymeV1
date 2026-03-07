/**
 * Profil utilisateur — Anonyme
 * Style Reddit/Discord, réputation, stats
 */

import { motion } from 'framer-motion';
import { User, Shield, LogOut, FileText, MessageCircle, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function DashboardProfile() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-app-text">Profil</h1>
        <p className="text-app-muted mt-1">Votre espace confidentiel</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-app-card/50 border border-app-border p-6 backdrop-blur-sm"
      >
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-app-purple/20 flex items-center justify-center overflow-hidden border border-app-purple/30">
            {user?.photo && user.photo.trim().length <= 4 ? (
              <span className="text-4xl">{user.photo}</span>
            ) : (
              <User className="w-10 h-10 text-app-purple" strokeWidth={1.5} />
            )}
          </div>
          <div>
            <h2 className="font-semibold text-app-text text-xl">{user?.pseudo || 'Utilisateur'}</h2>
            <p className="text-sm text-app-muted">Compte anonyme</p>
            <div className="flex items-center gap-2 mt-2">
              <Star className="w-4 h-4 text-app-purple" strokeWidth={1.5} />
              <span className="text-sm text-app-muted">Réputation : —</span>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-app-border flex items-center gap-2 text-app-muted">
          <Shield className="w-5 h-5 text-app-purple" strokeWidth={1.5} />
          <span className="text-sm">Vos données restent confidentielles et chiffrées</span>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 gap-4"
      >
        <Link to="/dashboard/topics">
          <div className="p-4 rounded-2xl bg-app-card/50 border border-app-border hover:border-app-purple/30 transition-all">
            <FileText className="w-8 h-8 text-app-purple mb-2" strokeWidth={1.5} />
            <p className="text-2xl font-bold text-app-text">—</p>
            <p className="text-sm text-app-muted">Publications</p>
          </div>
        </Link>
        <Link to="/dashboard/chat">
          <div className="p-4 rounded-2xl bg-app-card/50 border border-app-border hover:border-app-purple/30 transition-all">
            <MessageCircle className="w-8 h-8 text-app-purple mb-2" strokeWidth={1.5} />
            <p className="text-2xl font-bold text-app-text">—</p>
            <p className="text-sm text-app-muted">Discussions</p>
          </div>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <button
          type="button"
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-app-card/50 border border-app-border hover:border-app-purple/30 transition-colors"
        >
          <span className="text-app-text">Apparence</span>
          <span className="text-app-muted text-sm">{theme === 'dark' ? 'Mode sombre' : 'Mode clair'}</span>
        </button>
        <Link to="/dashboard/settings">
          <div className="w-full flex items-center justify-between p-4 rounded-xl bg-app-card/50 border border-app-border hover:border-app-purple/30 transition-colors">
            <span className="text-app-text">Paramètres</span>
            <span className="text-app-muted text-sm">Gérer le compte</span>
          </div>
        </Link>
        <motion.button
          type="button"
          onClick={handleLogout}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-app-danger/10 border border-app-danger/20 text-app-danger hover:bg-app-danger/20 transition-colors"
        >
          <LogOut className="w-5 h-5" strokeWidth={1.5} />
          Se déconnecter
        </motion.button>
      </motion.div>
    </div>
  );
}
