/**
 * Inscription - Design system (anonymat total)
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { getErrorMessage } from '../lib/api';

export default function Register() {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationsOpen, setRegistrationsOpen] = useState(true);

  useEffect(() => {
    api
      .get('/api/config')
      .then(({ data }) => {
        const f = data?.features || {};
        if (f.registrations === false) setRegistrationsOpen(false);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!pseudo.trim() || !password) {
      setError('Pseudo et mot de passe requis');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (!acceptPrivacy) {
      setError('Vous devez accepter la politique de confidentialité.');
      return;
    }
    setLoading(true);
    try {
      await registerUser(pseudo.trim(), password, null, null, null);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, "Erreur lors de l'inscription"));
    } finally {
      setLoading(false);
    }
  };

  if (!registrationsOpen) {
    return (
      <div className="max-w-md mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-h2 font-bold text-[#E5E7EB] mb-4"
        >
          Inscriptions fermées
        </motion.h2>
        <p className="text-muted glass-card p-6 rounded-xl">
          Les nouvelles inscriptions ne sont pas disponibles pour le moment. Si vous avez déjà un compte, vous pouvez vous connecter.
        </p>
        <p className="mt-4 text-sm text-muted text-center">
          <Link to="/connexion" className="text-accent hover:underline">Se connecter</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-h2 font-bold text-[#E5E7EB] mb-4"
      >
        Inscription
      </motion.h2>
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="glass-card p-6 space-y-4"
      >
        {error && <p className="text-sm text-danger bg-danger/10 rounded-xl p-3">{typeof error === 'string' ? error : (error?.message || 'Erreur')}</p>}
        <div>
          <label className="block text-sm text-muted mb-2">Choisir un pseudo *</label>
          <input
            type="text"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            placeholder="Ex : Écouteur2024, Anonyme123..."
            required
            className="w-full rounded-xl bg-white/5 border border-white/8 px-4 py-3 text-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <p className="text-xs text-muted mt-1">
            Votre pseudo ne doit rien avoir en commun avec votre nom, prénom ou identité. Choisissez un pseudonyme fictif pour préserver votre anonymat.
          </p>
        </div>
        <div>
          <label className="block text-sm text-muted mb-2">Mot de passe *</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl bg-white/5 border border-white/8 px-4 py-3 pr-12 text-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="button"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-[#E5E7EB] cursor-pointer p-1"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm text-muted mb-2">Confirmation *</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-xl bg-white/5 border border-white/8 px-4 py-3 pr-12 text-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="button"
              aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-[#E5E7EB] cursor-pointer p-1"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-sm text-[#E5E7EB] mb-3">
            <strong>Politique de confidentialité :</strong> En vous inscrivant, vous restez totalement anonyme. Nous ne collectons aucune donnée personnelle. L'objectif est de vous permettre de vous exprimer librement, sans crainte.
          </p>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptPrivacy}
              onChange={(e) => setAcceptPrivacy(e.target.checked)}
              className="mt-1 rounded"
            />
            <span className="text-xs text-muted">J'accepte cette politique de confidentialité.</span>
          </label>
        </div>
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl bg-primary text-white font-medium disabled:opacity-50"
        >
          {loading ? 'Inscription...' : "S'inscrire"}
        </motion.button>
      </motion.form>
      <p className="mt-4 text-sm text-muted text-center">
        Déjà inscrit ? <Link to="/connexion" className="text-accent hover:underline">Se connecter</Link>
      </p>
    </div>
  );
}
