const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Test configuration
  mode: {
    type: String,
    enum: ['time', 'words', 'custom'],
    required: true
  },
  duration: { type: Number }, // seconds (for time mode)
  wordCount: { type: Number }, // for word mode
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  customText: { type: String, maxlength: 5000 },
  
  // Results
  wpm: { type: Number, required: true },
  accuracy: { type: Number, required: true, min: 0, max: 100 },
  rawWPM: { type: Number }, // without error penalty
  errors: {
    total: { type: Number, default: 0 },
    corrected: { type: Number, default: 0 },
    uncorrected: { type: Number, default: 0 }
  },
  keystrokes: {
    total: { type: Number },
    correct: { type: Number },
    incorrect: { type: Number }
  },
  
  // Detailed data for analysis
  keystrokeLog: [{
    key: String,
    timestamp: Number,
    correct: Boolean,
    charIndex: Number
  }],
  
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes for leaderboard queries
testResultSchema.index({ userId: 1, completedAt: -1 });
testResultSchema.index({ wpm: -1, accuracy: -1 });
testResultSchema.index({ mode: 1, difficulty: 1, completedAt: -1 });

// Virtual for leaderboard ranking
testResultSchema.virtual('score').get(function() {
  return this.wpm * (this.accuracy / 100);
});

module.exports = mongoose.model('TestResult', testResultSchema);