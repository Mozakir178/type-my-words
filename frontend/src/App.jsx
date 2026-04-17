import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import Home from './pages/Home';
import Test from './pages/Test';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import ThemeToggle from './components/ui/ThemeToggle';
import { LogOut } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  return (
    <nav className="border-b dark:border-gray-700 px-6 py-3 flex justify-between items-center sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur z-50">
      <a href="/" className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">TypeMyWords</a>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        {isAuthenticated ? (
          <>
            <a href="/dashboard" className="hover:text-blue-500 transition">Dashboard</a>
            <a href="/test" className="hover:text-blue-500 transition">Test</a>
            <button onClick={logout} className="text-gray-500 hover:text-red-500 transition"><LogOut size={20} /></button>
          </>
        ) : (
          <>
            <a href="/login" className="hover:text-blue-500 transition">Login</a>
            <a href="/signup" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Sign Up</a>
          </>
        )}
      </div>
    </nav>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
              <Header />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/test/:mode?" element={<Test />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/login" element={<PublicRoute><LoginForm /></PublicRoute>} />
                  <Route path="/signup" element={<PublicRoute><SignupForm /></PublicRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;