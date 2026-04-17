import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Button = ({ 
  children, variant = 'primary', to, onClick, disabled, loading, className = '', ...props 
}) => {
  const baseClasses = 'px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg',
    secondary: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
  };

  const Component = to ? Link : 'button';
  const componentProps = to ? { to, ...props } : { onClick, disabled, type: 'button', ...props };

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Component 
        className={`${baseClasses} ${variants[variant]} ${className}`}
        disabled={loading || disabled}
        {...componentProps}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : children}
      </Component>
    </motion.div>
  );
};

export default Button;