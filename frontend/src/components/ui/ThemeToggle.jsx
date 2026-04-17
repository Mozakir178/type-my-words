import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  
  const themes = [
    { id: 'light', icon: '☀️', label: 'Light' },
    { id: 'dark', icon: '🌙', label: 'Dark' },
    { id: 'system', icon: '🖥️', label: 'System' }
  ];
  
  const cycleTheme = () => {
    const currentIndex = themes.findIndex(t => t.id === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].id);
  };
  
  return (
    <motion.button
      className="theme-toggle"
      onClick={cycleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`Current: ${theme} • Click to change`}
    >
      <motion.span
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="theme-icon"
      >
        {themes.find(t => t.id === theme)?.icon}
      </motion.span>
      
      {/* Theme dropdown on hover */}
      <div className="theme-dropdown">
        {themes.map(t => (
          <button
            key={t.id}
            className={`theme-option ${theme === t.id ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setTheme(t.id);
            }}
          >
            <span className="option-icon">{t.icon}</span>
            <span className="option-label">{t.label}</span>
            {theme === t.id && <span className="option-check">✓</span>}
          </button>
        ))}
      </div>
    </motion.button>
  );
};

export default ThemeToggle;