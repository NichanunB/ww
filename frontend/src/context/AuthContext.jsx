// frontend/src/context/AuthContext.jsx
import  { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.validateToken();
          setUser(response.data.data);
          setIsLoggedIn(true);
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
          // Token is invalid, remove it
          localStorage.removeItem('token');
          localStorage.removeItem('user_id');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user_id } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user_id', user_id.toString());
      
      // Get user profile
      const profileResponse = await authAPI.getProfile();
      setUser(profileResponse.data.data);
      setIsLoggedIn(true);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      await authAPI.register(userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    setUser(null);
    setIsLoggedIn(false);
  };

  const value = {
    user,
    isLoggedIn,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};