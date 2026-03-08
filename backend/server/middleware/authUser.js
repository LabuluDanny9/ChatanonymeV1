/**
 * Middleware auth utilisateur - Vérifie JWT (notre token ou Supabase Auth)
 * req.user = { id, pseudo, type: 'user' }
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

async function authUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch {
      if (config.jwt.supabaseSecret) {
        try {
          decoded = jwt.verify(token, config.jwt.supabaseSecret);
          if (decoded.sub) decoded = { userId: decoded.sub, type: 'user' };
        } catch {
          return res.status(401).json({ error: 'Token invalide ou expiré' });
        }
      } else {
        return res.status(401).json({ error: 'Token invalide ou expiré' });
      }
    }
    if (decoded.type !== 'user' && !decoded.userId) {
      return res.status(403).json({ error: 'Accès réservé aux utilisateurs' });
    }
    const userId = decoded.userId || decoded.sub;
    let user = await User.findById(userId);
    // Sync Supabase: si JWT valide mais user absent (trigger pas exécuté), créer l'utilisateur
    if (!user && decoded.sub && config.jwt.supabaseSecret) {
      try {
        const meta = decoded.user_metadata || decoded;
        const pseudo = String(meta.pseudo || meta.email?.split('@')[0] || 'user').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50) || 'user';
        const bcrypt = require('bcryptjs');
        const hash = await bcrypt.hash('supabase_sync_' + Date.now(), 10);
        user = await User.create({
          id: userId,
          pseudo,
          passwordHash: hash,
          phone: null,
          email: meta.email || null,
          photo: meta.photo || null,
        });
      } catch (e) {
        console.warn('[authUser] sync user:', e?.message);
      }
    }
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur introuvable' });
    }
    if (user.status === 'banned') {
      return res.status(403).json({ error: 'Compte désactivé' });
    }
    if (user.status === 'deleted') {
      return res.status(401).json({ error: 'Session expirée' });
    }
    req.user = {
      id: user.id,
      pseudo: user.pseudo,
      photo: user.photo,
      type: 'user',
    };
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token invalide ou expiré' });
    }
    next(err);
  }
}

module.exports = authUser;
