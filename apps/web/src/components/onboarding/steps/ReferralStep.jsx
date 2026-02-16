import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/Button';
import { motion } from 'framer-motion';
import onboardingService from '../../../services/onboardingService';

const ReferralStep = ({ config, stepData, onComplete, onBack, onSkip, t }) => {
  const [qrCodeData, setQrCodeData] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);

  const generateReferralCode = React.useCallback(async () => {
    try {
      setLoading(true);

      // Try to get referral code from backend
      try {
        const response = await onboardingService.generateReferralCode();
        if (response.success) {
          setReferralCode(response.referralCode);
        } else {
          throw new Error('Failed to generate referral code from backend');
        }
      } catch (error) {
        console.warn('Backend referral generation failed, using fallback:', error);
        // Fallback to client-side generation
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        setReferralCode(code);
      }

      // Generate QR code
      const qrData = onboardingService.generateQRCodeData(referralCode);
      setQrCodeData(qrData);
    } catch (error) {
      console.error('Error generating referral code:', error);
    } finally {
      setLoading(false);
    }
  }, [referralCode]);

  useEffect(() => {
    generateReferralCode();
  }, [generateReferralCode]);

  const handleShare = (platform) => {
    onboardingService.shareReferral(platform, referralCode);
  };

  const handleSkip = () => {
    onComplete({ skipped: true });
  };

  const handleContinue = () => {
    onComplete({ referralCode, qrCodeData });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-md w-full">
        <motion.div
          variants={itemVariants}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg text-center"
        >
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {config?.referralConfig?.title?.en || t('onboarding.steps.referral.title')}
            </h2>
            <p className="text-gray-600">
              {config?.referralConfig?.subtitle?.en || t('onboarding.steps.referral.subtitle')}
            </p>
          </div>

          {/* QR Code */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg inline-block">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('onboarding.steps.referral.qrCodeTitle')}
              </h3>
              {qrCodeData && (
                <img
                  src={qrCodeData}
                  alt="Referral QR Code"
                  className="w-48 h-48 mx-auto rounded-lg"
                />
              )}
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Your referral code:</p>
                <div className="bg-gray-100 rounded-lg px-4 py-2 font-mono text-lg font-bold text-purple-600">
                  {referralCode}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sharing Options */}
          <motion.div variants={itemVariants} className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('onboarding.steps.referral.incentiveMessage')}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{t('onboarding.steps.referral.ctaShareFriends')}</p>
            <div className="grid grid-cols-2 gap-3">
              {config?.referralConfig?.sharingOptions?.map((option) => (
                option.isEnabled && (
                  <Button
                    key={option.platform}
                    onClick={() => handleShare(option.platform)}
                    variant="outline"
                    className="flex items-center justify-center space-x-2 py-3"
                  >
                    {option.platform === 'whatsapp' && (
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                      </svg>
                    )}
                    {option.platform === 'twitter' && (
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                    )}
                    {option.platform === 'instagram' && (
                      <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z" />
                      </svg>
                    )}
                    {option.platform === 'copy' && (
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                    <span>{t(`onboarding.steps.referral.sharingOptions.${option.platform}`)}</span>
                  </Button>
                )
              ))}
            </div>
          </motion.div>

          {/* Navigation */}
          <motion.div variants={itemVariants} className="flex justify-between">
            <Button
              onClick={onBack}
              variant="outline"
            >
              {t('back')}
            </Button>

            <div className="flex space-x-3">
              <Button
                onClick={handleSkip}
                variant="outline"
              >
                {t('onboarding.steps.referral.skipOption')}
              </Button>
              <Button
                onClick={handleContinue}
                variant="primary"
              >
                {t('continue')}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ReferralStep;
