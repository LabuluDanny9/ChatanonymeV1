/**
 * Routes messages - Envoi et réception (user anonyme)
 */

const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authUser = require('../middleware/authUser');
const requirePlatformFeature = require('../middleware/requirePlatformFeature');

const requirePrivateChat = requirePlatformFeature('privateChat');

router.get('/', requirePrivateChat, authUser, messageController.getMyMessages);
router.post('/', requirePrivateChat, authUser, messageController.sendMessage);
router.post('/mark-read', requirePrivateChat, authUser, messageController.markAsRead);
router.delete('/:id', requirePrivateChat, authUser, messageController.deleteMessage);
router.patch('/:id', requirePrivateChat, authUser, messageController.updateMessage);

module.exports = router;
