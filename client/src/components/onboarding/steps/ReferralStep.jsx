import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/Button';
import { motion } from 'framer-motion';
import onboardingService from '../../../services/onboardingService';
import { 
  FaWhatsapp, 
  FaTwitter, 
  FaInstagram, 
  FaCopy 
} from 'react-icons/fa';

const ReferralStep = ({ config, stepData, onComplete, onBack, onSkip, t }) => {
  const [qrCodeData, setQrCodeData] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateReferralCode();
  }, []);

  const generateReferralCode = async () => {
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
  };

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
                      <FaWhatsapp className="w-5 h-5 text-green-600" />
                    )}
                    {option.platform === 'twitter' && (
                      <FaTwitter className="w-5 h-5 text-blue-600" />
                    )}
                    {option.platform === 'instagram' && (
                      <FaInstagram className="w-5 h-5 text-pink-600" />
                    )}
                    {option.platform === 'copy' && (
                      <FaCopy className="w-5 h-5 text-gray-700" />
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
