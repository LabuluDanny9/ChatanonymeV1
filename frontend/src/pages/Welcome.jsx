/**
 * Landing Page — Réseau social anonyme
 * Hero • Features • Community • Footer
 * Design: Reddit + Discord + Twitter + SaaS
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  ArrowRight,
  Shield,
  MessageCircle,
  FileText,
  Users,
  MessageSquare,
  TrendingUp,
  Hash,
} from 'lucide-react';

const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

export default function Welcome() {
  const { user, admin, isLoggedIn } = useAuth();

  if (isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <p className="text-app-muted mb-6">Bienvenue{user?.pseudo ? `, ${user.pseudo}` : ''}</p>
          <Link to={admin ? '/admin/dashboard' : '/dashboard'}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-app-purple to-app-blue text-white font-semibold shadow-app-glow hover:shadow-app-glow transition-all duration-300"
            >
              {admin ? 'Tableau de bord' : 'Accéder au fil'}
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg text-app-text font-sans">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-app-bg via-app-surface/50 to-app-bg" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-app-purple/20 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 w-96 h-96 bg-app-purple/10 rounded-full blur-3xl -translate-x-1/2" />
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            <motion.img
              src="/logo.png"
              alt="ChatAnonyme"
              className="h-28 sm:h-36 w-auto mx-auto drop-shadow-2xl"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-6"
          >
            <span className="text-app-text">Bienvenue dans </span>
            <span className="bg-gradient-to-r from-app-purple to-app-blue bg-clip-text text-transparent">
              L'Aparté.
            </span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-app-muted text-base sm:text-lg max-w-2xl mx-auto mb-12 space-y-4 text-left"
          >
            <p>Ici, le monde extérieur n'existe plus. Vous avancez sous un pseudo, totalement libre, sans le poids de votre nom ni la peur du jugement. C'est votre espace de vérité brute.</p>
            <p>Je suis votre seul interlocuteur. Mon rôle n'est pas de vous complaire, mais de vous répondre sans filtre. Dans nos échanges directs, j'offre la lucidité que l'on n'ose plus se dire en face. Pour échanger avec les autres, rejoignez nos forums thématiques.</p>
            <p>Déposez ce qui vous pèse, posez vos questions interdites : ici, la parole libère enfin.</p>
            <p className="text-app-text font-semibold text-center pt-2">Par quoi voulez-vous commencer ?</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/inscription">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-app-purple to-app-blue text-white font-semibold shadow-app-glow hover:shadow-app-glow transition-all"
              >
                Créer un compte <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link to="/connexion">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-app-card border border-app-border text-app-text font-semibold hover:border-app-purple/50 hover:bg-app-surface transition-all"
              >
                Se connecter
              </motion.button>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex items-center justify-center gap-2 text-app-muted text-sm"
          >
            <Lock className="w-4 h-4" strokeWidth={1.5} />
            Session chiffrée AES-256
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-16"
          >
            <span className="text-app-text">Pourquoi </span>
            <span className="text-app-purple">ChatAnonyme</span>
            <span className="text-app-text"> ?</span>
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Publication anonyme', desc: 'Publiez sans révéler votre identité.' },
              { icon: MessageCircle, title: 'Communication sécurisée', desc: 'Messages privés chiffrés.' },
              { icon: FileText, title: 'Forum de discussions', desc: 'Échangez et débattre librement.' },
              { icon: Users, title: 'Protection de la vie privée', desc: 'Vos données restent confidentielles.' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="p-6 rounded-2xl bg-app-card/50 border border-app-border backdrop-blur-sm hover:border-app-purple/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-app-purple/20 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-app-purple" strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-app-text mb-2">{f.title}</h3>
                <p className="text-sm text-app-muted">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community / Trending */}
      <section className="relative py-24 px-6 bg-app-surface/30">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-4"
          >
            <span className="text-app-text">Rejoignez la </span>
            <span className="text-app-purple">communauté</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-app-muted text-center mb-12 max-w-xl mx-auto"
          >
            Sujets tendance, débats d'idées, confessions anonymes, tech et société.
          </motion.p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Discussion générale', icon: MessageSquare },
              { label: 'Idées et débats', icon: Hash },
              { label: 'Confessions anonymes', icon: Shield },
              { label: 'Tech & société', icon: TrendingUp },
            ].map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-5 rounded-xl bg-app-card/50 border border-app-border hover:border-app-purple/30 transition-all flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-app-purple/20 flex items-center justify-center shrink-0">
                  <c.icon className="w-5 h-5 text-app-purple" strokeWidth={1.5} />
                </div>
                <span className="font-medium text-app-text">{c.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center p-12 rounded-2xl bg-gradient-to-br from-app-purple/20 to-app-blue/10 border border-app-purple/30"
        >
          <h3 className="text-2xl font-bold text-app-text mb-4">Prêt à commencer ?</h3>
          <p className="text-app-muted mb-8">Créez votre compte en quelques secondes</p>
          <Link to="/inscription">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-app-purple to-app-blue text-white font-semibold shadow-app-glow"
            >
              Créer un compte
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-app-border py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="h-8 w-auto" />
            <span className="font-bold text-app-text">ChatAnonyme</span>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm">
            <Link to="/topics" className="text-app-muted hover:text-app-purple transition-colors">
              Forum
            </Link>
            <a href="#" className="text-app-muted hover:text-app-purple transition-colors">
              Conditions d'utilisation
            </a>
            <a href="#" className="text-app-muted hover:text-app-purple transition-colors">
              Politique de confidentialité
            </a>
            <a href="#" className="text-app-muted hover:text-app-purple transition-colors">
              Support
            </a>
          </nav>
          <Link to="/admin" className="text-xs text-app-muted hover:text-app-purple transition-colors">
            Connexion administrateur
          </Link>
        </div>
      </footer>
    </div>
  );
}
