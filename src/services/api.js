import axios from 'axios';

// Use Vite-compatible env variable syntax
const getBaseUrl = () => {
    return import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
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

// Add token interceptor
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

// Add response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.log('Unauthorized - Token expired or invalid');
            localStorage.removeItem('token');
            
            // Use AuthContext logout if available, otherwise redirect
            if (logoutFn && typeof logoutFn === 'function') {
                logoutFn();
            } else {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
