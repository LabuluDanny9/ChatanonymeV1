/**
 * Auth Page — Login / Signup professionnel
 * Split screen, enterprise-grade, sécurité visible
 */

import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import AuthInput from '../components/auth/AuthInput';
import PasswordStrength from '../components/auth/PasswordStrength';
import { useAuth } from '../context/AuthContext';

const TABS = { login: 0, signup: 1, anonymous: 2 };

export default function AuthPage({ mode = 'user', defaultTab = 'login' }) {
  const isAdmin = mode === 'admin';
  const { loginUser, loginAdmin, registerUser, isAdmin: isLoggedAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TABS[defaultTab] ?? TABS.login);
  const [form, setForm] = useState({
    email: '',
    pseudo: '',
    password: '',
    confirmPassword: '',
    remember: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (isAdmin && isLoggedAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const identifier = isAdmin ? form.email : form.pseudo || form.email;
    if (!identifier?.trim() || !form.password) {
      setError('Tous les champs sont requis');
      return;
    }
    setLoading(true);
    try {
      const fn = isAdmin ? loginAdmin : loginUser;
      const result = isAdmin
        ? await loginAdmin(form.email.trim(), form.password)
        : await loginUser(identifier.trim(), form.password);
      setSuccess(true);
      setTimeout(() => {
        navigate(isAdmin ? '/admin/dashboard' : '/dashboard');
      }, 400);
    } catch (err) {
      setError(err.response?.data?.error || 'Identifiants incorrects');
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.pseudo?.trim() || !form.password) {
      setError('Pseudo et mot de passe requis');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setLoading(true);
    try {
      await registerUser(form.pseudo.trim(), form.password, null, form.email?.trim() || null, null);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 400);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription");
      setLoading(false);
    }
  };


  if (success) {
    return (
      <div className="min-h-screen bg-corum-blue flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 mx-auto rounded-full bg-corum-turquoise/20 flex items-center justify-center mb-4"
          >
            <CheckCircle className="w-10 h-10 text-corum-turquoise" />
          </motion.div>
          <p className="text-corum-offwhite font-medium">Connexion réussie</p>
          <p className="text-sm text-corum-gray mt-1">Redirection...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* GAUCHE — Branding (40%) */}
      <aside className="hidden lg:flex lg:w-[40%] flex-col justify-between bg-corum-night p-12 relative overflow-hidden">
        <div>
          <h1 className="text-2xl font-bold text-chat-offwhite tracking-tight">ChatAnonyme</h1>
          <p className="text-sm text-corum-gray mt-1">Plateforme sécurisée</p>
        </div>
        <div className="relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-corum-offwhite leading-tight max-w-sm"
          >
            Accès sécurisé à votre espace confidentiel.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-corum-gray mt-4 flex items-center gap-2"
          >
            <Shield className="w-5 h-5 text-corum-turquoise/80" strokeWidth={1.5} />
            Session sécurisée • Chiffrement AES-256
          </motion.p>
        </div>
        {/* Cercles décoratifs */}
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full border border-corum-turquoise/20" />
        <div className="absolute right-10 bottom-1/4 w-32 h-32 rounded-full border border-corum-turquoise/10" />
      </aside>

      {/* DROITE — Form (60%) */}
      <main className="flex-1 flex items-center justify-center p-6 bg-corum-blue">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-xl font-bold text-chat-offwhite">ChatAnonyme</h1>
            <p className="text-xs text-corum-gray mt-1">Accès sécurisé</p>
          </div>

          {/* Card — shake on error */}
          <motion.div
            key={error || 'idle'}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: error ? [0, -8, 8, -6, 6, 0] : 0,
            }}
            transition={{
              opacity: { delay: 0.1 },
              x: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
            }}
            className="rounded-2xl bg-corum-night/80 backdrop-blur-xl border border-white/10 p-8 shadow-xl"
          >
            {/* Tabs */}
            {!isAdmin && (
              <div className="flex gap-2 mb-8 p-1 rounded-xl bg-white/5">
                {[
                  { key: 'login', label: 'Connexion' },
                  { key: 'signup', label: 'Inscription' },
                  { key: 'anonymous', label: 'Anonyme' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => { setActiveTab(TABS[tab.key]); setError(''); }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeTab === TABS[tab.key]
                        ? 'bg-corum-turquoise text-corum-blue'
                        : 'text-corum-gray hover:text-corum-offwhite'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {isAdmin ? (
              /* Admin Login */
              <form onSubmit={handleLogin} className="space-y-5">
                <h2 className="text-xl font-semibold text-corum-offwhite">Connexion administrateur</h2>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm text-corum-red bg-corum-red/10 rounded-xl p-3"
                  >
                    {error}
                  </motion.p>
                )}
                <AuthInput
                  type="email"
                  label="Email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  error={error ? undefined : null}
                  icon={Mail}
                  required
                />
                <AuthInput
                  type="password"
                  label="Mot de passe"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  icon={Lock}
                  required
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={form.remember}
                    onChange={(e) => setForm((f) => ({ ...f, remember: e.target.checked }))}
                    className="rounded border-white/20 bg-white/5 text-corum-turquoise focus:ring-corum-turquoise"
                  />
                  <label htmlFor="remember" className="text-sm text-corum-gray">Se souvenir</label>
                </div>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-3.5 rounded-xl bg-corum-turquoise text-corum-blue font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Connexion sécurisée <ArrowRight className="w-5 h-5" />
                </motion.button>
              </form>
            ) : (
              <AnimatePresence mode="wait">
                {activeTab === TABS.login && (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onSubmit={handleLogin}
                    className="space-y-5"
                  >
                    <h2 className="text-xl font-semibold text-corum-offwhite">Connexion</h2>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-corum-red bg-corum-red/10 rounded-xl p-3"
                      >
                        {error}
                      </motion.p>
                    )}
                    <AuthInput
                      label="Pseudo ou email"
                      value={form.pseudo || form.email}
                      onChange={(e) => setForm((f) => ({ ...f, pseudo: e.target.value, email: e.target.value }))}
                      required
                    />
                    <AuthInput
                      type="password"
                      label="Mot de passe"
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      icon={Lock}
                      required
                    />
                    <Link to="#" className="block text-sm text-corum-turquoise hover:underline">
                      Mot de passe oublié ?
                    </Link>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full py-3.5 rounded-xl bg-corum-turquoise text-corum-blue font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      Connexion sécurisée <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </motion.form>
                )}

                {activeTab === TABS.signup && (
                  <motion.form
                    key="signup"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onSubmit={handleSignup}
                    className="space-y-5"
                  >
                    <h2 className="text-xl font-semibold text-corum-offwhite">Inscription</h2>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-corum-red bg-corum-red/10 rounded-xl p-3"
                      >
                        {error}
                      </motion.p>
                    )}
                    <AuthInput
                      label="Pseudo"
                      value={form.pseudo}
                      onChange={(e) => setForm((f) => ({ ...f, pseudo: e.target.value }))}
                      required
                    />
                    <AuthInput
                      type="email"
                      label="Email (optionnel)"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    />
                    <AuthInput
                      type="password"
                      label="Mot de passe"
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      required
                      minLength={6}
                    />
                    <PasswordStrength password={form.password} />
                    <AuthInput
                      type="password"
                      label="Confirmation"
                      value={form.confirmPassword}
                      onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                      error={form.confirmPassword && form.password !== form.confirmPassword ? 'Les mots de passe ne correspondent pas' : undefined}
                      required
                    />
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full py-3.5 rounded-xl bg-corum-turquoise text-corum-blue font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      Créer mon compte <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </motion.form>
                )}

                {activeTab === TABS.anonymous && (
                  <motion.div
                    key="anonymous"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-semibold text-corum-offwhite">Entrer anonymement</h2>
                    <p className="text-sm text-corum-gray">
                      Inscription rapide avec un pseudo. Vos échanges restent confidentiels et anonymes.
                    </p>
                    <motion.button
                      type="button"
                      onClick={() => { setActiveTab(TABS.signup); setError(''); }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 rounded-xl bg-corum-turquoise text-corum-blue font-semibold flex items-center justify-center gap-2"
                    >
                      Créer un compte anonyme <ArrowRight className="w-5 h-5" />
                    </motion.button>
                    <p className="text-center text-sm text-corum-gray mt-4">
                      Déjà un compte ? <button type="button" onClick={() => setActiveTab(TABS.login)} className="text-corum-turquoise hover:underline">Se connecter</button>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Security footer */}
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-corum-gray">
              <Lock className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Session sécurisée • Chiffrement AES-256</span>
            </div>
          </motion.div>

          {isAdmin ? (
            <p className="mt-6 text-center text-sm text-corum-gray">
              Utilisateur ? <Link to="/connexion" className="text-corum-turquoise hover:underline">Connexion</Link>
            </p>
          ) : (
            <p className="mt-6 text-center text-sm text-corum-gray">
              Administrateur ? <Link to="/admin" className="text-corum-turquoise hover:underline">Connexion admin</Link>
            </p>
          )}
        </motion.div>
      </main>
    </div>
  );
}
