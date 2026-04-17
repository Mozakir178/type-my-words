// frontend/src/components/typing/TextDisplay.jsx
import React, { memo } from 'react';
import { motion } from 'framer-motion';

const TextDisplay = memo(({ text, userInput, charStatus, currentIndex, minimal = false }) => {
  return (
    <div className={`text-display ${minimal ? 'minimal' : ''}`}>
      {text.split('').map((char, index) => {
        const status = charStatus[index];
        const isCurrent = index === currentIndex;
        const isTyped = index < userInput.length;
        
        // Display character or placeholder for spaces
        const displayChar = char === ' ' ? '\u00A0' : char;
        
        return (
          <motion.span
            key={index}
            className={`char ${status || 'pending'} ${isCurrent ? 'cursor' : ''} ${
              char === ' ' ? 'space' : ''
            }`}
            initial={false}
            animate={{
              color: status === 'correct' ? 'var(--color-correct)' :
                     status === 'incorrect' ? 'var(--color-error)' :
                     isCurrent ? 'var(--color-cursor)' : 'var(--color-text)',
              backgroundColor: isCurrent ? 'var(--color-cursor-bg)' : 'transparent',
              textDecoration: status === 'incorrect' ? 'underline wavy var(--color-error)' : 'none'
            }}
            transition={{ duration: 0.05 }}
          >
            {displayChar}
          </motion.span>
        );
      })}
    </div>
  );
});

TextDisplay.displayName = 'TextDisplay';
export default TextDisplay;