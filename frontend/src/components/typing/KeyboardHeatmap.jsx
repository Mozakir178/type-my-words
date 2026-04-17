import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

// QWERTY keyboard layout with key positions
const KEYBOARD_LAYOUT = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['CapsLock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
  ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
  ['Control', 'Alt', 'Space', 'Alt', 'Control']
];

// Key dimensions and spacing
const KEY_CONFIG = {
  width: 50,
  height: 50,
  gap: 4,
  specialKeyWidth: {
    'Backspace': 90,
    'Tab': 70,
    'CapsLock': 80,
    'Enter': 90,
    'Shift': 100,
    'Control': 60,
    'Alt': 50,
    'Space': 250
  }
};

const KeyboardHeatmap = memo(({ keystrokeLog = [], enabled = true }) => {
  // Calculate key statistics from keystroke log
  const keyStats = useMemo(() => {
    if (!enabled || !keystrokeLog.length) return {};
    
    const stats = {};
    
    keystrokeLog.forEach(({ key, correct, timestamp }) => {
      const normalizedKey = key.length === 1 ? key.toLowerCase() : key;
      
      if (!stats[normalizedKey]) {
        stats[normalizedKey] = {
          total: 0,
          correct: 0,
          incorrect: 0,
          timestamps: []
        };
      }
      
      stats[normalizedKey].total++;
      stats[normalizedKey].timestamps.push(timestamp);
      
      if (correct) {
        stats[normalizedKey].correct++;
      } else {
        stats[normalizedKey].incorrect++;
      }
    });
    
    // Calculate metrics
    Object.keys(stats).forEach(key => {
      const s = stats[key];
      s.accuracy = s.total > 0 ? (s.correct / s.total) * 100 : 100;
      s.avgTime = s.timestamps.length > 1 
        ? (s.timestamps[s.timestamps.length - 1] - s.timestamps[0]) / (s.timestamps.length - 1)
        : 0;
    });
    
    return stats;
  }, [keystrokeLog, enabled]);
  
  // Get color based on key performance
  const getKeyColor = (key) => {
    const stats = keyStats[key];
    if (!stats || !enabled) return 'var(--color-bg-secondary)';
    
    const { accuracy, total } = stats;
    
    // More usage = more saturated color
    const usageFactor = Math.min(total / 10, 1);
    
    if (accuracy >= 95) {
      // Green gradient based on usage
      const intensity = Math.floor(100 + usageFactor * 55);
      return `rgb(0, ${intensity}, 0)`;
    } else if (accuracy >= 80) {
      // Yellow-orange for moderate accuracy
      const intensity = Math.floor(200 - usageFactor * 100);
      return `rgb(${intensity}, ${intensity * 0.8}, 0)`;
    } else {
      // Red for low accuracy
      const intensity = Math.floor(150 + usageFactor * 105);
      return `rgb(${intensity}, 50, 50)`;
    }
  };
  
  // Get tooltip content for key
  const getKeyTooltip = (key) => {
    const stats = keyStats[key];
    if (!stats || !enabled) return null;
    
    return (
      <div className="heatmap-tooltip">
        <div className="tooltip-key">{key.toUpperCase()}</div>
        <div className="tooltip-stats">
          <div>Pressed: {stats.total}x</div>
          <div>Accuracy: {stats.accuracy.toFixed(1)}%</div>
          <div>Avg interval: {stats.avgTime.toFixed(0)}ms</div>
          {stats.incorrect > 0 && (
            <div className="tooltip-errors">Errors: {stats.incorrect}</div>
          )}
        </div>
      </div>
    );
  };
  
  if (!enabled) {
    return (
      <div className="keyboard-heatmap disabled">
        <div className="heatmap-placeholder">
          Heatmap disabled • Enable in settings to track key performance
        </div>
      </div>
    );
  }
  
  return (
    <div className="keyboard-heatmap">
      <div className="heatmap-title">
        Keyboard Heatmap
        {keystrokeLog.length > 0 && (
          <span className="heatmap-count">({keystrokeLog.length} keystrokes)</span>
        )}
      </div>
      
      <svg 
        className="keyboard-svg"
        viewBox="0 0 800 300"
        preserveAspectRatio="xMidYMid meet"
      >
        {KEYBOARD_LAYOUT.map((row, rowIndex) => {
          const rowY = rowIndex * (KEY_CONFIG.height + KEY_CONFIG.gap) + 10;
          let rowX = 10;
          
          // Center the keyboard
          const rowWidth = row.reduce((sum, key) => 
            sum + (KEY_CONFIG.specialKeyWidth[key] || KEY_CONFIG.width) + KEY_CONFIG.gap, 0);
          rowX = (800 - rowWidth) / 2;
          
          return row.map((key, keyIndex) => {
            const keyWidth = KEY_CONFIG.specialKeyWidth[key] || KEY_CONFIG.width;
            const keyX = row.reduce((sum, k, i) => 
              i < keyIndex ? sum + (KEY_CONFIG.specialKeyWidth[k] || KEY_CONFIG.width) + KEY_CONFIG.gap : sum, 10);
            
            const adjustedX = (800 - rowWidth) / 2 + 
              row.slice(0, keyIndex).reduce((sum, k) => 
                sum + (KEY_CONFIG.specialKeyWidth[k] || KEY_CONFIG.width) + KEY_CONFIG.gap, 0);
            
            return (
              <g key={`${rowIndex}-${keyIndex}`}>
                <motion.rect
                  x={adjustedX}
                  y={rowY}
                  width={keyWidth}
                  height={KEY_CONFIG.height}
                  rx="6"
                  fill={getKeyColor(key.toLowerCase())}
                  stroke="var(--color-border)"
                  strokeWidth="1"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                />
                <text
                  x={adjustedX + keyWidth / 2}
                  y={rowY + KEY_CONFIG.height / 2 + 5}
                  textAnchor="middle"
                  fill="var(--color-text)"
                  fontSize="12"
                  fontWeight="500"
                  style={{ pointerEvents: 'none' }}
                >
                  {key === 'Space' ? '␣' : key}
                </text>
                
                {/* Tooltip on hover */}
                <title>{getKeyTooltip(key.toLowerCase())}</title>
              </g>
            );
          });
        })}
      </svg>
      
      {/* Legend */}
      <div className="heatmap-legend">
        <span className="legend-item">
          <span className="legend-color good" /> High accuracy
        </span>
        <span className="legend-item">
          <span className="legend-color medium" /> Moderate
        </span>
        <span className="legend-item">
          <span className="legend-color poor" /> Needs practice
        </span>
      </div>
    </div>
  );
});

KeyboardHeatmap.displayName = 'KeyboardHeatmap';
export default KeyboardHeatmap;