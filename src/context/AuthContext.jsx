import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const API_URL = `${BASE_API_URL}/auth`;
const SUPER_ADMIN_ROLES = ['admin', 'superadmin', 'super admin'];

export const isSuperAdminUser = (user) => {
  const role = String(user?.role || '').trim().toLowerCase();
  const roleName = String(user?.roleName || '').trim().toLowerCase();
  return SUPER_ADMIN_ROLES.includes(role) || SUPER_ADMIN_ROLES.includes(roleName);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      if (isSuperAdminUser(parsedUser)) {
        setUser(parsedUser);
        setToken(storedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/superadmin-login`, { email, password });
      const { token: userToken, ...userData } = response.data;

      if (!isSuperAdminUser(userData)) {
        throw new Error('Only super admin can access the admin portal.');
      }
      
      setUser(userData);
      setToken(userToken);
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userToken);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      return userData;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Login failed. Please check credentials.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (email, password, role) => {
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/register`, { email, password, role });
      const { token: userToken, ...userData } = response.data;
      
      setUser(userData);
      setToken(userToken);
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userToken);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      return userData;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
