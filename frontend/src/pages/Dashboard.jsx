import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import StatsChart from '../components/dashboard/StatsChart';
import TestHistory from '../components/dashboard/TestHistory';
import Leaderboard from '../components/dashboard/Leaderboard';
import { api } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/tests/stats');
        setStats(data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  if (!user) return <div className="text-center py-20">Please log in to view your dashboard.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.username}!</h1>
          <p className="text-gray-500">Here's your typing performance overview</p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tests Taken', value: stats?.summary.totalTests || 0 },
          { label: 'Avg WPM', value: Math.round(stats?.summary.avgWPM || 0) },
          { label: 'Best WPM', value: stats?.summary.bestWPM || 0 },
          { label: 'Avg Accuracy', value: `${stats?.summary.avgAccuracy?.toFixed(1) || 0}%` }
        ].map((item, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <div className="text-sm text-gray-500">{item.label}</div>
            <div className="text-2xl font-bold mt-1">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <StatsChart data={stats?.recentTests || []} type="wpm" period="30d" />
        </div>
        <Leaderboard />
      </div>

      <TestHistory />
    </div>
  );
};

export default Dashboard;