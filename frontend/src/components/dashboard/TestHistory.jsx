import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

const TestHistory = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/tests/history', { params: { page, limit: 10 } });
        setTests(data.data.tests);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [page]);

  if (loading) return <div className="text-center py-8">Loading history...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <h3 className="text-xl font-bold mb-4">Recent Tests</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b dark:border-gray-700 text-sm text-gray-500">
              <th className="pb-2">Date</th>
              <th className="pb-2">Mode</th>
              <th className="pb-2">WPM</th>
              <th className="pb-2">Accuracy</th>
              <th className="pb-2">Errors</th>
            </tr>
          </thead>
          <tbody>
            {tests.map(test => (
              <tr key={test._id} className="border-b dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="py-3">{formatDistanceToNow(new Date(test.completedAt))} ago</td>
                <td className="py-3 capitalize">{test.mode} ({test.duration || test.wordCount})</td>
                <td className="py-3 font-medium text-blue-600">{test.wpm}</td>
                <td className="py-3">{test.accuracy}%</td>
                <td className="py-3 text-red-500">{test.errors.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between mt-4">
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
        <button onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded">Next</button>
      </div>
    </div>
  );
};

export default TestHistory;