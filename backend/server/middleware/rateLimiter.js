/**
 * Rate limiting - Limite les requêtes par IP
 * Protection contre abus et brute force.
 */

const rateLimit = require('express-rate-limit');
const config = require('../config');

const isProd = (process.env.NODE_ENV || 'development') === 'production';

// En dev, le polling (chat/admin) dépasse facilement 100 req/15 min.
// On augmente donc le plafond pour éviter de bloquer toute la plateforme pendant les tests.
const effectiveMax = isProd
  ? config.rateLimit.max
  : Math.max(config.rateLimit.max || 100, 2000);

const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: effectiveMax,
  message: { error: 'Trop de requêtes, réessayez plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
  // Chat + pièces jointes / vocaux : pas de quota global (envoi continu)
  skip: (req) => {
    const path = req.path || '';
    return (
      path.startsWith('/api/messages') ||
      path.startsWith('/api/admin/conversations') ||
      path.startsWith('/api/upload')
    );
  },
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
