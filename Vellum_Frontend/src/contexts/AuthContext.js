import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('vellum-token'));

  const loadUser = useCallback(async (tkn) => {
    if (!tkn) { setLoading(false); return; }
    try {
      const res = await api.get('/user/profile', {
        headers: { Authorization: `Bearer ${tkn}` }
      });
      setUser(res.data);
    } catch {
      localStorage.removeItem('vellum-token');
      localStorage.removeItem('vellum-refresh-token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(token); }, [token, loadUser]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: tkn, refreshToken, user: userData } = res.data;
    localStorage.setItem('vellum-token', tkn);
    localStorage.setItem('vellum-refresh-token', refreshToken);
    setToken(tkn);
    setUser(userData);
    return userData;
  };

  // CORREÇÃO: Enviando "username" em vez de "name" para agradar o Backend
  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { username: name, email, password });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('vellum-token');
    localStorage.removeItem('vellum-refresh-token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = () => loadUser(token);

  const isAuthenticated = !!user && !!token;
  const isPro = user?.plan === 'pro';

  return (
    <AuthContext.Provider value={{
      user, token, loading, isAuthenticated, isPro,
      login, register, logout, refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
