const express = require('express');
const router = express.Router();
const broadcastController = require('../controllers/broadcastController');
const authUser = require('../middleware/authUser');
const requirePlatformFeature = require('../middleware/requirePlatformFeature');

router.get('/', requirePlatformFeature('broadcasts'), authUser, broadcastController.list);

module.exports = router;
