/**
 * Contrôleur Topic - Sujets globaux (lecture pour tous, création/modif admin)
 */

const Topic = require('../models/Topic');
const TopicComment = require('../models/TopicComment');

// GET /api/topics - Liste des sujets publics (paginated)
async function list(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const offset = parseInt(req.query.offset, 10) || 0;
    const { topics, total } = await Topic.findAll({ limit, offset });
    const topicsWithCount = await Promise.all(
      topics.map(async (t) => ({
        ...t,
        comments_count: await TopicComment.countByTopicId(t.id),
      }))
    );
    return res.json({ topics: topicsWithCount, total });
  } catch (err) {
    next(err);
  }
}

// GET /api/topics/:id - Détail d'un sujet
async function getById(req, res, next) {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ error: 'Sujet introuvable' });
    }
    const comments_count = await TopicComment.countByTopicId(topic.id);
    return res.json({ ...topic, comments_count });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById };
