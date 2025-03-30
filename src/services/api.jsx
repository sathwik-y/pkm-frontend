import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080',
});

// Store reference to the logout function
let logoutFn = null;

// Function to set logout function from AuthContext
export const setLogoutFunction = (fn) => {
    logoutFn = fn;
};

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response, 
    (error) => {
        if (error.response && error.response.status === 401) {
            console.log('Unauthorized - Token expired or invalid');
            // Clear token from localStorage
            localStorage.removeItem('token');
            
            // Use AuthContext logout if available, otherwise redirect
            if (logoutFn && typeof logoutFn === 'function') {
                logoutFn();
            } else {
                // Fallback if logout function is not available
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
