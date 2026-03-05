/**
 * Gestionnaire d'erreurs global - Pas d'exposition de détails en production
 */

const config = require('../config');

function errorHandler(err, req, res, next) {
  console.error(err);

  let status = err.statusCode || err.status || 500;
  if (err.message?.includes('Type de fichier') || err.message?.includes('File too large') || err.code === 'LIMIT_FILE_SIZE') {
    status = 400;
  }
  const message = config.env === 'production' && status === 500
    ? 'Erreur serveur'
    : (err.message || 'Erreur serveur');

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
