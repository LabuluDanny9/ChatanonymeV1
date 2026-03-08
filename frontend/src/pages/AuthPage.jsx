/**
 * Auth Page — Login / Signup professionnel
 * Split screen, enterprise-grade, sécurité visible
 */

import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Shield, ArrowRight, Shuffle } from 'lucide-react';
import AuthInput from '../components/auth/AuthInput';
import PasswordStrength from '../components/auth/PasswordStrength';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage, toErrorDisplay } from '../lib/api';

const TABS = { login: 0, signup: 1, anonymous: 2 };

const AVATAR_OPTIONS = [
  '😊', '🎭', '🌟', '🔒', '🦋', '🌙', '🌸', '🦊', '🌈', '🦉', '🌻', '🐱',
  '🦄', '🐺', '🦅', '🌺', '🌊', '🔥', '⚡', '💫', '🪷', '🦩', '🐢', '🦎',
  '🌵', '🍀', '🌻', '🌼', '🦢', '🐝', '🦜', '🐬', '🦭', '🦋', '🪲', '🦗',
];

const PSEUDO_ADJECTIFS = ['Écho', 'Luna', 'Ombre', 'Sage', 'Vif', 'Calme', 'Secret', 'Lumineux', 'Noir', 'Bleu', 'Rouge', 'Vert', 'Serein', 'Mystère', 'Aurore', 'Crépuscule'];
const PSEUDO_SUBSTANTIFS = ['Écouteur', 'Pensée', 'Voyageur', 'Rêveur', 'Sagesse', 'Étoile', 'Onde', 'Flux', 'Souffle', 'Murmure', 'Silence', 'Horizon', 'Reflet', 'Miroir', 'Passage', 'Étincelle'];

function genererPseudo() {
  const adj = PSEUDO_ADJECTIFS[Math.floor(Math.random() * PSEUDO_ADJECTIFS.length)];
  const sub = PSEUDO_SUBSTANTIFS[Math.floor(Math.random() * PSEUDO_SUBSTANTIFS.length)];
  const num = Math.floor(Math.random() * 999) + 1;
  return `${adj}${sub}${num}`;
}

