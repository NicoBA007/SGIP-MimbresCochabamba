import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const authApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

authApi.interceptors.request.use(
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

export default authApi;