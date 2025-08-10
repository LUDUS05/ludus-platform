import React, { useState, useEffect } from 'react';
import { walletService } from '../../services/walletService';
import Button from '../ui/Button';
import Card from '../ui/Card';

const WalletPaymentOption = ({ 
  amount, 
  bookingId, 
  description,
  onPaymentSuccess, 
  onPaymentError,
  className = ''
}) => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await walletService.getWallet();
      setWallet(response.data.wallet);
    } catch (err) {
      console.error('Failed to fetch wallet data:', err);
      setError('Failed to load wallet information');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletPayment = async () => {
    try {
      setProcessing(true);
      setError(null);

      // Check balance first
      const balanceCheck = await walletService.checkBalance(amount);
      if (!balanceCheck.hasSufficientBalance) {
        setError(`Insufficient balance. You need ${walletService.formatCurrency(balanceCheck.shortfall)} more.`);
        return;
      }

      // Process payment
      const response = await walletService.payWithWallet(amount, bookingId, description);
      
      if (response.success) {
        onPaymentSuccess?.(response.data);
      } else {
        throw new Error(response.message || 'Payment failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Payment failed';
      setError(errorMessage);
      onPaymentError?.(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  const hasSufficientBalance = wallet && wallet.availableBalance >= amount;
  const shortfall = wallet ? amount - wallet.availableBalance : amount;

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        {/* Wallet Icon */}
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-ludus-orange to-ludus-orange-dark rounded-lg flex items-center justify-center">
          <span className="text-white text-xl">💳</span>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Pay with Wallet</h3>
            {wallet && (
              <span className="text-sm font-medium text-gray-600">
                Balance: {walletService.formatCurrency(wallet.availableBalance)}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-3">
            Use your wallet balance for instant payment
          </p>

          {/* Payment Amount */}
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Payment Amount:</span>
            <span className="text-lg font-bold text-gray-900">
              {walletService.formatCurrency(amount)}
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Balance Status */}
          {!hasSufficientBalance && wallet && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center text-yellow-700">
                <span className="text-lg mr-2">⚠️</span>
                <div>
                  <p className="text-sm font-medium">Insufficient Balance</p>
                  <p className="text-xs">
                    You need {walletService.formatCurrency(shortfall)} more. 
                    <a href="/wallet" className="text-yellow-600 hover:text-yellow-800 underline ml-1">
                      Add funds to wallet
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="space-y-2">
            <Button
              onClick={handleWalletPayment}
              disabled={processing || !hasSufficientBalance}
              className={`w-full ${
                hasSufficientBalance 
                  ? 'bg-gradient-to-r from-ludus-orange to-ludus-orange-dark hover:from-ludus-orange-dark hover:to-ludus-orange' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {processing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Processing...
                </div>
              ) : hasSufficientBalance ? (
                `Pay ${walletService.formatCurrency(amount)} with Wallet`
              ) : (
                'Insufficient Balance'
              )}
            </Button>

            {!hasSufficientBalance && wallet && (
              <Button
                variant="outline"
                onClick={() => window.open('/wallet', '_blank')}
                className="w-full"
              >
                Add Funds to Wallet
              </Button>
            )}
          </div>

          {/* Benefits */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">Wallet Payment Benefits:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Instant payment confirmation
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                No payment processing fees
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Easy refunds to wallet
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WalletPaymentOption;