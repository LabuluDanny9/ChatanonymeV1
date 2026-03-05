/**
 * Exécute la migration messages-attachments
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { pool, useJson } = require('../config/database');
const fs = require('fs');

async function run() {
  if (useJson) {
    console.log('Migration ignorée (mode JSON)');
    process.exit(0);
    return;
  }
  const sqlPath = path.join(__dirname, 'migration-messages-attachments.sql');
  const raw = fs.readFileSync(sqlPath, 'utf8');
  const sql = raw
    .replace(/--[^\n]*/g, '')
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  for (const stmt of sql) {
    if (!stmt) continue;
    try {
      await pool.query(stmt + ';');
      console.log('OK:', stmt.slice(0, 60) + '...');
    } catch (e) {
      if (e.message?.includes('already exists') || e.message?.includes('duplicate')) {
        console.log('Skip (exists):', stmt.slice(0, 50));
      } else {
        throw e;
      }
    }
  }
  console.log('Migration terminée.');
  process.exit(0);
}

run().catch((e) => {
  console.error('Erreur:', e.message);
  process.exit(1);
});
