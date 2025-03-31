import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setLogoutFunction } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsAuthenticated(true);
        setUser({ username: 'User' }); // Placeholder, modify based on your needs
      }
      setIsLoading(false);
    };

    checkToken();
  }, []);

  // Set logout function reference
  useEffect(() => {
    setLogoutFunction(logout);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/login', { userName: username, password });
      localStorage.setItem('token', response.data.token);
      setIsAuthenticated(true);
      setUser({ username });
      return true;
    } catch (error) {
      console.error('Login Failed:', error.response?.data || error.message);
      return false;
    }
  };

  const register = async (username, emailId, password) => {
    try {
      await api.post('/register', { userName: username, emailId, password });
      return true;
    } catch (error) {
      console.error('Signup Failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Signup failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/login';
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
