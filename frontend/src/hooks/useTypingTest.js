// frontend/src/hooks/useTypingTest.js
import { useState, useCallback, useRef, useEffect } from 'react';

export const useTypingTest = ({ mode, duration, wordCount, text: customText, onTestComplete }) => {
  const [state, setState] = useState({
    text: '',
    userInput: '',
    startTime: null,
    endTime: null,
    isRunning: false,
    isFinished: false,
    wpm: 0,
    accuracy: 100,
    errors: 0,
    charStatus: [],
    currentCharIndex: 0
  });
  
  const inputRef = useRef(null);
  const animationFrameRef = useRef(null);
  const keystrokeLogRef = useRef([]);

  // Generate text based on config
  const generateText = useCallback(() => {
    if (customText && customText.trim().length > 0) {
      return customText.trim();
    }
    
    const wordLists = {
      easy: ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this'],
      medium: ['typing', 'practice', 'keyboard', 'speed', 'accuracy', 'focus', 'rhythm', 'flow', 'precision', 'master', 'improve', 'challenge', 'exercise', 'technique', 'fingers', 'rapid', 'steady', 'consistent', 'progress', 'skill'],
      hard: ['pneumonoultramicroscopicsilicovolcanoconiosis', 'floccinaucinihilipilification', 'antidisestablishmentarianism', 'pseudopseudohypoparathyroidism', 'sesquipedalian', 'defenestration', 'serendipity', 'ephemeral']
    };
    
    const words = wordLists.medium;
    const count = mode === 'words' ? (wordCount || 25) : 50;
    const result = [];
    
    for (let i = 0; i < count; i++) {
      result.push(words[Math.floor(Math.random() * words.length)]);
    }
    
    return result.join(' ');
  }, [mode, wordCount, customText]);

  // Initialize test
  const startTest = useCallback(() => {
    const text = generateText();
    setState({
      text,
      userInput: '',
      startTime: Date.now(),
      endTime: null,
      isRunning: true,
      isFinished: false,
      wpm: 0,
      accuracy: 100,
      errors: 0,
      charStatus: Array(text.length).fill('pending'),
      currentCharIndex: 0
    });
    keystrokeLogRef.current = [];
    
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [generateText]);

  // Handle keystroke - FIXED VERSION
  const handleKeyPress = useCallback((e) => {
    if (!state.isRunning || state.isFinished) return;
    
    // Prevent default for special keys
    if (['Tab', 'Escape'].includes(e.key)) {
      e.preventDefault();
    }
    
    // Tab to restart
    if (e.key === 'Tab') {
      restartTest();
      return;
    }
    
    // Escape for focus mode (handled by parent)
    if (e.key === 'Escape') {
      return;
    }
    
    // Ignore modifier keys
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    
    const { text, userInput, currentCharIndex, charStatus, startTime } = state;
    
    // Prevent typing beyond text length
    if (currentCharIndex >= text.length) {
      finishTest();
      return;
    }
    
    const expectedChar = text[currentCharIndex];
    
    // Handle Backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (currentCharIndex > 0) {
        const newCharStatus = [...charStatus];
        newCharStatus[currentCharIndex - 1] = 'pending';
        
        setState(prev => ({
          ...prev,
          userInput: prev.userInput.slice(0, -1),
          currentCharIndex: currentCharIndex - 1,
          charStatus: newCharStatus
        }));
      }
      return;
    }
    
    // Handle regular printable characters (including space!)
    if (e.key.length === 1) {
      const isCorrect = e.key === expectedChar;
      const timestamp = Date.now() - startTime;
      
      // Log keystroke for analytics
      keystrokeLogRef.current.push({
        key: e.key,
        timestamp,
        correct: isCorrect,
        charIndex: currentCharIndex
      });
      
      // Update charStatus for ONLY the current index
      const newCharStatus = [...charStatus];
      newCharStatus[currentCharIndex] = isCorrect ? 'correct' : 'incorrect';
      
      // Calculate metrics based on correct characters only
      const elapsedMs = Date.now() - startTime;
      const elapsedMinutes = Math.max(elapsedMs / 60000, 0.01); // Prevent division by zero
      const correctChars = newCharStatus.filter(s => s === 'correct').length;
      const totalTyped = userInput.length + 1; // Include current keystroke
      
      // WPM: (correct chars / 5) / minutes
      const wpm = Math.round((correctChars / 5) / elapsedMinutes);
      
      // Accuracy: correct / total typed
      const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;
      
      // Error count
      const errorCount = newCharStatus.filter(s => s === 'incorrect').length;
      
      // Advance to next character
      const nextIndex = currentCharIndex + 1;
      
      setState(prev => ({
        ...prev,
        userInput: prev.userInput + e.key,
        currentCharIndex: nextIndex,
        charStatus: newCharStatus,
        wpm,
        accuracy,
        errors: errorCount
      }));
      
      // Check for word-based test completion
      if (nextIndex >= text.length) {
        finishTest();
        return;
      }
      
      // Check for time-based test completion
      if (mode === 'time' && startTime && elapsedMs >= duration * 1000) {
        finishTest();
      }
    }
  }, [state, mode, duration]);

  // Finish test and calculate final results
  const finishTest = useCallback(() => {
    // Prevent double-finish
    if (state.isFinished) return;
    
    const endTime = Date.now();
    const durationSeconds = (endTime - state.startTime) / 1000;
    
    const correctChars = state.charStatus.filter(s => s === 'correct').length;
    const totalTyped = state.userInput.length;
    
    // Final accuracy based on actual input
    const finalAccuracy = totalTyped > 0 
      ? Math.round((correctChars / totalTyped) * 100) 
      : 100;
    
    // Final WPM with minimum time threshold
    const durationMinutes = Math.max(durationSeconds / 60, 0.01);
    const finalWPM = Math.round((correctChars / 5) / durationMinutes);
    
    const results = {
      wpm: Math.max(0, finalWPM),
      accuracy: finalAccuracy,
      errors: {
        total: state.charStatus.filter(s => s === 'incorrect').length,
        corrected: 0,
        uncorrected: state.charStatus.filter(s => s === 'incorrect').length
      },
      keystrokes: {
        total: state.userInput.length,
        correct: state.charStatus.filter(s => s === 'correct').length,
        incorrect: state.charStatus.filter(s => s === 'incorrect').length
      },
      duration: Math.round(durationSeconds),
      keystrokeLog: [...keystrokeLogRef.current],
      mode: mode, // ✅ Fixed: use prop, not state.mode
      completedAt: new Date().toISOString(),
      text: state.text,
      userInput: state.userInput,
      startTime: state.startTime,
      endTime: endTime
    };
    
    setState(prev => ({
      ...prev,
      endTime,
      isRunning: false,
      isFinished: true,
      wpm: results.wpm,
      accuracy: results.accuracy
    }));
    
    // Callback to parent component
    console.log(results)
    onTestComplete?.(results);

  }, [state, mode, onTestComplete]);

  // Restart test (Tab key)
  const restartTest = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    startTest();
  }, [startTest]);

  // Focus mode state
  const [focusMode, setFocusMode] = useState(false);
  const toggleFocusMode = useCallback(() => {
    setFocusMode(prev => !prev);
  }, []);

  // Time-based test countdown effect
  useEffect(() => {
    if (!state.isRunning || mode !== 'time' || state.isFinished || !state.startTime) {
      return;
    }
    
    const checkTime = () => {
      const elapsed = Date.now() - state.startTime;
      if (elapsed >= duration * 1000) {
        finishTest();
      } else {
        animationFrameRef.current = requestAnimationFrame(checkTime);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(checkTime);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state.isRunning, state.startTime, state.isFinished, mode, duration, finishTest]);

  // Global key listener
  useEffect(() => {
    const handleGlobalKey = (e) => {
      // Only process if typing area is active
      const isActive = document.activeElement === inputRef.current || 
                       document.activeElement?.tagName === 'BODY';
      if (isActive) {
        handleKeyPress(e);
      }
    };
    
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [handleKeyPress]);

  // Prevent paste (anti-cheat)
  useEffect(() => {
    const handlePaste = (e) => {
      if (state.isRunning && !state.isFinished) {
        e.preventDefault();
      }
    };
    
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [state.isRunning, state.isFinished]);

  return {
    ...state,
    inputRef,
    focusMode,
    startTest,
    restartTest,
    toggleFocusMode,
    handleKeyPress
  };
};