export default function AuthPage({ mode = 'user', defaultTab = 'login' }) {
  const isAdmin = mode === 'admin';
  const { loginUser, loginAdmin, registerUser, isAdmin: isLoggedAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(TABS[defaultTab] ?? TABS.login);
  const [form, setForm] = useState({
    email: '',
    pseudo: '',
    password: '',
    confirmPassword: '',
    avatar: AVATAR_OPTIONS[0],
    remember: false,
    acceptPrivacy: false,
    signupEmail: '',
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
    const identifier = isAdmin ? form.email : form.pseudo;
    if (!identifier?.trim() || !form.password) {
      setError('Tous les champs sont requis');
      return;
    }
    setLoading(true);
    try {
      await (isAdmin
        ? loginAdmin(form.email.trim(), form.password)
        : loginUser(identifier.trim(), form.password));
      setLoading(false);
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Identifiants incorrects'));
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
    if (!form.acceptPrivacy) {
      setError('Vous devez accepter la politique de confidentialité pour vous inscrire.');
      return;
    }
    setLoading(true);
    try {
      await registerUser(form.pseudo.trim(), form.password, null, form.signupEmail?.trim() || null, form.avatar || null);
      setLoading(false);
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err, "Erreur lors de l'inscription"));
      setLoading(false);
    }
  };


  if (success) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return (
    <div className="min-h-screen flex">
      {/* GAUCHE — Logo grand format + Texte de bienvenue (40%) */}
      <aside className="hidden lg:flex lg:w-[40%] flex-col justify-between bg-corum-night p-12 relative overflow-hidden">
        <div className="relative z-10">
          <motion.img
            src="/logo.png"
            alt="L'Aparté"
            className="h-56 sm:h-64 md:h-72 lg:h-80 w-auto drop-shadow-2xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight mb-6"
          >
            <span className="text-corum-offwhite">Bienvenue dans </span>
            <span className="text-corum-turquoise">L'Aparté.</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-corum-gray text-sm sm:text-base space-y-4 max-w-md leading-relaxed"
          >
            <p>Ici, le monde extérieur n'existe plus. Vous avancez sous un pseudo, totalement libre, sans le poids de votre nom ni la peur du jugement. C'est votre espace de vérité brute.</p>
            <p>Je suis votre seul interlocuteur. Mon rôle n'est pas de vous complaire, mais de vous répondre sans filtre. Dans nos échanges directs, j'offre la lucidité que l'on n'ose plus se dire en face. Pour échanger avec les autres, rejoignez nos forums thématiques.</p>
            <p>Déposez ce qui vous pèse, posez vos questions interdites : ici, la parole libère enfin.</p>
            <p className="text-corum-offwhite font-semibold pt-2">Par quoi voulez-vous commencer ?</p>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative z-10 flex items-center gap-2 text-corum-gray text-sm mt-8"
        >
          <Shield className="w-5 h-5 text-corum-turquoise/80" strokeWidth={1.5} />
          Session sécurisée • Chiffrement AES-256
        </motion.div>
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
            <img src="/logo.png" alt="L'Aparté" className="h-36 sm:h-44 w-auto mx-auto drop-shadow-lg mb-4" />
            <h1 className="text-xl font-bold text-chat-offwhite mb-1">Bienvenue dans L'Aparté</h1>
            <p className="text-sm text-corum-gray">Par quoi voulez-vous commencer ?</p>
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
                    {toErrorDisplay(error)}
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
                        {toErrorDisplay(error)}
                      </motion.p>
                    )}
                    <AuthInput
                      label="Pseudo"
                      value={form.pseudo}
                      onChange={(e) => setForm((f) => ({ ...f, pseudo: e.target.value }))}
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
                        {toErrorDisplay(error)}
                      </motion.p>
                    )}
                    <div>
                      <p className="text-sm text-corum-offwhite mb-2">Choisir un avatar</p>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                        {AVATAR_OPTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, avatar: emoji }))}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all shrink-0 ${
                              form.avatar === emoji
                                ? 'bg-corum-turquoise/30 border-2 border-corum-turquoise'
                                : 'bg-white/5 border border-white/10 hover:border-corum-turquoise/50'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-end mb-1">
                        <motion.button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, pseudo: genererPseudo() }))}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-1.5 text-xs text-corum-turquoise hover:text-corum-turquoise/80 transition-colors"
                        >
                          <Shuffle className="w-3.5 h-3.5" />
                          Générer un pseudo
                        </motion.button>
                      </div>
                      <AuthInput
                        label="Pseudo"
                        placeholder="Lettres, chiffres, tirets uniquement (ex: LunaSage42)"
                        value={form.pseudo}
                        onChange={(e) => setForm((f) => ({ ...f, pseudo: e.target.value }))}
                        required
                      />
                    </div>
                    <AuthInput
                      type="email"
                      label="Adresse email"
                      placeholder="votre@email.com"
                      value={form.signupEmail}
                      onChange={(e) => setForm((f) => ({ ...f, signupEmail: e.target.value }))}
                      required
                    />
                    <p className="text-xs text-corum-gray -mt-2">
                      <strong>Important :</strong> Votre pseudo ne doit rien avoir en commun avec votre nom, prénom ou toute indication de votre identité. Choisissez un pseudonyme totalement fictif pour préserver votre anonymat.
                    </p>
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
                    {/* Politique de confidentialité */}
                    <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
                      <p className="text-sm text-corum-offwhite leading-relaxed">
                        <strong>Politique de confidentialité — Anonymat</strong><br />
                        Votre pseudo reste anonyme. L'email sert uniquement à la récupération de compte. Pour la connexion, vous utiliserez votre pseudo et mot de passe (pas l'email). L'objectif est de vous permettre de vous exprimer librement, sans crainte.
                      </p>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.acceptPrivacy}
                          onChange={(e) => setForm((f) => ({ ...f, acceptPrivacy: e.target.checked }))}
                          className="mt-1 rounded border-white/20 bg-white/5 text-corum-turquoise focus:ring-corum-turquoise"
                        />
                        <span className="text-sm text-corum-gray">
                          J'ai lu et j'accepte cette politique de confidentialité. Je comprends que mon anonymat est préservé.
                        </span>
                      </label>
                    </div>
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
                      Inscription avec un pseudo fictif. Aucune donnée personnelle n'est collectée. Exprimez-vous librement, sans crainte.
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
