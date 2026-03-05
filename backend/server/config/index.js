/**
 * Configuration centralisée - SILENCEHUB
 */

require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
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
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  whatsapp: {
    number: process.env.ADMIN_WHATSAPP_NUMBER || '',
  },
};
