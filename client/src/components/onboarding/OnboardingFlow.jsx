import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from './OnboardingProvider';

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
    t
  } = useOnboarding();

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-md w-full mx-4">
          <Alert type="error" message={error} />
          <div className="mt-4 text-center">
            <Button onClick={() => window.location.reload()} variant="primary">
              {t('common.tryAgain')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No config available
  if (!config || !config.isEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('onboarding.title')}
          </h1>
          <p className="text-gray-600 mb-6">
            {t('onboarding.subtitle')}
          </p>
          <Button onClick={() => navigate('/dashboard')} variant="primary">
            {t('common.getStarted')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Progress indicator */}
      {config.steps && config.steps.length > 1 && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-600">
                  {t('progress', { current: currentStep + 1, total: config.steps.length })}
                </span>
              </div>
              <div className="flex-1 max-w-xs">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: `${getProgressPercentage()}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="pt-16">
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
