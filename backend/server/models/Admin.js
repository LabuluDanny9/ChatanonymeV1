/**
 * Modèle Admin - Administrateur (email, mot de passe, photo obligatoire)
 */

const { pool } = require('../config/database');

const Admin = {
  async findByEmail(email) {
    const { rows } = await pool.query(
      'SELECT * FROM admins WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    return rows[0];
  },

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT id, email, photo, created_at FROM admins WHERE id = $1',
      [id]
    );
    return rows[0];
  },

  async create(email, passwordHash, photo = null) {
    const { rows } = await pool.query(
      `INSERT INTO admins (email, password_hash, photo) VALUES (LOWER($1), $2, $3) 
       RETURNING id, email, photo, created_at`,
      [email, passwordHash, photo || '']
    );
    return rows[0];
  },

  async updatePhoto(id, photo) {
    const { rows } = await pool.query(
      'UPDATE admins SET photo = $2 WHERE id = $1 RETURNING *',
      [id, photo]
    );
    return rows[0];
  },

  async exists() {
    const { rows } = await pool.query('SELECT 1 FROM admins LIMIT 1');
    return rows.length > 0;
  },
};

module.exports = Admin;
