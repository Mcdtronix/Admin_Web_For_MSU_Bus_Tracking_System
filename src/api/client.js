import axios from 'axios';

// Prefer environment variable; fallback to deployed API
// Set VITE_API_BASE_URL to override (e.g., http://localhost:8000/api)
const baseURL = import.meta?.env?.VITE_API_BASE_URL || 'https://parole.pythonanywhere.com/api';

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;
