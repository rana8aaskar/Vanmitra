const express = require('express');
const AuthController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Authentication routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected routes
router.get('/me', authMiddleware, AuthController.getMe);
router.post('/refresh', authMiddleware, AuthController.refreshToken);

module.exports = router;