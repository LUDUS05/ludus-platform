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
  }
};

export { paymentService };