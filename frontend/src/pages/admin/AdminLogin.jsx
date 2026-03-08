/**
 * Connexion administrateur — Interface professionnelle
 * Connexion + Création du premier compte admin
 */

import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, UserPlus } from 'lucide-react';
import AuthInput from '../../components/auth/AuthInput';
import { useAuth } from '../../context/AuthContext';
import api, { getErrorMessage } from '../../lib/api';

export default function AdminLogin() {
  const { loginAdmin, registerAdmin, isAdmin } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminCount, setAdminCount] = useState(0);

  useEffect(() => {
    api.get('/api/auth/admin/can-register')
      .then(({ data }) => {
        setAdminCount(data.count ?? 0);
        if (data.count === 0) setMode('register');
      })
      .catch((err) => {
        // 503 = DB non configurée → afficher formulaire quand même (login/register)
        if (err?.response?.status !== 503) return;
        setError(getErrorMessage(err, 'Base de données indisponible. Vérifiez la configuration.'));
      });
  }, []);

  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email?.trim() || !form.password) {
      setError('Email et mot de passe requis');
      return;
    }
    setLoading(true);
    try {
      await loginAdmin(form.email.trim(), form.password);
    } catch (err) {
      setError(getErrorMessage(err, 'Identifiants incorrects'));
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email?.trim() || !form.password) {
      setError('Email et mot de passe requis');
      return;
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      await registerAdmin(form.email.trim(), form.password);
    } catch (err) {
      setError(getErrorMessage(err, 'Erreur lors de la création'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panneau gauche — Branding professionnel */}
      <aside className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-gradient-to-br from-blue-600 to-blue-800 p-12 text-white">
        <div>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="ChatAnonyme" className="h-10 w-auto" />
              <span className="font-bold text-xl">ChatAnonyme</span>
            </div>
          <p className="text-blue-100 text-sm mt-2">Administration</p>
        </div>
        <div>
          <h1 className="text-3xl font-bold leading-tight max-w-md">
            Espace de gestion sécurisé
          </h1>
          <p className="text-blue-100 mt-4 max-w-sm">
            Accédez au tableau de bord pour gérer les utilisateurs, les conversations et les sujets de la plateforme.
          </p>
          <div className="mt-8 flex items-center gap-3 text-sm">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Lock className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-medium">Connexion sécurisée</p>
              <p className="text-blue-200 text-xs">Chiffrement TLS • Authentification JWT</p>
            </div>
          </div>
        </div>
        <p className="text-blue-200/80 text-xs">© ChatAnonyme — Tous droits réservés</p>
      </aside>

      {/* Panneau droit — Formulaire */}
      <main className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="ChatAnonyme" className="h-10 w-auto" />
              <span className="font-bold text-xl text-slate-800">ChatAnonyme</span>
            </div>
            <p className="text-chat-muted text-sm">Administration</p>
          </div>

          <div className="bg-white rounded-2xl border border-chat-border shadow-soft p-8">
            {/* Tabs Connexion / Créer un compte */}
            <div className="flex gap-2 mb-6 p-1 rounded-xl bg-slate-100">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === 'login' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Connexion
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); setForm((f) => ({ ...f, confirmPassword: '' })); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'register' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <UserPlus className="w-4 h-4" /> Créer un compte {adminCount > 0 && `(${adminCount}/3)`}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-xl font-bold text-slate-800 mb-1">Connexion administrateur</h2>
                  <p className="text-sm text-chat-muted mb-6">Utilisez vos identifiants pour accéder au tableau de bord.</p>

                  <form onSubmit={handleLogin} className="space-y-5">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm"
                      >
                        {error}
                      </motion.div>
                    )}
                    <AuthInput
                      type="email"
                      label="Adresse email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      icon={Mail}
                      variant="light"
                      required
                    />
                    <AuthInput
                      type="password"
                      label="Mot de passe"
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      icon={Lock}
                      variant="light"
                      required
                    />
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-blue-700 transition-colors"
                    >
                      {loading ? 'Connexion...' : 'Accéder au tableau de bord'}
                      <ArrowRight className="w-5 h-5" strokeWidth={2} />
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-xl font-bold text-slate-800 mb-1">Créer un compte administrateur</h2>
                  <p className="text-sm text-chat-muted mb-6">La plateforme peut avoir jusqu'à 3 administrateurs. Créez un compte pour rejoindre l'équipe.</p>

                  <form onSubmit={handleRegister} className="space-y-5">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm"
                      >
                        {error}
                      </motion.div>
                    )}
                    <AuthInput
                      type="email"
                      label="Adresse email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      icon={Mail}
                      variant="light"
                      required
                    />
                    <AuthInput
                      type="password"
                      label="Mot de passe"
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      icon={Lock}
                      variant="light"
                      required
                      minLength={6}
                    />
                    <AuthInput
                      type="password"
                      label="Confirmer le mot de passe"
                      value={form.confirmPassword}
                      onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                      icon={Lock}
                      variant="light"
                      required
                    />
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-blue-700 transition-colors"
                    >
                      {loading ? 'Création...' : 'Créer mon compte admin'}
                      <ArrowRight className="w-5 h-5" strokeWidth={2} />
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="mt-6 text-center text-sm text-chat-muted">
            Utilisateur ? <Link to="/connexion" className="text-blue-600 hover:underline font-medium">Connexion utilisateur</Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
