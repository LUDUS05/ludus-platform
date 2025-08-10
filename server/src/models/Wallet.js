const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'refund', 'payment', 'bonus', 'adjustment'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    validate: {
      validator: function(value) {
        return value > 0;
      },
      message: 'Transaction amount must be positive'
    }
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  reference: {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    paymentId: String, // Moyasar payment ID
    refundId: String,  // Moyasar refund ID
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For admin adjustments
    externalRef: String // External reference for tracking
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  metadata: {
    type: Map,
    of: String,
    default: {}
  }
}, {
  timestamps: true
});

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: function(value) {
        return value >= 0;
      },
      message: 'Wallet balance cannot be negative'
    }
  },
  currency: {
    type: String,
    default: 'SAR',
    enum: ['SAR']
  },
  // Lock mechanism for concurrent transaction safety
  locked: {
    type: Boolean,
    default: false
  },
  lockExpiry: {
    type: Date,
    default: null
  },
  // Transaction history
  transactions: [transactionSchema],
  // Wallet settings
  settings: {
    autoTopUp: {
      enabled: { type: Boolean, default: false },
      threshold: { type: Number, default: 50 }, // Auto top-up when balance falls below this
      amount: { type: Number, default: 100 }    // Amount to top up
    },
    notifications: {
      lowBalance: { type: Boolean, default: true },
      transactions: { type: Boolean, default: true }
    }
  },
  // Statistics
  stats: {
    totalDeposited: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    totalRefunded: { type: Number, default: 0 },
    totalTransactions: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['active', 'frozen', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for performance
walletSchema.index({ user: 1 }, { unique: true });
walletSchema.index({ 'transactions.createdAt': -1 });
walletSchema.index({ 'transactions.type': 1 });
walletSchema.index({ 'transactions.status': 1 });

// Virtual for available balance (considering pending transactions)
walletSchema.virtual('availableBalance').get(function() {
  const pendingWithdrawals = this.transactions
    .filter(t => t.type === 'withdrawal' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return this.balance - pendingWithdrawals;
});

// Methods for wallet operations
walletSchema.methods.addTransaction = async function(transactionData) {
  // Validate transaction
  if (!transactionData.type || !transactionData.amount || !transactionData.description) {
    throw new Error('Transaction must have type, amount, and description');
  }

  // Calculate new balance
  let newBalance = this.balance;
  const isCredit = ['deposit', 'refund', 'bonus'].includes(transactionData.type);
  const isDebit = ['withdrawal', 'payment'].includes(transactionData.type);

  if (isCredit) {
    newBalance += transactionData.amount;
  } else if (isDebit) {
    if (this.availableBalance < transactionData.amount) {
      throw new Error('Insufficient wallet balance');
    }
    newBalance -= transactionData.amount;
  }

  // Create transaction
  const transaction = {
    ...transactionData,
    balanceAfter: newBalance,
    status: transactionData.status || 'completed'
  };

  // Update balance and add transaction
  this.balance = newBalance;
  this.transactions.unshift(transaction); // Add to beginning for recent-first order

  // Update statistics
  if (transaction.status === 'completed') {
    this.stats.totalTransactions += 1;
    if (isCredit) {
      if (transactionData.type === 'deposit') {
        this.stats.totalDeposited += transactionData.amount;
      } else if (transactionData.type === 'refund') {
        this.stats.totalRefunded += transactionData.amount;
      }
    } else if (isDebit && transactionData.type === 'payment') {
      this.stats.totalSpent += transactionData.amount;
    }
  }

  await this.save();
  return transaction;
};

walletSchema.methods.lockWallet = async function(durationMs = 30000) { // 30 seconds default
  this.locked = true;
  this.lockExpiry = new Date(Date.now() + durationMs);
  await this.save();
};

walletSchema.methods.unlockWallet = async function() {
  this.locked = false;
  this.lockExpiry = null;
  await this.save();
};

walletSchema.methods.isLocked = function() {
  if (!this.locked) return false;
  if (!this.lockExpiry) return true;
  
  // Check if lock has expired
  if (new Date() > this.lockExpiry) {
    // Auto-unlock expired locks
    this.unlockWallet().catch(console.error);
    return false;
  }
  
  return true;
};

// Get transaction history with pagination
walletSchema.methods.getTransactionHistory = function(options = {}) {
  const {
    limit = 20,
    skip = 0,
    type = null,
    status = null,
    startDate = null,
    endDate = null
  } = options;

  let query = this.transactions;

  // Apply filters
  if (type) {
    query = query.filter(t => t.type === type);
  }
  if (status) {
    query = query.filter(t => t.status === status);
  }
  if (startDate) {
    query = query.filter(t => t.createdAt >= startDate);
  }
  if (endDate) {
    query = query.filter(t => t.createdAt <= endDate);
  }

  // Apply pagination
  const total = query.length;
  const transactions = query.slice(skip, skip + limit);

  return {
    transactions,
    pagination: {
      total,
      limit,
      skip,
      hasMore: (skip + limit) < total
    }
  };
};

// Static method to create wallet for user
walletSchema.statics.createWalletForUser = async function(userId) {
  try {
    const wallet = new this({
      user: userId,
      balance: 0
    });
    
    await wallet.save();
    return wallet;
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      // Wallet already exists for this user
      return await this.findOne({ user: userId });
    }
    throw error;
  }
};

// Static method for atomic balance updates
walletSchema.statics.atomicBalanceUpdate = async function(userId, transactionData) {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const wallet = await this.findOne({ user: userId }).session(session);
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (wallet.isLocked()) {
        throw new Error('Wallet is currently locked');
      }

      if (wallet.status !== 'active') {
        throw new Error('Wallet is not active');
      }

      await wallet.lockWallet();
      await wallet.addTransaction(transactionData);
      await wallet.unlockWallet();
    });
  } finally {
    await session.endSession();
  }
};

// Transform output (remove sensitive internal fields)
walletSchema.methods.toJSON = function() {
  const wallet = this.toObject();
  
  // Don't expose lock information
  delete wallet.locked;
  delete wallet.lockExpiry;
  
  // Limit transaction history in general responses
  if (wallet.transactions && wallet.transactions.length > 10) {
    wallet.transactions = wallet.transactions.slice(0, 10);
    wallet.hasMoreTransactions = true;
  }
  
  return wallet;
};

module.exports = mongoose.model('Wallet', walletSchema);