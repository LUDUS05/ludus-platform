import React, { useState, useEffect } from 'react';
import { paymentService } from '../../services/paymentService';

const PaymentForm = ({ 
  amount, 
  description, 
  onPaymentSuccess, 
  onPaymentError, 
  metadata = {},
  showSavedMethods = true 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('creditcard');
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    month: '',
    year: '',
    cvc: ''
  });
  const [savedMethods, setSavedMethods] = useState([]);
  const [selectedSavedMethod, setSelectedSavedMethod] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [moyasarLoaded, setMoyasarLoaded] = useState(false);

  useEffect(() => {
    // Initialize Moyasar SDK
    paymentService.initializeMoyasar()
      .then(() => {
        setMoyasarLoaded(true);
      })
      .catch(error => {
        console.error('Failed to load Moyasar SDK:', error);
        setErrors({ general: 'Payment system unavailable. Please try again later.' });
      });

    // Load saved payment methods if enabled
    if (showSavedMethods) {
      loadSavedMethods();
    }
  }, [showSavedMethods]);

  const loadSavedMethods = async () => {
    try {
      const response = await paymentService.getUserPaymentMethods();
      setSavedMethods(response.data.methods || []);
    } catch (error) {
      console.error('Failed to load saved payment methods:', error);
    }
  };

  const handleCardInputChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'number') {
      // Remove non-digits and limit to 19 characters (with spaces)
      formattedValue = value.replace(/\D/g, '').slice(0, 16);
    } else if (field === 'month') {
      formattedValue = value.replace(/\D/g, '').slice(0, 2);
      if (parseInt(formattedValue) > 12) formattedValue = '12';
    } else if (field === 'year') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    } else if (field === 'cvc') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardData(prev => ({
      ...prev,
      [field]: formattedValue
    }));

    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      let paymentData = {
        amount: paymentService.toHalalas(amount),
        description,
        metadata
      };

      if (paymentMethod === 'creditcard') {
        if (selectedSavedMethod) {
          // Use saved payment method
          paymentData.paymentMethod = 'credit_card';
          paymentData.savedTokenId = selectedSavedMethod;
        } else {
          // Validate card data
          const validation = paymentService.validateCardData(cardData);
          if (!validation.isValid) {
            setErrors(validation.errors);
            setLoading(false);
            return;
          }

          paymentData.paymentMethod = 'credit_card';
          paymentData.cardData = {
            number: cardData.number.replace(/\s/g, ''),
            name: cardData.name,
            month: cardData.month,
            year: cardData.year,
            cvc: cardData.cvc
          };

          if (saveCard) {
            paymentData.saveCard = true;
          }
        }
      } else {
        // Handle other payment methods (Apple Pay, STC Pay, etc.)
        paymentData.paymentMethod = paymentMethod;
      }

      const response = await paymentService.createPayment(paymentData);
      
      if (response.success) {
        onPaymentSuccess(response.data);
      } else {
        setErrors({ general: response.message || 'Payment failed' });
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      const errorMessage = error.response?.data?.message || 'Payment processing failed. Please try again.';
      setErrors({ general: errorMessage });
      
      if (onPaymentError) {
        onPaymentError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'creditcard', name: 'Credit/Debit Card', icon: '💳' },
    { id: 'applepay', name: 'Apple Pay', icon: '🍎' },
    { id: 'stcpay', name: 'STC Pay', icon: '📱' },
    { id: 'aman', name: 'Aman', icon: '🏪' }
  ];

  if (!moyasarLoaded) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ludus-orange mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading payment system...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Information</h2>

      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Total Amount</span>
          <span className="text-2xl font-bold text-ludus-orange">
            {paymentService.formatCurrency(amount)}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Payment Method Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  paymentMethod === method.id
                    ? 'border-ludus-orange bg-ludus-orange/10 text-ludus-orange-dark'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{method.icon}</span>
                  <span className="font-medium">{method.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Credit Card Form */}
        {paymentMethod === 'creditcard' && (
          <div className="space-y-4">
            {/* Saved Payment Methods */}
            {showSavedMethods && savedMethods.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saved Cards
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="savedMethod"
                      value=""
                      checked={selectedSavedMethod === ''}
                      onChange={(e) => setSelectedSavedMethod(e.target.value)}
                      className="w-4 h-4 text-ludus-orange border-gray-300 focus:ring-ludus-orange/50"
                    />
                    <span className="ml-3 font-medium text-gray-900">Use new card</span>
                  </label>
                  {savedMethods.map((method) => (
                    <label key={method.tokenId} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <input
                        type="radio"
                        name="savedMethod"
                        value={method.tokenId}
                        checked={selectedSavedMethod === method.tokenId}
                        onChange={(e) => setSelectedSavedMethod(e.target.value)}
                        className="w-4 h-4 text-ludus-orange border-gray-300 focus:ring-ludus-orange/50"
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">
                          •••• •••• •••• {method.last4}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {method.brand}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* New Card Form */}
            {selectedSavedMethod === '' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={paymentService.formatCardNumber(cardData.number)}
                    onChange={(e) => handleCardInputChange('number', e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.number ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.number && (
                    <p className="mt-1 text-sm text-red-600">{errors.number}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardData.name}
                    onChange={(e) => handleCardInputChange('name', e.target.value)}
                    placeholder="John Doe"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Month
                    </label>
                    <input
                      type="text"
                      value={cardData.month}
                      onChange={(e) => handleCardInputChange('month', e.target.value)}
                      placeholder="MM"
                      maxLength="2"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.month ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.month && (
                      <p className="mt-1 text-sm text-red-600">{errors.month}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <input
                      type="text"
                      value={cardData.year}
                      onChange={(e) => handleCardInputChange('year', e.target.value)}
                      placeholder="YYYY"
                      maxLength="4"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.year ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.year && (
                      <p className="mt-1 text-sm text-red-600">{errors.year}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVC
                    </label>
                    <input
                      type="text"
                      value={cardData.cvc}
                      onChange={(e) => handleCardInputChange('cvc', e.target.value)}
                      placeholder="123"
                      maxLength="4"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.cvc ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.cvc && (
                      <p className="mt-1 text-sm text-red-600">{errors.cvc}</p>
                    )}
                  </div>
                </div>

                {/* Save Card Option */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="saveCard"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    className="w-4 h-4 text-ludus-orange border-gray-300 rounded focus:ring-ludus-orange/50"
                  />
                  <label htmlFor="saveCard" className="ml-2 text-sm text-gray-700">
                    Save this card for future payments
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {errors.general && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="text-red-400 text-xl mr-3">⚠️</div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
                <p className="text-sm text-red-700 mt-1">{errors.general}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ludus-orange text-white py-3 px-4 rounded-md hover:bg-ludus-orange-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing Payment...
            </div>
          ) : (
            `Pay ${paymentService.formatCurrency(amount)}`
          )}
        </button>

        {/* Security Notice */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            🔒 Your payment information is encrypted and secure
          </p>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;