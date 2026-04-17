export const themes = {
  light: {
    bg: '#ffffff',
    bgSecondary: '#f8f9fa',
    text: '#2d3436',
    textSecondary: '#636e72',
    primary: '#0984e3',
    correct: '#00b894',
    error: '#d63031',
    cursor: '#2d3436',
    cursorBg: 'rgba(9, 132, 227, 0.2)',
    border: '#dfe6e9',
    shadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  dark: {
    bg: '#1e1e2e',
    bgSecondary: '#2a2a3a',
    text: '#cdd6f4',
    textSecondary: '#a6adc8',
    primary: '#89b4fa',
    correct: '#a6e3a1',
    error: '#f38ba8',
    cursor: '#f5e0dc',
    cursorBg: 'rgba(137, 180, 250, 0.2)',
    border: '#45475a',
    shadow: '0 2px 10px rgba(0,0,0,0.3)'
  }
};

export const applyTheme = (theme) => {
  const root = document.documentElement;
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
};