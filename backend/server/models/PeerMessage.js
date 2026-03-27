/**
 * Messages dans une conversation peer (utilisateur ↔ utilisateur)
 */

const { pool } = require('../config/database');

const PeerMessage = {
  async create(conversationId, senderId, content, messageType = 'text', metadata = {}) {
    const metaJson = JSON.stringify(metadata || {});
    const { rows } = await pool.query(
      `INSERT INTO peer_messages (conversation_id, sender_id, content, message_type, metadata)
       VALUES ($1, $2, $3, $4, $5::jsonb) RETURNING *`,
      [conversationId, senderId, content ?? '', messageType, metaJson]
    );
    return rows[0];
  },

  async findByConversationId(conversationId) {
    const { rows } = await pool.query(
      `SELECT * FROM peer_messages
       WHERE conversation_id = $1 AND deleted_at IS NULL
       ORDER BY created_at ASC`,
      [conversationId]
    );
    return rows;
  },
};

module.exports = PeerMessage;
