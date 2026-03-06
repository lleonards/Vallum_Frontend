import axios from 'axios';

const API_URL = 'https://vallum-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000
});

// ==============================
// REQUEST INTERCEPTOR
// ==============================
api.interceptors.request.use(config => {
  const token = localStorage.getItem('vellum-token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// ==============================
// RESPONSE INTERCEPTOR (REFRESH TOKEN)
// ==============================
api.interceptors.response.use(
  response => response,

  async error => {
    const originalRequest = error.config;

    // Token expirado → tenta renovar automaticamente
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('vellum-refresh-token');

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { token, refreshToken: newRefresh } = res.data;

          localStorage.setItem('vellum-token', token);
          localStorage.setItem('vellum-refresh-token', newRefresh);

          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          return api(originalRequest);

        } catch (refreshError) {
          console.error('Erro ao renovar token:', refreshError);
          localStorage.removeItem('vellum-token');
          localStorage.removeItem('vellum-refresh-token');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
