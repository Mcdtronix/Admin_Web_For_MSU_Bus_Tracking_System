import axios from 'axios';

// Use the remote API by default
// Set VITE_API_BASE_URL to override (e.g., http://localhost:8000/api)

const baseURL = import.meta?.env?.VITE_API_BASE_URL || 'https://parole.pythonanywhere.com/api';

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
client.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
client.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.response?.data, error.config?.url);
    return Promise.reject(error);
  }
);

export default client;
