export const calculateWPM = (chars, timeInSeconds) => {
  if (timeInSeconds === 0) return 0;
  const minutes = timeInSeconds / 60;
  // Standard: 5 characters = 1 word
  return Math.round((chars / 5) / minutes);
};

export const calculateAccuracy = (correct, total) => {
  if (total === 0) return 100;
  return Math.round((correct / total) * 10000) / 100;
};

export const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const calculateConsistency = (wpmReadings) => {
  if (wpmReadings.length < 2) return 100;
  const avg = wpmReadings.reduce((a, b) => a + b, 0) / wpmReadings.length;
  const variance = wpmReadings.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / wpmReadings.length;
  const stdDev = Math.sqrt(variance);
  // Coefficient of variation inverted
  return Math.max(0, Math.round((1 - stdDev / avg) * 100));
};