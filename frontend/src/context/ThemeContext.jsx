import React, { createContext, useState, useEffect, useCallback } from 'react';
import { themes, applyTheme } from '../styles/themes';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Load from localStorage or default to system
    const saved = localStorage.getItem('theme');
    if (saved && themes[saved]) return saved;
    
    // Check system preference
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });
  
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Apply theme with smooth transition
  const applyThemeWithTransition = useCallback((newTheme) => {
    setIsTransitioning(true);
    
    // Get theme colors
    const themeColors = themes[newTheme] || themes.light;
    applyTheme(themeColors);
    
    // Update document class for CSS hooks
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Save preference
    localStorage.setItem('theme', newTheme);
    
    // End transition after CSS animation
    setTimeout(() => setIsTransitioning(false), 300);
  }, []);
  
  // Handle system theme changes
  useEffect(() => {
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      applyThemeWithTransition(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyThemeWithTransition]);
  
  // Apply theme when it changes
  useEffect(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      applyThemeWithTransition(isDark ? 'dark' : 'light');
    } else {
      applyThemeWithTransition(theme);
    }
  }, [theme, applyThemeWithTransition]);
  
  // Keyboard shortcut: Ctrl/Cmd + T to toggle theme
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        const currentIndex = Object.keys(themes).indexOf(theme);
        const nextTheme = Object.keys(themes)[(currentIndex + 1) % Object.keys(themes).length];
        setTheme(nextTheme);
      }
    };
    
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme, isTransitioning }}>
      <div className={`theme-wrapper ${isTransitioning ? 'transitioning' : ''}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};