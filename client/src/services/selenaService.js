/**
 * @fileoverview Service for integrating with Selena-Onboard AI agent.
 * 
 * Purpose: Provides a comprehensive service layer for interacting with the
 * Selena-Onboard AI agent, handling session management, conversation flow,
 * and error handling with proper Arabic/English support.
 * 
 * Business Context: This service enables the LUDUS frontend to seamlessly
 * integrate with the Selena-Onboard agent, providing personalized onboarding
 * assistance that improves user experience and reduces support burden.
 * 
 * @version 1.0.0
 * @since 2025-09-28
 * @author LUDUS Development Team - Selena-Onboard Implementation
 */

import apiClient from './apiClient';

class SelenaService {
  constructor() {
    this.baseURL = '/api/selena';
    this.sessionId = null;
    this.isConnected = false;
  }

  /**
   * Start a new onboarding session with Selena
   * @param {Object} options - Session configuration
   * @param {string} options.language - Language preference ('ar' or 'en')
   * @param {string} options.cultural_context - Cultural context ('saudi' or 'international')
   * @param {string} options.user_id - Optional user ID for authenticated sessions
   * @returns {Promise<Object>} Session data including session_id and welcome message
   */
  async startSession({ language = 'ar', cultural_context = 'saudi', user_id = null } = {}) {
    try {
      const response = await apiClient.post(`${this.baseURL}/start-session`, {
        language,
        cultural_context,
        user_id
      });

      if (response.data.success) {
        this.sessionId = response.data.session.session_id;
        this.isConnected = true;
        
        return {
          success: true,
          session: response.data.session,
          analytics: response.data.analytics
        };
      } else {
        throw new Error(response.data.message || 'Failed to start Selena session');
      }
    } catch (error) {
      console.error('Error starting Selena session:', error);
      this.isConnected = false;
      
      return {
        success: false,
        error: error.message,
        fallback: true
      };
    }
  }

  /**
   * Get registration assistance from Selena
   * @param {string} message - User's message/question
   * @param {string} language - Language preference
   * @param {string} sessionId - Optional session ID (uses current session if not provided)
   * @returns {Promise<Object>} Selena's response with guidance and suggestions
   */
  async getRegistrationHelp(message, language = 'ar', sessionId = null) {
    try {
      const response = await apiClient.post(`${this.baseURL}/registration-help`, {
        message,
        session_id: sessionId || this.sessionId,
        language
      });

      if (response.data.success) {
        return {
          success: true,
          response: response.data.response
        };
      } else {
        throw new Error(response.data.message || 'Failed to get registration help');
      }
    } catch (error) {
      console.error('Error getting registration help:', error);
      
      return {
        success: false,
        error: error.message,
        fallback: {
          message: language === 'ar' 
            ? 'أعتذر، لا أستطيع تقديم المساعدة في التسجيل حالياً. يمكنك المتابعة يدوياً أو المحاولة لاحقاً.'
            : 'Sorry, I can\'t provide registration help right now. You can continue manually or try later.',
          suggestions: language === 'ar' 
            ? ['متابعة التسجيل يدوياً', 'المحاولة مرة أخرى']
            : ['Continue registration manually', 'Try again']
        }
      };
    }
  }

  /**
   * Get profile setup assistance from Selena
   * @param {string} message - User's message/question about profile setup
   * @param {string} language - Language preference
   * @param {string} sessionId - Optional session ID
   * @returns {Promise<Object>} Selena's response with profile guidance
   */
  async getProfileSetupHelp(message, language = 'ar', sessionId = null) {
    try {
      const response = await apiClient.post(`${this.baseURL}/profile-setup`, {
        message,
        session_id: sessionId || this.sessionId,
        language
      });

      if (response.data.success) {
        return {
          success: true,
          response: response.data.response
        };
      } else {
        throw new Error(response.data.message || 'Failed to get profile setup help');
      }
    } catch (error) {
      console.error('Error getting profile setup help:', error);
      
      return {
        success: false,
        error: error.message,
        fallback: {
          message: language === 'ar' 
            ? 'أعتذر، لا أستطيع تقديم المساعدة في إعداد الملف الشخصي حالياً. يمكنك ملء المعلومات يدوياً.'
            : 'Sorry, I can\'t help with profile setup right now. You can fill out the information manually.',
          suggestions: language === 'ar' 
            ? ['إعداد الملف يدوياً', 'المحاولة لاحقاً']
            : ['Set up profile manually', 'Try later']
        }
      };
    }
  }

  /**
   * Get platform feature tour from Selena
   * @param {string} message - User's request for feature information
   * @param {string} language - Language preference
   * @param {string} sessionId - Optional session ID
   * @returns {Promise<Object>} Selena's response with platform overview
   */
  async getFeatureTour(message, language = 'ar', sessionId = null) {
    try {
      const response = await apiClient.post(`${this.baseURL}/feature-tour`, {
        message,
        session_id: sessionId || this.sessionId,
        language
      });

      if (response.data.success) {
        return {
          success: true,
          response: response.data.response
        };
      } else {
        throw new Error(response.data.message || 'Failed to get feature tour');
      }
    } catch (error) {
      console.error('Error getting feature tour:', error);
      
      return {
        success: false,
        error: error.message,
        fallback: {
          message: language === 'ar' 
            ? 'أعتذر، لا أستطيع تقديم الجولة حالياً. يمكنك استكشاف المنصة بنفسك أو زيارة صفحة "كيف تعمل المنصة".'
            : 'Sorry, I can\'t provide the tour right now. You can explore the platform yourself or visit the "How it Works" page.',
          suggestions: language === 'ar' 
            ? ['استكشاف المنصة', 'زيارة صفحة المساعدة']
            : ['Explore platform', 'Visit help page']
        }
      };
    }
  }

