/**
 * Connexion - Design system
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Login({ redirectTo = null }) {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password) {
      setError('Identifiant et mot de passe requis');
      return;
    }
    setLoading(true);
    try {
      const result = await loginUser(identifier.trim(), password);
      if (result.type === 'admin') {
        navigate(redirectTo || '/admin/dashboard');
      } else {
        navigate(redirectTo || '/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-h2 font-bold text-[#E5E7EB] mb-4">Connexion</h2>
      <p className="text-sm text-muted mb-4">
        {redirectTo ? "Utilisez votre email d'administrateur." : 'Pseudo (utilisateur) ou email (admin).'}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-danger bg-danger/10 rounded-xl p-3">{error}</p>}
        <div>
          <label className="block text-sm text-muted mb-2">Pseudo ou email</label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            placeholder={redirectTo ? "admin@..." : "pseudo ou admin@..."}
            className="w-full rounded-xl bg-white/5 border border-white/8 px-4 py-3 text-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-2">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl bg-white/5 border border-white/8 px-4 py-3 text-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl bg-primary text-white font-medium disabled:opacity-50"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </motion.button>
      </form>
      {!redirectTo && (
        <p className="mt-4 text-sm text-muted text-center">
          Pas encore inscrit ? <Link to="/inscription" className="text-accent hover:underline">S'inscrire</Link>
        </p>
      )}
    </div>
  );
}
