/**
 * Inscription - Design system
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!pseudo.trim() || !password) {
      setError('Pseudo et mot de passe requis');
      return;
    }
    setLoading(true);
    try {
      await registerUser(pseudo.trim(), password, phone.trim() || null, email.trim() || null, null);
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
          <label className="block text-sm text-muted mb-2">Pseudo *</label>
          <input
            type="text"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            required
            className="w-full rounded-xl bg-white/5 border border-white/8 px-4 py-3 text-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
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
          <label className="block text-sm text-muted mb-2">Téléphone (optionnel)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/8 px-4 py-3 text-[#E5E7EB]"
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-2">Email (optionnel)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/8 px-4 py-3 text-[#E5E7EB]"
          />
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
