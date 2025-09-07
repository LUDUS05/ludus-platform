import api from './api';

class OnboardingService {
  /**
   * Get onboarding configuration
   */
  async getConfig() {
    try {
      const response = await api.get('/onboarding/config');
      return response.data;
    } catch (error) {
      console.error('Error fetching onboarding config:', error);
      throw error;
    }
  }

  /**
   * Complete an onboarding step
   */
  async completeStep(stepId, stepData) {
    try {
      const response = await api.post('/onboarding/complete-step', {
        stepId,
        stepData
      });
      return response.data;
    } catch (error) {
      console.error('Error completing onboarding step:', error);
      throw error;
    }
  }

  /**
   * Complete entire onboarding
   */
  async completeOnboarding(finalData = null) {
    try {
      const response = await api.post('/onboarding/complete', {
        finalData
      });
      return response.data;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }

  /**
   * Get user onboarding progress
   */
  async getProgress() {
    try {
      const response = await api.get('/onboarding/progress');
      return response.data;
    } catch (error) {
      console.error('Error fetching onboarding progress:', error);
      throw error;
    }
  }

  /**
   * Get onboarding leaderboard
   */
  async getLeaderboard(limit = 10) {
    try {
      const response = await api.get(`/onboarding/leaderboard`, { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Error fetching onboarding leaderboard:', error);
      throw error;
    }
  }

  /**
   * Admin: Get full onboarding configuration
   */
  async getFullConfig() {
    try {
      const response = await api.get('/onboarding/admin/config');
      return response.data;
    } catch (error) {
      console.error('Error fetching full onboarding config:', error);
      throw error;
    }
  }

  /**
   * Admin: Update onboarding configuration
   */
  async updateConfig(config) {
    try {
      const response = await api.put('/onboarding/admin/config', config);
      return response.data;
    } catch (error) {
      console.error('Error updating onboarding config:', error);
      throw error;
    }
  }

  /**
   * Admin: Toggle onboarding system
   */
  async toggleOnboarding() {
    try {
      const response = await api.post('/onboarding/admin/toggle');
      return response.data;
    } catch (error) {
      console.error('Error toggling onboarding:', error);
      throw error;
    }
  }

  /**
   * Admin: Reset user onboarding
   */
  async resetUserOnboarding(userId) {
    try {
      const response = await api.post(`/onboarding/admin/reset-user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error resetting user onboarding:', error);
      throw error;
    }
  }

  /**
   * Get categories for interests step
   */
  async getCategories() {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Generate referral code
   */
  async generateReferralCode() {
    try {
      const response = await api.post('/referrals/generate');
      return response.data;
    } catch (error) {
      console.error('Error generating referral code:', error);
      throw error;
    }
  }

  /**
   * Validate form data based on field configuration
   */
  validateField(fieldId, value, validation = {}) {
    const errors = [];

    // Required validation
    if (validation.required && (!value || value.trim() === '')) {
      errors.push('required');
      return errors;
    }

    // Email validation
    if (fieldId === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push('invalidEmail');
      }
    }

    // Phone validation (KSA format)
    if (fieldId === 'phone' && value) {
      const phoneRegex = /^\+966[0-9]{9}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        errors.push('invalidPhone');
      }
    }

    // Min length validation
    if (validation.minLength && value && value.length < validation.minLength) {
      errors.push('minLength');
    }

    // Max length validation
    if (validation.maxLength && value && value.length > validation.maxLength) {
      errors.push('maxLength');
    }

    return errors;
  }

  /**
   * Format phone number for KSA
   */
  formatPhoneNumber(value) {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // If starts with 966, keep it
    if (digits.startsWith('966')) {
      return `+${digits}`;
    }
    
    // If starts with 0, replace with +966
    if (digits.startsWith('0')) {
      return `+966${digits.substring(1)}`;
    }
    
    // If 9 digits, add +966
    if (digits.length === 9) {
      return `+966${digits}`;
    }
    
    return value;
  }

  /**
   * Generate QR code data URL for referral
   */
  generateQRCodeData(referralCode) {
    const qrData = {
      type: 'referral',
      code: referralCode,
      url: `${window.location.origin}/register?ref=${referralCode}`
    };
    
    // This would typically use a QR code library like qrcode.js
    // For now, return a placeholder
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="12">
          QR Code for ${referralCode}
        </text>
      </svg>
    `)}`;
  }

  /**
   * Share referral via different platforms
   */
  shareReferral(platform, referralCode, userName = '') {
    const referralUrl = `${window.location.origin}/register?ref=${referralCode}`;
    const message = `Join me on LUDUS! Use my referral code: ${referralCode} - ${referralUrl}`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing, copy to clipboard
        this.copyToClipboard(referralUrl);
        break;
      case 'copy':
        this.copyToClipboard(referralUrl);
        break;
      default:
        console.warn('Unknown sharing platform:', platform);
    }
  }

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  }
}

export default new OnboardingService();
