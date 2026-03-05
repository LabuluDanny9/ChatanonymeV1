/**
 * Insère l'admin directement dans la base de données
 * Utilise ADMIN_EMAIL et ADMIN_PASSWORD du .env
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const bcrypt = require('bcrypt');
const { pool, useJson } = require('../config/database');
const config = require('../config');

async function insertAdmin() {
  const email = config.admin.email || process.env.ADMIN_EMAIL || 'admin@silencehub.local';
  const password = config.admin.password || process.env.ADMIN_PASSWORD || 'ChangeMe123!';

  if (useJson) {
    const Admin = require('../models/Admin');
    const exists = await Admin.exists();
    if (exists) {
      console.log('Admin existe déjà');
    } else {
      const hash = await bcrypt.hash(password, 12);
      await Admin.create(email, hash, '');
      console.log('Admin ajouté:', email);
    }
    process.exit(0);
    return;
  }

  const hash = await bcrypt.hash(password, 12);

  const { rows } = await pool.query('SELECT id FROM admins WHERE LOWER(email) = LOWER($1)', [email]);
  if (rows.length > 0) {
    await pool.query('UPDATE admins SET password_hash = $2 WHERE id = $1', [rows[0].id, hash]);
    console.log('Admin mis à jour:', email);
  } else {
    await pool.query(
      'INSERT INTO admins (email, password_hash, photo) VALUES (LOWER($1), $2, $3)',
      [email, hash, '']
    );
    console.log('Admin ajouté:', email);
  }
  process.exit(0);
}

insertAdmin().catch((e) => {
  console.error('Erreur:', e.message);
  process.exit(1);
});
