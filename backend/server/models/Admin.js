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

  async create(email, passwordHash, photo = null, customId = null) {
    if (customId) {
      const { rows } = await pool.query(
        `INSERT INTO admins (id, email, password_hash, photo) VALUES ($1, LOWER($2), $3, $4) 
         ON CONFLICT (id) DO NOTHING RETURNING id, email, photo, created_at`,
        [customId, email, passwordHash, photo || '']
      );
      return rows[0] || (await this.findById(customId));
    }
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

  async count() {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM admins');
    return rows[0]?.count ?? 0;
  },

  async findAll() {
    const { rows } = await pool.query(
      'SELECT id, email, photo, created_at FROM admins ORDER BY created_at ASC'
    );
    return rows;
  },

  async getFirstPhoto() {
    const { rows } = await pool.query('SELECT photo FROM admins LIMIT 1');
    return rows[0]?.photo || null;
  },

  async deleteById(id) {
    const { rows } = await pool.query('DELETE FROM admins WHERE id = $1 RETURNING id', [id]);
    return rows[0] || null;
  },
};

module.exports = Admin;
