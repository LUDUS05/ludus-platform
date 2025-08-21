const axios = require('axios');
const crypto = require('crypto');

class MoyasarService {
  constructor() {
    this.apiKey = process.env.MOYASAR_SECRET_KEY;
    this.baseURL = process.env.MOYASAR_BASE_URL || 'https://api.moyasar.com/v1';
    this.webhookSecret = process.env.MOYASAR_WEBHOOK_SECRET;
    
    // Enable mock mode if explicitly requested or if no API key is available
    this.mockMode = process.env.MOYASAR_MOCK === 'true' || !this.apiKey;

    if (!this.mockMode) {
      this.client = axios.create({
        baseURL: this.baseURL,
        headers: {
          'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
          'Content-Type': 'application/json'
        }
      });
    }
  }

  async createPayment(paymentData) {
    if (this.mockMode) {
      const mockId = `pay_mock_${Math.random().toString(36).slice(2, 10)}`;
      const amountHalalas = Math.round(paymentData.amount * 100);
      return {
        id: mockId,
        status: 'paid',
        amount: amountHalalas,
        currency: 'SAR',
        description: paymentData.description,
        source: {
          type: paymentData.source?.type || 'creditcard',
          company: 'MockCard',
          brand: 'Mock',
          last_four: '4242'
        },
        created_at: new Date().toISOString(),
        metadata: paymentData.metadata || {}
      };
    }

    try {
      const payload = {
        amount: Math.round(paymentData.amount * 100), // Convert SAR to halalas
        currency: 'SAR',
        description: paymentData.description,
        callback_url: paymentData.callbackUrl,
        source: paymentData.source,
        metadata: {
          booking_id: paymentData.bookingId,
          user_id: paymentData.userId,
          activity_id: paymentData.activityId,
          ...paymentData.metadata
        }
      };

      const response = await this.client.post('/payments', payload);
      return response.data;
    } catch (error) {
      throw new Error(`Moyasar payment creation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async retrievePayment(paymentId) {
    if (this.mockMode) {
      return {
        id: paymentId,
        status: 'paid',
        amount: 100,
        currency: 'SAR',
        description: 'Mock payment',
        created_at: new Date().toISOString()
      };
    }

    try {
      const response = await this.client.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Moyasar payment retrieval failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async refundPayment(paymentId, refundData) {
    if (this.mockMode) {
      const mockRefundId = `refund_mock_${Math.random().toString(36).slice(2, 10)}`;
      return {
        id: mockRefundId,
        status: 'refunded',
        amount: Math.round(refundData.amount * 100),
        currency: 'SAR',
        description: refundData.reason || 'Booking cancellation refund'
      };
    }

    try {
      const payload = {
        amount: Math.round(refundData.amount * 100), // Convert SAR to halalas
        description: refundData.reason || 'Booking cancellation refund'
      };

      const response = await this.client.post(`/payments/${paymentId}/refund`, payload);
      return response.data;
    } catch (error) {
      throw new Error(`Moyasar refund failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async createInvoice(invoiceData) {
    if (this.mockMode) {
      const mockInvoiceId = `inv_mock_${Math.random().toString(36).slice(2, 10)}`;
      return {
        id: mockInvoiceId,
        amount: Math.round(invoiceData.amount * 100),
        currency: 'SAR',
        description: invoiceData.description,
        status: 'paid',
        created_at: new Date().toISOString(),
        metadata: invoiceData.metadata || {}
      };
    }

    try {
      const payload = {
        amount: Math.round(invoiceData.amount * 100), // Convert SAR to halalas
        currency: 'SAR',
        description: invoiceData.description,
        callback_url: invoiceData.callbackUrl,
        metadata: invoiceData.metadata
      };

      const response = await this.client.post('/invoices', payload);
      return response.data;
    } catch (error) {
      throw new Error(`Moyasar invoice creation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  verifyWebhookSignature(payload, signature) {
    if (!this.webhookSecret) {
      if (this.mockMode) {
        // In mock mode, accept all webhooks
        return true;
      }
      console.warn('Moyasar webhook secret not configured');
      return false;
    }

    try {
      const computedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload, 'utf8')
        .digest('hex');
      
      return signature === computedSignature;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }

  async tokenizeCard(cardData) {
    if (this.mockMode) {
      return {
        id: `tok_mock_${Math.random().toString(36).slice(2, 10)}`,
        last_four: (cardData.number || '0000').slice(-4),
        brand: 'MockCard'
      };
    }

    try {
      const payload = {
        name: cardData.name,
        number: cardData.number,
        cvc: cardData.cvc,
        month: cardData.month,
        year: cardData.year
      };

      const response = await this.client.post('/tokens', payload);
      return response.data;
    } catch (error) {
      throw new Error(`Card tokenization failed: ${error.response?.data?.message || error.message}`);
    }
  }

  validatePaymentMethod(method) {
    const validMethods = ['creditcard', 'mada', 'applepay', 'stcpay', 'sadad'];
    return validMethods.includes(method);
  }

  formatAmount(amount) {
    return Math.round(amount * 100); // Convert SAR to halalas
  }

  parseAmount(halalas) {
    return halalas / 100; // Convert halalas to SAR
  }

  getPaymentStatus(moyasarStatus) {
    const statusMap = {
      'paid': 'paid',
      'failed': 'failed',
      'pending': 'pending',
      'authorized': 'pending',
      'captured': 'paid',
      'refunded': 'refunded',
      'partially_refunded': 'refunded'
    };

    return statusMap[moyasarStatus] || 'pending';
  }

  createCardSource(cardData) {
    return {
      type: 'creditcard',
      name: cardData.name,
      number: cardData.number,
      cvc: cardData.cvc,
      month: cardData.month,
      year: cardData.year
    };
  }

  createTokenSource(token) {
    return {
      type: 'token',
      token: token
    };
  }

  createApplePaySource(token) {
    return {
      type: 'applepay',
      token: token
    };
  }

  createSTCPaySource(mobile) {
    return {
      type: 'stcpay',
      mobile: mobile
    };
  }

  getErrorMessage(error) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      return Object.values(errors).flat().join(', ');
    }

    return error.message || 'Payment processing failed';
  }
}

module.exports = new MoyasarService();