/**
 * Middleware auth admin - Vérifie JWT administrateur (API ou Supabase Auth)
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
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch {
      if (config.jwt.supabaseSecret) {
        try {
          decoded = jwt.verify(token, config.jwt.supabaseSecret);
          decoded = { adminId: decoded.sub, type: 'admin' };
        } catch {
          return res.status(401).json({ error: 'Token invalide ou expiré' });
        }
      } else {
        return res.status(401).json({ error: 'Token invalide ou expiré' });
      }
    }
    if (decoded.type !== 'admin' && !decoded.adminId) {
      return res.status(403).json({ error: 'Accès réservé à l\'administrateur' });
    }
    const adminId = decoded.adminId || decoded.sub;
    let admin = await Admin.findById(adminId);
    // Sync Supabase: si JWT valide mais admin absent (trigger pas exécuté), créer l'admin
    if (!admin && decoded.sub && config.jwt.supabaseSecret) {
      try {
        const email = decoded.email || decoded.user_metadata?.email || '';
        if (email) {
          const bcrypt = require('bcryptjs');
          const hash = await bcrypt.hash('supabase_sync_' + Date.now(), 10);
          admin = await Admin.create(email, hash, decoded.user_metadata?.photo || '', adminId);
        }
      } catch (e) {
        console.warn('[authAdmin] sync admin:', e?.message);
      }
    }
    if (!admin) {
      return res.status(401).json({ error: 'Administrateur introuvable' });
    }
    req.admin = { id: admin.id, email: admin.email, photo: admin.photo || '' };
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token invalide ou expiré' });
    }
    next(err);
  }
}

module.exports = authAdmin;
