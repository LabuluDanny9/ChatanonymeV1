/**
 * Profil utilisateur — Anonyme
 */

import { motion } from 'framer-motion';
import { User, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-corum-offwhite">Profil</h1>
        <p className="text-corum-gray text-sm mt-1">Votre espace confidentiel</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-corum-night/60 backdrop-blur-xl border border-white/10 p-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-corum-turquoise/20 flex items-center justify-center">
            <User className="w-8 h-8 text-corum-turquoise" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-semibold text-corum-offwhite">{user?.pseudo || 'Utilisateur'}</h2>
            <p className="text-sm text-corum-gray">Compte anonyme</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-2 text-corum-gray">
          <Shield className="w-5 h-5 text-corum-turquoise" strokeWidth={1.5} />
          <span className="text-sm">Vos données restent confidentielles et chiffrées</span>
        </div>
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
          className="w-full flex items-center justify-between p-4 rounded-xl bg-corum-night/60 border border-white/10 hover:border-corum-turquoise/30 transition-colors"
        >
          <span className="text-corum-offwhite">Apparence</span>
          <span className="text-corum-gray text-sm">{theme === 'dark' ? 'Mode sombre' : 'Mode clair'}</span>
        </button>
        <motion.button
          type="button"
          onClick={handleLogout}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-corum-red/10 border border-corum-red/20 text-corum-red hover:bg-corum-red/20 transition-colors"
        >
          <LogOut className="w-5 h-5" strokeWidth={1.5} />
          Se déconnecter
        </motion.button>
      </motion.div>
    </div>
  );
}
