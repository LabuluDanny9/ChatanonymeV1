/**
 * Supprime tous les administrateurs
 * Usage: node server/scripts/clear-admins.js [--json]
 * --json : force le mode JSON (fichier local) même si DATABASE_URL est PostgreSQL
 * Fonctionne en mode JSON et PostgreSQL
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');

const forceJson = process.argv.includes('--json');
const dbUrl = forceJson ? 'json:./data/silencehub.json' : (process.env.DATABASE_URL || '');
const useJson = !dbUrl || dbUrl.startsWith('json:');

async function run() {
  if (useJson) {
    const dbPath = dbUrl.startsWith('json:')
      ? path.resolve(path.join(__dirname, '../..'), dbUrl.replace('json:', '').trim())
      : path.join(__dirname, '../../data/silencehub.json');
    if (!fs.existsSync(dbPath)) {
      console.error('Fichier introuvable:', dbPath);
      process.exit(1);
    }
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const count = (data.admins || []).length;
    data.admins = [];
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    console.log(`${count} administrateur(s) supprimé(s).`);
    console.log('L\'onglet inscription est maintenant actif sur /admin');
    process.exit(0);
  }

  const { pool } = require('../config/database');
  const { rows } = await pool.query('DELETE FROM admins RETURNING id');
  const count = rows.length;
  console.log(`${count} administrateur(s) supprimé(s).`);
  console.log('L\'onglet inscription est maintenant actif sur /admin');
  process.exit(0);
}

run().catch((e) => {
  console.error('Erreur:', e.message);
  process.exit(1);
});
