import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('vellum-token'));

  // Sempre que o token mudar, atualiza o header Authorization do Axios
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const logout = useCallback(() => {
    localStorage.removeItem('vellum-token');
    localStorage.removeItem('vellum-refresh-token');
    setToken(null);
    setUser(null);
  }, []);

  const loadUser = useCallback(async (tkn) => {
    if (!tkn) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/user/profile');
      setUser(res.data);
    } catch (err) {
      console.error('Erro ao carregar usuário:', err);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

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
      console.error('Erro no login:', err);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      return res.data;
    } catch (err) {
      console.error('Erro no registro:', err);
      throw err;
    }
  };

  const refreshUser = () => loadUser(token);

  const isAuthenticated = !!user && !!token;
  const isPro = user?.plan === 'pro' || user?.plan === 'premium';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isPro,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return ctx;
};
