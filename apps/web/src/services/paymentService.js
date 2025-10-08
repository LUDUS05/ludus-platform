import api from './api';

const paymentService = {
  // Create a new payment
  createPayment: async (paymentData) => {
    const response = await api.post('/payments/create-payment', paymentData);
    return response.data;
  },

  // Confirm payment status
  confirmPayment: async (paymentId) => {
    const response = await api.post(`/payments/confirm-payment/${paymentId}`);
    return response.data;
  },

  // Get payment status
  getPaymentStatus: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}/status`);
    return response.data;
  },

  // Process refund
  processRefund: async (bookingId, refundData) => {
    const response = await api.post(`/payments/refund/${bookingId}`, refundData);
    return response.data;
  },

  // Save payment method
  savePaymentMethod: async (paymentMethodData) => {
    const response = await api.post('/payments/save-method', paymentMethodData);
    return response.data;
  },

  // Get user's saved payment methods
  getUserPaymentMethods: async () => {
    const response = await api.get('/payments/methods');
    return response.data;
  },

  // Moyasar SDK initialization
  initializeMoyasar: () => {
    const script = document.createElement('script');
    script.src = 'https://cdn.moyasar.com/mpf/1.5.3/moyasar.js';
    script.async = true;
    document.head.appendChild(script);
    
    return new Promise((resolve, reject) => {
      script.onload = () => {
        if (window.Moyasar) {
          window.Moyasar.init({
            element: '.moyasar-form',
            amount: 0, // Will be set dynamically
            currency: 'SAR',
            description: 'LUDUS Activity Booking',
            publishable_api_key: process.env.REACT_APP_MOYASAR_PUBLISHABLE_KEY,
            callback_url: `${window.location.origin}/payment/callback`,
            methods: ['creditcard', 'applepay', 'stcpay', 'aman'],
            on_initiating: () => {
              console.log('Payment initiated');
            },
            on_completed: (payment) => {
              console.log('Payment completed:', payment);
            },
            on_error: (error) => {
              console.error('Payment error:', error);
            }
          });
          resolve(window.Moyasar);
        } else {
          reject(new Error('Moyasar SDK failed to load'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load Moyasar SDK'));
    });
  },

  // Create Moyasar payment form
  createPaymentForm: (containerId, options = {}) => {
    if (!window.Moyasar) {
      throw new Error('Moyasar SDK not loaded. Call initializeMoyasar() first.');
    }

    const defaultOptions = {
      element: `#${containerId}`,
      amount: options.amount || 0,
      currency: 'SAR',
      description: options.description || 'LUDUS Activity Booking',
      publishable_api_key: process.env.REACT_APP_MOYASAR_PUBLISHABLE_KEY,
      callback_url: options.callbackUrl || `${window.location.origin}/payment/callback`,
      methods: options.methods || ['creditcard', 'applepay', 'stcpay', 'aman'],
      metadata: options.metadata || {},
      on_initiating: options.onInitiating || (() => {}),
      on_completed: options.onCompleted || (() => {}),
      on_error: options.onError || (() => {})
    };

    return window.Moyasar.init(defaultOptions);
  },

  // Validate card data
  validateCardData: (cardData) => {
    const errors = {};

    if (!cardData.number || cardData.number.length < 16) {
      errors.number = 'Card number must be at least 16 digits';
    }

    if (!cardData.name || cardData.name.trim().length < 2) {
      errors.name = 'Cardholder name is required';
    }

    if (!cardData.month || cardData.month < 1 || cardData.month > 12) {
      errors.month = 'Valid expiry month is required';
    }

    if (!cardData.year || cardData.year < new Date().getFullYear()) {
      errors.year = 'Valid expiry year is required';
    }

    if (!cardData.cvc || cardData.cvc.length < 3) {
      errors.cvc = 'Valid CVC is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Format card number for display
  formatCardNumber: (number) => {
    const cleaned = number.replace(/\D/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted;
  },

  // Get card type from number
  getCardType: (number) => {
    const cleaned = number.replace(/\D/g, '');
    
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6/.test(cleaned)) return 'discover';
    if (/^9/.test(cleaned)) return 'mada'; // Saudi MADA cards
    
    return 'unknown';
  },

  // Format currency for Saudi Riyals
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2
    }).format(amount);
  },

  // Convert SAR to halalas (Moyasar uses halalas)
  toHalalas: (amount) => {
    return Math.round(amount * 100);
  },

  // Convert halalas to SAR
  fromHalalas: (halalas) => {
    return halalas / 100;
  },

  // Get payment history
  getPaymentHistory: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/payments/history?${queryParams}`);
    return response.data;
  },

  // Get payment analytics
  getPaymentAnalytics: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/payments/analytics?${queryParams}`);
    return response.data;
  },

  // Get payment methods configuration
  getPaymentMethodsConfig: async () => {
    const response = await api.get('/payments/config');
    return response.data;
  },

  // Delete payment method
  deletePaymentMethod: async (methodId) => {
    const response = await api.delete(`/payments/methods/${methodId}`);
    return response.data;
  },

  // Set default payment method
  setDefaultPaymentMethod: async (methodId) => {
    const response = await api.put(`/payments/methods/${methodId}/default`);
    return response.data;
  },

  // Enhanced card validation
  validateCardDataEnhanced: (cardData) => {
    const errors = {};

    // Card number validation
    if (!cardData.number || cardData.number.length < 16) {
      errors.number = 'Card number must be at least 16 digits';
    } else {
      // Luhn algorithm validation
      if (!paymentService.validateLuhn(cardData.number)) {
        errors.number = 'Invalid card number';
      }
    }

    // Cardholder name validation
    if (!cardData.name || cardData.name.trim().length < 2) {
      errors.name = 'Cardholder name is required';
    } else if (cardData.name.trim().length > 100) {
      errors.name = 'Cardholder name is too long';
    }

    // Expiry month validation
    if (!cardData.month || cardData.month < 1 || cardData.month > 12) {
      errors.month = 'Valid expiry month is required';
    }

    // Expiry year validation
    const currentYear = new Date().getFullYear();
    if (!cardData.year || cardData.year < currentYear) {
      errors.year = 'Valid expiry year is required';
    } else if (cardData.year > currentYear + 20) {
      errors.year = 'Expiry year is too far in the future';
    }

    // CVC validation
    if (!cardData.cvc || cardData.cvc.length < 3) {
      errors.cvc = 'Valid CVC is required';
    } else if (cardData.cvc.length > 4) {
      errors.cvc = 'CVC is too long';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Luhn algorithm validation
  validateLuhn: (cardNumber) => {
    const cleaned = cardNumber.replace(/\D/g, '');
    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i));

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  },

  // Get card issuer information
  getCardIssuer: (cardNumber) => {
    const cleaned = cardNumber.replace(/\D/g, '');
    
    // Visa
    if (/^4/.test(cleaned)) {
      return {
        type: 'visa',
        name: 'Visa',
        icon: '💳',
        color: '#1A1F71'
      };
    }
    
    // Mastercard
    if (/^5[1-5]/.test(cleaned)) {
      return {
        type: 'mastercard',
        name: 'Mastercard',
        icon: '💳',
        color: '#EB001B'
      };
    }
    
    // American Express
    if (/^3[47]/.test(cleaned)) {
      return {
        type: 'amex',
        name: 'American Express',
        icon: '💳',
        color: '#006FCF'
      };
    }
    
    // MADA (Saudi)
    if (/^9/.test(cleaned)) {
      return {
        type: 'mada',
        name: 'MADA',
        icon: '🏦',
        color: '#00A651'
      };
    }
    
    return {
      type: 'unknown',
      name: 'Unknown',
      icon: '💳',
      color: '#6B7280'
    };
  },

  // Format card number with spaces
  formatCardNumberWithSpaces: (number) => {
    const cleaned = number.replace(/\D/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted;
  },

  // Mask card number for display
  maskCardNumber: (number, visibleDigits = 4) => {
    const cleaned = number.replace(/\D/g, '');
    const lastDigits = cleaned.slice(-visibleDigits);
    const masked = '*'.repeat(cleaned.length - visibleDigits);
    return masked + lastDigits;
  },

  // Calculate payment fees
  calculateFees: (amount, method = 'credit_card') => {
    const feeRates = {
      credit_card: 0.029, // 2.9%
      mada: 0.015, // 1.5%
      apple_pay: 0.029, // 2.9%
      stc_pay: 0.02, // 2%
      sadad: 0.01 // 1%
    };

    const rate = feeRates[method] || 0.029;
    const fee = amount * rate;
    const netAmount = amount - fee;

    return {
      amount,
      fee: Math.round(fee * 100) / 100,
      netAmount: Math.round(netAmount * 100) / 100,
      rate: rate * 100
    };
  },

  // Get payment status color
  getPaymentStatusColor: (status) => {
    const colors = {
      pending: '#F59E0B',
      processing: '#3B82F6',
      completed: '#10B981',
      failed: '#EF4444',
      cancelled: '#6B7280',
      refunded: '#8B5CF6'
    };
    return colors[status] || '#6B7280';
  },

  // Get payment status text
  getPaymentStatusText: (status) => {
    const texts = {
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed',
      cancelled: 'Cancelled',
      refunded: 'Refunded'
    };
    return texts[status] || 'Unknown';
  }
};

export { paymentService };