import axios from 'axios'
import { config } from './config'
import { supabase } from './supabase'

const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add auth token
api.interceptors.request.use(async (cfg) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    cfg.headers.Authorization = `Bearer ${session.access_token}`
  }
  return cfg
})

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      supabase.auth.signOut()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
