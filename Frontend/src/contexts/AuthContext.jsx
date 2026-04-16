import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/api/auth/me');
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      
      if (res.data.status === 'MFA_SETUP_REQUIRED' || res.data.status === 'MFA_CODE_REQUIRED') {
        return res.data;
      }

      localStorage.setItem('token', res.data.token);
      setUser({
        id: res.data.userId || res.data.id || null,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role
      });
      return { status: 'SUCCESS', role: res.data.role };
    } catch (err) {
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/api/auth/register', userData);
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const verifyMfaLogin = async (userId, code) => {
    try {
      const res = await api.post('/api/auth/login/verify-mfa', { userId, code: parseInt(code, 10) });
      localStorage.setItem('token', res.data.token);
      setUser({
        id: res.data.userId || res.data.id || null,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role
      });
      return { status: 'SUCCESS', role: res.data.role };
    } catch (err) {
      throw err;
    }
  };

  const verifyMfaSetup = async (userId, code) => {
    try {
      const res = await api.post('/api/auth/mfa/verify-setup', { 
        userId, 
        code: parseInt(code, 10) 
      });
      localStorage.setItem('token', res.data.token);
      setUser({
        id: res.data.userId || res.data.id || null,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role
      });
      return { status: 'SUCCESS', role: res.data.role };
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyMfaLogin, verifyMfaSetup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
