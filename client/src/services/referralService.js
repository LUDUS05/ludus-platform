import api from './api';

class ReferralService {
  constructor() {
    this.baseUrl = '/referrals';
  }

  // Generate unique referral code for user
  async generateReferralCode() {
    try {
      const response = await api.post(`${this.baseUrl}/generate-code`);
      return response.data;
    } catch (error) {
      // Log the entire error object for more details
      console.error('Error generating referral code:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to generate referral code');
    }
  }

  // Process referral during user registration
  async processReferralRegistration(referralCode, newUserId, metadata = {}) {
    try {
      const response = await api.post(`${this.baseUrl}/process-registration`, {
        referralCode,
        newUserId,
        source: metadata.source || 'direct-link',
        platform: metadata.platform || 'unknown',
        userAgent: metadata.userAgent || navigator.userAgent,
        ipAddress: metadata.ipAddress || ''
      });
      return response.data;
    } catch (error) {
      console.error('Error processing referral registration:', error);
      throw new Error(error.response?.data?.message || 'Failed to process referral');
    }
  }

  // Process referral reward for first booking
  async processReferralBooking(userId) {
    try {
      const response = await api.post(`${this.baseUrl}/process-booking`, { userId });
      return response.data;
    } catch (error) {
      console.error('Error processing referral booking:', error);
      throw new Error(error.response?.data?.message || 'Failed to process referral booking');
    }
  }

  // Get referral statistics for user
  async getReferralStats(userId) {
    try {
      const response = await api.get(`${this.baseUrl}/stats/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting referral stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to get referral statistics');
    }
  }

  // Get referral history for user
  async getReferralHistory(userId, page = 1, limit = 10) {
    try {
      const response = await api.get(`${this.baseUrl}/history/${userId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting referral history:', error);
      throw new Error(error.response?.data?.message || 'Failed to get referral history');
    }
  }

  // Generate QR code for referral link
  generateQRCode(referralCode, size = 200) {
    const envUrl = process.env.REACT_APP_API_URL || 'https://ludus-backend-athena.onrender.com';
    const baseUrl = envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
    return `${baseUrl}/qr/${referralCode}?size=${size}&format=png`;
  }

  // Generate QR code as data URL (for better CORS compatibility)
  async generateQRCodeDataURL(referralCode, size = 200) {
    try {
      const envUrl = process.env.REACT_APP_API_URL || 'https://ludus-backend-athena.onrender.com';
      const baseUrl = envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
      const response = await fetch(`${baseUrl}/qr/${referralCode}?size=${size}&format=png`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error generating QR code data URL:', error);
      // Fallback to direct URL
      return this.generateQRCode(referralCode, size);
    }
  }

  // Generate referral link
  generateReferralLink(referralCode) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/register?ref=${referralCode}`;
  }

  // Share referral link on social platforms
  async shareReferralLink(referralCode, platform, activityTitle = '') {
    const referralLink = this.generateReferralLink(referralCode);
    const shareText = activityTitle 
      ? `Check out this amazing activity: ${activityTitle}`
      : 'Join me on Ludus and discover amazing activities!';
    
    let shareUrl = '';
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + referralLink)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent('Join me on Ludus!')}&body=${encodeURIComponent(shareText + '\n\n' + referralLink)}`;
        break;
      case 'sms':
        shareUrl = `sms:?body=${encodeURIComponent(shareText + ' ' + referralLink)}`;
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(referralLink);
          return { success: true, message: 'Referral link copied to clipboard!' };
        } catch (err) {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = referralLink;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          return { success: true, message: 'Referral link copied to clipboard!' };
        }
      default:
        throw new Error('Unsupported platform');
    }
    
    if (shareUrl && platform !== 'copy') {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      return { success: true, message: `Shared on ${platform}!` };
    }
    
    return { success: true, message: 'Link shared successfully!' };
  }

