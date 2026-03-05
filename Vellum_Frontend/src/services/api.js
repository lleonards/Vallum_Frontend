import axios from 'axios';

const API_URL = https://vallum-backend.onrender.com
const api = axios.create({
  baseURL: API_URL,
  timeout: 60000
});

// Request interceptor: attach token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('vellum-token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 refresh
api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('vellum-refresh-token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { token, refreshToken: newRefresh } = res.data;
          localStorage.setItem('vellum-token', token);
          localStorage.setItem('vellum-refresh-token', newRefresh);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('vellum-token');
          localStorage.removeItem('vellum-refresh-token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export default api;
