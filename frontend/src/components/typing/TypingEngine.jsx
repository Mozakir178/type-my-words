import React, { memo, useCallback } from 'react';
import { motion,AnimatePresence } from 'framer-motion';
import { useTypingTest } from '../../hooks/useTypingTest';
import Caret from './Caret';
import TextDisplay from './TextDisplay';
import StatsBar from '../ui/StatsBar';

const TypingEngine = memo(({ config, onComplete, theme }) => {
  const {
    text,
    userInput,
    charStatus,
    currentCharIndex,
    wpm,
    accuracy,
    errors,
    isRunning,
    isFinished,
    focusMode,
    inputRef,
    startTest,
    restartTest,
    toggleFocusMode
  } = useTypingTest({
    ...config,
    onTestComplete: onComplete
  });

  // Smooth scroll to keep caret in view
  const containerRef = useCallback((node) => {
    if (node && currentCharIndex > 0 && !focusMode) {
      const caretPosition = currentCharIndex * 8; // Approx char width
      if (caretPosition > node.offsetWidth - 100) {
        node.scrollTo({ left: caretPosition - node.offsetWidth + 100, behavior: 'smooth' });
      }
    }
  }, [currentCharIndex, focusMode]);

  // Start test on mount
  React.useEffect(() => {
    startTest();
  }, [startTest]);

  if (focusMode) {
    return (
      <div className="focus-mode" onClick={toggleFocusMode}>
        <div className="focus-hint">Press ESC to exit focus mode</div>
        <TextDisplay 
          text={text}
          userInput={userInput}
          charStatus={charStatus}
          currentIndex={currentCharIndex}
          minimal={true}
        />
      </div>
    );
  }

  return (
    <div className="typing-engine" theme={theme}>
      {/* Stats Bar */}
      <StatsBar 
        wpm={wpm}
        accuracy={accuracy}
        errors={errors}
        timeRemaining={config.mode === 'time' ? 
          Math.max(0, config.duration - Math.floor((Date.now() - Date.parse(new Date())) / 1000)) 
          : null}
      />
      
      {/* Main Typing Area */}
      <motion.div 
        ref={containerRef}
        className="text-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => inputRef.current?.focus()}
      >
        <TextDisplay 
          text={text}
          userInput={userInput}
          charStatus={charStatus}
          currentIndex={currentCharIndex}
        />
        <Caret visible={isRunning && !isFinished} />
        
        {/* Hidden input for mobile/IME support */}
        <input
          ref={inputRef}
          type="text"
          className="hidden-input"
          value={userInput}
          readOnly
          autoFocus
          onBlur={(e) => {
            // Refocus after short delay to allow Tab restart
            setTimeout(() => {
              if (!document.activeElement?.closest('.typing-controls')) {
                e.target.focus();
              }
            }, 100);
          }}
        />
      </motion.div>
      
      {/* Controls */}
      <AnimatePresence>
        {!isRunning && !isFinished && (
          <motion.div 
            className="controls"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button onClick={startTest} className="btn-primary">
              Start Test
            </button>
            <button onClick={toggleFocusMode} className="btn-secondary">
              Focus Mode (ESC)
            </button>
          </motion.div>
        )}
        
        {isFinished && (
          <motion.div 
            className="results-overlay"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="results-card">
              <h2>Test Complete! 🎉</h2>
              <div className="results-grid">
                <div className="result-item">
                  <span className="label">WPM</span>
                  <span className="value">{wpm}</span>
                </div>
                <div className="result-item">
                  <span className="label">Accuracy</span>
                  <span className="value">{accuracy}%</span>
                </div>
                <div className="result-item">
                  <span className="label">Errors</span>
                  <span className="value">{errors}</span>
                </div>
              </div>
              <div className="controls">
                <button onClick={restartTest} className="btn-primary">
                  Restart (Tab)
                </button>
                <button onClick={toggleFocusMode} className="btn-secondary">
                  Review Mistakes
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hint */}
      <div className="hint">
        <kbd>Tab</kbd> to restart • <kbd>ESC</kbd> for focus mode
      </div>
    </div>
  );
});

TypingEngine.displayName = 'TypingEngine';
export default TypingEngine;