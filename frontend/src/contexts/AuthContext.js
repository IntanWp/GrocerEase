import React, { createContext, useContext, useState, useEffect } from 'react';
import { userAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to decode JWT token
const decodeToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decodedToken = decodeToken(token);
        if (decodedToken && decodedToken.id) {
          // Fetch full user profile data
          const userResponse = await userAPI.getProfile(decodedToken.id);
          if (userResponse.success) {
            setUser({
              id: decodedToken.id,
              ...userResponse.user
            });
          } else {
            // Token is invalid or user doesn't exist
            localStorage.removeItem('token');
            setUser(null);
          }
        } else {
          // Invalid token format
          localStorage.removeItem('token');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  const login = async (credentials) => {
    try {
      const response = await userAPI.login(credentials);
      console.log('Login response:', response);
      
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        
        // Decode token to get user ID
        const decodedToken = decodeToken(response.token);
        if (decodedToken && decodedToken.id) {
          // Fetch user profile data
          const userResponse = await userAPI.getProfile(decodedToken.id);
          if (userResponse.success) {
            setUser({
              id: decodedToken.id,
              ...userResponse.user
            });
            return { success: true };
          } else {
            // If we can't get user data, remove token and fail login
            localStorage.removeItem('token');
            return { success: false, message: 'Failed to fetch user data' };
          }
        } else {
          localStorage.removeItem('token');
          return { success: false, message: 'Invalid token received' };
        }
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await userAPI.register(userData);
      console.log('Register response:', response);
      
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        
        // Decode token to get user ID
        const decodedToken = decodeToken(response.token);
        if (decodedToken && decodedToken.id) {
          // Fetch user profile data
          const userResponse = await userAPI.getProfile(decodedToken.id);
          if (userResponse.success) {
            setUser({
              id: decodedToken.id,
              ...userResponse.user
            });
            return { success: true };
          } else {
            // If we can't get user data, remove token and fail registration
            localStorage.removeItem('token');
            return { success: false, message: 'Failed to fetch user data' };
          }
        } else {
          localStorage.removeItem('token');
          return { success: false, message: 'Invalid token received' };
        }
      } else {
        return { success: false, message: response.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user && !!localStorage.getItem('token')
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};