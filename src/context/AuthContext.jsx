import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const API_URL = `${BASE_API_URL}/auth`;
const SUPER_ADMIN_ROLES = ['admin', 'superadmin', 'super admin'];
const SUPERADMIN_LOGIN_PATH = '/superadmin-login';
const PUBLIC_LOGIN_PATH = '/login';

export const isSuperAdminUser = (user) => {
  const role = String(user?.role || '').trim().toLowerCase();
  const roleName = String(user?.roleName || '').trim().toLowerCase();
  return SUPER_ADMIN_ROLES.includes(role) || SUPER_ADMIN_ROLES.includes(roleName);
};

const getTokenPayload = (jwtToken) => {
  try {
    const payload = jwtToken.split('.')[1];
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(normalizedPayload));
  } catch {
    return null;
  }
};

const isTokenExpired = (jwtToken) => {
  const payload = getTokenPayload(jwtToken);
  if (!payload?.exp) return false;
  return payload.exp * 1000 <= Date.now();
};

const isAuthExpiredError = (error) => {
  const status = error.response?.status;
  const responseMessage = error.response?.data?.message || error.response?.data?.error || '';
  const message = `${responseMessage} ${error.message || ''}`.toLowerCase();
  return (
    status === 401 ||
    message.includes('jwt expired') ||
    message.includes('token expired') ||
    message.includes('auth error')
  );
};

const clearPublicSession = () => {
  localStorage.removeItem('publicUser');
  localStorage.removeItem('publicToken');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const logoutAndRedirect = useCallback(() => {
    logout();
    if (window.location.pathname !== SUPERADMIN_LOGIN_PATH) {
      window.location.assign(SUPERADMIN_LOGIN_PATH);
    }
  }, [logout]);

  const logoutPublicAndRedirect = useCallback(() => {
    clearPublicSession();
    if (window.location.pathname !== PUBLIC_LOGIN_PATH) {
      window.location.assign(PUBLIC_LOGIN_PATH);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        if (isSuperAdminUser(parsedUser) && !isTokenExpired(storedToken)) {
          setUser(parsedUser);
          setToken(storedToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

          try {
            const res = await axios.get(`${BASE_API_URL}/auth/verify-admin`, {
              headers: { Authorization: `Bearer ${storedToken}` }
            });
            if (res.data?.success && res.data?.user) {
              setUser(res.data.user);
              localStorage.setItem('user', JSON.stringify(res.data.user));
            } else {
              throw new Error('Verification failed');
            }
          } catch (err) {
            console.error('Super Admin DB verification failed:', err);
            setUser(null);
            setToken(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
          }
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      response => response,
      error => {
        const requestUrl = error.config?.url || '';
        const isAuthRoute = requestUrl.includes('/auth/');
        const hasAdminToken = Boolean(localStorage.getItem('token'));
        const hasPublicToken = Boolean(localStorage.getItem('publicToken'));
        const isAdminRequest = requestUrl.includes('/admin/') || window.location.pathname.startsWith('/admin');
        const isPublicPortalRequest = requestUrl.includes('/jobseeker/') || requestUrl.includes('/employer/');

        if (!isAuthRoute && hasAdminToken && isAdminRequest && isAuthExpiredError(error)) {
          logoutAndRedirect();
        } else if (!isAuthRoute && hasPublicToken && isPublicPortalRequest && isAuthExpiredError(error)) {
          logoutPublicAndRedirect();
        }

        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptorId);
  }, [logoutAndRedirect, logoutPublicAndRedirect]);

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

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
