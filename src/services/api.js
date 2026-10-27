import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401s, 403s and global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear localStorage and redirect to login if token is invalid or forbidden
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth'); // Ensure Redux auth state is cleared on reload
      window.location.href = '/login';
    } else {
      const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
      console.warn(`API Error (${error.response?.status || 'network'}):`, message);
      error.message = message;
    }
    return Promise.reject(error);
  }
);

export default api;
