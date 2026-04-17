const rateLimit = require('express-rate-limit');

// Auth rate limiting (strict)
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip // Rate limit by IP
});

// API rate limiting (moderate)
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Test submission rate limiting (per user)
exports.testSubmitLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 test submissions per minute
  message: {
    success: false,
    message: 'Test submission rate limit exceeded'
  },
  keyGenerator: (req) => req.user?._id || req.ip
});