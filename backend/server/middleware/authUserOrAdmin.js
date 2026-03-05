/**
 * Auth User OU Admin - Pour upload (user ou admin)
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
    const decoded = jwt.verify(token, config.jwt.secret);
    if (decoded.type === 'user') {
      const user = await User.findById(decoded.userId);
      if (!user) return res.status(401).json({ error: 'Utilisateur introuvable' });
      if (user.status === 'banned') return res.status(403).json({ error: 'Compte désactivé' });
      req.user = { id: user.id, pseudo: user.pseudo, type: 'user' };
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
