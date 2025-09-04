import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { motion } from 'framer-motion';
import { useOnboarding } from '../OnboardingProvider';

const AuthStep = ({ config, onComplete, onNext, t }) => {
  const { authenticateWithGoogle, authenticateWithEmail, loading, error } = useOnboarding();
  const [authMethod, setAuthMethod] = useState(null);
  const [emailData, setEmailData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const handleGoogleAuth = async () => {
    const result = await authenticateWithGoogle();
    if (result.success) {
      onComplete({ method: 'google', user: result.user });
    }
  };

  const handleEmailAuth = () => {
    setAuthMethod('email');
  };

  const handleEmailSignUp = async () => {
    const result = await authenticateWithEmail(
      emailData.email, 
      emailData.password, 
      {
        firstName: emailData.firstName,
        lastName: emailData.lastName
      }
    );
    if (result.success) {
      onComplete({ method: 'email', user: result.user });
    }
  };

  const handleEmailSignIn = async () => {
    const result = await authenticateWithEmail(emailData.email, emailData.password);
    if (result.success) {
      onComplete({ method: 'email', user: result.user });
    }
  };

  const handleBack = () => {
    setAuthMethod(null);
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

  if (authMethod === 'email') {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center px-4"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-md w-full">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('onboarding.steps.auth.createAccount')}
              </h2>
              <p className="text-gray-600">
                {t('onboarding.steps.auth.emailSubtitle')}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder={t('onboarding.steps.auth.firstName')}
                  value={emailData.firstName}
                  onChange={(e) => setEmailData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder={t('onboarding.steps.auth.lastName')}
                  value={emailData.lastName}
                  onChange={(e) => setEmailData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <input
                type="email"
                placeholder={t('onboarding.steps.auth.email')}
                value={emailData.email}
                onChange={(e) => setEmailData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              
              <input
                type="password"
                placeholder={t('onboarding.steps.auth.password')}
                value={emailData.password}
                onChange={(e) => setEmailData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />

              <Button
                onClick={handleEmailSignUp}
                disabled={loading || !emailData.email || !emailData.password || !emailData.firstName || !emailData.lastName}
                variant="primary"
                className="w-full py-3"
              >
                {loading ? t('common.loading') : t('onboarding.steps.auth.createAccount')}
              </Button>

              <Button
                onClick={handleBack}
                variant="outline"
                className="w-full"
              >
                {t('back')}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {t('onboarding.steps.auth.alreadyHaveAccount')}{' '}
                  <button
                    onClick={handleEmailSignIn}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    {t('onboarding.steps.auth.signInHere')}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
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
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {config?.authConfig?.title?.en || t('onboarding.steps.auth.title')}
            </h2>
            <p className="text-gray-600">
              {config?.authConfig?.subtitle?.en || t('onboarding.steps.auth.subtitle')}
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Auth Options */}
          <div className="space-y-4">
            {/* Google Auth */}
            {config?.authConfig?.allowGoogleAuth !== false && (
              <motion.div variants={itemVariants}>
                <Button
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-3 py-3 border-2 hover:border-gray-300"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>
                    {loading ? t('common.loading') : t('onboarding.steps.auth.continueWithGoogle')}
                  </span>
                </Button>
              </motion.div>
            )}

            {/* Divider */}
            <motion.div variants={itemVariants} className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-700">{t('common.or')}</span>
              </div>
            </motion.div>

            {/* Email Auth */}
            {config?.authConfig?.allowEmailAuth !== false && (
              <motion.div variants={itemVariants}>
                <Button
                  onClick={handleEmailAuth}
                  variant="primary"
                  className="w-full py-3"
                >
                  {t('onboarding.steps.auth.createAccount')}
                </Button>
              </motion.div>
            )}
          </div>

          {/* Social Proof */}
          {config?.authConfig?.socialProof && (
            <motion.div variants={itemVariants} className="mt-6 text-center">
              <p className="text-sm text-gray-700">
                {config.authConfig.socialProof.en}
              </p>
            </motion.div>
          )}

          {/* Sign In Link */}
          <motion.div variants={itemVariants} className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('onboarding.steps.auth.alreadyHaveAccount')}{' '}
              <button
                onClick={() => onNext()}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                {t('onboarding.steps.auth.signInHere')}
              </button>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AuthStep;
