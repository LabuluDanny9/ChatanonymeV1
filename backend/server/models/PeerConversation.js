/**
 * Conversations entre deux utilisateurs (messagerie directe)
 * user_a et user_b sont toujours ordonnés : user_a < user_b (UUID lexicographique)
 */

const { pool } = require('../config/database');

function orderPair(userId1, userId2) {
  const a = String(userId1);
  const b = String(userId2);
  return a < b ? [a, b] : [b, a];
}

const PeerConversation = {
  orderPair,

  async findByUsers(userId1, userId2) {
    const [ua, ub] = orderPair(userId1, userId2);
    const { rows } = await pool.query(
      'SELECT * FROM peer_conversations WHERE user_a = $1 AND user_b = $2',
      [ua, ub]
    );
    return rows[0];
  },

  async create(userId1, userId2) {
    const [ua, ub] = orderPair(userId1, userId2);
    const { rows } = await pool.query(
      `INSERT INTO peer_conversations (user_a, user_b) VALUES ($1, $2) RETURNING *`,
      [ua, ub]
    );
    return rows[0];
  },

  async getOrCreate(userId1, userId2) {
    let pc = await this.findByUsers(userId1, userId2);
    if (!pc) pc = await this.create(userId1, userId2);
    return pc;
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM peer_conversations WHERE id = $1', [id]);
    return rows[0];
  },

  async touchUpdatedAt(id) {
    const { rows } = await pool.query(
      `UPDATE peer_conversations SET updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    return rows[0];
  },

  /** Liste des conversations pour un utilisateur, avec l’interlocuteur et le dernier message */
  async listForUser(userId) {
    const { rows } = await pool.query(
      `/* PEER_CONV_LIST_V1 */
       SELECT pc.id, pc.user_a, pc.user_b, pc.updated_at,
              ou.id AS other_user_id, ou.pseudo AS other_pseudo, ou.photo AS other_photo,
              (SELECT pm.content FROM peer_messages pm
                WHERE pm.conversation_id = pc.id AND pm.deleted_at IS NULL
                ORDER BY pm.created_at DESC LIMIT 1) AS last_message_content,
              (SELECT pm.created_at FROM peer_messages pm
                WHERE pm.conversation_id = pc.id AND pm.deleted_at IS NULL
                ORDER BY pm.created_at DESC LIMIT 1) AS last_message_at
       FROM peer_conversations pc
       JOIN users ou ON ou.id = CASE WHEN pc.user_a = $1::uuid THEN pc.user_b ELSE pc.user_a END
       WHERE pc.user_a = $1 OR pc.user_b = $1
       ORDER BY pc.updated_at DESC`,
      [userId]
    );
    return rows;
  },
};

module.exports = PeerConversation;
