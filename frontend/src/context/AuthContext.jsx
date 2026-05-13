import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const getAuthError = (error, fallback) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === 'ERR_NETWORK') {
    return 'Backend is not reachable. Start the backend on http://localhost:8080 and try again.';
  }
  return fallback;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('nt_user');
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem('nt_user');
      localStorage.removeItem('nt_token');
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      const userData = res.data;
      setUser(userData.user);
      localStorage.setItem('nt_user', JSON.stringify(userData.user));
      localStorage.setItem('nt_token', userData.token);
      return { success: true };
    } catch (e) {
      return { success: false, error: getAuthError(e, 'Login failed') };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      const userData = res.data;
      setUser(userData.user);
      localStorage.setItem('nt_user', JSON.stringify(userData.user));
      localStorage.setItem('nt_token', userData.token);
      return { success: true };
    } catch (e) {
      return { success: false, error: getAuthError(e, 'Registration failed') };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nt_user');
    localStorage.removeItem('nt_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
