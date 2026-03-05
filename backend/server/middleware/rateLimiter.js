/**
 * Rate limiting - Limite les requêtes par IP
 * Protection contre abus et brute force.
 */

const rateLimit = require('express-rate-limit');
const config = require('../config');

const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { error: 'Trop de requêtes, réessayez plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Plus strict pour login admin
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Trop de tentatives de connexion.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, adminLoginLimiter };
