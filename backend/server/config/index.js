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
    primaryEmail: (process.env.PRIMARY_ADMIN_EMAIL || 'labuludanny9@gmail.com').toLowerCase(),
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },
  cors: {
    // Sur Vercel : accepte *.vercel.app + apps Capacitor (WebView : https://localhost, capacitor://…)
    // CORS_ORIGIN : URL exacte ou plusieurs séparées par des virgules
    origin: (() => {
      const env = process.env.CORS_ORIGIN || 'http://localhost:3000';
      const origins = env.split(',').map((o) => o.trim()).filter(Boolean).filter((o) => o.startsWith('http'));

      const isCapacitorLike = (origin) => {
        if (!origin || typeof origin !== 'string') return false;
        if (origin === 'https://localhost' || origin === 'http://localhost') return true;
        if (origin.startsWith('capacitor://') || origin.startsWith('ionic://')) return true;
        return false;
      };

      const allow = (origin) => {
        if (!origin) return true;
        if (origins.includes(origin)) return true;
        if (process.env.VERCEL && origin.endsWith('.vercel.app')) return true;
        if (isCapacitorLike(origin)) return true;
        return false;
      };

      return (origin, cb) => {
        cb(null, allow(origin) ? true : false);
      };
    })(),
  },
  whatsapp: {
    number: process.env.ADMIN_WHATSAPP_NUMBER || '',
  },
};
