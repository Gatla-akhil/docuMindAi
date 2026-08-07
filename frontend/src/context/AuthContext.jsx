import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data.data.user);
        } catch (err) {
          console.warn('[AuthInit Warning]: Session expired or invalid server connection');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const payload = res.data.data || res.data;
      const userData = payload.user;
      const accessToken = payload.accessToken || payload.token;
      const refreshToken = payload.refreshToken;

      if (!userData || !accessToken) {
        throw new Error('Invalid authentication response structure');
      }

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken || accessToken);
      setUser(userData);
      toast.success(`Welcome back, ${userData.name || 'User'}!`);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const register = async (name, email, password, role = 'user') => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      const payload = res.data.data || res.data;
      const userData = payload.user;
      const accessToken = payload.accessToken || payload.token;
      const refreshToken = payload.refreshToken;

      if (!userData || !accessToken) {
        throw new Error('Invalid registration response structure');
      }

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken || accessToken);
      setUser(userData);
      toast.success('Account created successfully!');
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch (err) {
      console.warn('[Logout Warning]: Remote invalidate failed');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      toast.success('Logged out successfully.');
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      const res = await api.put('/auth/profile', updatedData);
      setUser(res.data.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
