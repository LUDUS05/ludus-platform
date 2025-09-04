import { api } from './api';

export const walletService = {
  // Get user wallet
  getWallet: async () => {
    const response = await api.get('/wallet');
    return response.data;
  },

  // Get wallet transaction history
  getTransactions: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/wallet/transactions?${queryParams.toString()}`);
    return response.data;
  },

  // Get wallet statistics
  getStats: async () => {
    const response = await api.get('/wallet/stats');
    return response.data;
  },

  // Add funds to wallet
  depositFunds: async (amount, paymentMethodId, description = 'Wallet deposit') => {
    const response = await api.post('/wallet/deposit', {
      amount,
      paymentMethodId,
      description
    });
    return response.data;
  },

  // Confirm deposit (for webhook/callback handling)
  confirmDeposit: async (paymentId, status) => {
    const response = await api.post('/wallet/deposit/confirm', {
      paymentId,
      status
    });
    return response.data;
  },

  // Withdraw funds from wallet
  withdrawFunds: async (amount, description = 'Wallet withdrawal') => {
    const response = await api.post('/wallet/withdraw', {
      amount,
      description
    });
    return response.data;
  },

  // Pay with wallet funds
  payWithWallet: async (amount, bookingId, description = 'Activity booking payment') => {
    const response = await api.post('/wallet/pay', {
      amount,
      bookingId,
      description
    });
    return response.data;
  },

  // Update wallet settings
  updateSettings: async (settings) => {
    const response = await api.put('/wallet/settings', { settings });
    return response.data;
  },

  // Helper method to check if user has sufficient balance
  checkBalance: async (requiredAmount) => {
    const walletData = await walletService.getWallet();
    const availableBalance = walletData.data.wallet.availableBalance;
    return {
      hasSufficientBalance: availableBalance >= requiredAmount,
      availableBalance,
      shortfall: requiredAmount > availableBalance ? requiredAmount - availableBalance : 0
    };
  },

  // Format currency for display
  formatCurrency: (amount, currency = 'SAR') => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(amount);
  },

  // Get transaction type display info
  getTransactionTypeInfo: (type) => {
    const typeInfo = {
      deposit: {
        label: 'Deposit',
        icon: '💰',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        isCredit: true
      },
      withdrawal: {
        label: 'Withdrawal',
        icon: '🏦',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        isCredit: false
      },
      payment: {
        label: 'Payment',
        icon: '💳',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        isCredit: false
      },
      refund: {
        label: 'Refund',
        icon: '↩️',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        isCredit: true
      },
      bonus: {
        label: 'Bonus',
        icon: '🎁',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        isCredit: true
      },
      adjustment: {
        label: 'Adjustment',
        icon: '⚖️',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        isCredit: null // Can be either
      }
    };

    return typeInfo[type] || {
      label: type.charAt(0).toUpperCase() + type.slice(1),
      icon: '💱',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      isCredit: null
    };
  },

  // Get status badge styling
  getStatusBadgeStyle: (status) => {
    const statusStyles = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return statusStyles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  },

  // Validate amounts
  validateDepositAmount: (amount) => {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      return { valid: false, error: 'Amount must be a positive number' };
    }
    
    if (numAmount < 10) {
      return { valid: false, error: 'Minimum deposit amount is 10 SAR' };
    }
    
    if (numAmount > 10000) {
      return { valid: false, error: 'Maximum deposit amount is 10,000 SAR' };
    }
    
    return { valid: true, error: null };
  },

  validateWithdrawalAmount: (amount, availableBalance) => {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      return { valid: false, error: 'Amount must be a positive number' };
    }
    
    if (numAmount < 20) {
      return { valid: false, error: 'Minimum withdrawal amount is 20 SAR' };
    }
    
    if (numAmount > availableBalance) {
      return { valid: false, error: 'Insufficient wallet balance' };
    }
    
    return { valid: true, error: null };
  }
};