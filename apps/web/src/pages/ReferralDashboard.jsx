import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import referralService from '../services/referralService';
import { Card } from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import ReferralSocialShare from '../components/referral/ReferralSocialShare';
import { 
  Users, 
  DollarSign, 
  Share2, 
  QrCode, 
  Download, 
  Copy, 
  Check,
  TrendingUp,
  Award,
  Activity,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

const ReferralDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [referralStats, setReferralStats] = useState(null);
  const [referralHistory, setReferralHistory] = useState([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState(null);

  useEffect(() => {
    if (user) {
      loadReferralData();
    }
  }, [user]);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load referral stats and history in parallel
      const [statsResponse, historyResponse] = await Promise.all([
        referralService.getReferralStats(user.id || user._id),
        referralService.getReferralHistory(user.id || user._id, 1, 10)
      ]);

      setReferralStats(statsResponse.data);
      setReferralHistory(historyResponse.data.referrals || []);

      // Generate QR code data URL if referral code exists
      if (statsResponse.data?.referralCode) {
        try {
          const qrDataURL = await referralService.generateQRCodeDataURL(statsResponse.data.referralCode);
          setQrCodeDataURL(qrDataURL);
        } catch (error) {
          console.error('Error generating QR code data URL:', error);
          // Fallback to direct URL
          setQrCodeDataURL(referralService.generateQRCode(statsResponse.data.referralCode));
        }
      }

    } catch (error) {
      console.error('Error loading referral data:', error);
      setError(error.message || t('referral.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = async () => {
    try {
      setLoading(true);
      const response = await referralService.generateReferralCode();
      if (response.success) {
        // Refresh data to get the new code
        await loadReferralData();
      }
    } catch (error) {
      setError(error.message || 'Failed to generate referral code');
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

  const downloadQRCode = () => {
    if (!referralStats?.referralCode) return;
    
    const filename = `referral-qr-${referralStats.referralCode}.png`;
    referralService.downloadQRCode(referralStats.referralCode, filename);
  };

  const shareOnPlatform = async (platform) => {
    if (!referralStats?.referralCode) return;

    try {
      setSharing(true);
      await referralService.shareReferralLink(referralStats.referralCode, platform);
    } catch (error) {
      setError(`Failed to share on ${platform}`);
    } finally {
      setSharing(false);
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('referral.title')}</h1>
        <p className="text-gray-600">{t('common.shareLudusWithFriends')}</p>
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
              <p className="text-sm font-medium text-gray-600">{t('referral.totalReferrals')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(referralStats?.totalReferrals || 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('referral.totalEarnings')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(referralStats?.totalEarnings || 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Referrals</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(referralStats?.activeReferrals || 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('referral.pendingRewards')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(referralStats?.pendingRewards || 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Referral Code & Sharing */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{t('referral.yourReferralCode')}</h2>
            <button
              onClick={loadReferralData}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {referralStats?.referralCode ? (
            <div className="space-y-4">
              {/* Referral Code Display */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🎁</div>
                  <div>
                    <div className="font-medium text-gray-800">{t('referral.referralCode')}</div>
                    <div className="text-sm text-gray-500 font-mono">{referralStats.referralCode}</div>
                  </div>
                </div>
                <button
                  onClick={copyReferralLink}
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                  title={t('referral.copyReferralLink')}
                >
                  {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-gray-600" />}
                </button>
              </div>

              {/* Referral Link */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-gray-800 mb-2">Your Referral Link</div>
                <div className="text-sm text-gray-600 font-mono break-all">
                  {referralService.generateReferralLink(referralStats.referralCode)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowQRModal(true)}
                  className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <QrCode className="h-4 w-4" />
                  View QR Code
                </button>
                <button
                  onClick={downloadQRCode}
                  className="flex items-center justify-center gap-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download QR
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎁</div>
              <p className="text-gray-600 mb-4">You don't have a referral code yet</p>
              <button
                onClick={generateReferralCode}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('referral.generateReferralCode')}
              </button>
            </div>
          )}
        </Card>

        {/* Social Sharing */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('referral.shareAndEarn')}</h2>
          
          <ReferralSocialShare 
            referralCode={referralStats?.referralCode}
            referralLink={referralStats?.referralLink}
            disabled={sharing}
          />
        </Card>
      </div>

      {/* Referral History */}
      <Card className="p-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{t('referral.referralHistory')}</h2>
          <button
            onClick={loadReferralData}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Refresh
          </button>
        </div>

        {referralHistory.length > 0 ? (
          <div className="space-y-4">
            {referralHistory.map((referral) => (
              <div key={referral._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {referral.referredUserId?.firstName} {referral.referredUserId?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{referral.referredUserId?.email}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      referral.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {referral.status}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    {formatCurrency(referral.rewardAmount)}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {referral.rewardType}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>{t('referral.noReferralsYet')}</p>
          </div>
        )}
      </Card>

      {/* How It Works */}
      <Card className="p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('referral.howReferralsWork')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">1️⃣</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">{t('referral.shareYourLink')}</h3>
            <p className="text-sm text-gray-600">
              {t('referral.shareYourLinkDesc')}
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">2️⃣</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">{t('referral.friendsJoin')}</h3>
            <p className="text-sm text-gray-600">
              {t('referral.friendsJoinDesc')}
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">3️⃣</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">{t('referral.earnMore')}</h3>
            <p className="text-sm text-gray-600">
              {t('referral.earnMoreDesc')}
            </p>
          </div>
        </div>
      </Card>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('common.yourReferralQRCode')}</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center">
              {qrCodeDataURL ? (
                <img 
                  src={qrCodeDataURL} 
                  alt={t('common.referralQRCode')} 
                  className="mx-auto mb-4 rounded-lg"
                  onError={(e) => {
                    console.error('QR code image failed to load:', e);
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <div className="text-gray-400">{t('referral.loadingQRCode')}</div>
                </div>
              )}
              <p className="text-sm text-gray-600 mb-3">
                {t('referral.shareQRCodeWithFriends')}
              </p>
              <button
                onClick={downloadQRCode}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('referral.downloadQRCode')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralDashboard;
