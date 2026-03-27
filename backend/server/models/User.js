/**
 * Modèle User - Utilisateurs inscrits (pseudo, mot de passe, infos optionnelles)
 */

const { pool } = require('../config/database');

const User = {
  async create({ pseudo, passwordHash, phone = null, email = null, photo = null, id: customId = null }) {
    if (customId) {
      const { rows } = await pool.query(
        `INSERT INTO users (id, pseudo, password_hash, phone, email, photo, status) 
         VALUES ($1, $2, $3, $4, $5, $6, 'active') 
         ON CONFLICT (id) DO NOTHING RETURNING *`,
        [customId, pseudo, passwordHash, phone, email, photo]
      );
      return rows[0] || (await this.findById(customId));
    }
    const { rows } = await pool.query(
      `INSERT INTO users (pseudo, password_hash, phone, email, photo, status) 
       VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *`,
      [pseudo, passwordHash, phone, email, photo]
    );
    return rows[0];
  },

  async findByPseudo(pseudo) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE LOWER(pseudo) = LOWER($1) AND status != $2',
      [pseudo, 'deleted']
    );
    return rows[0];
  },

  async findByEmail(email) {
    if (!email || !email.includes('@')) return null;
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND status != $2',
      [email, 'deleted']
    );
    return rows[0];
  },

  async findByIdentifier(identifier) {
    if (identifier?.includes('@')) {
      return this.findByEmail(identifier);
    }
    return this.findByPseudo(identifier);
  },

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT id, pseudo, phone, email, photo, status, created_at FROM users WHERE id = $1',
      [id]
    );
    return rows[0];
  },

  async findAll(pagination = { limit: 50, offset: 0 }) {
    const { limit, offset } = pagination;
    const { rows } = await pool.query(
      `SELECT id, pseudo, phone, email, photo, status, created_at FROM users 
       ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const { rows: countRows } = await pool.query('SELECT COUNT(*)::int AS count FROM users');
    return { users: rows, total: countRows[0].count };
  },

  async updateStatus(id, status) {
    const { rows } = await pool.query(
      'UPDATE users SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return rows[0];
  },

  async updateProfile(id, { phone, email, photo }) {
    const { rows } = await pool.query(
      `UPDATE users SET phone = COALESCE($2, phone), email = COALESCE($3, email), photo = COALESCE($4, photo) 
       WHERE id = $1 RETURNING *`,
      [id, phone, email, photo]
    );
    return rows[0];
  },

  async softDelete(id) {
    return this.updateStatus(id, 'deleted');
  },

  async ban(id) {
    return this.updateStatus(id, 'banned');
  },

  /** Recherche d’utilisateurs actifs par pseudo (messagerie entre utilisateurs) */
  async searchActiveByPseudo(substring, excludeUserId, limit = 20) {
    const needle = String(substring || '').trim();
    if (needle.length < 2) return [];
    const pattern = `%${needle}%`;
    const { rows } = await pool.query(
      `/* peer_user_search */
       SELECT id, pseudo, photo FROM users
       WHERE status = 'active' AND id != $1 AND LOWER(pseudo) LIKE LOWER($2)
       ORDER BY pseudo ASC LIMIT $3`,
      [excludeUserId, pattern, limit]
    );
    return rows;
  },
};

module.exports = User;
