import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

const SignupForm = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const { signup, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }
    
    const result = await signup(form.username, form.email, form.password);
    if (result.success) {
      window.location.href = '/dashboard';
    } else {
      setError(result.error || 'Signup failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center">Create Account</h2>
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
      
      {['username', 'email', 'password', 'confirmPassword'].map(field => (
        <div key={field}>
          <label className="block text-sm font-medium mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
          <input 
            type={field.includes('password') ? 'password' : 'text'} 
            value={form[field]} 
            onChange={e => setForm({...form, [field]: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
      ))}
      
      <Button type="submit" className="w-full" loading={loading}>Create Account</Button>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign In</Link>
      </p>
    </form>
  );
};

export default SignupForm;