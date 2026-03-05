const express = require('express');
const router = express.Router();
const broadcastController = require('../controllers/broadcastController');
const authUser = require('../middleware/authUser');

router.get('/', authUser, broadcastController.list);

module.exports = router;
