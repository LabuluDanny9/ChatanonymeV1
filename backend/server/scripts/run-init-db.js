/**
 * Initialisation PostgreSQL — ChatAnonyme
 * Exécute init-db.sql pour créer le schéma (users, admins, conversations, messages, etc.)
 * Usage: npm run init-db
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const dbUrl = process.env.DATABASE_URL || '';
const useJson = !dbUrl || dbUrl.startsWith('json:');

async function run() {
  if (useJson) {
    console.log('Mode JSON détecté — init-db ignoré (utilisez PostgreSQL pour exécuter le schéma).');
    console.log('Pour PostgreSQL : définissez DATABASE_URL=postgresql://... dans .env');
    process.exit(0);
    return;
  }

  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: dbUrl.includes('supabase.co') ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('Connexion à PostgreSQL...');
    await pool.query('SELECT 1');
    console.log('Connexion OK.');

    const fs = require('fs');
    const sqlPath = path.join(__dirname, 'init-db.sql');
    const raw = fs.readFileSync(sqlPath, 'utf8');
    const statements = raw
      .replace(/--[^\n]*/g, '')
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      try {
        await pool.query(stmt + ';');
        const preview = stmt.slice(0, 70).replace(/\s+/g, ' ');
        console.log('OK:', preview + (stmt.length > 70 ? '...' : ''));
      } catch (e) {
        if (e.message?.includes('already exists') || e.message?.includes('duplicate')) {
          console.log('Skip (existe déjà):', stmt.slice(0, 50) + '...');
        } else {
          throw e;
        }
      }
    }

    console.log('\nBase de données initialisée avec succès.');
    console.log('Exécutez "npm run seed-admin" pour créer l\'admin initial.');
  } catch (err) {
    console.error('Erreur:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

run();
