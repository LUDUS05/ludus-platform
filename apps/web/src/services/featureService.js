import api from './api';

class FeatureService {
  constructor() {
    this.settings = null;
    this.lastFetch = null;
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async getSettings() {
    const now = Date.now();
    
    // Return cached settings if still valid
    if (this.settings && this.lastFetch && (now - this.lastFetch) < this.cacheTimeout) {
      return this.settings;
    }

    try {
      const response = await api.get('/admin/settings');
      this.settings = response.data;
      this.lastFetch = now;
      return this.settings;
    } catch (error) {
      console.error('Failed to fetch site settings:', error);
      // Return default settings if fetch fails
      return {
        featureControls: {
          bookingEnabled: true,
          walletEnabled: true,
          reviewsEnabled: true,
          notificationsEnabled: true
        }
      };
    }
  }

  async isFeatureEnabled(featureName) {
    const settings = await this.getSettings();
    return settings.featureControls?.[featureName] !== false;
  }

  async isBookingEnabled() {
    return this.isFeatureEnabled('bookingEnabled');
  }

  async isWalletEnabled() {
    return this.isFeatureEnabled('walletEnabled');
  }

  async isReviewsEnabled() {
    return this.isFeatureEnabled('reviewsEnabled');
  }

  async isNotificationsEnabled() {
    return this.isFeatureEnabled('notificationsEnabled');
  }

  // Clear cache (useful when settings are updated)
  clearCache() {
    this.settings = null;
    this.lastFetch = null;
  }
}

const featureService = new FeatureService();
export default featureService;
