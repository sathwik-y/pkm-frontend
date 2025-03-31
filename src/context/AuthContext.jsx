import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check token validity on mount
  useEffect(() => {
    const checkTokenValidity = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        // Instead of calling a verification endpoint that doesn't exist,
        // just assume token is valid until proven otherwise by API interceptors
        setIsAuthenticated(true);
        // You could also try to get user info if needed
        // But for now just set basic authentication state
      }
      setIsLoading(false);
    };

    checkTokenValidity();
  }, []);

  const login = async(username, password) => {
    try {
      const response = await api.post('/login', {userName: username, password});
      localStorage.setItem('token', response.data.token);
      setIsAuthenticated(true);
      setUser({ username });
      return true;
    } catch (error) {
      console.error('Login Failed: ', error);
      return false;
    }
  };

  const register = async (username, emailId, password) => {
    try {
      const response = await api.post('/register', {
        userName: username,
        emailId,
        password
      });
      return true;
    } catch (error) {
      console.error("Signup Failed: ", error);
      throw new Error(error.response?.data?.error || 'Signup failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/login'; // Force redirect to login
  };

  if (isLoading) {
    // You could return a loading component here if needed
    return <div className="loading">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);