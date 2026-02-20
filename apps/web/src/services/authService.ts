import api from './api';
import { User } from '../../types';

interface AuthResponse {
    success: boolean;
    data: {
        user: User;
        accessToken: string;
    };
}

interface LoginCredentials {
    email?: string;
    password?: string;
    // Add other loose fields if necessary, or keep strict
}

interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword?: string;
    role?: string;
}

export const authService = {
    // Register new user
    register: async (userData: RegisterData): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', userData);
        const { user, accessToken } = response.data.data;

        // Store access token and user data (refresh token is now in HttpOnly cookie)
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));

        return response.data;
    },

    // Login user
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        const { user, accessToken } = response.data.data;

        // Store access token and user data (refresh token is now in HttpOnly cookie)
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));

        return response.data;
    },

    // Logout user
    logout: async (): Promise<void> => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            // Even if logout fails on server, clear local storage
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            // Note: HttpOnly refresh token cookie is cleared by server
        }
    },

    // Get current user
    getCurrentUser: async (): Promise<{ success: boolean; data: { user: User } }> => {
        const response = await api.get<{ success: boolean; data: { user: User } }>('/auth/me');
        return response.data;
    },

    // Refresh token (now uses HttpOnly cookie)
    refreshToken: async (): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/refresh');

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        // Note: New refresh token is automatically set as HttpOnly cookie by server

        return response.data;
    },

    // Verify email
    verifyEmail: async (token: string): Promise<any> => {
        const response = await api.post('/auth/verify-email', { token });
        return response.data;
    },

    // Forgot password
    forgotPassword: async (email: string): Promise<any> => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    // Reset password
    resetPassword: async (token: string, password: string): Promise<any> => {
        const response = await api.post('/auth/reset-password', { token, password });
        return response.data;
    },

    // Change password
    changePassword: async (currentPassword: string, newPassword: string): Promise<any> => {
        const response = await api.put('/auth/change-password', {
            currentPassword,
            newPassword,
        });
        return response.data;
    },

    // Social login
    socialLogin: async (provider: string, token: string, userData: any = {}): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/social-login', {
            provider,
            token,
            ...userData, // Include referral code and other data
        });
        const { user, accessToken } = response.data.data;

        // Store access token and user data (refresh token is now in HttpOnly cookie)
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));

        return response.data;
    },

    // Check if user is authenticated
    isAuthenticated: (): boolean => {
        const token = localStorage.getItem('accessToken');
        const user = localStorage.getItem('user');
        return !!(token && user);
    },

    // Get stored user data
    getStoredUser: (): User | null => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Clear stored data
    clearStoredData: (): void => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        // Note: HttpOnly refresh token cookie should be cleared by server logout
    },
};
