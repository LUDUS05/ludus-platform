const Wallet = require('../models/Wallet');
const User = require('../models/User');
const { moyasarService } = require('../services/moyasarService');

// @desc    Get user wallet
// @route   GET /api/wallet
// @access  Private
const getUserWallet = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    let wallet = await Wallet.findOne({ user: userId });
    
    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = await Wallet.createWalletForUser(userId);
    }

    res.json({
      success: true,
      data: { wallet }
    });
  } catch (error) {
    console.error('Get user wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet information'
    });
  }
};

// @desc    Get wallet transaction history
// @route   GET /api/wallet/transactions
// @access  Private
const getWalletTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      type,
      status,
      startDate,
      endDate
    } = req.query;

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    const skip = (page - 1) * limit;
    const options = {
      limit: parseInt(limit),
      skip,
      type,
      status,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null
    };

    const result = wallet.getTransactionHistory(options);

    res.json({
      success: true,
      data: {
        transactions: result.transactions,
        pagination: {
          ...result.pagination,
          page: parseInt(page),
          totalPages: Math.ceil(result.pagination.total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get wallet transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction history'
    });
  }
};

// @desc    Add funds to wallet
// @route   POST /api/wallet/deposit
// @access  Private
const depositFunds = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { amount, paymentMethodId, description = 'Wallet deposit' } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid deposit amount'
      });
    }

    if (amount < 10) { // Minimum deposit
      return res.status(400).json({
        success: false,
        message: 'Minimum deposit amount is 10 SAR'
      });
    }

    if (amount > 10000) { // Maximum deposit
      return res.status(400).json({
        success: false,
        message: 'Maximum deposit amount is 10,000 SAR'
      });
    }

    // Get or create wallet
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await Wallet.createWalletForUser(userId);
    }

    // Create payment with Moyasar
    const paymentData = {
      amount: Math.round(amount * 100), // Convert to halalas
      currency: 'SAR',
      description: `Wallet deposit - ${amount} SAR`,
      source: {
        type: 'creditcard',
        name: req.user.firstName + ' ' + req.user.lastName,
        number: 'tok_' + paymentMethodId // Use saved payment method token
      },
      callback_url: `${process.env.CLIENT_URL}/wallet/deposit/callback`,
      metadata: {
        user_id: userId,
        wallet_id: wallet._id.toString(),
        transaction_type: 'wallet_deposit'
      }
    };

    const moyasarPayment = await moyasarService.createPayment(paymentData);

    // Add pending transaction to wallet
    const transaction = await wallet.addTransaction({
      type: 'deposit',
      amount: amount,
      description: description,
      reference: {
        paymentId: moyasarPayment.id
      },
      status: 'pending'
    });

    res.json({
      success: true,
      data: {
        transaction,
        payment: {
          id: moyasarPayment.id,
          amount: moyasarPayment.amount / 100, // Convert back to SAR
          status: moyasarPayment.status,
          source: moyasarPayment.source
        }
      }
    });
  } catch (error) {
    console.error('Deposit funds error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process deposit'
    });
  }
};

// @desc    Process successful deposit (webhook/callback)
// @route   POST /api/wallet/deposit/confirm
// @access  Private
const confirmDeposit = async (req, res, next) => {
  try {
    const { paymentId, status } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    // Find wallet transaction by payment ID
    const wallet = await Wallet.findOne({
      'transactions.reference.paymentId': paymentId
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Find the specific transaction
    const transaction = wallet.transactions.find(
      t => t.reference.paymentId === paymentId
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Transaction already processed'
      });
    }

    // Update transaction status based on payment status
    if (status === 'paid') {
      transaction.status = 'completed';
      // Balance was already updated when transaction was created
      
      // Update stats
      wallet.stats.totalDeposited += transaction.amount;
      wallet.stats.totalTransactions += 1;
    } else {
      transaction.status = 'failed';
      // Reverse the balance change
      wallet.balance -= transaction.amount;
      transaction.balanceAfter = wallet.balance;
    }

    await wallet.save();

    res.json({
      success: true,
      data: { 
        transaction,
        wallet: {
          balance: wallet.balance,
          availableBalance: wallet.availableBalance
        }
      }
    });
  } catch (error) {
    console.error('Confirm deposit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm deposit'
    });
  }
};

