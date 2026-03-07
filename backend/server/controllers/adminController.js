/**
 * Contrôleur Admin - Dashboard, utilisateurs, conversations, modération, sujets
 */

const User = require('../models/User');
const Admin = require('../models/Admin');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Topic = require('../models/Topic');
const TopicComment = require('../models/TopicComment');
const AuditLog = require('../models/AuditLog');
const { pool } = require('../config/database');

function getClientIp(req) {
  return req.ip || req.connection?.remoteAddress || null;
}

// GET /api/admin/stats - Statistiques dashboard
async function getStats(req, res, next) {
  try {
    const [usersCount, conversationsCount, topicsCount, openConversationsCount] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS c FROM users WHERE status = $1', ['active']).then(r => r.rows[0].c),
      pool.query('SELECT COUNT(*)::int AS c FROM conversations').then(r => r.rows[0].c),
      pool.query('SELECT COUNT(*)::int AS c FROM topics').then(r => r.rows[0].c),
      pool.query('SELECT COUNT(*)::int AS c FROM conversations WHERE status = $1', ['open']).then(r => r.rows[0].c),
    ]);
    let messagesToday = 0;
    let activityData = [];
    try {
      const msgRes = await pool.query('SELECT COUNT(*)::int AS c FROM messages WHERE created_at >= CURRENT_DATE');
      messagesToday = msgRes.rows[0]?.c ?? 0;
    } catch (_) {}
    try {
      const actRes = await pool.query(`
        SELECT DATE(created_at) AS d, COUNT(*)::int AS c
        FROM messages WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY DATE(created_at) ORDER BY d ASC
      `);
      activityData = actRes.rows || [];
    } catch (_) {}
    return res.json({
      usersCount,
      conversationsCount,
      topicsCount,
      openConversationsCount,
      messagesToday,
      activityData,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/users - Liste des utilisateurs (paginated)
async function listUsers(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const offset = parseInt(req.query.offset, 10) || 0;
    const { users, total } = await User.findAll({ limit, offset });
    return res.json({ users, total });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/users/:id - Supprimer (soft) un utilisateur
async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    await User.softDelete(id);
    await AuditLog.create(req.admin.id, 'user.delete', 'user', id, null, getClientIp(req));
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/users/:id/ban - Bannir un utilisateur
async function banUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    await User.ban(id);
    await AuditLog.create(req.admin.id, 'user.ban', 'user', id, null, getClientIp(req));
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/conversations - Toutes les conversations
async function listConversations(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const offset = parseInt(req.query.offset, 10) || 0;
    const { conversations, total } = await Conversation.findAllForAdmin({ limit, offset });
    return res.json({ conversations, total });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/conversations/:id - Détail conversation + messages
async function getConversation(req, res, next) {
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ error: 'Conversation introuvable' });
    const messages = await Message.findByConversationId(conv.id, true);
    return res.json({ conversation: conv, messages });
  } catch (err) {
    next(err);
  }
}

// Normalisation contenu (texte, voice, image, fichier) — même logique que messageController
function normalizeContent(body) {
  const { content, messageType, metadata, topicId } = body || {};
  if (messageType && (metadata || messageType === 'text')) {
    const mt = messageType === 'audio' ? 'voice' : messageType;
    return { messageType: mt, content: content || '', metadata: metadata || {}, topicId: topicId || null };
  }
  const c = String(content || '').trim();
  if (!c) return null;
  try {
    const parsed = JSON.parse(c);
    if (parsed.type && parsed.data) {
      const mt = parsed.type === 'voice' ? 'voice' : parsed.type === 'image' ? 'image' : parsed.type === 'video' ? 'video' : 'file';
      const meta = { url: parsed.data };
      if (parsed.duration) meta.duration = parsed.duration;
      if (parsed.name) meta.filename = parsed.name;
      return { messageType: mt, content: '', metadata: meta, topicId: null };
    }
  } catch {}
  return { messageType: 'text', content: c, metadata: {}, topicId: null };
}

// POST /api/admin/conversations/:id/reply - Répondre (texte, voice, image, fichier)
async function replyToConversation(req, res, next) {
  try {
    const { id } = req.params;
    const payload = normalizeContent(req.body);
    if (!payload) return res.status(400).json({ error: 'Contenu requis' });
    const conv = await Conversation.findById(id);
    if (!conv) return res.status(404).json({ error: 'Conversation introuvable' });
    const message = await Message.create(
      conv.id, 'admin', req.admin.id,
      payload.content, payload.messageType, payload.metadata, payload.topicId
    );
    const io = req.app.get('io');
    if (io) io.to(`user:${conv.user_id}`).emit('message:new', { conversationId: conv.id, userId: conv.user_id, message });
    return res.status(201).json(message);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/conversations/:id/close - Marquer conversation comme fermée
async function closeConversation(req, res, next) {
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ error: 'Conversation introuvable' });
    await Conversation.close(conv.id);
    await AuditLog.create(req.admin.id, 'conversation.close', 'conversation', conv.id, null, getClientIp(req));
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/messages/:id - Soft delete un message
async function deleteMessage(req, res, next) {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Message introuvable' });
    const conv = await Conversation.findById(msg.conversation_id);
    await Message.softDelete(msg.id);
    await AuditLog.create(req.admin.id, 'message.delete', 'message', msg.id, null, getClientIp(req));
    const io = req.app.get('io');
    if (io && conv) {
      io.to(`user:${conv.user_id}`).emit('message:deleted', { conversationId: conv.id, messageId: msg.id });
    }
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/messages/:id - Modifier un message (admin, texte uniquement)
async function updateMessage(req, res, next) {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Message introuvable' });
    const { content } = req.body || {};
    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Contenu requis' });
    }
    const updated = await Message.update(msg.id, content.trim(), 'text', {});
    const conv = await Conversation.findById(msg.conversation_id);
    const io = req.app.get('io');
    if (io && conv) {
      io.to(`user:${conv.user_id}`).emit('message:updated', { conversationId: conv.id, message: updated });
    }
    await AuditLog.create(req.admin.id, 'message.update', 'message', msg.id, null, getClientIp(req));
    return res.json(updated);
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/topics - Liste sujets (admin) avec nombre de commentaires
async function listTopics(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const offset = parseInt(req.query.offset, 10) || 0;
    const { topics, total } = await Topic.findAll({ limit, offset });
    const TopicComment = require('../models/TopicComment');
    const topicsWithComments = await Promise.all(
      topics.map(async (t) => ({
        ...t,
        comments_count: await TopicComment.countByTopicId(t.id),
      }))
    );
    return res.json({ topics: topicsWithComments, total });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/topics - Publier un sujet global
async function createTopic(req, res, next) {
  try {
    const { title, content } = req.body || {};
    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: 'Titre requis' });
    }
    const topic = await Topic.create(String(title).trim(), String(content || '').trim());
    await AuditLog.create(req.admin.id, 'topic.create', 'topic', topic.id, null, getClientIp(req));
    return res.status(201).json(topic);
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/topics/:id - Modifier un sujet
async function updateTopic(req, res, next) {
  try {
    const { title, content } = req.body || {};
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ error: 'Sujet introuvable' });
    const updated = await Topic.update(topic.id, String(title ?? topic.title).trim(), String(content ?? topic.content).trim());
    return res.json(updated);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/topics/:id - Supprimer un sujet
async function deleteTopic(req, res, next) {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ error: 'Sujet introuvable' });
    await Topic.delete(topic.id);
    await AuditLog.create(req.admin.id, 'topic.delete', 'topic', topic.id, null, getClientIp(req));
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/topics/comments/:commentId/reply-private - Répondre en privé à un utilisateur (admin)
async function replyPrivateToComment(req, res, next) {
  try {
    const { commentId } = req.params;
    const { content } = req.body || {};
    if (!content || !String(content).trim()) {
      return res.status(400).json({ error: 'Contenu requis' });
    }
    const comment = await TopicComment.findById(commentId);
    if (!comment) return res.status(404).json({ error: 'Commentaire introuvable' });
    const authorId = comment.author_id ?? comment.authorId;
    if (comment.author_type !== 'user' || !authorId || authorId === 'anonymous') {
      return res.status(400).json({ error: 'Impossible de répondre en privé à un commentaire anonyme' });
    }
    const conversation = await Conversation.getOrCreateForUser(authorId);
    const message = await Message.create(
      conversation.id, 'admin', req.admin.id,
      String(content).trim(), 'text', {}, comment.topic_id
    );
    const io = req.app.get('io');
    if (io) io.to(`user:${authorId}`).emit('message:new', { conversationId: conversation.id, userId: authorId, message });
    try {
      await AuditLog.create(req.admin.id, 'comment.reply_private', 'topic_comment', commentId, null, getClientIp(req));
    } catch {}
    return res.status(201).json(message);
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/broadcast - Message collectif à tous les utilisateurs
async function sendBroadcast(req, res, next) {
  try {
    const { content } = req.body || {};
    if (!content || !String(content).trim()) {
      return res.status(400).json({ error: 'Contenu requis' });
    }
    const Broadcast = require('../models/Broadcast');
    const broadcast = await Broadcast.create(req.admin.id, String(content).trim());
    const io = req.app.get('io');
    if (io) io.emit('broadcast:new', broadcast);
    return res.status(201).json(broadcast);
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/photo - Mettre à jour la photo admin (obligatoire)
async function updatePhoto(req, res, next) {
  try {
    const { photo } = req.body || {};
    if (!photo) {
      return res.status(400).json({ error: 'Photo requise' });
    }
    await Admin.updatePhoto(req.admin.id, photo);
    const admin = await Admin.findById(req.admin.id);
    return res.json({ photo: admin.photo });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStats,
  listUsers,
  deleteUser,
  banUser,
  listConversations,
  getConversation,
  replyToConversation,
  closeConversation,
  deleteMessage,
  updateMessage,
  listTopics,
  createTopic,
  updateTopic,
  deleteTopic,
  replyPrivateToComment,
  sendBroadcast,
  updatePhoto,
};
