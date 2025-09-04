import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import referralService from '../services/referralService';
import { Globe, ArrowLeft, ArrowRight, Check, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/common/Logo';

const UserRegistrationPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    referralCode: ''
  });
  
  // Conversational flow state
  const [currentStep, setCurrentStep] = useState(-1); // Start with welcome screen
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  
  // Form state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Refs
  const inputRef = useRef(null);
  const termsModalRef = useRef(null);
  
  // Language switcher
  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const getCurrentLanguageText = () => {
    return i18n.language === 'ar' ? 'English' : 'العربية';
  };
  
  // Conversational questions configuration - moved inside useMemo to fix translation issues
  const conversationSteps = useMemo(() => [
    {
      key: 'firstName',
      question: t('user.registration.questions.firstName.question'),
      placeholder: t('user.registration.questions.firstName.placeholder'),
      type: 'text',
      required: true,
      buttonText: t('user.registration.questions.firstName.buttonText')
    },
    {
      key: 'lastName',
      question: t('user.registration.questions.lastName.question', { name: formData.firstName || '' }),
      placeholder: t('user.registration.questions.lastName.placeholder'),
      type: 'text',
      required: true,
      buttonText: t('user.registration.questions.lastName.buttonText')
    },
    {
      key: 'email',
      question: t('user.registration.questions.email.question', { name: formData.firstName || '' }),
      placeholder: t('user.registration.questions.email.placeholder'),
      type: 'email',
      required: true,
      buttonText: t('user.registration.questions.email.buttonText')
    },
    {
      key: 'password',
      question: t('user.registration.questions.password.question'),
      placeholder: t('user.registration.questions.password.placeholder'),
      type: 'password',
      required: true,
      buttonText: t('user.registration.questions.password.buttonText')
    },
    {
      key: 'confirmPassword',
      question: t('user.registration.questions.confirmPassword.question'),
      placeholder: t('user.registration.questions.confirmPassword.placeholder'),
      type: 'password',
      required: true,
      buttonText: t('user.registration.questions.confirmPassword.buttonText')
    },
    {
      key: 'phone',
      question: t('user.registration.questions.phone.question'),
      placeholder: t('user.registration.questions.phone.placeholder'),
      type: 'tel',
      required: false,
      buttonText: t('user.registration.questions.phone.buttonText')
    },
    {
      key: 'dateOfBirth',
      question: t('user.registration.questions.dateOfBirth.question'),
      placeholder: t('user.registration.questions.dateOfBirth.placeholder'),
      type: 'date',
      required: false,
      buttonText: t('user.registration.questions.dateOfBirth.buttonText')
    }
  ], [t, formData.firstName]);

  // Check for referral code in URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setFormData(prev => ({ ...prev, referralCode: refCode }));
    }
  }, [searchParams]);

  const getCurrentQuestion = () => {
    if (currentStep < 0 || currentStep >= conversationSteps.length) return null;
    return conversationSteps[currentStep];
  };

  const getPersonalizedQuestion = (step) => {
    const questionData = conversationSteps[step];
    if (!questionData) return '';
    
    const { question } = questionData;
    if (typeof question === 'function') {
      return question(formData.firstName);
    }
    return question;
  };

  const getCurrentValue = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return '';
    return formData[currentQuestion.key] || '';
  };

  const handleInputChange = (e) => {
    const { value } = e.target;
    const currentQuestion = getCurrentQuestion();
    if (currentQuestion) {
      setFormData(prev => ({
        ...prev,
        [currentQuestion.key]: value
      }));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNext();
    }
  };

  const validateCurrentStep = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return true;
    
    const value = formData[currentQuestion.key];
    if (currentQuestion.required && !value) {
      setErrors({ current: t('user.registration.validation.required') });
      return false;
    }
    
    // Email validation
    if (currentQuestion.key === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setErrors({ current: t('user.registration.validation.invalidEmail') });
        return false;
      }
    }
    
    // Password validation
    if (currentQuestion.key === 'password' && value) {
      if (value.length < 8) {
        setErrors({ current: t('user.registration.validation.passwordTooShort') });
        return false;
      }
    }
    
    // Confirm password validation
    if (currentQuestion.key === 'confirmPassword' && value) {
      if (value !== formData.password) {
        setErrors({ current: t('user.registration.validation.passwordMismatch') });
        return false;
      }
    }
    
    // Phone validation
    if (currentQuestion.key === 'phone' && value) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
      if (!phoneRegex.test(value)) {
        setErrors({ current: t('user.registration.validation.invalidPhone') });
        return false;
      }
    }
    
    setErrors({});
    return true;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) return;
    
    if (currentStep === conversationSteps.length - 1) {
      // Last step - show terms
      setCurrentStep(conversationSteps.length);
      return;
    }
    
    if (currentStep === conversationSteps.length) {
      // Terms step - submit form
      if (!acceptTerms) {
        setErrors({ current: t('user.registration.validation.termsRequired') });
        return;
      }
      
      await handleSubmit();
      return;
    }
    
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
      setIsAnimating(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 300);
  };

  const handleBack = () => {
    if (currentStep > -1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 300);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Process referral if exists
      if (formData.referralCode) {
        await referralService.processReferralSignup(formData.referralCode);
      }
      
      // Register user
      await register(formData);
      setShowSuccess(true);
      
      // Redirect after delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ current: error.message || t('user.registration.validation.submissionError') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTermsStep = () => {
    return currentStep === conversationSteps.length;
  };

  const handleTermsScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setHasScrolledToBottom(true);
    }
  };

  const openTermsModal = () => {
    setShowTermsModal(true);
    setHasScrolledToBottom(false);
  };

  const closeTermsModal = () => {
    setShowTermsModal(false);
    setHasScrolledToBottom(false);
  };

  // Success screen
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#e0e0e0] flex items-center justify-center p-4" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} lang={i18n.language}>
        <div className="neumorphic rounded-2xl p-8 text-center max-w-md">
          <div className="flex justify-center mb-4">
            <Logo className="h-16 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {t('user.registration.success.title')}
          </h1>
          <p className="text-gray-600 mb-6">
            {t('user.registration.success.message', { name: formData.firstName })}
          </p>
          <p className="text-sm text-gray-500">
            {t('user.registration.success.redirecting')}
          </p>
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
              {t('user.registration.title')}
            </h1>
            <p className="text-gray-600 mb-8">
              {t('user.registration.subtitle')}
            </p>
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                {t('user.registration.alreadyHaveAccount')}{' '}
                <Link to="/login" className="text-orange-500 font-medium hover:underline">
                  {t('common.login')}
                </Link>
              </p>
            </div>
            <button
              onClick={handleNext}
              className="neumorphic-subtle hover:neumorphic-pressed w-full py-3 px-6 rounded-xl text-lg font-medium text-gray-700 transition-all duration-200"
            >
              {t('user.registration.getStarted')}
            </button>
          </div>
        )}

        {/* Question Screens */}
        {currentStep >= 0 && currentStep < conversationSteps.length && (
          <div className={`neumorphic rounded-2xl p-8 transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {getPersonalizedQuestion(currentStep)}
            </h2>
            
            <div className="mb-6">
              <div className="relative">
                {getCurrentQuestion()?.type === 'password' ? (
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type={showPassword ? 'text' : 'password'}
                      className="w-full px-4 py-3 border-0 rounded-xl neumorphic-pressed bg-gray-50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={getCurrentValue()}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder={getCurrentQuestion()?.placeholder}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                ) : getCurrentQuestion()?.type === 'date' ? (
                  <input
                    ref={inputRef}
                    type="date"
                    className="w-full px-4 py-3 border-0 rounded-xl neumorphic-pressed bg-gray-50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={getCurrentValue()}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                  />
                ) : (
                  <input
                    ref={inputRef}
                    type={getCurrentQuestion()?.type || 'text'}
                    className="w-full px-4 py-3 border-0 rounded-xl neumorphic-pressed bg-gray-50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={getCurrentValue()}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={getCurrentQuestion()?.placeholder}
                  />
                )}
              </div>
              
              {errors.current && (
                <div className="mt-2 text-red-500 text-sm text-center">{errors.current}</div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                className="flex-1 neumorphic-subtle hover:neumorphic-pressed py-3 px-4 rounded-xl text-gray-700 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-5 h-5 inline mr-2" />
                {t('common.back')}
              </button>
              
              <button
                className="flex-1 neumorphic-subtle hover:neumorphic-pressed py-3 px-4 rounded-xl text-gray-700 font-medium transition-all duration-200"
                onClick={handleNext}
              >
                {getCurrentQuestion()?.buttonText || t('common.next')}
                <ArrowRight className="w-5 h-5 inline ml-2" />
              </button>
            </div>
          </div>
        )}
        
        {/* Terms Screen */}
        {isTermsStep() && (
          <div className="neumorphic rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {t('user.registration.terms.title', { name: formData.firstName })}
            </h2>
            
            <div className="mb-6">
              <button
                onClick={openTermsModal}
                className="w-full neumorphic-subtle hover:neumorphic-pressed py-3 px-4 rounded-xl text-gray-700 font-medium transition-all duration-200 text-left"
              >
                📄 {t('user.registration.terms.checkbox')}
              </button>
              
              {errors.current && (
                <div className="mt-2 text-red-500 text-sm text-center">{errors.current}</div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                className="flex-1 neumorphic-subtle hover:neumorphic-pressed py-3 px-4 rounded-xl text-gray-700 font-medium transition-all duration-200"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                <ArrowLeft className="w-5 h-5 inline mr-2" />
                {t('common.back')}
              </button>
              
              <button
                className="flex-1 neumorphic-subtle hover:neumorphic-pressed py-3 px-4 rounded-xl text-gray-700 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleNext}
                disabled={!acceptTerms || isSubmitting}
              >
                {isSubmitting ? t('user.registration.terms.submitting') : t('user.registration.terms.submit')}
                <ArrowRight className="w-5 h-5 inline ml-2" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="neumorphic rounded-2xl p-6 max-w-md w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {t('auth.termsAndConditions')}
              </h3>
              <button
                onClick={closeTermsModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div 
              ref={termsModalRef}
              className="flex-1 overflow-y-auto mb-4 p-4 neumorphic-pressed rounded-lg text-sm text-gray-700 leading-relaxed"
              onScroll={handleTermsScroll}
            >
              <div className="space-y-4">
                <h4 className="font-bold text-lg">1. {t('auth.acceptanceOfTerms')}</h4>
                <p>{t('user.registration.terms.content.section1')}</p>
                
                <h4 className="font-bold text-lg">2. {t('auth.userAccount')}</h4>
                <p>{t('user.registration.terms.content.section2')}</p>
                
                <h4 className="font-bold text-lg">3. {t('auth.privacyPolicy')}</h4>
                <p>{t('user.registration.terms.content.section3')}</p>
                
                <h4 className="font-bold text-lg">4. {t('auth.userConduct')}</h4>
                <p>{t('user.registration.terms.content.section4')}</p>
                
                <h4 className="font-bold text-lg">5. {t('auth.bookingAndCancellation')}</h4>
                <p>{t('user.registration.terms.content.section5')}</p>
                
                <h4 className="font-bold text-lg">6. {t('auth.paymentTerms')}</h4>
                <p>{t('user.registration.terms.content.section6')}</p>
                
                <h4 className="font-bold text-lg">7. {t('auth.limitationOfLiability')}</h4>
                <p>{t('user.registration.terms.content.section7')}</p>
                
                <h4 className="font-bold text-lg">8. {t('auth.changesToTerms')}</h4>
                <p>{t('user.registration.terms.content.section8')}</p>
                
                <h4 className="font-bold text-lg">9. {t('auth.contactInformation')}</h4>
                <p>{t('user.registration.terms.content.section9')}</p>
                
                <div className="text-center py-4">
                  <p className="text-xs text-gray-500">
                    {t('auth.lastUpdated')}: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="modalAcceptTerms"
                className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                disabled={!hasScrolledToBottom}
              />
              <label htmlFor="modalAcceptTerms" className="text-sm text-gray-700">
                {hasScrolledToBottom 
                  ? t('auth.agreeToTerms')
                  : t('auth.scrollToReadTerms')
                }
              </label>
            </div>
            
            <button
              onClick={closeTermsModal}
              className="w-full neumorphic-subtle hover:neumorphic-pressed py-3 px-4 rounded-xl text-gray-700 font-medium transition-all duration-200"
            >
              {t('auth.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRegistrationPage;