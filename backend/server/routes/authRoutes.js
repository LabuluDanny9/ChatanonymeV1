/**
 * Routes d'authentification - Inscription, login user/admin
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { adminLoginLimiter } = require('../middleware/rateLimiter');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/admin/can-register', authController.canRegisterAdmin);
router.post('/admin/register', authController.registerAdmin);
router.post('/admin/login', adminLoginLimiter, authController.adminLogin);

module.exports = router;
