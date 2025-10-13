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

  // DISABLED: Lockdown system functions
  toggleComingSoon: async () => {
    throw new Error('Coming soon mode is disabled');
  },

  toggleMaintenance: async () => {
    throw new Error('Maintenance mode is disabled');
  }
};
