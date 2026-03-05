/**
 * Routes utilisateur anonyme - Sa conversation uniquement
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authUser = require('../middleware/authUser');

router.get('/me/conversation', authUser, userController.getMyConversation);

module.exports = router;
