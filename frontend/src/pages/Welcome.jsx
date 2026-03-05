/**
 * Welcome — Entrée fullscreen hero
 * Confidential. Minimal. Intelligent.
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, ArrowRight } from 'lucide-react';

const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

export default function Welcome() {
  const { user, admin, isLoggedIn } = useAuth();

  if (isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-chat-bg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <p className="text-chat-muted mb-6">Bienvenue{user?.pseudo ? `, ${user.pseudo}` : ''}</p>
          <Link to={admin ? '/admin/dashboard' : '/dashboard'}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-xl bg-chat-primary text-white font-semibold shadow-soft hover:bg-blue-700 transition-all duration-300"
            >
              {admin ? 'Tableau de bord' : 'Conversation sécurisée'}
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-sky-50/50">
      {/* Cercles décoratifs bleus */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute -right-24 -top-24 w-[400px] h-[400px] rounded-full border-2 border-blue-200"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute right-1/4 top-1/3 w-[280px] h-[280px] rounded-full border border-blue-100"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute right-0 bottom-1/4 w-64 h-64 rounded-full bg-blue-100"
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <img src="/logo.png" alt="ChatAnonyme" className="h-16 w-auto mx-auto" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 leading-tight tracking-tight mb-4"
        >
          Communiquez librement.
          <br />
          <span className="text-chat-primary">En toute confidentialité.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="text-chat-muted text-lg mb-12 max-w-md mx-auto"
        >
          Plateforme sécurisée d'échange anonyme.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Link to="/connexion">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-chat-primary text-white font-semibold shadow-soft hover:bg-blue-700 transition-all duration-300"
            >
              Entrer anonymement <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-sm text-chat-muted flex flex-col items-center justify-center gap-3"
        >
          <span className="flex items-center gap-2">
            <Lock className="w-4 h-4" strokeWidth={1.5} />
            Session chiffrée AES-256
          </span>
          <Link to="/admin" className="text-chat-muted hover:text-chat-primary transition-colors text-xs">
            Connexion administrateur
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
