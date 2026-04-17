import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Trophy, Users, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { slideInUp } from '../utils/animations';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    { icon: <Trophy size={24} />, title: 'Track Progress', desc: 'Detailed WPM & accuracy history with interactive charts' },
    { icon: <Users size={24} />, title: 'Multiplayer Races', desc: 'Compete live with typists around the world' },
    { icon: <Settings size={24} />, title: 'Fully Customizable', desc: 'Themes, fonts, sounds, and test configurations' }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 text-center">
      <motion.div initial="hidden" animate="visible" variants={slideInUp} className="space-y-8 max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Type Faster.<br />
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Think Smarter.
          </span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          The modern, open-source typing practice platform designed to help you master your keyboard.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/test" className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-lg transition shadow-lg hover:shadow-blue-500/25">
            Start Typing <ArrowRight size={20} />
          </Link>
          {!isAuthenticated && (
            <Link to="/signup" className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 rounded-xl font-medium text-lg transition">
              Create Account
            </Link>
          )}
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mt-12 text-left">
          {features.map((f, i) => (
            <motion.div 
              key={i} 
              variants={slideInUp} 
              className="p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="text-blue-600 mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg mb-1">{f.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Home;