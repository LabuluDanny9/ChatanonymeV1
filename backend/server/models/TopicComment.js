/**
 * Modèle TopicComment - Commentaires sur les sujets forum
 */

const { pool } = require('../config/database');

const TopicComment = {
  async create({ topicId, authorId, authorType, authorName, authorPhoto, parentId, content }) {
    const { rows } = await pool.query(
      `INSERT INTO topic_comments (topic_id, author_id, author_type, author_name, author_photo, parent_id, content)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [topicId, authorId, authorType, authorName, authorPhoto || null, parentId || null, content?.trim() || '']
    );
    return rows[0];
  },

  async findByTopicId(topicId) {
    const { rows } = await pool.query(
      'SELECT * FROM topic_comments WHERE topic_id = $1 ORDER BY created_at ASC',
      [topicId]
    );
    return rows;
  },

  async like(commentId) {
    const { rows } = await pool.query(
      'UPDATE topic_comments SET likes_count = likes_count + 1 WHERE id = $1 RETURNING *',
      [commentId]
    );
    return rows[0];
  },

  async countByTopicId(topicId) {
    const { rows } = await pool.query(
      'SELECT COUNT(*)::int AS count FROM topic_comments WHERE topic_id = $1',
      [topicId]
    );
    return rows[0]?.count ?? 0;
  },

  async findById(commentId) {
    const { rows } = await pool.query(
      'SELECT * FROM topic_comments WHERE id = $1',
      [commentId]
    );
    return rows[0];
  },

  async delete(commentId) {
    await pool.query('DELETE FROM topic_comments WHERE id = $1', [commentId]);
    return true;
  },
};

module.exports = TopicComment;
