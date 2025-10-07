import Alert from "../ui/Alert";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Card } from '../ui/Card';

import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Download,
  RefreshCw,
  Crown,
  Award,
  Activity
} from 'lucide-react';

const ReferralManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [referralStats, setReferralStats] = useState(null);
  const [topInviters, setTopInviters] = useState([]);
  const [rewards, setRewards] = useState({});
  const [editingRewards, setEditingRewards] = useState(false);
  const [rewardForm, setRewardForm] = useState({
    registration: 50,
    firstBooking: 100
  });

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all referral data in parallel
      const [statsResponse, invitersResponse, rewardsResponse] = await Promise.all([
        api.get('/admin/referrals/stats'),
        api.get('/admin/referrals/top-inviters'),
        api.get('/admin/referrals/rewards')
      ]);

      setReferralStats(statsResponse.data.data);
      setTopInviters(invitersResponse.data.data);
      setRewards(rewardsResponse.data.data);
      
      // Initialize form with current reward values
      setRewardForm({
        registration: rewardsResponse.data.data.registration?.amount || 50,
        firstBooking: rewardsResponse.data.data.firstBooking?.amount || 100
      });

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load referral data';
      setError(errorMessage);
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRewardUpdate = async () => {
    try {
      setLoading(true);
      
      const response = await api.put('/admin/referrals/rewards', {
        registration: { amount: parseInt(rewardForm.registration) },
        firstBooking: { amount: parseInt(rewardForm.firstBooking) }
      });

      if (response.data.success) {
        setRewards(response.data.data);
        setEditingRewards(false);
        // Refresh data
        fetchReferralData();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update rewards';
      setError(errorMessage);
      console.error('Error updating rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReferralData = async () => {
    try {
      const response = await api.get('/admin/referrals/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `referral-data-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export referral data');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ar-SA').format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Referral System Management</h1>
        <p className="text-gray-600">Monitor and control the platform's referral program</p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Referrals</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(referralStats?.totalReferrals || 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Referrers</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(referralStats?.activeReferrers || 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Rewards Paid</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(referralStats?.totalRewardsPaid || 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {referralStats?.conversionRate ? `${referralStats.conversionRate.toFixed(1)}%` : '0%'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Inviters Leaderboard */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Crown className="h-5 w-5 text-yellow-500 mr-2" />
              Top Inviters
            </h2>
            <button
              onClick={fetchReferralData}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {topInviters.length > 0 ? (
              topInviters.map((inviter, index) => (
                <div key={inviter._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mr-3">
                      {index === 0 && <Crown className="h-4 w-4 text-yellow-500" />}
                      {index === 1 && <Award className="h-4 w-4 text-gray-500" />}
                      {index === 2 && <Award className="h-4 w-4 text-orange-500" />}
                      {index > 2 && <span className="text-sm font-medium text-gray-600">{index + 1}</span>}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {inviter.firstName} {inviter.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{inviter.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{inviter.totalReferrals} referrals</p>
                    <p className="text-sm text-green-600">
                      {formatCurrency(inviter.totalEarnings)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No referral data available yet</p>
              </div>
            )}
          </div>
        </Card>

        {/* Reward Management */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Settings className="h-5 w-5 text-gray-500 mr-2" />
              Reward Settings
            </h2>
            {!editingRewards && (
              <button
                onClick={() => setEditingRewards(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Rewards
              </button>
            )}
          </div>

          {editingRewards ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Reward (SAR)
                </label>
                <input
                  type="number"
                  value={rewardForm.registration}
                  onChange={(e) => setRewardForm(prev => ({ ...prev, registration: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Booking Reward (SAR)
                </label>
                <input
                  type="number"
                  value={rewardForm.firstBooking}
                  onChange={(e) => setRewardForm(prev => ({ ...prev, firstBooking: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="1"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleRewardUpdate}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingRewards(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Registration Reward</p>
                    <p className="text-sm text-gray-500">When new user registers with referral</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(rewards.registration?.amount || 0)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">First Booking Reward</p>
                    <p className="text-sm text-gray-500">When referred user makes first booking</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(rewards.firstBooking?.amount || 0)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Analytics Charts Section */}
      <Card className="p-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Referral Analytics</h2>
          <button
            onClick={exportReferralData}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Monthly Referrals</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(referralStats?.monthlyReferrals || 0)}
            </p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Average Referrals per User</p>
            <p className="text-2xl font-bold text-gray-900">
              {referralStats?.avgReferralsPerUser ? referralStats.avgReferralsPerUser.toFixed(1) : '0'}
            </p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Total Active Referral Codes</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(referralStats?.activeReferralCodes || 0)}
            </p>
          </div>
        </div>

        {/* Placeholder for future charts */}
        <div className="mt-6 p-8 bg-gray-50 rounded-lg text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Advanced analytics charts coming soon</p>
          <p className="text-sm text-gray-400">Referral trends, conversion funnels, and performance metrics</p>
        </div>
      </Card>
    </div>
  );
};

export default ReferralManagement;
