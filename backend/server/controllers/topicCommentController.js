/**
 * Contrôleur TopicComment - Commentaires sur les sujets forum
 */

const TopicComment = require('../models/TopicComment');
const Topic = require('../models/Topic');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// GET /api/topics/:topicId/comments - Liste des commentaires d'un sujet
async function list(req, res, next) {
  try {
    const { topicId } = req.params;
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ error: 'Sujet introuvable' });
    }
    const comments = await TopicComment.findByTopicId(topicId);
    return res.json({ comments });
  } catch (err) {
    next(err);
  }
}

// POST /api/topics/:topicId/comments - Créer un commentaire
async function create(req, res, next) {
  try {
    const { topicId } = req.params;
    const { content, parentId } = req.body;
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ error: 'Sujet introuvable' });
    }
    if (!content || !String(content).trim()) {
      return res.status(400).json({ error: 'Le contenu du commentaire est requis' });
    }

    // Auteur : admin connecté, user connecté, ou anonyme (author_name dans body)
    let authorId = null;
    let authorType = 'user';
    let authorName = 'Anonyme';
    let authorPhoto = null;

    if (req.admin) {
      authorId = req.admin.id;
      authorType = 'admin';
      authorName = req.admin.email?.split('@')[0] || 'Admin';
    } else if (req.user) {
      authorId = req.user.id;
      authorType = 'user';
      authorName = req.user.pseudo || 'Utilisateur';
      authorPhoto = req.user.photo || null;
    } else if (req.body.author_name && String(req.body.author_name).trim()) {
      authorName = String(req.body.author_name).trim().slice(0, 100);
    }

    const comment = await TopicComment.create({
      topicId,
      authorId: authorId || 'anonymous',
      authorType,
      authorName,
      authorPhoto,
      parentId: parentId || null,
      content: String(content).trim(),
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`topic:${topicId}`).emit('comment:new', comment);
      const excerpt = String(content).trim().slice(0, 160);
      const aid = comment.author_id ?? comment.authorId;
      io.to('forum').emit('notification:forum', {
        kind: 'comment',
        topicId,
        topicTitle: topic.title,
        commentId: comment.id,
        excerpt,
        authorName: comment.author_name || authorName,
        authorId: aid && aid !== 'anonymous' ? aid : null,
      });
    }

    return res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

// POST /api/topics/:topicId/comments/:commentId/like - Liker un commentaire
async function like(req, res, next) {
  try {
    const { topicId, commentId } = req.params;
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ error: 'Sujet introuvable' });
    }
    const comments = await TopicComment.findByTopicId(topicId);
    const exists = comments.some((c) => c.id === commentId);
    if (!exists) {
      return res.status(404).json({ error: 'Commentaire introuvable' });
    }
    const comment = await TopicComment.like(commentId);
    return res.json(comment);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/topics/:topicId/comments/:commentId - Supprimer un commentaire
// Admin : peut supprimer tout. User : uniquement ses propres commentaires.
async function remove(req, res, next) {
  try {
    const { topicId, commentId } = req.params;
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ error: 'Sujet introuvable' });
    }
    const comment = await TopicComment.findById(commentId);
    const commentTopicId = comment?.topic_id ?? comment?.topicId;
    if (!comment || commentTopicId !== topicId) {
      return res.status(404).json({ error: 'Commentaire introuvable' });
    }

    if (req.admin) {
      // Admin peut tout supprimer
    } else if (req.user) {
      if (comment.author_type !== 'user' || comment.author_id !== req.user.id) {
        return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos propres commentaires' });
      }
    } else {
      return res.status(401).json({ error: 'Authentification requise pour supprimer un commentaire' });
    }

    await TopicComment.delete(commentId);
    const io = req.app.get('io');
    if (io) {
      io.to(`topic:${topicId}`).emit('comment:deleted', { commentId });
    }
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// POST /api/topics/:topicId/comments/:commentId/reply-private - Répondre en privé (user → admin)
// L'utilisateur envoie un message privé à l'admin en réponse à un commentaire admin.
async function replyPrivate(req, res, next) {
  try {
    const { topicId, commentId } = req.params;
    const { content } = req.body || {};
    if (!req.user) {
      return res.status(401).json({ error: 'Connexion requise pour répondre en privé' });
    }
    if (!content || !String(content).trim()) {
      return res.status(400).json({ error: 'Le contenu du message est requis' });
    }

    const topic = await Topic.findById(topicId);
    if (!topic) return res.status(404).json({ error: 'Sujet introuvable' });
    const comment = await TopicComment.findById(commentId);
    const commentTopicId = comment?.topic_id ?? comment?.topicId;
    if (!comment || commentTopicId !== topicId) {
      return res.status(404).json({ error: 'Commentaire introuvable' });
    }
    if (comment.author_type !== 'admin') {
      return res.status(400).json({ error: 'Vous ne pouvez répondre en privé qu\'à un commentaire de l\'administrateur' });
    }

    const conversation = await Conversation.getOrCreateForUser(req.user.id);
    const message = await Message.create(
      conversation.id, 'user', req.user.id,
      String(content).trim(), 'text', {}, topic.id
    );
    const io = req.app.get('io');
    if (io) io.to('admin').emit('message:new', { conversationId: conversation.id, userId: req.user.id, message });
    return res.status(201).json(message);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, like, remove, replyPrivate };
