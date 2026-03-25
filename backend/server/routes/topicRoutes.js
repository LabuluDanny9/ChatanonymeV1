/**
 * Routes sujets publics - Lecture pour tous (auth optionnelle pour cohérence)
 */

const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');
const topicCommentController = require('../controllers/topicCommentController');
const optionalAuthUserOrAdmin = require('../middleware/optionalAuthUserOrAdmin');
const authUser = require('../middleware/authUser');
const requirePlatformFeature = require('../middleware/requirePlatformFeature');

const requireForum = requirePlatformFeature('forum');

router.get('/', requireForum, topicController.list);
// Commentaires (doivent être avant /:id pour éviter les conflits)
router.get('/:topicId/comments', requireForum, topicCommentController.list);
router.post('/:topicId/comments', requireForum, optionalAuthUserOrAdmin, topicCommentController.create);
router.post('/:topicId/comments/:commentId/like', requireForum, topicCommentController.like);
router.delete('/:topicId/comments/:commentId', requireForum, optionalAuthUserOrAdmin, topicCommentController.remove);
router.post('/:topicId/comments/:commentId/reply-private', requireForum, authUser, topicCommentController.replyPrivate);
router.get('/:id', requireForum, topicController.getById);

module.exports = router;
