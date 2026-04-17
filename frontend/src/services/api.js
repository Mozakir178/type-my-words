import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('unauthorized'));
    }
    return Promise.reject(error);
  }
);

// API service functions
export const testService = {
  submitResult: (result) => api.post('/tests', result),
  getHistory: (params) => api.get('/tests/history', { params }),
  getLeaderboard: (filters) => api.get('/tests/leaderboard', { params: filters })
};

export const userService = {
  getProfile: () => api.get('/users/me'),
  updatePreferences: (prefs) => api.patch('/users/preferences', prefs)
};

export default api;