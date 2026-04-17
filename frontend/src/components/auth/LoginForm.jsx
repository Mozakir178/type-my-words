import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      window.location.href = '/dashboard';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center">Welcome Back</h2>
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input 
          type="email" value={email} onChange={e => setEmail(e.target.value)} 
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input 
          type="password" value={password} onChange={e => setPassword(e.target.value)} 
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
      </div>
      
      <Button type="submit" className="w-full" loading={loading}>Sign In</Button>
      
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign Up</Link>
      </p>
    </form>
  );
};

export default LoginForm;