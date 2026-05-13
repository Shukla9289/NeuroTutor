import axios from 'axios';

const isLocalHost = () => ['localhost', '127.0.0.1'].includes(window.location.hostname);

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  return isLocalHost() ? 'http://localhost:8080/api' : '/api';
};

export const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthRequest = err.config?.url?.includes('/auth/');
    if (err.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('nt_token');
      localStorage.removeItem('nt_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
