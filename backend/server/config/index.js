/**
 * Configuration centralisée - SILENCEHUB
 */

require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5001,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    supabaseSecret: process.env.SUPABASE_JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    anonymousExpiresIn: process.env.JWT_ANONYMOUS_EXPIRES_IN || '365d',
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@silencehub.local',
    password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },
  cors: {
    // Sur Vercel : accepte *.vercel.app automatiquement (front + API même domaine)
    // CORS_ORIGIN : URL exacte ou plusieurs séparées par des virgules
    origin: (() => {
      const env = process.env.CORS_ORIGIN || 'http://localhost:3000';
      const origins = env.split(',').map((o) => o.trim()).filter(Boolean).filter((o) => o.startsWith('http'));
      if (process.env.VERCEL) {
        return (origin, cb) => {
          const ok = !origin || origins.includes(origin) || (origin && origin.endsWith('.vercel.app'));
          cb(null, ok ? (origin || true) : false);
        };
      }
      return origins.length ? (origins.length === 1 ? origins[0] : origins) : 'http://localhost:3000';
    })(),
  },
  whatsapp: {
    number: process.env.ADMIN_WHATSAPP_NUMBER || '',
  },
};
