/**
 * Routes sujets publics - Lecture pour tous (auth optionnelle pour cohérence)
 */

const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');

router.get('/', topicController.list);
router.get('/:id', topicController.getById);

module.exports = router;
