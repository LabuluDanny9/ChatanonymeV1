/**
 * Supprime tous les administrateurs et en crée un seul
 * Usage: node server/scripts/reset-admins-one.js [email] [mot_de_passe]
 * Si email/mot de passe omis, utilise ADMIN_EMAIL et ADMIN_PASSWORD du .env
 * Fonctionne avec PostgreSQL (Supabase) et JSON
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');

const dbUrl = process.env.DATABASE_URL || '';
const useJson = !dbUrl || dbUrl.startsWith('json:');

async function run() {
  const email = process.argv[2] || process.env.ADMIN_EMAIL || 'admin@laparte.com';
  const password = process.argv[3] || process.env.ADMIN_PASSWORD || 'Admin123!';

  if (password.length < 6) {
    console.error('Le mot de passe doit contenir au moins 6 caractères.');
    process.exit(1);
  }

  if (useJson) {
    const fs = require('fs');
    const dataPath = dbUrl.startsWith('json:')
      ? path.resolve(path.join(__dirname, '../..'), dbUrl.replace('json:', '').trim())
      : path.join(__dirname, '../../data/silencehub.json');
    if (!fs.existsSync(dataPath)) {
      console.error('Fichier introuvable:', dataPath);
      process.exit(1);
    }
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const previousCount = (data.admins || []).length;
    const hash = await bcrypt.hash(password, 12);
    data.admins = [{
      id: require('crypto').randomUUID(),
      email: email.toLowerCase(),
      password_hash: hash,
      photo: '',
      created_at: new Date().toISOString(),
    }];
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    console.log(`${previousCount} administrateur(s) supprimé(s).`);
    console.log('1 administrateur créé:', email);
    process.exit(0);
    return;
  }

  // PostgreSQL — supprimer d'abord les tables qui référencent admins
  const { pool } = require('../config/database');
  await pool.query('DELETE FROM audit_logs');
  await pool.query('DELETE FROM broadcasts');
  const { rows: deleted } = await pool.query('DELETE FROM admins RETURNING id');
  const hash = await bcrypt.hash(password, 12);
  await pool.query(
    'INSERT INTO admins (email, password_hash, photo) VALUES (LOWER($1), $2, $3)',
    [email, hash, '']
  );
  console.log(`${deleted.length} administrateur(s) supprimé(s).`);
  console.log('1 administrateur créé:', email);
  console.log('Connectez-vous sur /admin avec ces identifiants.');
  process.exit(0);
}

run().catch((e) => {
  console.error('Erreur:', e.message);
  process.exit(1);
});
