/**
 * Routes messagerie entre utilisateurs
 */

const express = require('express');
const authUser = require('../middleware/authUser');
const requirePlatformFeature = require('../middleware/requirePlatformFeature');
const peerController = require('../controllers/peerController');

const router = express.Router();

router.use(authUser);
router.use(requirePlatformFeature('userToUserChat'));

router.get('/discover', peerController.discover);
router.post('/open', peerController.openConversation);
router.get('/conversations', peerController.listConversations);
router.get('/conversations/:id/messages', peerController.getMessages);
router.post('/conversations/:id/messages', peerController.sendMessage);

module.exports = router;
