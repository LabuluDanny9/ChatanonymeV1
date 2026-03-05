/**
 * Modèle Broadcast - Messages collectifs envoyés par l'admin à tous les utilisateurs
 */

const { pool } = require('../config/database');

const Broadcast = {
  async create(adminId, content) {
    const { rows } = await pool.query(
      `INSERT INTO broadcasts (admin_id, content) VALUES ($1, $2) RETURNING *`,
      [adminId, content]
    );
    return rows[0];
  },

  async findAll(pagination = { limit: 50, offset: 0 }) {
    const { limit, offset } = pagination;
    const { rows } = await pool.query(
      `SELECT * FROM broadcasts ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const { rows: countRows } = await pool.query('SELECT COUNT(*)::int AS count FROM broadcasts');
    return { broadcasts: rows, total: countRows[0].count };
  },
};

module.exports = Broadcast;
