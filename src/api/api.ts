import axios from 'axios';

// 🚀 Configuratie van de basis-URL van de backend
// Omdat je server op poort 5000 draait (zoals gedefinieerd in server.ts)
const API_BASE_URL = 'http://localhost:5000/api';

// Maak een custom Axios instantie aan
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Axios Request Interceptor: Voegt de JWT-token toe aan de headers van elk verzoek
 * Dit is cruciaal voor de authMiddleware op de backend
 */
api.interceptors.request.use(
    (config) => {
        // 1. Haal de token op uit de lokale opslag (waar deze wordt bewaard na inloggen)
        const token = localStorage.getItem('token');

        // 2. Als een token bestaat, voeg deze dan toe aan de 'Authorization' header
        if (token) {
            // Vereist formaat: Bearer <token>
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        // Afhandeling van request errors
        return Promise.reject(error);
    }
);

export default api;