// @desc    Withdraw funds from wallet
// @route   POST /api/wallet/withdraw
// @access  Private
const withdrawFunds = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { amount, description = 'Wallet withdrawal' } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid withdrawal amount'
      });
    }

    if (amount < 20) { // Minimum withdrawal
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal amount is 20 SAR'
      });
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    if (wallet.availableBalance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
    }

    // Add withdrawal transaction (this will be processed manually by admin)
    const transaction = await wallet.addTransaction({
      type: 'withdrawal',
      amount: amount,
      description: description,
      status: 'pending' // Withdrawals need manual approval
    });

    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully. It will be processed within 1-2 business days.',
      data: { 
        transaction,
        wallet: {
          balance: wallet.balance,
          availableBalance: wallet.availableBalance
        }
      }
    });
  } catch (error) {
    console.error('Withdraw funds error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process withdrawal'
    });
  }
};

// @desc    Use wallet funds for payment
// @route   POST /api/wallet/pay
// @access  Private
const payWithWallet = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { amount, bookingId, description = 'Activity booking payment' } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount'
      });
    }

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    if (wallet.availableBalance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
    }

    // Process payment
    const transaction = await wallet.addTransaction({
      type: 'payment',
      amount: amount,
      description: description,
      reference: {
        bookingId: bookingId
      },
      status: 'completed'
    });

    res.json({
      success: true,
      data: { 
        transaction,
        wallet: {
          balance: wallet.balance,
          availableBalance: wallet.availableBalance
        }
      }
    });
  } catch (error) {
    console.error('Pay with wallet error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process payment'
    });
  }
};

// @desc    Process refund to wallet
// @route   POST /api/wallet/refund
// @access  Private (typically called by booking system)
const processRefund = async (req, res, next) => {
  try {
    const { userId, amount, bookingId, description = 'Booking refund' } = req.body;

    // Validation
    if (!userId || !amount || !bookingId) {
      return res.status(400).json({
        success: false,
        message: 'User ID, amount, and booking ID are required'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid refund amount'
      });
    }

    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await Wallet.createWalletForUser(userId);
    }

    // Add refund transaction
    const transaction = await wallet.addTransaction({
      type: 'refund',
      amount: amount,
      description: description,
      reference: {
        bookingId: bookingId,
        adminId: req.user?.id // If processed by admin
      },
      status: 'completed'
    });

    res.json({
      success: true,
      data: { 
        transaction,
        wallet: {
          balance: wallet.balance,
          availableBalance: wallet.availableBalance
        }
      }
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process refund'
    });
  }
};

// @desc    Update wallet settings
// @route   PUT /api/wallet/settings
// @access  Private
const updateWalletSettings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { settings } = req.body;

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    // Update settings
    if (settings) {
      wallet.settings = { ...wallet.settings, ...settings };
      await wallet.save();
    }

    res.json({
      success: true,
      data: { 
        settings: wallet.settings
      }
    });
  } catch (error) {
    console.error('Update wallet settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update wallet settings'
    });
  }
};

// @desc    Get wallet statistics
// @route   GET /api/wallet/stats
// @access  Private
const getWalletStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    // Calculate additional statistics
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentTransactions = wallet.transactions.filter(
      t => t.createdAt >= last30Days
    );

    const monthlyStats = {
      totalTransactions: recentTransactions.length,
      totalDeposited: recentTransactions
        .filter(t => t.type === 'deposit' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0),
      totalSpent: recentTransactions
        .filter(t => t.type === 'payment' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0)
    };

    res.json({
      success: true,
      data: {
        overallStats: wallet.stats,
        monthlyStats,
        currentBalance: wallet.balance,
        availableBalance: wallet.availableBalance,
        status: wallet.status
      }
    });
  } catch (error) {
    console.error('Get wallet stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet statistics'
    });
  }
};

module.exports = {
  getUserWallet,
  getWalletTransactions,
  depositFunds,
  confirmDeposit,
  withdrawFunds,
  payWithWallet,
  processRefund,
  updateWalletSettings,
  getWalletStats
};