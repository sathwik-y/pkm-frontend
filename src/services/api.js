import axios from 'axios'

// Variable to store logout function reference
let logoutFunction = null;

// Export function to set logout handler
export const setLogoutFunction = (fn) => {
    logoutFunction = fn;
};

const api = axios.create({
    baseURL: 'http://localhost:8080',
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if(token){
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
        if(error.response && error.response.status === 401){
            localStorage.removeItem('token');
            // Use the logout function if it's set, otherwise redirect manually
            if (logoutFunction) {
                logoutFunction();
            } else {
                window.location.href='/login';
            }
        }
        return Promise.reject(error);
    }
);
export default api