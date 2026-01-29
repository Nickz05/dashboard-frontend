import axios from 'axios';

const API_BASE_URL = 'https://api.dashboard.nickzomer.com/api/';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// REQUEST interceptor (token toevoegen)
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

// RESPONSE interceptor (auto-logout bij 401/403) ← NIEUW!
api.interceptors.response.use(
    (response) => {
        // Success response - gewoon doorgeven
        return response;
    },
    (error) => {
        // Error response - check voor 401 of 403
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('🚪 Token expired of invalid - logging out...');

            // Verwijder token
            localStorage.removeItem('token');

            // Redirect naar login
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;