/**
 * Exécute toutes les migrations dans l'ordre
 * Usage: npm run migrate
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const dbUrl = process.env.DATABASE_URL || '';
const useJson = !dbUrl || dbUrl.startsWith('json:');

async function run() {
  if (useJson) {
    console.log('Migrations ignorées (mode JSON).');
    process.exit(0);
    return;
  }

  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: (dbUrl.includes('supabase.co') || dbUrl.includes('pooler.supabase.com')) ? { rejectUnauthorized: false } : false,
  });

  const migrationsDir = path.join(__dirname, '../migrations');
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const sqlPath = path.join(migrationsDir, file);
    const raw = fs.readFileSync(sqlPath, 'utf8');
    const statements = raw
      .replace(/--[^\n]*/g, '')
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`\n--- ${file} ---`);
    for (const stmt of statements) {
      if (!stmt) continue;
      try {
        await pool.query(stmt + ';');
        console.log('OK:', stmt.slice(0, 60).replace(/\s+/g, ' ') + '...');
      } catch (e) {
        if (e.message?.includes('already exists') || e.message?.includes('duplicate')) {
          console.log('Skip:', stmt.slice(0, 50) + '...');
        } else {
          throw e;
        }
      }
    }
  }

  await pool.end();
  console.log('\nMigrations terminées.');
  process.exit(0);
}

run().catch((e) => {
  console.error('Erreur:', e.message);
  process.exit(1);
});
