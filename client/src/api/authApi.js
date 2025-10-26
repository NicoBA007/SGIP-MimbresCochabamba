import axios from 'axios';

// URL base de la API (igual que en otros archivos)
const API_BASE_URL = 'http://localhost:3001/api';

// 1. Creamos una "instancia" de axios para el panel
const authApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Usamos un "interceptor"
// Esto es una función que se ejecuta ANTES de cada petición
authApi.interceptors.request.use(
    (config) => {
        // 3. Obtenemos el token de localStorage
        const token = localStorage.getItem('token');
        
        if (token) {
            // 4. Si el token existe, lo añadimos a los headers
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Manejamos errores de la configuración de la petición
        return Promise.reject(error);
    }
);

export default authApi;