/**
 * Contrôleur Broadcast - Messages collectifs (pour les utilisateurs)
 */

const Broadcast = require('../models/Broadcast');

async function list(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const offset = parseInt(req.query.offset, 10) || 0;
    const { broadcasts, total } = await Broadcast.findAll({ limit, offset });
    return res.json({ broadcasts, total });
  } catch (err) {
    next(err);
  }
}

module.exports = { list };
