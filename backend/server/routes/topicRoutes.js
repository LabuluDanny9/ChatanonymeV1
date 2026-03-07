/**
 * Routes sujets publics - Lecture pour tous (auth optionnelle pour cohérence)
 */

const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');
const topicCommentController = require('../controllers/topicCommentController');
const optionalAuthUserOrAdmin = require('../middleware/optionalAuthUserOrAdmin');
const authUser = require('../middleware/authUser');

router.get('/', topicController.list);
// Commentaires (doivent être avant /:id pour éviter les conflits)
router.get('/:topicId/comments', topicCommentController.list);
router.post('/:topicId/comments', optionalAuthUserOrAdmin, topicCommentController.create);
router.post('/:topicId/comments/:commentId/like', topicCommentController.like);
router.delete('/:topicId/comments/:commentId', optionalAuthUserOrAdmin, topicCommentController.remove);
router.post('/:topicId/comments/:commentId/reply-private', authUser, topicCommentController.replyPrivate);
router.get('/:id', topicController.getById);

module.exports = router;
