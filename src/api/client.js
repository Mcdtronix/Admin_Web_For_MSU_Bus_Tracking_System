import axios from 'axios';

// For production (Vercel), use the proxy path
// For development, use the direct backend URL or localhost
const baseURL = import.meta?.env?.VITE_API_BASE_URL || '/api';

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;