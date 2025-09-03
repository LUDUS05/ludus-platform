import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import referralService from '../services/referralService';
import { Users, DollarSign, Share2, QrCode, Copy, Check, TrendingUp } from 'lucide-react';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [referralStats, setReferralStats] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
      
      // Load referral stats
      loadReferralStats();
    }
  }, [user]);

  const loadReferralStats = async () => {
    try {
      const response = await referralService.getReferralStats(user.id || user._id);
      setReferralStats(response.data);
    } catch (error) {
      console.error('Error loading referral stats:', error);
      // Don't show error for referral stats
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      await updateProfile(formData);
      setMessage(t('profile.profileUpdated'));
    } catch (error) {
      setError(error.response?.data?.message || t('profile.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = async () => {
    if (!referralStats?.referralCode) return;

    try {
      const result = await referralService.shareReferralLink(referralStats.referralCode, 'copy');
      if (result.success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      setError('Failed to copy referral link');
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto container-padding">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">{t('navigation.profile')}</h1>
            <p className="text-gray-600 mt-1">{t('profile.manageAccount')}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            {message && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700">{message}</p>
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700">{error}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.firstName')}
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.lastName')}
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.phone')}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="+966 XX XXX XXXX"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </form>

          {/* Referral Section */}
          {referralStats && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Referral Program</h2>
                <Link
                  to="/referrals"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Full Dashboard →
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatNumber(referralStats.totalReferrals || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Referrals</div>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(referralStats.totalEarnings || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Earnings</div>
                </div>
                
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {referralStats.referralCode || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Your Code</div>
                </div>
              </div>

              {referralStats.referralCode && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Share2 className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-800">Referral Link</div>
                        <div className="text-sm text-gray-500 font-mono">
                          {referralService.generateReferralLink(referralStats.referralCode)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={copyReferralLink}
                      className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Copy referral link"
                    >
                      {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-gray-600" />}
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowQRModal(true)}
                      className="flex-1 flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <QrCode className="h-4 w-4" />
                      View QR Code
                    </button>
                    <Link
                      to="/referrals"
                      className="flex-1 flex items-center justify-center gap-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <TrendingUp className="h-4 w-4" />
                      Manage Referrals
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && referralStats?.referralCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Referral QR Code</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center">
              <img 
                src={referralService.generateQRCode(referralStats.referralCode)} 
                alt="Referral QR Code" 
                className="mx-auto mb-4 rounded-lg"
              />
              <p className="text-sm text-gray-600 mb-3">
                Share this QR code with friends to earn rewards
              </p>
              <button
                onClick={() => referralService.downloadQRCode(referralStats.referralCode)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Download QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;