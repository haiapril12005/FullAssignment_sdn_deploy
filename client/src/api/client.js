import axios from 'axios';

export const TOKEN_KEY = 'sq_token';
export const USER_KEY = 'sq_user';

// Same server in production ("/api"); set VITE_API_URL only if the API lives on another domain.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT to every request: Authorization: Bearer <token>
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turn an Axios error into a readable message from the backend
export const errorMessage = (err) =>
  (err && err.response && err.response.data && err.response.data.message) ||
  (err && err.message) ||
  'Something went wrong';

export default api;
