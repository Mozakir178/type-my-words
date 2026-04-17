const TestResult = require('../models/TestResult');
const User = require('../models/User');
const { calculateMetrics } = require('../utils/typingMetrics');
const { generateText } = require('../utils/textGenerator');
const mongoose = require('mongoose');

// Submit test result
exports.submitTest = async (req, res, next) => {
  try {
    const {
      mode,
      duration,
      wordCount,
      difficulty,
      customText,
      text,
      userInput,
      keystrokeLog,
      startTime,
      endTime
    } = req.body;

    // Calculate metrics server-side for security
    const metrics = calculateMetrics(text, keystrokeLog, startTime, endTime);
    
    // Create test result
    const testResult = await TestResult.create({
      userId: req.user._id,
      mode,
      duration,
      wordCount,
      difficulty: difficulty || 'medium',
      customText: mode === 'custom' ? customText : undefined,
      ...metrics,
      keystrokeLog: keystrokeLog.slice(-100) // Store last 100 keystrokes for analysis
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 
        'stats.totalTests': 1,
        'stats.totalTimeTyping': Math.round((endTime - startTime) / 1000)
      },
      $max: {
        'stats.bestWPM': metrics.wpm,
        'stats.bestAccuracy': metrics.accuracy
      }
    });

    // Recalculate average WPM
    const userStats = await User.findById(req.user._id).select('stats');
    const allTests = await TestResult.find({ userId: req.user._id }).select('wpm');
    const avgWPM = allTests.reduce((sum, t) => sum + t.wpm, 0) / allTests.length;
    
    await User.findByIdAndUpdate(req.user._id, {
      'stats.averageWPM': Math.round(avgWPM * 10) / 10
    });

    res.status(201).json({
      success: true,
      data: {
        test: testResult,
        userStats: userStats.stats
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user test history
exports.getTestHistory = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      mode, 
      difficulty,
      sortBy = 'completedAt',
      order = 'desc'
    } = req.query;

    const query = { userId: req.user._id };
    if (mode) query.mode = mode;
    if (difficulty) query.difficulty = difficulty;

    const tests = await TestResult.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-keystrokeLog')
      .lean();

    const total = await TestResult.countDocuments(query);

    res.json({
      success: true,
      data: {
        tests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalResults: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res, next) => {
  try {
    const {
      mode = 'time',
      difficulty = 'medium',
      duration = 60,
      period = 'all', // all, daily, weekly
      page = 1,
      limit = 50
    } = req.query;

    const query = { mode, difficulty };
    
    // Time period filtering
    if (period === 'daily') {
      query.completedAt = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
    } else if (period === 'weekly') {
      query.completedAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    }
    
    // Filter by duration for time-based tests
    if (mode === 'time' && duration) {
      query.duration = parseInt(duration);
    }

    // Aggregation for leaderboard with user info
    const leaderboard = await TestResult.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          wpm: 1,
          accuracy: 1,
          completedAt: 1,
          mode: 1,
          difficulty: 1,
          duration: 1,
          username: '$user.username',
          score: { $multiply: ['$wpm', { $divide: ['$accuracy', 100] }] }
        }
      },
      { $sort: { score: -1, accuracy: -1, completedAt: 1 } },
      { $limit: parseInt(limit) * parseInt(page) }
    ]);

    // Add rank to each entry
    const startIndex = (page - 1) * limit;
    const results = leaderboard.slice(startIndex, startIndex + parseInt(limit)).map((entry, index) => ({
      ...entry,
      rank: startIndex + index + 1
    }));

    const total = await TestResult.countDocuments(query);

    res.json({
      success: true,
      data: {
        leaderboard: results,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalResults: total
        },
        filters: { mode, difficulty, duration, period }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get test statistics for dashboard
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Get aggregate stats
    const stats = await TestResult.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalTests: { $sum: 1 },
          avgWPM: { $avg: '$wpm' },
          avgAccuracy: { $avg: '$accuracy' },
          bestWPM: { $max: '$wpm' },
          bestAccuracy: { $max: '$accuracy' },
          totalTime: { $sum: '$duration' }
        }
      }
    ]);

    // Get recent tests for chart
    const recentTests = await TestResult.find({ userId })
      .sort({ completedAt: -1 })
      .limit(30)
      .select('wpm accuracy completedAt mode')
      .lean();

    // Get mode distribution
    const modeStats = await TestResult.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$mode',
          count: { $sum: 1 },
          avgWPM: { $avg: '$wpm' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: stats[0] || {
          totalTests: 0,
          avgWPM: 0,
          avgAccuracy: 0,
          bestWPM: 0,
          bestAccuracy: 0,
          totalTime: 0
        },
        recentTests: recentTests.reverse(), // Chronological order for charts
        modeStats
      }
    });
  } catch (error) {
    next(error);
  }
};