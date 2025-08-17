import api from './api';

export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { user, accessToken } = response.data.data;
    
    // Store access token and user data (refresh token is now in HttpOnly cookie)
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { user, accessToken } = response.data.data;
    
    // Store access token and user data (refresh token is now in HttpOnly cookie)
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  // Logout user
  logout: async () => {
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
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Refresh token (now uses HttpOnly cookie)
  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    
    const { accessToken } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    // Note: New refresh token is automatically set as HttpOnly cookie by server
    
    return response.data;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, password) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Social login
  socialLogin: async (provider, token) => {
    const response = await api.post('/auth/social-login', {
      provider,
      token,
    });
    const { user, accessToken } = response.data.data;
    
    // Store access token and user data (refresh token is now in HttpOnly cookie)
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Get stored user data
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Clear stored data
  clearStoredData: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    // Note: HttpOnly refresh token cookie should be cleared by server logout
  },
};