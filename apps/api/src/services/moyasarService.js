/**
 * @fileoverview Service for interacting with the Moyasar payment gateway.
 * @module services/moyasarService
 */

const axios = require('axios');
const crypto = require('crypto');

class MoyasarService {
  /**
   * Creates an instance of MoyasarService.
   */
  constructor() {
    this.apiKey = process.env.MOYASAR_SECRET_KEY;
    this.baseURL = process.env.MOYASAR_BASE_URL || 'https://api.moyasar.com/v1';
    this.webhookSecret = process.env.MOYASAR_WEBHOOK_SECRET;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Create a new payment.
   * @param {object} paymentData - The payment data.
   * @returns {Promise<object>} A promise that resolves to the Moyasar payment object.
   */
  async createPayment(paymentData) {
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

  /**
   * Retrieve a payment by its ID.
   * @param {string} paymentId - The ID of the payment to retrieve.
   * @returns {Promise<object>} A promise that resolves to the Moyasar payment object.
   */
  async retrievePayment(paymentId) {
    try {
      const response = await this.client.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Moyasar payment retrieval failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Refund a payment.
   * @param {string} paymentId - The ID of the payment to refund.
   * @param {object} refundData - The refund data.
   * @returns {Promise<object>} A promise that resolves to the Moyasar refund object.
   */
  async refundPayment(paymentId, refundData) {
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

  /**
   * Create a new invoice.
   * @param {object} invoiceData - The invoice data.
   * @returns {Promise<object>} A promise that resolves to the Moyasar invoice object.
   */
  async createInvoice(invoiceData) {
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

  /**
   * Verify the signature of a Moyasar webhook.
   * @param {string} payload - The webhook payload.
   * @param {string} signature - The webhook signature.
   * @returns {boolean} True if the signature is valid, false otherwise.
   */
  verifyWebhookSignature(payload, signature) {
    if (!this.webhookSecret) {
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

  /**
   * Tokenize a credit card.
   * @param {object} cardData - The card data.
   * @returns {Promise<object>} A promise that resolves to the Moyasar token object.
   */
  async tokenizeCard(cardData) {
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

  /**
   * Validate a payment method.
   * @param {string} method - The payment method to validate.
   * @returns {boolean} True if the payment method is valid, false otherwise.
   */
  validatePaymentMethod(method) {
    const validMethods = ['creditcard', 'mada', 'applepay', 'stcpay', 'sadad'];
    return validMethods.includes(method);
  }

  /**
   * Format an amount to halalas.
   * @param {number} amount - The amount in SAR.
   * @returns {number} The amount in halalas.
   */
  formatAmount(amount) {
    return Math.round(amount * 100); // Convert SAR to halalas
  }

  /**
   * Parse an amount from halalas to SAR.
   * @param {number} halalas - The amount in halalas.
   * @returns {number} The amount in SAR.
   */
  parseAmount(halalas) {
    return halalas / 100; // Convert halalas to SAR
  }

  /**
   * Get the payment status from a Moyasar status.
   * @param {string} moyasarStatus - The Moyasar status.
   * @returns {string} The payment status.
   */
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

  /**
   * Create a credit card payment source.
   * @param {object} cardData - The card data.
   * @returns {object} The credit card payment source object.
   */
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

  /**
   * Create a token payment source.
   * @param {string} token - The payment token.
   * @returns {object} The token payment source object.
   */
  createTokenSource(token) {
    return {
      type: 'token',
      token: token
    };
  }

  /**
   * Create an Apple Pay payment source.
   * @param {string} token - The Apple Pay token.
   * @returns {object} The Apple Pay payment source object.
   */
  createApplePaySource(token) {
    return {
      type: 'applepay',
      token: token
    };
  }

  /**
   * Create an STC Pay payment source.
   * @param {string} mobile - The mobile number.
   * @returns {object} The STC Pay payment source object.
   */
  createSTCPaySource(mobile) {
    return {
      type: 'stcpay',
      mobile: mobile
    };
  }

  /**
   * Get an error message from a Moyasar error.
   * @param {Error} error - The error object.
   * @returns {string} The error message.
   */
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