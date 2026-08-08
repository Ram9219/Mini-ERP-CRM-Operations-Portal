import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user || null);
      } catch (error) {
        if (error.response?.status === 401) {
          setUser(null);
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email, password, role) => {
    try {
      const response = await api.post('/auth/login', { email, password, role });
      const currentUser = response.data.user;
      if (currentUser) {
        setUser(currentUser);
        return { success: true };
      }
      const verify = await api.get('/auth/me');
      setUser(verify.data.user || null);
      return { success: true };
    } catch (error) {
      let message = 'Login failed. Please try again.';
      if (error.response) {
        if (error.response.status === 401) {
          message = error.response.data?.message || 'Invalid email or password';
        } else if (error.response.status === 400) {
          message = error.response.data?.message || 'Invalid login request';
        } else if (error.response.status === 403) {
          message = 'Permission denied';
        } else if (error.response.status >= 500) {
          message = 'Server error occurred. Please try again later.';
        }
      }
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
        await api.post('/auth/logout');
    } finally {
      setUser(null);
      navigate('/login', { replace: true });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        logout,
      }}
    >
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
