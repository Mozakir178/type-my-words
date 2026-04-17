import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Trophy } from 'lucide-react';

const Leaderboard = () => {
  const [filters, setFilters] = useState({ mode: 'time', period: 'daily' });
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/tests/leaderboard', { params: filters });
        setData(data.data.leaderboard);
      } catch (err) { console.error(err); }
    };
    fetch();
  }, [filters]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Trophy /> Global Leaderboard</h1>
        <div className="flex gap-2">
          {['daily', 'weekly', 'all'].map(p => (
            <button 
              key={p} onClick={() => setFilters({...filters, period: p})}
              className={`px-3 py-1 rounded capitalize ${filters.period === p ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >{p}</button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50 text-left">
            <tr>
              <th className="p-4">Rank</th>
              <th className="p-4">User</th>
              <th className="p-4">Mode</th>
              <th className="p-4">WPM</th>
              <th className="p-4">Accuracy</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry, i) => (
              <tr key={entry._id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="p-4 font-bold">{i + 1}</td>
                <td className="p-4">{entry.username}</td>
                <td className="p-4 capitalize">{entry.mode}</td>
                <td className="p-4 font-mono text-blue-600">{entry.wpm}</td>
                <td className="p-4">{entry.accuracy}%</td>
                <td className="p-4 text-gray-500 text-sm">{new Date(entry.completedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;