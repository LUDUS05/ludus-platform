import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, ArrowRight, Check } from 'lucide-react';
import Logo from '../components/common/Logo';

const OnboardTestPage = () => {
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(-1); // Start with welcome screen
  const [isAnimating, setIsAnimating] = useState(false);

  // Language switcher
  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const getCurrentLanguageText = () => {
    return i18n.language === 'ar' ? 'English' : 'العربية';
  };

  const handleNext = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
      setIsAnimating(false);
    }, 150);
  };

  const handleBack = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => prev - 1);
      setIsAnimating(false);
    }, 150);
  };

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
          .text-neumorphic {
            color: #2d3748;
            text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
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

      <div className="max-w-md mx-auto pb-24 px-4">
        {/* Welcome Screen */}
        {currentStep === -1 && (
          <div className="neumorphic rounded-2xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <Logo className="h-20 w-auto" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {t('onboard.test.title', 'Onboarding Test')}
            </h1>
            <p className="text-gray-600 mb-8">
              {t('onboard.test.subtitle', 'Minimal pre-launch onboarding entry using existing layout')}
            </p>
            
            <button
              onClick={handleNext}
              className="neumorphic-subtle hover:neumorphic-pressed w-full py-3 px-6 rounded-xl text-lg font-medium text-gray-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {t('onboard.test.getStarted', 'Get Started')}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Options Screen */}
        {currentStep === 0 && (
          <div className={`neumorphic rounded-2xl p-8 transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {t('onboard.test.chooseOption', 'Choose an Option')}
            </h2>
            
            <div className="space-y-4">
              <Link 
                to="/onboarding" 
                className="neumorphic-subtle hover:neumorphic-pressed w-full py-3 px-6 rounded-xl text-lg font-medium text-gray-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                {t('onboard.test.goToOnboarding', 'Go to Onboarding Flow')}
              </Link>

              <Link 
                to="/register" 
                className="neumorphic-subtle hover:neumorphic-pressed w-full py-3 px-6 rounded-xl text-lg font-medium text-gray-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                {t('onboard.test.registerEmail', 'Register (Email)')}
              </Link>

              <Link 
                to="/neo/home" 
                className="neumorphic-subtle hover:neumorphic-pressed w-full py-3 px-6 rounded-xl text-lg font-medium text-gray-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                {t('onboard.test.neoHome', 'Neo Home')}
              </Link>
            </div>

            <div className="mt-8 text-sm text-gray-500">
              <p className="font-medium mb-2">{t('onboard.test.tips', 'Tips:')}</p>
              <ul className="list-disc ml-5 space-y-1">
                <li>{t('onboard.test.tip1', 'Use Incognito to test a fresh user flow')}</li>
                <li>{t('onboard.test.tip2', 'Profile/Interests can be skipped via "Complete Later"')}</li>
              </ul>
            </div>

            <button
              onClick={handleBack}
              className="mt-6 w-full py-2 px-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {t('common.back', 'Back')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardTestPage;


