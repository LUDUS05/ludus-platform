import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from './OnboardingProvider';
import { Globe } from 'lucide-react';
import { SelenaChatButton } from './SelenaChat';

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

  // Get current step name for display
  const getCurrentStepName = () => {
    if (!config?.steps || !config.steps[currentStep]) {
      return t('common.loading');
    }
    
    const stepId = config.steps[currentStep].stepId;
    const stepNames = {
      welcome: t('onboarding.steps.welcome.title'),
      socialProof: t('onboarding.steps.socialProof.title'),
      auth: t('onboarding.steps.auth.title'),
      profile: t('onboarding.steps.profile.title'),
      referral: t('onboarding.steps.referral.title'),
      interests: t('onboarding.steps.interests.title'),
      preferences: t('onboarding.steps.preferences.title')
    };
    
    return stepNames[stepId] || t('common.loading');
  };

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

      {/* Progress indicator with navigation */}
      {config.steps && config.steps.length > 1 && (
        <div className="max-w-md mx-auto px-4 pb-4">
          <div className="neumorphic rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-600">
                  {getCurrentStepName()}
                </span>
                <span className="text-xs text-gray-500">
                  {t('onboarding.progress', { current: currentStep + 1, total: config.steps.length })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Previous step arrow */}
                {currentStep > 0 && (
                  <button
                    onClick={previousStep}
                    className="neumorphic-subtle hover:neumorphic-pressed p-2 rounded-lg transition-all duration-200"
                    title={t('common.previous')}
                  >
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                {/* Next step arrow */}
                {currentStep < config.steps.length - 1 && (
                  <button
                    onClick={nextStep}
                    className="neumorphic-subtle hover:neumorphic-pressed p-2 rounded-lg transition-all duration-200"
                    title={t('common.next')}
                  >
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
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
      
      {/* Selena Chat Assistant */}
      <SelenaChatButton 
        currentStep={config?.steps?.[currentStep]?.stepId}
        className="onboarding-chat-button"
      />
    </div>
  );
};

export default OnboardingFlow;
