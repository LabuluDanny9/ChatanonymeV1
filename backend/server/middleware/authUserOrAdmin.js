/**
 * Auth User OU Admin - Accepte notre JWT ou Supabase Auth
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const Admin = require('../models/Admin');

async function authUserOrAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token requis' });
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch {
      if (config.jwt.supabaseSecret) {
        try {
          decoded = jwt.verify(token, config.jwt.supabaseSecret);
          decoded = { userId: decoded.sub, type: 'user' };
        } catch {
          return res.status(401).json({ error: 'Token invalide ou expiré' });
        }
      } else {
        return res.status(401).json({ error: 'Token invalide ou expiré' });
      }
    }
    if (decoded.type === 'user' || decoded.userId) {
      const userId = decoded.userId || decoded.sub;
      const user = await User.findById(userId);
      if (!user) return res.status(401).json({ error: 'Utilisateur introuvable' });
      if (user.status === 'banned') return res.status(403).json({ error: 'Compte désactivé' });
      req.user = { id: user.id, pseudo: user.pseudo, photo: user.photo, type: 'user' };
    } else if (decoded.type === 'admin') {
      const admin = await Admin.findById(decoded.adminId);
      if (!admin) return res.status(401).json({ error: 'Administrateur introuvable' });
      req.admin = { id: admin.id, email: admin.email };
    } else {
      return res.status(401).json({ error: 'Token invalide' });
    }
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token invalide ou expiré' });
    }
    next(err);
  }
}

module.exports = authUserOrAdmin;
