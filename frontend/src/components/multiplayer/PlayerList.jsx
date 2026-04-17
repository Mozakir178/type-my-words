import { motion } from 'framer-motion';

const PlayerList = ({ players }) => {
  return (
    <div className="space-y-2">
      {players.map((player, index) => (
        <motion.div 
          key={player.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              index === 0 ? 'bg-yellow-200' : index === 1 ? 'bg-gray-300' : index === 2 ? 'bg-orange-200' : 'bg-blue-200'
            }`}>
              {index + 1}
            </div>
            <span className="font-medium">{player.username}</span>
          </div>
          <div className="text-right">
            <div className="font-mono text-sm">{player.wpm || 0} WPM</div>
            <div className="w-24 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-200" style={{ width: `${player.progress || 0}%` }} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default PlayerList;