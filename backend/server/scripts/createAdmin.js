/**
 * Créer un compte administrateur
 * Usage: node server/scripts/createAdmin.js <email> <mot_de_passe>
 * Exemple: node server/scripts/createAdmin.js admin@monapp.com MonMotDePasse123!
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const bcrypt = require('bcrypt');
const { pool, useJson } = require('../config/database');

async function createAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.log('Usage: node server/scripts/createAdmin.js <email> <mot_de_passe>');
    console.log('Exemple: node server/scripts/createAdmin.js admin@monapp.com MonMotDePasse123!');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('Le mot de passe doit contenir au moins 6 caractères.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);

  if (useJson) {
    const fs = require('fs');
    const dbUrl = process.env.DATABASE_URL || '';
    const dataPath = dbUrl.startsWith('json:')
      ? path.resolve(path.join(__dirname, '../..'), dbUrl.replace('json:', '').trim())
      : path.join(__dirname, '../../data/silencehub.json');
    let data = { admins: [], users: [], conversations: [], messages: [], topics: [], broadcasts: [], audit_logs: [] };
    if (fs.existsSync(dataPath)) {
      data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
    if (!data.admins) data.admins = [];

    const existing = data.admins.find((a) => a.email?.toLowerCase() === email.toLowerCase());
    if (existing) {
      existing.password_hash = hash;
      console.log('Mot de passe admin mis à jour:', email);
    } else {
      data.admins.push({
        id: `admin-${Date.now()}`,
        email: email.toLowerCase(),
        password_hash: hash,
        photo: '',
        created_at: new Date().toISOString(),
      });
      console.log('Admin créé:', email);
    }
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    process.exit(0);
    return;
  }

  const { rows } = await pool.query('SELECT id FROM admins WHERE LOWER(email) = LOWER($1)', [email]);
  if (rows.length > 0) {
    await pool.query('UPDATE admins SET password_hash = $2, updated_at = NOW() WHERE id = $1', [rows[0].id, hash]);
    console.log('Mot de passe admin mis à jour:', email);
  } else {
    await pool.query(
      'INSERT INTO admins (email, password_hash, photo) VALUES (LOWER($1), $2, $3)',
      [email, hash, '']
    );
    console.log('Admin créé:', email);
  }
  process.exit(0);
}

createAdmin().catch((e) => {
  console.error('Erreur:', e.message);
  process.exit(1);
});
