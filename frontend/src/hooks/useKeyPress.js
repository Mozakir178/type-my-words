import { useState, useEffect } from 'react';

export const useKeyPress = (targetKey) => {
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const downHandler = (e) => {
      if (e.key === targetKey) {
        setPressed(true);
      }
    };
    const upHandler = (e) => {
      if (e.key === targetKey) {
        setPressed(false);
      }
    };

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [targetKey]);

  return pressed;
};