/**
 * Modèle Topic - Sujets globaux publiés par l'admin
 * Lecture seule pour les utilisateurs anonymes.
 */

const { pool } = require('../config/database');

const Topic = {
  async create(title, content) {
    const { rows } = await pool.query(
      `INSERT INTO topics (title, content) VALUES ($1, $2) RETURNING *`,
      [title, content]
    );
    return rows[0];
  },

  async findAll(pagination = { limit: 20, offset: 0 }) {
    const { limit, offset } = pagination;
    const { rows } = await pool.query(
      `SELECT * FROM topics ORDER BY published_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const { rows: countRows } = await pool.query('SELECT COUNT(*)::int AS count FROM topics');
    return { topics: rows, total: countRows[0].count };
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM topics WHERE id = $1', [id]);
    return rows[0];
  },

  async update(id, title, content) {
    const { rows } = await pool.query(
      'UPDATE topics SET title = $1, content = $2 WHERE id = $3 RETURNING *',
      [title, content, id]
    );
    return rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM topics WHERE id = $1', [id]);
    return { deleted: true };
  },
};

module.exports = Topic;
