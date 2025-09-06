import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import onboardingService from '../../services/onboardingService';

const OnboardingContext = createContext();

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export const OnboardingProvider = ({ children }) => {
  const { t, i18n } = useTranslation();
  const { user, login, register } = useAuth();
  const [searchParams] = useSearchParams();
  const [config, setConfig] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [onboardingProgress, setOnboardingProgress] = useState(null);

  useEffect(() => {
    initializeOnboarding();
  }, []);

  // Handle referral code from URL parameters
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setFormData(prev => ({ ...prev, referralCode: refCode }));
    }
    // Adjust-style deep link params (campaign, adgroup, creative, deep_link)
    const campaign = searchParams.get('campaign') || searchParams.get('utm_campaign');
    const adgroup = searchParams.get('adgroup') || searchParams.get('utm_adgroup');
    const creative = searchParams.get('creative') || searchParams.get('utm_content');
    const deepLink = searchParams.get('deep_link') || searchParams.get('deepLink');
    const feature = searchParams.get('feature');
    if (campaign || adgroup || creative || deepLink || feature) {
      setFormData(prev => ({
        ...prev,
        attribution: { campaign, adgroup, creative, feature },
        deepLinkTarget: deepLink || null
      }));
    }
  }, [searchParams]);

  const initializeOnboarding = async () => {
    try {
      setLoading(true);
      setError('');

      // Load onboarding configuration
      const configResponse = await onboardingService.getConfig();
      if (configResponse.success) {
        setConfig(configResponse.config);
      } else {
        throw new Error(configResponse.error || 'Failed to load onboarding configuration');
      }

      // Check if user is authenticated
      if (user) {
        // Load user's onboarding progress
        const progressResponse = await onboardingService.getProgress();
        if (progressResponse.success && progressResponse.progress) {
          setOnboardingProgress(progressResponse.progress);
          setCurrentStep(progressResponse.progress.currentStep || 0);
          setFormData(progressResponse.progress.formData || {});
        }
      }
    } catch (error) {
      console.error('Error initializing onboarding:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (stepData) => {
    setFormData(prev => ({
      ...prev,
      ...stepData
    }));
  };

  const nextStep = async (stepData = {}) => {
    try {
      // Update form data
      if (Object.keys(stepData).length > 0) {
        updateFormData(stepData);
      }

      // Save progress to backend
      if (user) {
        const stepId = config.steps[currentStep]?.stepId;
        if (stepId) {
          await onboardingService.completeStep(stepId, stepData);
        }
      }

      // Move to next step
      if (currentStep < config.steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error moving to next step:', error);
      setError(error.message);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < config.steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  const completeOnboarding = async (finalData = {}) => {
    try {
      setLoading(true);
      setError('');

      if (user) {
        // Complete onboarding in backend
        const result = await onboardingService.completeOnboarding({
          ...formData,
          ...finalData
        });

        if (result.success) {
          setOnboardingProgress({
            completed: true,
            completedAt: new Date().toISOString(),
            ...result.data
          });
          return { success: true };
        } else {
          throw new Error(result.error || 'Failed to complete onboarding');
        }
      } else {
        throw new Error('User not authenticated');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const authenticateWithGoogle = async () => {
    try {
      setLoading(true);
      setError('');

      // Use existing Google authentication from AuthContext
      const result = await login('google');
      if (result.success) {
        // Reset onboarding state for new user
        setCurrentStep(0);
        setFormData({});
        setOnboardingProgress(null);
        return { success: true, user: result.user };
      } else {
        throw new Error(result.error || 'Google authentication failed');
      }
    } catch (error) {
      console.error('Error authenticating with Google:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const authenticateWithEmail = async (email, password, userData = null) => {
    try {
      setLoading(true);
      setError('');

      let result;
      if (userData) {
        // Register new user
        result = await register({
          email,
          password,
          firstName: userData.firstName,
          lastName: userData.lastName
        });
      } else {
        // Login existing user
        result = await login('email', { email, password });
      }

      if (result.success) {
        // Reset onboarding state for new user
        setCurrentStep(0);
        setFormData({});
        setOnboardingProgress(null);
        return { success: true, user: result.user };
      } else {
        throw new Error(result.error || 'Email authentication failed');
      }
    } catch (error) {
      console.error('Error authenticating with email:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepConfig = () => {
    if (!config || !config.steps || currentStep >= config.steps.length) {
      return null;
    }
    return config.steps[currentStep];
  };

  const isStepCompleted = (stepId) => {
    if (!onboardingProgress || !onboardingProgress.completedSteps) {
      return false;
    }
    return onboardingProgress.completedSteps.includes(stepId);
  };

  const getProgressPercentage = () => {
    if (!config || !config.steps) {
      return 0;
    }
    return Math.round((currentStep / config.steps.length) * 100);
  };

  const value = {
    // State
    config,
    currentStep,
    formData,
    loading,
    error,
    user,
    onboardingProgress,
    
    // Actions
    nextStep,
    previousStep,
    goToStep,
    completeOnboarding,
    updateFormData,
    authenticateWithGoogle,
    authenticateWithEmail,
    
    // Utilities
    getCurrentStepConfig,
    isStepCompleted,
    getProgressPercentage,
    
    // Translation
    t,
    i18n
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};
