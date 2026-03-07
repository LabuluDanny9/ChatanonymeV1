/**
 * Gestionnaire d'erreurs global - Pas d'exposition de détails en production
 */

const config = require('../config');

function isDbConnectionError(err) {
  const code = err?.code || err?.cause?.code;
  return code === 'ECONNREFUSED' || code === 'ETIMEDOUT' || code === 'ENOTFOUND'
    || err?.message?.includes('Connection terminated')
    || err?.message?.includes('connection timeout')
    || err?.message?.includes('connect ETIMEDOUT');
}

function errorHandler(err, req, res, next) {
  console.error(err);

  let status = err.statusCode || err.status || 500;
  if (err.message?.includes('Type de fichier') || err.message?.includes('File too large') || err.code === 'LIMIT_FILE_SIZE') {
    status = 400;
  }
  if (isDbConnectionError(err)) {
    status = 503;
  }

  let message = config.env === 'production' && status === 500
    ? 'Erreur serveur'
    : (err.message || 'Erreur serveur');

  if (status === 503) {
    message = 'Base de données indisponible. Utilisez le connection pooler Supabase (port 6543) ou le mode JSON. Voir backend/.env';
  }

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
