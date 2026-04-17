// Word lists by difficulty
const WORD_LISTS = {
  easy: [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
    'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
    'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
    'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so'
  ],
  
  medium: [
    'typing', 'practice', 'keyboard', 'speed', 'accuracy', 'focus', 'rhythm',
    'flow', 'precision', 'master', 'improve', 'challenge', 'exercise',
    'technique', 'fingers', 'rapid', 'steady', 'consistent', 'progress',
    'skill', 'develop', 'training', 'performance', 'measure', 'tracking'
  ],
  
  hard: [
    'pneumonoultramicroscopicsilicovolcanoconiosis',
    'floccinaucinihilipilification',
    'antidisestablishmentarianism',
    'pseudopseudohypoparathyroidism',
    'sesquipedalian', 'defenestration', 'serendipity', 'ephemeral',
    'quintessential', 'perspicacious', 'obsequious', 'surreptitious',
    'mellifluous', 'ineffable', 'ubiquitous', 'cacophony', 'juxtaposition'
  ],
  
  quotes: [
    'The quick brown fox jumps over the lazy dog',
    'Pack my box with five dozen liquor jugs',
    'How vexingly quick daft zebras jump',
    'The five boxing wizards jump quickly',
    'Sphinx of black quartz, judge my vow'
  ]
};

// Generate random text based on configuration
exports.generateText = (config) => {
  const { mode, count, difficulty, customText, type = 'words' } = config;
  
  // Return custom text if provided
  if (customText && mode === 'custom') {
    return customText.trim();
  }
  
  // Select word list based on difficulty
  const words = WORD_LISTS[difficulty] || WORD_LISTS.medium;
  
  // Generate text based on type
  if (type === 'quotes') {
    const quotes = WORD_LISTS.quotes;
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
  
  // Generate word-based text
  const result = [];
  const targetCount = mode === 'words' ? count : (count || 50);
  
  for (let i = 0; i < targetCount; i++) {
    result.push(words[Math.floor(Math.random() * words.length)]);
  }
  
  return result.join(' ');
};

// Get available options for UI
exports.getTextOptions = () => {
  return {
    modes: ['time', 'words', 'custom'],
    durations: [15, 30, 60, 120],
    wordCounts: [10, 25, 50, 100, 200],
    difficulties: ['easy', 'medium', 'hard'],
    types: ['words', 'quotes']
  };
};