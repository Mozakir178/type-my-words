const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const { authValidation, validate } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');
const { signup, login, logout, getMe } = require('../controllers/authController');

router.post('/signup', authLimiter, authValidation, validate, signup);
router.post('/login', authLimiter, authValidation, validate, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;