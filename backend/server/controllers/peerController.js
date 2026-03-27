/**
 * Messagerie entre utilisateurs (activable par l’administrateur principal)
 */

const User = require('../models/User');
const PeerConversation = require('../models/PeerConversation');
const PeerMessage = require('../models/PeerMessage');

function isParticipant(conv, userId) {
  if (!conv) return false;
  const u = String(userId);
  return String(conv.user_a) === u || String(conv.user_b) === u;
}

async function discover(req, res, next) {
  try {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) {
      return res.json({ users: [] });
    }
    const users = await User.searchActiveByPseudo(q, req.user.id, 20);
    return res.json({ users });
  } catch (err) {
    next(err);
  }
}

async function openConversation(req, res, next) {
  try {
    const { pseudo, userId: otherIdRaw } = req.body || {};
    let other = null;
    if (otherIdRaw) {
      other = await User.findById(String(otherIdRaw));
    } else if (pseudo && String(pseudo).trim()) {
      other = await User.findByPseudo(String(pseudo).trim());
    }
    if (!other || other.status === 'banned' || other.status === 'deleted') {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }
    if (other.id === req.user.id) {
      return res.status(400).json({ error: 'Vous ne pouvez pas ouvrir une conversation avec vous-même' });
    }
    const conv = await PeerConversation.getOrCreate(req.user.id, other.id);
    return res.json({
      conversation: {
        id: conv.id,
        updated_at: conv.updated_at,
        otherUser: { id: other.id, pseudo: other.pseudo, photo: other.photo || null },
      },
    });
  } catch (err) {
    next(err);
  }
}

async function listConversations(req, res, next) {
  try {
    const rows = await PeerConversation.listForUser(req.user.id);
    const conversations = rows.map((r) => ({
      id: r.id,
      updated_at: r.updated_at,
      otherUser: {
        id: r.other_user_id,
        pseudo: r.other_pseudo,
        photo: r.other_photo || null,
      },
      lastMessage: r.last_message_content
        ? { content: r.last_message_content, created_at: r.last_message_at }
        : null,
    }));
    return res.json({ conversations });
  } catch (err) {
    next(err);
  }
}

async function getMessages(req, res, next) {
  try {
    const conv = await PeerConversation.findById(req.params.id);
    if (!conv || !isParticipant(conv, req.user.id)) {
      return res.status(404).json({ error: 'Conversation introuvable' });
    }
    const messages = await PeerMessage.findByConversationId(conv.id);
    const otherId = String(conv.user_a) === String(req.user.id) ? conv.user_b : conv.user_a;
    const other = await User.findById(otherId);
    return res.json({
      conversation: {
        id: conv.id,
        otherUser: other
          ? { id: other.id, pseudo: other.pseudo, photo: other.photo || null }
          : null,
      },
      messages,
    });
  } catch (err) {
    next(err);
  }
}

async function sendMessage(req, res, next) {
  try {
    const conv = await PeerConversation.findById(req.params.id);
    if (!conv || !isParticipant(conv, req.user.id)) {
      return res.status(404).json({ error: 'Conversation introuvable' });
    }
    const { content, messageType, metadata } = req.body || {};
    const text = content != null ? String(content).trim() : '';
    if (!text) {
      return res.status(400).json({ error: 'Message vide' });
    }
    const msg = await PeerMessage.create(
      conv.id,
      req.user.id,
      text,
      messageType || 'text',
      metadata && typeof metadata === 'object' ? metadata : {}
    );
    await PeerConversation.touchUpdatedAt(conv.id);
    return res.status(201).json(msg);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  discover,
  openConversation,
  listConversations,
  getMessages,
  sendMessage,
};
