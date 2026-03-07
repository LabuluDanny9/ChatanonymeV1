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

function isDbSchemaError(err) {
  const code = err?.code || err?.cause?.code;
  const msg = err?.message || '';
  return code === '42P01' || code === 'DATABASE_URL_REQUIRED'
    || (msg.includes('relation') && msg.includes('does not exist'))
    || msg.includes('DATABASE_URL manquant');
}

function errorHandler(err, req, res, next) {
  console.error('[errorHandler]', err?.message, err?.code, err?.stack);

  let status = err.statusCode || err.status || 500;
  if (err.message?.includes('Type de fichier') || err.message?.includes('File too large') || err.code === 'LIMIT_FILE_SIZE') {
    status = 400;
  }
  if (isDbConnectionError(err)) {
    status = 503;
  }
  if (isDbSchemaError(err)) {
    status = 503;
  }

  let message = config.env === 'production' && status === 500
    ? 'Erreur serveur'
    : (err.message || 'Erreur serveur');

  if (status === 503) {
    if (isDbSchemaError(err)) {
      message = 'Base de données non configurée. Exécutez init-db-complet.sql dans Supabase (SQL Editor) et configurez DATABASE_URL sur Vercel.';
    } else if (isDbConnectionError(err)) {
      message = 'Base de données indisponible. Utilisez le connection pooler Supabase (port 6543). Voir DEPLOYMENT.md';
    } else {
      message = 'Base de données indisponible. Vérifiez DATABASE_URL et le schéma Supabase. Voir DEPLOYMENT.md';
    }
  }

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
