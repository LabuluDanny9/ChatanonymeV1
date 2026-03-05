/**
 * Routes messages - Envoi et réception (user anonyme)
 */

const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authUser = require('../middleware/authUser');

router.get('/', authUser, messageController.getMyMessages);
router.post('/', authUser, messageController.sendMessage);
router.post('/mark-read', authUser, messageController.markAsRead);
router.delete('/:id', authUser, messageController.deleteMessage);
router.patch('/:id', authUser, messageController.updateMessage);

module.exports = router;
