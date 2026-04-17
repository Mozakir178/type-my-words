/**
 * Calculate typing metrics from keystroke data
 */
exports.calculateMetrics = (text, keystrokeLog, startTime, endTime) => {
  const durationMinutes = (endTime - startTime) / 60000;
  
  // Count correct/incorrect characters
  let correctChars = 0;
  let incorrectChars = 0;
  let correctedErrors = 0;
  
  keystrokeLog.forEach((keystroke, index) => {
    if (keystroke.correct) {
      correctChars++;
    } else {
      incorrectChars++;
      // Check if this error was later corrected
      if (keystrokeLog.slice(index + 1).some(k => 
        k.charIndex === keystroke.charIndex && k.correct
      )) {
        correctedErrors++;
      }
    }
  });
  
  // Calculate WPM (standard: 5 characters = 1 word)
  const totalChars = correctChars + incorrectChars;
  const grossWPM = Math.round((totalChars / 5) / durationMinutes);
  const netWPM = Math.round(((correctChars / 5) - (incorrectChars / 5)) / durationMinutes);
  
  // Calculate accuracy
  const accuracy = totalChars > 0 
    ? Math.round((correctChars / totalChars) * 100 * 100) / 100 
    : 0;
  
  return {
    wpm: Math.max(0, netWPM),
    rawWPM: grossWPM,
    accuracy,
    errors: {
      total: incorrectChars,
      corrected: correctedErrors,
      uncorrected: incorrectChars - correctedErrors
    },
    keystrokes: {
      total: totalChars,
      correct: correctChars,
      incorrect: incorrectChars
    }
  };
};

/**
 * Generate text based on difficulty
 */
exports.generateText = (mode, count, difficulty) => {
  const wordLists = {
    easy: ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'],
    medium: ['typing', 'practice', 'keyboard', 'speed', 'accuracy', 'focus', 'rhythm', 'flow', 'precision', 'master', 'improve', 'challenge'],
    hard: ['pneumonoultramicroscopicsilicovolcanoconiosis', 'floccinaucinihilipilification', 'antidisestablishmentarianism', 'pseudopseudohypoparathyroidism', 'sesquipedalian']
  };
  
  const words = wordLists[difficulty] || wordLists.medium;
  let result = [];
  
  for (let i = 0; i < count; i++) {
    result.push(words[Math.floor(Math.random() * words.length)]);
  }
  
  return result.join(' ');
};