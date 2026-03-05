/**
 * Contrôleur User - Côté utilisateur anonyme : uniquement sa propre conversation
 * Les actions admin (liste users, ban, etc.) sont dans adminController.
 */

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// GET /api/users/me/conversation - Ma conversation avec l'admin
async function getMyConversation(req, res, next) {
  try {
    const userId = req.user.id;
    const conversation = await Conversation.getOrCreateForUser(userId);
    const messages = await Message.findByConversationId(conversation.id);
    return res.json({ conversation, messages });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyConversation };
