const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const { validate, testValidation } = require('../middleware/validation');
const { testSubmitLimiter } = require('../middleware/rateLimiter');
const {
  submitTest,
  getTestHistory,
  getLeaderboard,
  getStats
} = require('../controllers/testController');

// Public routes (optional auth)
router.get('/leaderboard', optionalAuth, getLeaderboard);

// Protected routes
router.use(protect);

// Submit test result (with rate limiting)
router.post('/', 
  testSubmitLimiter,
  testValidation, 
  validate, 
  submitTest
);

// Get user test history
router.get('/history', getTestHistory);

// Get user statistics for dashboard
router.get('/stats', getStats);

// Get single test result
router.get('/:id', async (req, res, next) => {
  try {
    const TestResult = require('../models/TestResult');
    const test = await TestResult.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).select('-keystrokeLog');
    
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test result not found'
      });
    }
    
    res.json({ success: true, data: { test } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;