import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { api } from '../../services/api';

const WalletDashboard = () => {
  const { t } = useTranslation();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [walletRes, transactionsRes, statsRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/wallet/transactions?limit=10'),
        api.get('/wallet/stats')
      ]);

      setWallet(walletRes.data.data.wallet);
      setTransactions(transactionsRes.data.data.transactions);
      setStats(statsRes.data.data);
    } catch (err) {
      setError('Failed to load wallet data');
      console.error('Wallet data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getTransactionIcon = (type) => {
    const icons = {
      deposit: '💰',
      withdrawal: '🏦',
      payment: '💳',
      refund: '↩️',
      bonus: '🎁',
      adjustment: '⚖️'
    };
    return icons[type] || '💱';
  };

  const getTransactionColor = (type) => {
    const colors = {
      deposit: 'text-green-600',
      refund: 'text-green-600',
      bonus: 'text-green-600',
      payment: 'text-red-600',
      withdrawal: 'text-red-600',
      adjustment: 'text-blue-600'
    };
    return colors[type] || 'text-gray-600';
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Wallet Unavailable</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchWalletData}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wallet</h1>
        <p className="text-gray-600">Manage your balance and view transaction history</p>
      </div>

      {/* Balance Card */}
      <Card className="mb-6 bg-gradient-to-r from-ludus-orange to-ludus-orange-dark text-white">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium opacity-90 mb-2">Current Balance</h2>
              <div className="text-3xl font-bold mb-1">
                {formatCurrency(wallet?.balance || 0)}
              </div>
              <div className="text-sm opacity-75">
                Available: {formatCurrency(wallet?.availableBalance || 0)}
              </div>
            </div>
            <div className="text-6xl opacity-20">💳</div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <Button 
              variant="outline" 
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              onClick={() => setActiveTab('deposit')}
            >
              <span className="mr-2">➕</span>
              Add Funds
            </Button>
            <Button 
              variant="outline" 
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              onClick={() => setActiveTab('withdraw')}
            >
              <span className="mr-2">➖</span>
              Withdraw
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <span className="text-green-600 text-xl">📈</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Deposited</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(stats.overallStats.totalDeposited)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <span className="text-blue-600 text-xl">💰</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(stats.overallStats.totalSpent)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-full p-3 mr-4">
                <span className="text-purple-600 text-xl">🔄</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-lg font-semibold text-gray-900">
                  {stats.overallStats.totalTransactions}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'deposit', 'withdraw', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-ludus-orange text-ludus-orange'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'overview' ? 'Recent Transactions' : tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📝</div>
                  <p className="text-gray-500">No transactions yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Your transaction history will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 capitalize">
                            {transaction.type.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                          {['deposit', 'refund', 'bonus'].includes(transaction.type) ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadge(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'deposit' && (
          <DepositFunds wallet={wallet} onSuccess={fetchWalletData} />
        )}

        {activeTab === 'withdraw' && (
          <WithdrawFunds wallet={wallet} onSuccess={fetchWalletData} />
        )}

        {activeTab === 'settings' && (
          <WalletSettings wallet={wallet} onUpdate={fetchWalletData} />
        )}
      </div>
    </div>
  );
};

// Deposit Funds Component
const DepositFunds = ({ wallet, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!amount || amount < 10) {
      setError('Minimum deposit amount is 10 SAR');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // This would integrate with the payment system
      const response = await api.post('/wallet/deposit', {
        amount: parseFloat(amount),
        description: `Wallet deposit - ${amount} SAR`
      });

      alert('Deposit initiated! You will be redirected to payment.');
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process deposit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Funds to Wallet</h3>
        
        <form onSubmit={handleDeposit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (SAR)
            </label>
            <input
              type="number"
              min="10"
              max="10000"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-ludus-orange focus:border-ludus-orange"
              placeholder="Enter amount"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum: 10 SAR, Maximum: 10,000 SAR
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading || !amount}
            className="w-full"
          >
            {loading ? 'Processing...' : `Add ${amount} SAR to Wallet`}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Payment Methods</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Credit/Debit Cards (Visa, Mastercard)</p>
            <p>• MADA Cards</p>
            <p>• Apple Pay</p>
            <p>• STC Pay</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Withdraw Funds Component
const WithdrawFunds = ({ wallet, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount || amount < 20) {
      setError('Minimum withdrawal amount is 20 SAR');
      return;
    }

    if (parseFloat(amount) > wallet?.availableBalance) {
      setError('Insufficient balance');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await api.post('/wallet/withdraw', {
        amount: parseFloat(amount),
        description: `Wallet withdrawal - ${amount} SAR`
      });

      alert('Withdrawal request submitted! It will be processed within 1-2 business days.');
      setAmount('');
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process withdrawal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Withdraw Funds</h3>
        
        <form onSubmit={handleWithdraw} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (SAR)
            </label>
            <input
              type="number"
              min="20"
              max={wallet?.availableBalance || 0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-ludus-orange focus:border-ludus-orange"
              placeholder="Enter amount"
            />
            <p className="text-xs text-gray-500 mt-1">
              Available: {wallet?.availableBalance || 0} SAR (Minimum: 20 SAR)
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading || !amount}
            className="w-full"
          >
            {loading ? 'Processing...' : `Withdraw ${amount} SAR`}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">⏱️ Processing Time</h4>
          <p className="text-sm text-yellow-700">
            Withdrawal requests are processed within 1-2 business days. 
            Funds will be transferred to your registered bank account.
          </p>
        </div>
      </div>
    </Card>
  );
};

// Wallet Settings Component
const WalletSettings = ({ wallet, onUpdate }) => {
  const [settings, setSettings] = useState(wallet?.settings || {});
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.put('/wallet/settings', { settings });
      alert('Settings updated successfully!');
      onUpdate?.();
    } catch (err) {
      alert('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="p-6 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Wallet Settings</h3>
        
        {/* Notifications */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Notifications</h4>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.notifications?.lowBalance}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: {
                    ...settings.notifications,
                    lowBalance: e.target.checked
                  }
                })}
                className="rounded border-gray-300 text-ludus-orange focus:ring-ludus-orange"
              />
              <span className="ml-2 text-sm text-gray-700">
                Low balance notifications
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.notifications?.transactions}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: {
                    ...settings.notifications,
                    transactions: e.target.checked
                  }
                })}
                className="rounded border-gray-300 text-ludus-orange focus:ring-ludus-orange"
              />
              <span className="ml-2 text-sm text-gray-700">
                Transaction notifications
              </span>
            </label>
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </Card>
  );
};

export default WalletDashboard;