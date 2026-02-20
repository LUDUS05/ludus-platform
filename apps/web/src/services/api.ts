import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

// API configuration for Vite
const getApiBaseUrl = (): string => {
    // Production
    if (import.meta.env.PROD || import.meta.env.MODE === 'production') {
        const envUrl = import.meta.env.VITE_API_URL || 'https://ludus-backend-jzc5.onrender.com';
        return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
    }

    // Development
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) {
        return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
    }
    return 'http://localhost:5001/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Include cookies in all requests (important for HttpOnly refresh tokens)
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Refresh token is sent via HttpOnly cookie
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
                    withCredentials: true,
                });

                const { accessToken } = response.data.data;

                localStorage.setItem('accessToken', accessToken);

                // Retry original request with new token
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                }
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, redirect to login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
