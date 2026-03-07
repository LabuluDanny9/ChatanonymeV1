/**
 * Seed utilisateur + admin — ChatAnonyme
 * Crée demo (Demo123!) et admin@laparte.app (Admin123!)
 * Usage: npm run seed-user-admin
 * Ou exécuter seed-user-admin.sql dans Supabase SQL Editor
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const dbUrl = process.env.DATABASE_URL || '';

async function run() {
  if (!dbUrl || dbUrl.startsWith('json:')) {
    console.log('DATABASE_URL PostgreSQL requis. Exécutez seed-user-admin.sql dans Supabase SQL Editor.');
    process.exit(1);
  }

  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: (dbUrl.includes('supabase.co') || dbUrl.includes('pooler.supabase.com')) ? { rejectUnauthorized: false } : false,
  });

  try {
    await pool.query(`
      INSERT INTO users (id, pseudo, password_hash, phone, email, photo, status)
      SELECT gen_random_uuid(), 'demo', crypt('Demo123!', gen_salt('bf', 12)), NULL, 'demo@laparte.app', NULL, 'active'
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE LOWER(pseudo) = 'demo')
    `);
    await pool.query(`
      INSERT INTO admins (id, email, password_hash, photo)
      SELECT gen_random_uuid(), 'admin@laparte.app', crypt('Admin123!', gen_salt('bf', 12)), ''
      WHERE NOT EXISTS (SELECT 1 FROM admins WHERE LOWER(email) = 'admin@laparte.app')
    `);
    console.log('Utilisateur: demo / Demo123!');
    console.log('Admin: admin@laparte.app / Admin123!');
  } catch (err) {
    console.error('Erreur:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
