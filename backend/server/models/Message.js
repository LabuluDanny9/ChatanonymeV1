/**
 * Modèle Message - Texte, voice, image, vidéo, fichier
 * message_type: 'text' | 'voice' | 'image' | 'video' | 'file'
 * metadata: { url?, duration?, filename?, mimeType?, size? }
 * Exécuter migration-messages-attachments.sql pour les nouvelles colonnes.
 */

const { pool } = require('../config/database');

const Message = {
  async create(conversationId, senderType, senderId, content, messageType = 'text', metadata = {}, topicId = null) {
    const contentVal = content ?? '';
    const metaJson = JSON.stringify(metadata || {});
    try {
      const { rows } = await pool.query(
        `INSERT INTO messages (conversation_id, sender_type, sender_id, content, message_type, metadata, topic_id) 
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7) RETURNING *`,
        [conversationId, senderType, senderId, contentVal, messageType, metaJson, topicId]
      );
      return rows[0];
    } catch (err) {
      if (err.message && err.message.includes('column') && (err.message.includes('message_type') || err.message.includes('metadata'))) {
        const { rows } = await pool.query(
          `INSERT INTO messages (conversation_id, sender_type, sender_id, content) VALUES ($1, $2, $3, $4) RETURNING *`,
          [conversationId, senderType, senderId, typeof contentVal === 'string' ? contentVal : JSON.stringify({ type: messageType, ...metadata })]
        );
        return rows[0];
      }
      throw err;
    }
  },

  async findByConversationId(conversationId, includeDeleted = false) {
    const query = includeDeleted
      ? 'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC'
      : 'SELECT * FROM messages WHERE conversation_id = $1 AND deleted_at IS NULL ORDER BY created_at ASC';
    const { rows } = await pool.query(query, [conversationId]);
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM messages WHERE id = $1', [id]);
    return rows[0];
  },

  async markAsRead(id) {
    await pool.query('UPDATE messages SET is_read = TRUE WHERE id = $1', [id]);
    return this.findById(id);
  },

  async markConversationMessagesAsRead(conversationId, exceptSenderType) {
    await pool.query(
      `UPDATE messages SET is_read = TRUE WHERE conversation_id = $1 AND sender_type != $2`,
      [conversationId, exceptSenderType]
    );
  },

  async softDelete(id) {
    const { rows } = await pool.query(
      'UPDATE messages SET deleted_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    return rows[0];
  },

  async update(id, content, messageType = 'text', metadata = {}) {
    const metaJson = JSON.stringify(metadata || {});
    try {
      const { rows } = await pool.query(
        `UPDATE messages SET content = $2, message_type = $3, metadata = $4::jsonb, edited_at = NOW() 
         WHERE id = $1 RETURNING *`,
        [id, content ?? '', messageType, metaJson]
      );
      return rows[0];
    } catch (err) {
      if (err.message && err.message.includes('column') && err.message.includes('edited_at')) {
        const { rows } = await pool.query(
          'UPDATE messages SET content = $2, message_type = $3, metadata = $4::jsonb WHERE id = $1 RETURNING *',
          [id, content ?? '', messageType, metaJson]
        );
        return rows[0];
      }
      throw err;
    }
  },

  async getUnreadCountByConversation(conversationId, forUser = true) {
    const senderType = forUser ? 'admin' : 'user';
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS count FROM messages 
       WHERE conversation_id = $1 AND sender_type = $2 AND is_read = FALSE AND deleted_at IS NULL`,
      [conversationId, senderType]
    );
    return rows[0].count;
  },
};

module.exports = Message;
