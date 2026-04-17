const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  stats: {
    totalTests: { type: Number, default: 0 },
    bestWPM: { type: Number, default: 0 },
    bestAccuracy: { type: Number, default: 0 },
    averageWPM: { type: Number, default: 0 },
    totalTimeTyping: { type: Number, default: 0 } // in seconds
  },
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    soundEnabled: { type: Boolean, default: true },
    fontSize: { type: Number, default: 24 },
    fontFamily: { type: String, default: 'monospace' }
  },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateStats = function(testResult) {
  this.stats.totalTests += 1;
  this.stats.totalTimeTyping += testResult.duration;
  
  if (testResult.wpm > this.stats.bestWPM) {
    this.stats.bestWPM = testResult.wpm;
  }
  if (testResult.accuracy > this.stats.bestAccuracy) {
    this.stats.bestAccuracy = testResult.accuracy;
  }
  
  // Recalculate average WPM
  this.stats.averageWPM = 
    (this.stats.averageWPM * (this.stats.totalTests - 1) + testResult.wpm) 
    / this.stats.totalTests;
};

module.exports = mongoose.model('User', userSchema);