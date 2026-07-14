import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Response interceptor for unified error formatting
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.message || 'Something went wrong';
        const customError = new Error(message);
        customError.response = error.response;
        customError.config = error.config;
        return Promise.reject(customError);
    }
);

export default api;
