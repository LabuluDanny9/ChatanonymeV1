/**
 * Inscription - Design system (anonymat total)
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      const msg = err.response?.data?.error || err.message || "Erreur lors de l'inscription";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

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
        {error && <p className="text-sm text-danger bg-danger/10 rounded-xl p-3">{error}</p>}
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
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-xl bg-white/5 border border-white/8 px-4 py-3 text-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-2">Confirmation *</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded-xl bg-white/5 border border-white/8 px-4 py-3 text-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
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
