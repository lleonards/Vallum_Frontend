import axios from 'axios';
import { supabase } from './supabase';

const BASE_URL = import.meta.env.VITE_API_URL || '';

// Cria instância do axios com token JWT automático
const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// ─── Documents ────────────────────────────────────────────────────────────────
export const documentsApi = {
  list:   ()          => api.get('/api/documents'),
  get:    (id)        => api.get(`/api/documents/${id}`),
  create: (data)      => api.post('/api/documents', data),
  update: (id, data)  => api.put(`/api/documents/${id}`, data),
  delete: (id)        => api.delete(`/api/documents/${id}`),
};

// ─── Convert ──────────────────────────────────────────────────────────────────
export const convertApi = {
  pdf: (formData) => api.post('/api/convert/pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// ─── Payments ─────────────────────────────────────────────────────────────────
export const paymentsApi = {
  createCheckout: () => api.post('/api/payments/create-checkout'),
  getStatus:      () => api.get('/api/payments/status'),
  createPortal:   () => api.post('/api/payments/create-portal'),
};

export default api;
