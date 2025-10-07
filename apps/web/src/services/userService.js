import api from './api';

const userService = {
  // Get user profile
  getUserProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update user profile
  updateUserProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  // Get user bookings
  getUserBookings: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/users/bookings?${queryParams}`);
    return response.data;
  },

  // Get user favorites
  getUserFavorites: async () => {
    const response = await api.get('/users/favorites');
    return response.data;
  },

  // Add activity to favorites
  addToFavorites: async (activityId) => {
    const response = await api.post(`/users/favorites/${activityId}`);
    return response.data;
  },

  // Remove activity from favorites
  removeFromFavorites: async (activityId) => {
    const response = await api.delete(`/users/favorites/${activityId}`);
    return response.data;
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get('/users/dashboard-stats');
    return response.data;
  }
};

export { userService };