  /**
   * Get cultural guidance from Selena
   * @param {string} message - User's question about Saudi culture/activities
   * @param {string} language - Language preference
   * @param {string} sessionId - Optional session ID
   * @returns {Promise<Object>} Selena's response with cultural insights
   */
  async getCulturalGuidance(message, language = 'ar', sessionId = null) {
    try {
      const response = await apiClient.post(`${this.baseURL}/cultural-guidance`, {
        message,
        session_id: sessionId || this.sessionId,
        language
      });

      if (response.data.success) {
        return {
          success: true,
          response: response.data.response
        };
      } else {
        throw new Error(response.data.message || 'Failed to get cultural guidance');
      }
    } catch (error) {
      console.error('Error getting cultural guidance:', error);
      
      return {
        success: false,
        error: error.message,
        fallback: {
          message: language === 'ar' 
            ? 'أعتذر، لا أستطيع تقديم التوجيه الثقافي حالياً. جميع أنشطة لودوس مناسبة للثقافة السعودية.'
            : 'Sorry, I can\'t provide cultural guidance right now. All LUDUS activities are culturally appropriate for Saudi Arabia.',
          suggestions: language === 'ar' 
            ? ['استكشاف الأنشطة', 'التواصل مع الدعم']
            : ['Explore activities', 'Contact support']
        }
      };
    }
  }

  /**
   * Complete onboarding process with Selena
   * @param {Object} finalData - Final onboarding data and preferences
   * @param {string} language - Language preference
   * @param {string} sessionId - Optional session ID
   * @returns {Promise<Object>} Completion response with welcome message
   */
  async completeOnboarding(finalData = {}, language = 'ar', sessionId = null) {
    try {
      const response = await apiClient.post(`${this.baseURL}/complete-onboarding`, {
        session_id: sessionId || this.sessionId,
        final_data: finalData,
        language
      });

      if (response.data.success) {
        this.isConnected = false; // Session completed
        
        return {
          success: true,
          response: response.data.response,
          analytics: response.data.analytics
        };
      } else {
        throw new Error(response.data.message || 'Failed to complete onboarding');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      
      return {
        success: false,
        error: error.message,
        fallback: {
          message: language === 'ar' 
            ? 'تهانينا! تم إكمال الإعداد بنجاح. مرحباً بك في مجتمع لودوس!'
            : 'Congratulations! Setup completed successfully. Welcome to the LUDUS community!',
          current_step: 'completed',
          progress_percentage: 100
        }
      };
    }
  }

  /**
   * Send a general chat message to Selena
   * @param {string} message - User's message
   * @param {string} language - Language preference
   * @param {string} sessionId - Optional session ID
   * @returns {Promise<Object>} Selena's response
   */
  async sendMessage(message, language = 'ar', sessionId = null) {
    try {
      const response = await apiClient.post(`${this.baseURL}/chat`, {
        message,
        session_id: sessionId || this.sessionId,
        language
      });

      if (response.data.success) {
        return {
          success: true,
          response: response.data.response
        };
      } else {
        throw new Error(response.data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message to Selena:', error);
      
      return {
        success: false,
        error: error.message,
        fallback: {
          reply: language === 'ar' 
            ? 'أعتذر، أواجه صعوبة تقنية حالياً. كيف يمكنني مساعدتك؟'
            : 'Sorry, I\'m having technical difficulties right now. How can I help you?',
          session_id: sessionId || this.sessionId || `fallback_${Date.now()}`,
          agent_type: 'onboard'
        }
      };
    }
  }

  /**
   * Get onboarding progress for a user
   * @param {string} userId - User ID to check progress for
   * @returns {Promise<Object>} Progress data and analytics
   */
  async getProgress(userId) {
    try {
      const response = await apiClient.get(`${this.baseURL}/progress/${userId}`);

      if (response.data.success) {
        return {
          success: true,
          progress: response.data.progress
        };
      } else {
        throw new Error(response.data.message || 'Failed to get progress');
      }
    } catch (error) {
      console.error('Error getting onboarding progress:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get session details
   * @param {string} sessionId - Session ID to retrieve
   * @returns {Promise<Object>} Session details and analytics
   */
  async getSessionDetails(sessionId) {
    try {
      const response = await apiClient.get(`${this.baseURL}/session/${sessionId}`);

      if (response.data.success) {
        return {
          success: true,
          session: response.data.session
        };
      } else {
        throw new Error(response.data.message || 'Failed to get session details');
      }
    } catch (error) {
      console.error('Error getting session details:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get analytics data (admin only)
   * @param {string} timeframe - Timeframe for analytics ('7d', '30d', '90d')
   * @returns {Promise<Object>} Analytics data
   */
  async getAnalytics(timeframe = '30d') {
    try {
      const response = await apiClient.get(`${this.baseURL}/analytics?timeframe=${timeframe}`);

      if (response.data.success) {
        return {
          success: true,
          analytics: response.data.analytics
        };
      } else {
        throw new Error(response.data.message || 'Failed to get analytics');
      }
    } catch (error) {
      console.error('Error getting Selena analytics:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Reset current session
   */
  resetSession() {
    this.sessionId = null;
    this.isConnected = false;
  }

  /**
   * Check if currently connected to Selena
   * @returns {boolean} Connection status
   */
  isSessionActive() {
    return this.isConnected && this.sessionId !== null;
  }

  /**
   * Get current session ID
   * @returns {string|null} Current session ID
   */
  getCurrentSessionId() {
    return this.sessionId;
  }
}

// Create and export a singleton instance
const selenaService = new SelenaService();
export default selenaService;