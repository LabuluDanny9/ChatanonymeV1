/**
 * Routes utilisateur anonyme - Sa conversation uniquement
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authUser = require('../middleware/authUser');
const requirePlatformFeature = require('../middleware/requirePlatformFeature');

router.get(
  '/me/conversation',
  requirePlatformFeature('privateChat'),
  authUser,
  userController.getMyConversation
);

module.exports = router;
