/**
 * Réinitialise la base JSON à l'état vide
 * Usage: npm run reset-db
 * ATTENTION: Efface toutes les données en mode JSON.
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const dbUrl = process.env.DATABASE_URL || 'json:./data/silencehub.json';
const useJson = !dbUrl || dbUrl.startsWith('json:');

function reset() {
  if (!useJson) {
    console.log('reset-db ne fonctionne qu\'en mode JSON.');
    console.log('Pour PostgreSQL, utilisez init-db après avoir recréé la base.');
    process.exit(1);
  }

  const dataPath = dbUrl.startsWith('json:')
    ? path.resolve(path.join(__dirname, '../..'), dbUrl.replace('json:', '').trim())
    : path.join(__dirname, '../../data/silencehub.json');

  const emptyPath = path.join(__dirname, '../../data/silencehub.empty.json');
  const emptyData = JSON.parse(fs.readFileSync(emptyPath, 'utf8'));

  fs.writeFileSync(dataPath, JSON.stringify(emptyData, null, 2));
  console.log('Base JSON réinitialisée.');
  console.log('Exécutez "npm run seed-admin" pour créer l\'admin initial.');
  process.exit(0);
}

reset();
