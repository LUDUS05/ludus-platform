import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { walletService } from '../../services/walletService';

const WalletPaymentOption = ({
  amount,
  bookingId,
  description,
  onSuccess,
  onError
}) => {
  const { t } = useTranslation();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const response = await walletService.getWallet();
      setWallet(response.data.wallet);
    } catch (err) {
      console.error('Failed to fetch wallet data:', err);
      setError(t('wallet.walletUnavailable'));
    }
  };

  const handleWalletPayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Check if user has sufficient balance
      const balanceCheck = await walletService.checkBalance(amount);
      
      if (!balanceCheck.sufficient) {
        setError(t('wallet.insufficientBalance') + '. ' + t('wallet.addFundsToWallet'));
        setLoading(false);
        return;
      }

      // Process payment
      const response = await walletService.payWithWallet(amount, bookingId, description);
      
      if (response.success) {
        onSuccess(response.data);
      } else {
        setError(response.message || t('common.error'));
      }
    } catch (err) {
      console.error('Wallet payment error:', err);
      setError(err.response?.data?.message || t('common.error'));
    }

    setLoading(false);
  };

  const hasSufficientBalance = wallet && wallet.availableBalance >= amount;
  const shortfall = wallet ? amount - wallet.availableBalance : amount;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Wallet Icon */}
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{t('wallet.addFundsTitle')}</h3>
          {wallet && (
            <p className="text-sm text-gray-600">
              {t('wallet.balance')}: {walletService.formatCurrency(wallet.availableBalance)}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-4">
        {t('wallet.instantPayment')}
      </p>

      {/* Payment Amount */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">{t('payment.totalPrice')}:</span>
          <span className="text-lg font-semibold text-gray-900">
            {walletService.formatCurrency(amount)}
          </span>
        </div>
      </div>

      {/* Insufficient Balance Warning */}
      {!hasSufficientBalance && wallet && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                {t('wallet.insufficientBalance')}. {t('wallet.addFundsToWallet')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Button */}
      <button
        onClick={handleWalletPayment}
        disabled={loading || !hasSufficientBalance}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
          hasSufficientBalance
            ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        title={
          hasSufficientBalance
            ? t('wallet.payNow', { amount: walletService.formatCurrency(amount) })
            : t('wallet.insufficientBalance')
        }
      >
        {loading ? t('wallet.processing') : t('wallet.payNow', { amount: walletService.formatCurrency(amount) })}
      </button>

      {/* Add Funds Button for Insufficient Balance */}
      {!hasSufficientBalance && wallet && (
        <div className="mt-4">
          <button
            onClick={() => window.open('/wallet', '_blank')}
            className="w-full py-2 px-4 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200"
          >
            {t('wallet.addFunds')}
          </button>
        </div>
      )}

      {/* Benefits */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs font-medium text-gray-700 mb-2">{t('wallet.walletPaymentBenefits')}:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• {t('wallet.instantPayment')}</li>
          <li>• {t('wallet.noFees')}</li>
          <li>• {t('wallet.easyRefunds')}</li>
          <li>• {t('wallet.secureTransactions')}</li>
        </ul>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
};

export default WalletPaymentOption;