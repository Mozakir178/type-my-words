import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Target, AlertCircle, Zap } from 'lucide-react';

const StatsBar = memo(({ wpm = 0, accuracy = 100, errors = 0, timeRemaining = null, isRunning = false }) => {
  // Format time display
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Determine accuracy color
  const getAccuracyColor = (acc) => {
    if (acc >= 95) return 'text-green-500';
    if (acc >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Determine WPM color based on performance
  const getWpmColor = (wpm) => {
    if (wpm >= 80) return 'text-purple-500';
    if (wpm >= 50) return 'text-blue-500';
    if (wpm >= 30) return 'text-green-500';
    return 'text-gray-500';
  };

  return (
    <motion.div 
      className="stats-bar"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="stats-container">
        {/* WPM Display */}
        <motion.div 
          className="stat-item wpm"
          key={`wpm-${Math.floor(wpm / 10)}`}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
        >
          <Zap size={18} className={`stat-icon ${getWpmColor(wpm)}`} />
          <div className="stat-value">
            <AnimatePresence mode="wait">
              <motion.span
                key={wpm}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`font-mono font-bold ${getWpmColor(wpm)}`}
              >
                {Math.round(wpm)}
              </motion.span>
            </AnimatePresence>
            <span className="stat-label">WPM</span>
          </div>
        </motion.div>

        {/* Accuracy Display */}
        <motion.div 
          className="stat-item accuracy"
          key={`acc-${Math.floor(accuracy / 5)}`}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
        >
          <Target size={18} className={`stat-icon ${getAccuracyColor(accuracy)}`} />
          <div className="stat-value">
            <AnimatePresence mode="wait">
              <motion.span
                key={accuracy}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`font-mono font-bold ${getAccuracyColor(accuracy)}`}
              >
                {accuracy}%
              </motion.span>
            </AnimatePresence>
            <span className="stat-label">Accuracy</span>
          </div>
        </motion.div>

        {/* Errors Display */}
        <div className="stat-item errors">
          <AlertCircle size={18} className={`stat-icon ${errors > 0 ? 'text-red-500' : 'text-gray-400'}`} />
          <div className="stat-value">
            <span className={`font-mono font-bold ${errors > 0 ? 'text-red-500' : 'text-gray-400'}`}>
              {errors}
            </span>
            <span className="stat-label">Errors</span>
          </div>
        </div>

        {/* Timer Display (for time-based tests) */}
        {timeRemaining !== null && (
          <motion.div 
            className="stat-item timer"
            animate={timeRemaining <= 10 && isRunning ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.3, repeat: timeRemaining <= 10 && isRunning ? Infinity : 0 }}
          >
            <Clock size={18} className={`stat-icon ${timeRemaining <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
            <div className="stat-value">
              <span className={`font-mono font-bold ${timeRemaining <= 10 ? 'text-red-500' : ''}`}>
                {formatTime(timeRemaining)}
              </span>
              <span className="stat-label">Time</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Progress bar for time-based tests */}
      {timeRemaining !== null && (
        <div className="timer-progress">
          <motion.div 
            className="progress-fill"
            initial={{ width: '100%' }}
            animate={{ width: `${(timeRemaining / 60) * 100}%` }}
            transition={{ duration: 0.3 }}
            style={{ 
              background: timeRemaining <= 10 
                ? 'linear-gradient(90deg, #ef4444, #f97316)' 
                : 'linear-gradient(90deg, #3b82f6, #8b5cf6)' 
            }}
          />
        </div>
      )}
    </motion.div>
  );
});

StatsBar.displayName = 'StatsBar';
export default StatsBar;