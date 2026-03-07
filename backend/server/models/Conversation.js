/**
 * Modèle Conversation - Fil 1-to-admin par utilisateur
 * Une seule conversation ouverte par user.
 */

const { pool } = require('../config/database');

const Conversation = {
  async findByUserId(userId) {
    const { rows } = await pool.query(
      'SELECT * FROM conversations WHERE user_id = $1',
      [userId]
    );
    return rows[0];
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM conversations WHERE id = $1', [id]);
    return rows[0];
  },

  async create(userId) {
    const { rows } = await pool.query(
      `INSERT INTO conversations (user_id, status) VALUES ($1, 'open') RETURNING *`,
      [userId]
    );
    return rows[0];
  },

  async getOrCreateForUser(userId) {
    let conv = await this.findByUserId(userId);
    if (!conv) conv = await this.create(userId);
    return conv;
  },

  async updateStatus(id, status) {
    const { rows } = await pool.query(
      'UPDATE conversations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    return rows[0];
  },

  async close(id) {
    return this.updateStatus(id, 'closed');
  },

  async findAllForAdmin(pagination = { limit: 50, offset: 0 }) {
    const { limit, offset } = pagination;
    const { rows } = await pool.query(
      `SELECT c.id, c.user_id, c.status, c.created_at, c.updated_at,
              u.pseudo, u.photo, u.status AS user_status
       FROM conversations c
       JOIN users u ON u.id = c.user_id
       ORDER BY c.updated_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const { rows: countRows } = await pool.query('SELECT COUNT(*)::int AS count FROM conversations');
    return { conversations: rows, total: countRows[0].count };
  },
};

module.exports = Conversation;
