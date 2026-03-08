/**
 * Contrôleur Message - Texte, voice, image, vidéo, fichier
 */

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

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

// POST /api/messages - Envoyer un message (user anonyme)
async function sendMessage(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Session expirée. Reconnectez-vous.' });
    }
    const payload = normalizeContent(req.body);
    if (!payload) {
      return res.status(400).json({ error: 'Contenu du message requis' });
    }
    const conversation = await Conversation.getOrCreateForUser(userId);
    const message = await Message.create(
      conversation.id,
      'user',
      userId,
      payload.content,
      payload.messageType,
      payload.metadata || {},
      payload.topicId
    );
    const io = req.app.get('io');
    if (io) io.to('admin').emit('message:new', { conversationId: conversation.id, userId, message });
    return res.status(201).json(message);
  } catch (err) {
    console.error('[sendMessage]', err?.message, err?.code);
    next(err);
  }
}

// GET /api/messages - Liste des messages de ma conversation (user)
async function getMyMessages(req, res, next) {
  try {
    const userId = req.user.id;
    const conversation = await Conversation.findByUserId(userId);
    if (!conversation) {
      return res.json({ conversation: null, messages: [] });
    }
    const messages = await Message.findByConversationId(conversation.id);
    return res.json({ conversation, messages });
  } catch (err) {
    next(err);
  }
}

// Marquer mes messages non lus comme lus (user) — émet à l'admin pour check bleu
async function markAsRead(req, res, next) {
  try {
    const userId = req.user.id;
    const conversation = await Conversation.findByUserId(userId);
    if (!conversation) return res.json({ ok: true });
    await Message.markConversationMessagesAsRead(conversation.id, 'user');
    const io = req.app.get('io');
    if (io) io.to('admin').emit('messages:read', { conversationId: conversation.id });
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/messages/:id - Supprimer un de mes messages (user)
async function deleteMessage(req, res, next) {
  try {
    const userId = req.user.id;
    const conversation = await Conversation.findByUserId(userId);
    if (!conversation) return res.status(404).json({ error: 'Conversation introuvable' });
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Message introuvable' });
    if (msg.conversation_id !== conversation.id || msg.sender_type !== 'user' || msg.sender_id !== userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }
    await Message.softDelete(msg.id);
    const io = req.app.get('io');
    if (io) {
      io.to('admin').emit('message:deleted', { conversationId: conversation.id, messageId: msg.id });
    }
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/messages/:id - Modifier un de mes messages (user, texte uniquement)
async function updateMessage(req, res, next) {
  try {
    const userId = req.user.id;
    const conversation = await Conversation.findByUserId(userId);
    if (!conversation) return res.status(404).json({ error: 'Conversation introuvable' });
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Message introuvable' });
    if (msg.conversation_id !== conversation.id || msg.sender_type !== 'user' || msg.sender_id !== userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }
    const { content } = req.body || {};
    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Contenu requis' });
    }
    const updated = await Message.update(msg.id, content.trim(), 'text', {});
    const io = req.app.get('io');
    if (io) io.to('admin').emit('message:updated', { conversationId: conversation.id, message: updated });
    return res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = { sendMessage, getMyMessages, markAsRead, deleteMessage, updateMessage };