  // Download QR code
  downloadQRCode(referralCode, filename = 'referral-qr-code.png') {
    const envUrl = process.env.REACT_APP_API_URL || 'https://ludus-backend-athena.onrender.com';
    const baseUrl = envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
    const downloadUrl = `${baseUrl}/qr/${referralCode}/download?size=300&format=png`;
    
    // Create a temporary link to download the QR code
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Validate referral code format
  validateReferralCode(code) {
    // Referral codes are now 8-character hex strings
    return /^[A-F0-9]{8}$/.test(code);
  }

  // Get referral analytics for admin
  async getReferralAnalytics(period = '30d') {
    try {
      const response = await api.get('/admin/referrals/analytics', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting referral analytics:', error);
      throw new Error(error.response?.data?.message || 'Failed to get referral analytics');
    }
  }

  // Get top inviters for admin
  async getTopInviters(limit = 10) {
    try {
      const response = await api.get('/admin/referrals/top-inviters', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting top inviters:', error);
      throw new Error(error.response?.data?.message || 'Failed to get top inviters');
    }
  }

  // Update referral rewards (admin only)
  async updateReferralRewards(rewards) {
    try {
      const response = await api.put('/admin/referrals/rewards', rewards);
      return response.data;
    } catch (error) {
      console.error('Error updating referral rewards:', error);
      throw new Error(error.response?.data?.message || 'Failed to update referral rewards');
    }
  }

  // Export referral data (admin only)
  async exportReferralData(format = 'csv', period = 'all') {
    try {
      const response = await api.get('/admin/referrals/export', {
        params: { format, period },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `referral-data-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Data exported successfully!' };
    } catch (error) {
      console.error('Error exporting referral data:', error);
      throw new Error(error.response?.data?.message || 'Failed to export referral data');
    }
  }

  // Track referral click (for analytics)
  async trackReferralClick(referralCode, source = 'unknown', platform = 'unknown') {
    try {
      // This could be sent to an analytics endpoint
      console.log('Referral click tracked:', { referralCode, source, platform, timestamp: new Date() });
      
      // In the future, this could send data to analytics service
      // await api.post('/analytics/referral-click', { referralCode, source, platform });
      
      return { success: true };
    } catch (error) {
      console.error('Error tracking referral click:', error);
      // Don't throw error for analytics tracking
      return { success: false };
    }
  }

  // Create invitation for tracking
  async createInvitation(invitationData) {
    try {
      const response = await api.post('/invitations', invitationData);
      return response.data;
    } catch (error) {
      console.error('Error creating invitation:', error);
      throw new Error(error.response?.data?.message || 'Failed to create invitation');
    }
  }

  // Track invitation click
  async trackInvitationClick(invitationId, metadata = {}) {
    try {
      const response = await api.post(`/invitations/${invitationId}/click`, metadata);
      return response.data;
    } catch (error) {
      console.error('Error tracking invitation click:', error);
      throw new Error(error.response?.data?.message || 'Failed to track invitation click');
    }
  }

  // Get invitation statistics
  async getInvitationStats(period = '30d') {
    try {
      const response = await api.get('/invitations/stats', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting invitation stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to get invitation statistics');
    }
  }

  // Get invitation history
  async getInvitationHistory(page = 1, limit = 10, filters = {}) {
    try {
      const response = await api.get('/invitations/history', {
        params: { page, limit, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting invitation history:', error);
      throw new Error(error.response?.data?.message || 'Failed to get invitation history');
    }
  }

  // Get invitation analytics
  async getInvitationAnalytics(period = '30d') {
    try {
      const response = await api.get('/invitations/analytics', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting invitation analytics:', error);
      throw new Error(error.response?.data?.message || 'Failed to get invitation analytics');
    }
  }

  // Get referral rewards configuration
  async getReferralRewards() {
    try {
      const response = await api.get('/admin/referrals/rewards');
      return response.data;
    } catch (error) {
      console.error('Error getting referral rewards:', error);
      throw new Error(error.response?.data?.message || 'Failed to get referral rewards');
    }
  }

  // ===== ANALYTICS METHODS =====

  // Get comprehensive referral analytics
  async getReferralAnalytics(period = '30d', filters = {}) {
    try {
      const response = await api.get('/analytics/referrals', {
        params: { period, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching referral analytics:', error);
      throw new Error(error.response?.data?.message || 'Failed to get referral analytics');
    }
  }

  // Get referral funnel analysis
  async getReferralFunnel(period = '30d', referrerId = null) {
    try {
      const response = await api.get('/analytics/funnel', {
        params: { period, referrerId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching referral funnel:', error);
      throw new Error(error.response?.data?.message || 'Failed to get referral funnel');
    }
  }

  // Get geographic analytics
  async getGeographicAnalytics(period = '30d', referrerId = null) {
    try {
      const response = await api.get('/analytics/geographic', {
        params: { period, referrerId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching geographic analytics:', error);
      throw new Error(error.response?.data?.message || 'Failed to get geographic analytics');
    }
  }

  // Get source performance analytics
  async getSourcePerformance(period = '30d', referrerId = null) {
    try {
      const response = await api.get('/analytics/sources', {
        params: { period, referrerId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching source performance:', error);
      throw new Error(error.response?.data?.message || 'Failed to get source performance');
    }
  }

  // Get ROI analytics
  async getROIAnalytics(period = '30d', referrerId = null) {
    try {
      const response = await api.get('/analytics/roi', {
        params: { period, referrerId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching ROI analytics:', error);
      throw new Error(error.response?.data?.message || 'Failed to get ROI analytics');
    }
  }

  // ===== REPORTING METHODS =====

  // Get available report templates
  async getReportTemplates() {
    try {
      const response = await api.get('/reports/templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching report templates:', error);
      throw new Error(error.response?.data?.message || 'Failed to get report templates');
    }
  }

  // Generate referral report
  async generateReferralReport(reportConfig) {
    try {
      const response = await api.post('/reports/generate', reportConfig);
      return response.data;
    } catch (error) {
      console.error('Error generating referral report:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate referral report');
    }
  }

  // Export referral data
  async exportReferralData(exportConfig) {
    try {
      const response = await api.post('/reports/export', exportConfig, {
        responseType: exportConfig.format === 'json' ? 'json' : 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting referral data:', error);
      throw new Error(error.response?.data?.message || 'Failed to export referral data');
    }
  }
}

export default new ReferralService();
