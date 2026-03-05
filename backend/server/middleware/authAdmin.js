/**
 * Middleware auth admin - Vérifie JWT administrateur
 * req.admin = { id, email }
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const Admin = require('../models/Admin');

async function authAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Token admin manquant' });
    }
    const decoded = jwt.verify(token, config.jwt.secret);
    if (decoded.type !== 'admin') {
      return res.status(403).json({ error: 'Accès réservé à l\'administrateur' });
    }
    const admin = await Admin.findById(decoded.adminId);
    if (!admin) {
      return res.status(401).json({ error: 'Administrateur introuvable' });
    }
    req.admin = { id: admin.id, email: admin.email };
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token invalide ou expiré' });
    }
    next(err);
  }
}

module.exports = authAdmin;
