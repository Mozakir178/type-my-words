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

  const generateText = useCallback(() => {
    if (customText && customText.trim().length > 0) {
      return customText.trim();
    }
    
    const wordLists = {
      easy: ['the','be','to','of','and','a','in','that','have','it','for','not','on','with','he','as','you','do','at','this'],
      medium: ['typing','practice','keyboard','speed','accuracy','focus','rhythm','flow','precision','master','improve','challenge','exercise','technique','fingers','rapid','steady','consistent','progress','skill'],
      hard: ['pneumonoultramicroscopicsilicovolcanoconiosis','floccinaucinihilipilification','antidisestablishmentarianism','pseudopseudohypoparathyroidism','sesquipedalian','defenestration','serendipity','ephemeral']
    };
    
    const words = wordLists.medium;
    const count = mode === 'words' ? (wordCount || 25) : 50;
    
    return Array.from({ length: count }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
  }, [mode, wordCount, customText]);

  const startTest = useCallback(() => {
    const text = generateText();
    setState({
      text,
      userInput: '',
      startTime: null, 
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

  const handleKeyPress = useCallback((e) => {
    if (!state.isRunning || state.isFinished) return;

    if (['Tab', 'Escape'].includes(e.key)) e.preventDefault();
    if (e.key === 'Tab') return restartTest();
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    const { text, userInput, currentCharIndex, charStatus } = state;

    if (currentCharIndex >= text.length) return finishTest();

    let startTime = state.startTime;
    if (!startTime && e.key.length === 1) {
      startTime = Date.now();
    }

    const expectedChar = text[currentCharIndex];

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

    if (e.key.length === 1) {
      const isCorrect = e.key === expectedChar;

      const elapsedMs = startTime ? Date.now() - startTime : 0;
      const elapsedMinutes = Math.max(elapsedMs / 60000, 0.01);

      keystrokeLogRef.current.push({
        key: e.key,
        timestamp: elapsedMs,
        correct: isCorrect,
        charIndex: currentCharIndex
      });

      const newCharStatus = [...charStatus];
      newCharStatus[currentCharIndex] = isCorrect ? 'correct' : 'incorrect';

      const correctChars = newCharStatus.filter(s => s === 'correct').length;
      const totalTyped = userInput.length + 1;

      const wpm = Math.round((correctChars / 5) / elapsedMinutes);
      const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;
      const errorCount = newCharStatus.filter(s => s === 'incorrect').length;

      const nextIndex = currentCharIndex + 1;

      setState(prev => ({
        ...prev,
        startTime: prev.startTime || startTime, // ✅ set once
        userInput: prev.userInput + e.key,
        currentCharIndex: nextIndex,
        charStatus: newCharStatus,
        wpm,
        accuracy,
        errors: errorCount
      }));

      if (nextIndex >= text.length) return finishTest();

      if (mode === 'time' && startTime && elapsedMs >= duration * 1000) {
        finishTest();
      }
    }
  }, [state, mode, duration]);

  const finishTest = useCallback(() => {
    if (state.isFinished) return;

    const endTime = Date.now();

    const durationSeconds = state.startTime
      ? (endTime - state.startTime) / 1000
      : 0;

    const correctChars = state.charStatus.filter(s => s === 'correct').length;
    const totalTyped = state.userInput.length;

    const finalAccuracy = totalTyped > 0
      ? Math.round((correctChars / totalTyped) * 100)
      : 100;

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
        correct: correctChars,
        incorrect: state.charStatus.filter(s => s === 'incorrect').length
      },
      duration: Math.round(durationSeconds),
      keystrokeLog: [...keystrokeLogRef.current],
      mode,
      completedAt: new Date().toISOString(),
      text: state.text,
      userInput: state.userInput,
      startTime: state.startTime,
      endTime
    };

    setState(prev => ({
      ...prev,
      endTime,
      isRunning: false,
      isFinished: true,
      wpm: results.wpm,
      accuracy: results.accuracy
    }));

    onTestComplete?.(results);

  }, [state, mode, onTestComplete]);

  const restartTest = useCallback(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    startTest();
  }, [startTest]);

  const [focusMode, setFocusMode] = useState(false);
  const toggleFocusMode = useCallback(() => {
    setFocusMode(prev => !prev);
  }, []);

  useEffect(() => {
    if (!state.isRunning || mode !== 'time' || state.isFinished || !state.startTime) return;

    const checkTime = () => {
      const elapsed = Date.now() - state.startTime;
      if (elapsed >= duration * 1000) {
        finishTest();
      } else {
        animationFrameRef.current = requestAnimationFrame(checkTime);
      }
    };

    animationFrameRef.current = requestAnimationFrame(checkTime);

    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [state.isRunning, state.startTime, state.isFinished, mode, duration, finishTest]);

  useEffect(() => {
    const handleGlobalKey = (e) => {
      const isActive = document.activeElement === inputRef.current || document.activeElement?.tagName === 'BODY';
      if (isActive) handleKeyPress(e);
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [handleKeyPress]);

  useEffect(() => {
    const handlePaste = (e) => {
      if (state.isRunning && !state.isFinished) e.preventDefault();
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