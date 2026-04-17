import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Crown, Trophy } from 'lucide-react';

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState({ mode: 'time', difficulty: 'medium', period: 'daily' });

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get('/tests/leaderboard', { params: filter });
        setData(data.data.leaderboard);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLeaderboard();
  }, [filter]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2"><Trophy size={20} /> Global Leaderboard</h3>
        <select 
          value={filter.period} onChange={e => setFilter({...filter, period: e.target.value})}
          className="bg-transparent border rounded px-2 py-1 text-sm"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="space-y-3">
        {data.slice(0, 10).map((entry, index) => (
          <div key={entry.rank} className={`flex items-center justify-between p-3 rounded-lg ${
            index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 
            index === 1 ? 'bg-gray-100 dark:bg-gray-700/50' :
            index === 2 ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-gray-50 dark:bg-gray-800/50'
          }`}>
            <div className="flex items-center gap-3">
              <span className="font-bold w-6 text-center">{entry.rank}</span>
              {index < 3 && <Crown size={16} className={index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-orange-500'} />}
              <span className="font-medium">{entry.username}</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-blue-600">{entry.wpm} WPM</div>
              <div className="text-xs text-gray-500">{entry.accuracy}% acc</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;