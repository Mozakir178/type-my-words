import { motion } from 'framer-motion';

const Caret = ({ visible }) => {
  if (!visible) return null;
  
  return (
    <motion.span
      className="caret"
      animate={{ opacity: [1, 0] }}
      transition={{ 
        duration: 0.8, 
        repeat: Infinity, 
        ease: "linear",
        repeatType: "reverse"
      }}
      style={{
        display: 'inline-block',
        width: '2px',
        backgroundColor: 'var(--color-cursor)',
        marginLeft: '-2px',
        verticalAlign: 'text-bottom'
      }}
    />
  );
};

export default Caret;