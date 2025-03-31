import axios from 'axios';

// Use environment variables in a browser-compatible way
const getBaseUrl = () => {
    // For Create React App
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
    }
    // For older bundlers using window.__env
    if (window && window.__env && window.__env.REACT_APP_BACKEND_URL) {
        return window.__env.REACT_APP_BACKEND_URL;
    }
    // Default fallback
    return 'http://localhost:8080';
};

const api = axios.create({
    baseURL: getBaseUrl(),
});

// Store reference to the logout function
let logoutFn = null;

// Function to set logout function from AuthContext
export const setLogoutFunction = (fn) => {
    logoutFn = fn;
};

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear storage and redirect to login on authentication errors
      localStorage.removeItem('token');
      // Use the logout function if it's set, otherwise redirect manually
      if (logoutFn) {
        logoutFn();
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
