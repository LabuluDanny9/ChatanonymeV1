/**
 * SILENCEHUB - Application Express
 * API REST sécurisée, CORS, rate limiting, sanitization.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const { apiLimiter } = require('./middleware/rateLimiter');
const { sanitizeBody } = require('./middleware/sanitize');
const errorHandler = require('./middleware/errorHandler');

const path = require('path');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const topicRoutes = require('./routes/topicRoutes');
const broadcastRoutes = require('./routes/broadcastRoutes');
const adminRoutes = require('./routes/adminRoutes');
const configController = require('./controllers/configController');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Trust proxy (requis quand le frontend appelle via proxy - X-Forwarded-For)
app.set('trust proxy', 1);

// Sécurité
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(apiLimiter);

// Body parsing — 15MB pour messages vocaux et pièces jointes (base64)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(sanitizeBody);

// Fichiers uploadés (statique)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'silencehub' }));

// Diagnostic complet - statut config pour résoudre les 500
app.get('/api/debug-setup', async (req, res) => {
  const checks = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    JWT_SECRET: !!process.env.JWT_SECRET,
    CORS_ORIGIN: !!process.env.CORS_ORIGIN,
    VERCEL: !!process.env.VERCEL,
    NODE_ENV: process.env.NODE_ENV || 'development',
  };
  let dbOk = false;
  let dbError = null;
  if (checks.DATABASE_URL) {
    try {
      const { pool } = require('./config/database');
      await pool.query('SELECT 1');
      const r = await pool.query('SELECT COUNT(*)::int as c FROM users');
      dbOk = true;
      checks.usersTable = true;
      checks.usersCount = r?.rows?.[0]?.c ?? 0;
    } catch (e) {
      dbError = e?.message || String(e);
      checks.usersTable = false;
    }
  }
  const ok = checks.DATABASE_URL && checks.JWT_SECRET && dbOk;
  return res.status(ok ? 200 : 503).json({
    ok,
    checks,
    dbError: dbError || undefined,
    hint: !checks.DATABASE_URL ? 'Ajoutez DATABASE_URL (pooler Supabase port 6543)' :
      !checks.JWT_SECRET ? 'Ajoutez JWT_SECRET' :
      dbError?.includes('does not exist') ? 'Exécutez init-db-complet.sql dans Supabase SQL Editor' :
      dbError ? `DB: ${dbError}` : undefined,
  });
});

// Diagnostic DB - pour identifier les erreurs d'inscription en production
app.get('/api/health-db', async (req, res) => {
  try {
    const { pool } = require('./config/database');
    const hasUrl = !!process.env.DATABASE_URL;
    const isVercel = !!process.env.VERCEL;
    const result = await pool.query('SELECT 1 as ok');
    const usersCheck = await pool.query('SELECT COUNT(*)::int as c FROM users');
    return res.json({
      status: 'ok',
      database: 'connected',
      hasDatabaseUrl: hasUrl,
      isVercel,
      usersCount: usersCheck?.rows?.[0]?.c ?? 0,
    });
  } catch (err) {
    console.error('[health-db]', err);
    return res.status(503).json({
      status: 'error',
      database: 'failed',
      error: err?.message || String(err),
      code: err?.code,
      hint: !process.env.DATABASE_URL
        ? 'DATABASE_URL manquant sur Vercel'
        : err?.message?.includes('does not exist')
          ? 'Exécutez init-db-complet.sql dans Supabase SQL Editor'
          : 'Vérifiez DATABASE_URL (pooler port 6543 recommandé)',
    });
  }
});

// Accès direct à la racine — redirection vers le frontend
app.get('/', (req, res) =>
  res.status(200).json({
    service: 'SilenceHub API',
    message: 'Utilisez http://localhost:3000 pour accéder à l\'application.',
    docs: '/health pour le statut du serveur',
  })
);

// Config publique
app.get('/api/config', configController.getConfig);

// API
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/broadcasts', broadcastRoutes);
app.use('/api/admin', adminRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Non trouvé' }));

// Erreurs
app.use(errorHandler);

module.exports = app;
