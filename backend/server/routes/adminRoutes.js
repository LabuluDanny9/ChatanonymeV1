/**
 * Routes admin - Protégées par authAdmin
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authAdmin = require('../middleware/authAdmin');

router.use(authAdmin);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.listUsers);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/:id/ban', adminController.banUser);
router.get('/conversations', adminController.listConversations);
router.get('/conversations/:id', adminController.getConversation);
router.post('/conversations/:id/reply', adminController.replyToConversation);
router.patch('/conversations/:id/close', adminController.closeConversation);
router.delete('/messages/:id', adminController.deleteMessage);
router.patch('/messages/:id', adminController.updateMessage);
router.get('/topics', adminController.listTopics);
router.post('/topics', adminController.createTopic);
router.put('/topics/:id', adminController.updateTopic);
router.delete('/topics/:id', adminController.deleteTopic);
router.post('/broadcast', adminController.sendBroadcast);
router.put('/photo', adminController.updatePhoto);

module.exports = router;
