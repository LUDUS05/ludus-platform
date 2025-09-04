import api from './api';

export const siteSettingsService = {
  // Get site settings
  getSettings: async () => {
    const response = await api.get('/site-settings');
    return response.data;
  },

  // Update site settings (Admin only)
  updateSettings: async (settings) => {
    const response = await api.put('/site-settings', settings);
    return response.data;
  },

  // Toggle coming soon mode
  toggleComingSoon: async () => {
    const response = await api.post('/site-settings/toggle-coming-soon');
    return response.data;
  },

  // Toggle maintenance mode
  toggleMaintenance: async () => {
    const response = await api.post('/site-settings/toggle-maintenance');
    return response.data;
  }
};
