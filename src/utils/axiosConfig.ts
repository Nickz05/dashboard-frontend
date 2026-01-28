// src/utils/axiosConfig.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - voeg token toe aan elke request
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
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

// Response interceptor - handle token errors
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Als het een 401 is en we hebben nog niet geprobeerd te refreshen
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');

                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                // Probeer nieuwe token te krijgen
                const response = await axios.post(`${API_URL}/api/auth/refresh`, {
                    refreshToken: refreshToken
                });

                const { token, refreshToken: newRefreshToken } = response.data;

                // Sla nieuwe tokens op
                localStorage.setItem('token', token);
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken);
                }

                // Retry originele request met nieuwe token
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return axiosInstance(originalRequest);

            } catch (refreshError) {
                // Refresh failed, redirect naar login
                console.error('Token refresh failed:', refreshError);

                // Clear alle auth data
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');

                // Redirect naar login
                window.location.href = '/login?expired=true';

                return Promise.reject(refreshError);
            }
        }

        // Voor andere errors, gewoon doorgeven
        return Promise.reject(error);
    }
);

export default axiosInstance;

// Helper functions voor API calls
export const apiClient = {
    get: (url: string, config = {}) => axiosInstance.get(url, config),
    post: (url: string, data?: any, config = {}) => axiosInstance.post(url, data, config),
    put: (url: string, data?: any, config = {}) => axiosInstance.put(url, data, config),
    patch: (url: string, data?: any, config = {}) => axiosInstance.patch(url, data, config),
    delete: (url: string, config = {}) => axiosInstance.delete(url, config),
};