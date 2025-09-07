import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from './OnboardingProvider';
import { Globe } from 'lucide-react';

// Import step components
import WelcomeStep from './steps/WelcomeStep';
import AuthStep from './steps/AuthStep';
import ProfileStep from './steps/ProfileStep';
import ReferralStep from './steps/ReferralStep';
import InterestsStep from './steps/InterestsStep';
import PreferencesStep from './steps/PreferencesStep';
import SuccessStep from './steps/SuccessStep';
import SocialProofStep from './steps/SocialProofStep';

// Import UI components
import { Button } from '../ui/Button';
import Alert from '../ui/Alert';
import LoadingSpinner from '../ui/LoadingSpinner';

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const {
    config,
    currentStep,
    formData,
    loading,
    error,
    user,
    nextStep,
    previousStep,
    completeOnboarding,
    getCurrentStepConfig,
    getProgressPercentage,
    t: onboardingT
  } = useOnboarding();

  // Set Arabic as default language on component mount
  useEffect(() => {
    if (i18n.language !== 'ar') {
      i18n.changeLanguage('ar');
    }
  }, [i18n]);

  // Language switcher
  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const getCurrentLanguageText = () => {
    return i18n.language === 'ar' ? 'English' : 'العربية';
  };

  // Handle step completion
  const handleStepComplete = async (stepId, data) => {
    await nextStep(data);
  };

  // Handle success step completion
  const handleSuccessComplete = () => {
    navigate('/dashboard');
  };

  // Render current step
  const renderCurrentStep = () => {
    const currentStepConfig = getCurrentStepConfig();
    
    if (!currentStepConfig) {
      return null;
    }

    const stepId = currentStepConfig.stepId;
    const commonProps = {
      config: currentStepConfig,
      stepData: formData[stepId] || {},
      onComplete: (data) => handleStepComplete(stepId, data),
      onNext: nextStep,
      onBack: previousStep,
      onSkip: () => nextStep(),
      t
    };

    switch (stepId) {
      case 'welcome':
        return <WelcomeStep {...commonProps} />;
      case 'socialProof':
        return <SocialProofStep {...commonProps} />;
      case 'auth':
        return <AuthStep {...commonProps} />;
      case 'profile':
        return <ProfileStep {...commonProps} />;
      case 'referral':
        return <ReferralStep {...commonProps} />;
      case 'interests':
        return <InterestsStep {...commonProps} />;
      case 'preferences':
        return <PreferencesStep {...commonProps} />;
      default:
        return null;
    }
  };

  // Show success step if onboarding is completed
  if (currentStep >= config?.steps.length) {
    return (
      <SuccessStep
        onComplete={handleSuccessComplete}
        t={t}
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#e0e0e0]" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} lang={i18n.language}>
        <style>
          {`
            .neumorphic {
              box-shadow: 8px 8px 16px #bebebe, -8px -8px 16px #ffffff;
              background-color: #e0e0e0;
            }
            .neumorphic-pressed {
              box-shadow: inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff;
            }
            .neumorphic-subtle {
              box-shadow: 4px 4px 8px #bebebe, -4px -4px 8px #ffffff;
              background-color: #e0e0e0;
            }
          `}
        </style>

        {/* Language Switcher */}
        <div className="max-w-md mx-auto px-4 pt-6 pb-4">
          <div className="neumorphic rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-700" />
              <span className="text-sm text-gray-700 font-medium">
                {t('auth.language')}
              </span>
            </div>
            <button
              onClick={toggleLanguage}
              className="neumorphic-subtle hover:neumorphic-pressed px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium text-gray-700"
            >
              {getCurrentLanguageText()}
            </button>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 pb-24">
          <div className="neumorphic rounded-2xl p-8 text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#e0e0e0]" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} lang={i18n.language}>
        <style>
          {`
            .neumorphic {
              box-shadow: 8px 8px 16px #bebebe, -8px -8px 16px #ffffff;
              background-color: #e0e0e0;
            }
            .neumorphic-pressed {
              box-shadow: inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff;
            }
            .neumorphic-subtle {
              box-shadow: 4px 4px 8px #bebebe, -4px -4px 8px #ffffff;
              background-color: #e0e0e0;
            }
          `}
        </style>

        {/* Language Switcher */}
        <div className="max-w-md mx-auto px-4 pt-6 pb-4">
          <div className="neumorphic rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-700" />
              <span className="text-sm text-gray-700 font-medium">
                {t('auth.language')}
              </span>
            </div>
            <button
              onClick={toggleLanguage}
              className="neumorphic-subtle hover:neumorphic-pressed px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium text-gray-700"
            >
              {getCurrentLanguageText()}
            </button>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 pb-24">
          <div className="neumorphic rounded-2xl p-8">
            <Alert type="error" message={error} />
            <div className="mt-4 text-center">
              <button
                onClick={() => window.location.reload()}
                className="neumorphic-subtle hover:neumorphic-pressed w-full py-3 px-6 rounded-xl text-lg font-medium text-gray-700 transition-all duration-200"
              >
                {t('common.tryAgain')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No config available
  if (!config || !config.isEnabled) {
    return (
      <div className="min-h-screen bg-[#e0e0e0]" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} lang={i18n.language}>
        <style>
          {`
            .neumorphic {
              box-shadow: 8px 8px 16px #bebebe, -8px -8px 16px #ffffff;
              background-color: #e0e0e0;
            }
            .neumorphic-pressed {
              box-shadow: inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff;
            }
            .neumorphic-subtle {
              box-shadow: 4px 4px 8px #bebebe, -4px -4px 8px #ffffff;
              background-color: #e0e0e0;
            }
          `}
        </style>

        {/* Language Switcher */}
        <div className="max-w-md mx-auto px-4 pt-6 pb-4">
          <div className="neumorphic rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-700" />
              <span className="text-sm text-gray-700 font-medium">
                {t('auth.language')}
              </span>
            </div>
            <button
              onClick={toggleLanguage}
              className="neumorphic-subtle hover:neumorphic-pressed px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium text-gray-700"
            >
              {getCurrentLanguageText()}
            </button>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 pb-24">
          <div className="neumorphic rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              {t('onboarding.title')}
            </h1>
            <p className="text-gray-600 mb-6">
              {t('onboarding.subtitle')}
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="neumorphic-subtle hover:neumorphic-pressed w-full py-3 px-6 rounded-xl text-lg font-medium text-gray-700 transition-all duration-200"
            >
              {t('common.getStarted')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e0e0e0]" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} lang={i18n.language}>
      <style>
        {`
          .neumorphic {
            box-shadow: 8px 8px 16px #bebebe, -8px -8px 16px #ffffff;
            background-color: #e0e0e0;
          }
          .neumorphic-pressed {
            box-shadow: inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff;
          }
          .neumorphic-subtle {
            box-shadow: 4px 4px 8px #bebebe, -4px -4px 8px #ffffff;
            background-color: #e0e0e0;
          }
        `}
      </style>

      {/* Language Switcher */}
      <div className="max-w-md mx-auto px-4 pt-6 pb-4">
        <div className="neumorphic rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-700" />
            <span className="text-sm text-gray-700 font-medium">
              {t('auth.language')}
            </span>
          </div>
          <button
            onClick={toggleLanguage}
            className="neumorphic-subtle hover:neumorphic-pressed px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium text-gray-700"
          >
            {getCurrentLanguageText()}
          </button>
        </div>
      </div>

      {/* Progress indicator */}
      {config.steps && config.steps.length > 1 && (
        <div className="max-w-md mx-auto px-4 pb-4">
          <div className="neumorphic rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                {t('progress', { current: currentStep + 1, total: config.steps.length })}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${getProgressPercentage()}%`
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-md mx-auto px-4 pb-24">
        {renderCurrentStep()}
      </div>

      {/* Error display */}
      {error && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <div className="max-w-md mx-auto">
            <Alert type="error" message={error} />
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingFlow;
