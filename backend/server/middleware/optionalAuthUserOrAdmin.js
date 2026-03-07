/**
 * Auth optionnelle - Si token valide, remplit req.user ou req.admin
 * Sinon, continue sans erreur (pour commentaires anonymes)
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const Admin = require('../models/Admin');

async function optionalAuthUserOrAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return next();
    const decoded = jwt.verify(token, config.jwt.secret);
    if (decoded.type === 'user') {
      const user = await User.findById(decoded.userId);
      if (user && user.status !== 'banned') {
        req.user = { id: user.id, pseudo: user.pseudo, photo: user.photo, type: 'user' };
      }
    } else if (decoded.type === 'admin') {
      const admin = await Admin.findById(decoded.adminId);
      if (admin) {
        req.admin = { id: admin.id, email: admin.email };
      }
    }
    next();
  } catch {
    next();
  }
}

module.exports = optionalAuthUserOrAdmin;
