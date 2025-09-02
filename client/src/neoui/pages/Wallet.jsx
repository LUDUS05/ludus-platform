import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet, Plus, Gift, History, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function NeoWallet() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [topUpAmount, setTopUpAmount] = useState('');
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  // Mock data - TODO: Replace with actual API calls
  const [walletData] = useState({
    balance: 1250.50,
    currency: 'SAR',
    rewards: 450,
    referralEarnings: 125
  });

  const [transactions] = useState([
    {
      id: 1,
      type: 'deposit',
      amount: 500,
      description: 'Top-up via credit card',
      date: '2024-01-15',
      status: 'completed'
    },
    {
      id: 2,
      type: 'reward',
      amount: 50,
      description: 'Referral bonus',
      date: '2024-01-14',
      status: 'completed'
    },
    {
      id: 3,
      type: 'payment',
      amount: -75,
      description: 'Activity booking',
      date: '2024-01-13',
      status: 'completed'
    },
    {
      id: 4,
      type: 'reward',
      amount: 25,
      description: 'Social sharing bonus',
      date: '2024-01-12',
      status: 'completed'
    }
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getTransactionIcon = (type) => {
    const icons = {
      deposit: <ArrowUpRight className="w-5 h-5 text-green-600" />,
      reward: <Gift className="w-5 h-5 text-blue-600" />,
      payment: <ArrowDownLeft className="w-5 h-5 text-red-600" />,
      referral: <Gift className="w-5 h-5 text-purple-600" />
    };
    return icons[type] || <ArrowUpRight className="w-5 h-5 text-gray-600" />;
  };

  const handleTopUp = () => {
    if (topUpAmount && parseFloat(topUpAmount) > 0) {
      // TODO: Implement actual top-up logic
      console.log('Top-up amount:', topUpAmount);
      setShowTopUpModal(false);
      setTopUpAmount('');
    }
  };

  const isRTL = i18n.language === 'ar';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {isRTL ? 'المحفظة' : 'Wallet'}
        </h1>
        <p className="text-gray-600">
          {isRTL ? 'إدارة رصيدك ومكافآتك' : 'Manage your balance and rewards'}
        </p>
      </div>

      {/* Balance Card */}
      <div className="neumorphic rounded-2xl p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <Wallet className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-sm text-gray-600 mb-2">
          {isRTL ? 'الرصيد الحالي' : 'Current Balance'}
        </h2>
        <div className="text-3xl font-bold text-gray-800 mb-4">
          {formatCurrency(walletData.balance)}
        </div>
        <button
          onClick={() => setShowTopUpModal(true)}
          className="neumorphic-subtle hover:neumorphic-pressed px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 mx-auto"
        >
          <Plus className="w-5 h-5" />
          <span>{isRTL ? 'إضافة رصيد' : 'Add Balance'}</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="neumorphic rounded-xl p-4 text-center">
          <Gift className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-gray-800">{walletData.rewards}</div>
          <div className="text-sm text-gray-600">
            {isRTL ? 'نقاط المكافآت' : 'Reward Points'}
          </div>
        </div>
        <div className="neumorphic rounded-xl p-4 text-center">
          <Gift className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-gray-800">{formatCurrency(walletData.referralEarnings)}</div>
          <div className="text-sm text-gray-600">
            {isRTL ? 'أرباح الإحالة' : 'Referral Earnings'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="neumorphic rounded-xl p-1">
        <div className="flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 text-sm font-medium ${
              activeTab === 'overview'
                ? 'neumorphic-pressed text-blue-600'
                : 'text-gray-600 hover:neumorphic-subtle'
            }`}
          >
            {isRTL ? 'نظرة عامة' : 'Overview'}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 text-sm font-medium ${
              activeTab === 'history'
                ? 'neumorphic-pressed text-blue-600'
                : 'text-gray-600 hover:neumorphic-subtle'
            }`}
          >
            {isRTL ? 'التاريخ' : 'History'}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="neumorphic rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3">
              {isRTL ? 'المعاملات الأخيرة' : 'Recent Transactions'}
            </h3>
            <div className="space-y-3">
              {transactions.slice(0, 3).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <div className="font-medium text-gray-800">{transaction.description}</div>
                      <div className="text-sm text-gray-500">{transaction.date}</div>
                    </div>
                  </div>
                  <div className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="neumorphic rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3">
              {isRTL ? 'سجل المعاملات' : 'Transaction History'}
            </h3>
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <div className="font-medium text-gray-800">{transaction.description}</div>
                      <div className="text-sm text-gray-500">{transaction.date}</div>
                    </div>
                  </div>
                  <div className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top-up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="neumorphic rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              {isRTL ? 'إضافة رصيد' : 'Add Balance'}
            </h3>
            <input
              type="number"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              placeholder={isRTL ? 'أدخل المبلغ' : 'Enter amount'}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowTopUpModal(false)}
                className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleTopUp}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isRTL ? 'تأكيد' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
