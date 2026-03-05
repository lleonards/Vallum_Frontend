import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('vellum-token'));

  const loadUser = useCallback(async (tkn) => {
    if (!tkn) {
      setLoading(false);
      return;
    }
    try {
      // Busca o perfil do usuário usando o token salvo
      const res = await api.get('/user/profile');
      setUser(res.data);
    } catch (err) {
      console.error("Erro ao carregar usuário:", err);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser(token);
  }, [token, loadUser]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: tkn, refreshToken, user: userData } = res.data;
      
      localStorage.setItem('vellum-token', tkn);
      localStorage.setItem('vellum-refresh-token', refreshToken);
      
      setToken(tkn);
      setUser(userData);
      return userData;
    } catch (err) {
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      // O seu backend em routes/auth.js valida: if (!email || !password || !name)
      // Portanto, o objeto enviado deve ter exatamente essas chaves.
      const res = await api.post('/auth/register', { name, email, password });
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('vellum-token');
    localStorage.removeItem('vellum-refresh-token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = () => loadUser(token);

  const isAuthenticated = !!user && !!token;
  const isPro = user?.plan === 'pro' || user?.plan === 'premium';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated,
      isPro,
      login,
      register,
      logout,
      refreshUser
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
