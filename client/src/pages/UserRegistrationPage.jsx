import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserRegistrationPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: ''
  });
  
  // Conversational flow state
  const [currentStep, setCurrentStep] = useState(-1); // Start with welcome screen
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Form state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Refs
  const inputRef = useRef(null);
  
  // Conversational questions configuration
  const conversationSteps = [
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
      question: (firstName) => t('user.registration.questions.lastName.question', { name: firstName || '' }),
      placeholder: t('user.registration.questions.lastName.placeholder'),
      type: 'text',
      required: true,
      buttonText: t('user.registration.questions.lastName.buttonText')
    },
    {
      key: 'email',
      question: (firstName) => t('user.registration.questions.email.question', { name: firstName || '' }),
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
  ];

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
    const question = getCurrentQuestion();
    return question ? formData[question.key] : '';
  };

  const isWelcomeScreen = () => currentStep === -1;
  const isTermsStep = () => currentStep === conversationSteps.length;
  const getProgress = () => Math.max(0, (currentStep + 1) / (conversationSteps.length + 1) * 100);

  useEffect(() => {
    // Focus input when step changes
    if (inputRef.current && currentStep >= 0 && currentStep < conversationSteps.length) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [currentStep]);

  const validateCurrentField = (value) => {
    const question = getCurrentQuestion();
    if (!question) return '';

    if (!value && question.required) {
      return t('user.registration.validation.required');
    }
    
    switch (question.key) {
      case 'email':
        return value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) 
          ? t('user.registration.validation.invalidEmail') 
          : '';
      case 'password':
        return value && value.length < 8 
          ? t('user.registration.validation.passwordTooShort') 
          : '';
      case 'confirmPassword':
        return value && value !== formData.password
          ? t('user.registration.validation.passwordMismatch')
          : '';
      case 'phone':
        return value && !/^[+]?[\d\s\-\(\)]{10,}$/.test(value) 
          ? t('user.registration.validation.invalidPhone') 
          : '';
      case 'firstName':
      case 'lastName':
        return value && value.length < 2
          ? t('user.registration.validation.nameTooShort')
          : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const question = getCurrentQuestion();
    if (!question) return;
    
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [question.key]: value }));
    
    // Clear errors when typing
    if (errors.current) {
      setErrors(prev => ({ ...prev, current: '' }));
    }
  };

  const handleNext = () => {
    if (isWelcomeScreen()) {
      // Start the conversation
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(0);
        setIsAnimating(false);
      }, 300);
      return;
    }

    if (isTermsStep()) {
      handleSubmit();
      return;
    }

    const question = getCurrentQuestion();
    if (!question) return;

    const value = formData[question.key]?.trim() || '';
    const error = validateCurrentField(value);
    
    if (error) {
      setErrors({ current: error });
      return;
    }

    // Move to next step
    setIsAnimating(true);
    setErrors({});
    
    setTimeout(() => {
      if (currentStep >= conversationSteps.length - 1) {
        setCurrentStep(conversationSteps.length); // Terms step
      } else {
        setCurrentStep(prev => prev + 1);
      }
      setIsAnimating(false);
    }, 300);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNext();
    }
  };

  const handleBack = () => {
    if (currentStep > -1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleSubmit = async () => {
    if (!acceptTerms) {
      setErrors({ current: t('user.registration.validation.termsRequired') });
      return;
    }

    setIsSubmitting(true);

    try {
      const { confirmPassword, ...registrationData } = formData;
      await register(registrationData);
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ current: error.response?.data?.message || t('user.registration.validation.submissionError') });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (showSuccess) {
    return (
      <div className="ludus-form-container">
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Manrope:wght@300;400;500;600&display=swap');
            
            .ludus-form-container {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              background: linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            
            .success-screen {
              text-align: center;
              max-width: 600px;
              background: white;
              border-radius: 20px;
              padding: 60px 40px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.08);
            }
            
            .success-icon {
              width: 80px;
              height: 80px;
              background: #FF6600;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 30px;
              animation: successPulse 2s ease-in-out infinite;
            }
            
            @keyframes successPulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
            
            .success-checkmark {
              color: white;
              font-size: 36px;
              font-weight: bold;
            }
            
            .success-title {
              font-size: 32px;
              font-weight: 600;
              color: #2B2B2B;
              margin-bottom: 20px;
              font-family: 'Manrope', sans-serif;
            }
            
            .success-message {
              font-size: 18px;
              color: #666;
              line-height: 1.6;
              margin-bottom: 40px;
            }
            
            .redirect-info {
              background: #F8F9FA;
              border-radius: 12px;
              padding: 24px;
              color: #666;
              font-size: 15px;
            }
          `}
        </style>
        
        <div className="success-screen">
          <div className="success-icon">
            <span className="success-checkmark">✓</span>
          </div>
          
          <h1 className="success-title">{t('user.registration.success.title')}</h1>
          
          <p className="success-message">
            {t('user.registration.success.message', { name: formData.firstName })}
          </p>
          
          <div className="redirect-info">
            {t('user.registration.success.redirecting')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ludus-form-container">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Manrope:wght@300;400;500;600&display=swap');
          
          .ludus-form-container {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%);
            min-height: 100vh;
            position: relative;
            overflow: hidden;
          }
          
          .progress-bar {
            position: fixed;
            top: 0;
            left: 0;
            height: 4px;
            background: #FF6600;
            transition: width 0.6s ease;
            z-index: 1000;
          }
          
          .form-screen {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            opacity: 1;
            transform: translateY(0);
            transition: all 0.3s ease;
          }
          
          .form-screen.animating {
            opacity: 0;
            transform: translateY(20px);
          }
          
          .welcome-screen {
            text-align: center;
            max-width: 700px;
          }
          
          .ludus-logo {
            width: 120px;
            height: 40px;
            margin: 0 auto 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .ludus-logo img {
            height: 100%;
            width: auto;
            object-fit: contain;
          }
          
          .welcome-title {
            font-size: 48px;
            font-weight: 600;
            color: #2B2B2B;
            margin-bottom: 20px;
            font-family: 'Manrope', sans-serif;
            line-height: 1.2;
          }
          
          .welcome-subtitle {
            font-size: 20px;
            color: #666;
            margin-bottom: 30px;
            line-height: 1.4;
          }
          
          .login-link {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
          }
          
          .login-link a {
            color: #FF6600;
            text-decoration: none;
            font-weight: 500;
          }
          
          .login-link a:hover {
            text-decoration: underline;
          }
          
          .start-button {
            background: #FF6600;
            color: white;
            border: none;
            border-radius: 50px;
            padding: 16px 40px;
            font-size: 18px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: inherit;
          }
          
          .start-button:hover {
            background: #E55A00;
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(255, 102, 0, 0.3);
          }
          
          .question-screen {
            max-width: 600px;
            width: 100%;
          }
          
          .question-container {
            background: white;
            border-radius: 20px;
            padding: 50px 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.08);
            text-align: center;
          }
          
          .question-text {
            font-size: 28px;
            font-weight: 500;
            color: #2B2B2B;
            margin-bottom: 40px;
            line-height: 1.3;
            font-family: 'Manrope', sans-serif;
          }
          
          .input-container {
            margin-bottom: 30px;
            position: relative;
          }
          
          .form-input {
            width: 100%;
            border: none;
            border-bottom: 3px solid #E5E5E5;
            background: transparent;
            padding: 16px 0;
            font-size: 20px;
            color: #2B2B2B;
            text-align: center;
            outline: none;
            transition: border-color 0.3s ease;
            font-family: inherit;
          }
          
          .form-input:focus {
            border-bottom-color: #FF6600;
          }
          
          .form-input::placeholder {
            color: #999;
            font-weight: 300;
          }
          
          .error-message {
            color: #FF4444;
            font-size: 16px;
            margin-top: 15px;
            font-weight: 400;
          }
          
          .button-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 40px;
          }
          
          .back-button {
            background: transparent;
            border: none;
            color: #999;
            font-size: 16px;
            cursor: pointer;
            padding: 12px 20px;
            transition: color 0.3s ease;
            font-family: inherit;
          }
          
          .back-button:hover {
            color: #666;
          }
          
          .back-button:disabled {
            color: #CCC;
            cursor: not-allowed;
          }
          
          .next-button {
            background: #FF6600;
            color: white;
            border: none;
            border-radius: 50px;
            padding: 14px 32px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: inherit;
            min-width: 120px;
          }
          
          .next-button:hover {
            background: #E55A00;
            transform: translateY(-1px);
          }
          
          .next-button:disabled {
            background: #CCC;
            cursor: not-allowed;
            transform: none;
          }
          
          .terms-screen {
            max-width: 600px;
            width: 100%;
          }
          
          .terms-container {
            background: white;
            border-radius: 20px;
            padding: 50px 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.08);
            text-align: center;
          }
          
          .terms-title {
            font-size: 28px;
            font-weight: 500;
            color: #2B2B2B;
            margin-bottom: 30px;
            font-family: 'Manrope', sans-serif;
          }
          
          .checkbox-container {
            display: flex;
            align-items: flex-start;
            justify-content: center;
            gap: 15px;
            margin: 30px 0;
            text-align: left;
          }
          
          .checkbox-input {
            width: 20px;
            height: 20px;
            accent-color: #FF6600;
            margin-top: 2px;
            flex-shrink: 0;
          }
          
          .checkbox-label {
            font-size: 16px;
            color: #666;
            line-height: 1.5;
            cursor: pointer;
            flex: 1;
          }
          
          .terms-link {
            color: #FF6600;
            text-decoration: underline;
            cursor: pointer;
            font-weight: 500;
          }
          
          .terms-link:hover {
            color: #E55A00;
          }
          
          .submit-button {
            background: #FF6600;
            color: white;
            border: none;
            border-radius: 50px;
            padding: 16px 40px;
            font-size: 18px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: inherit;
            margin-top: 20px;
          }
          
          .submit-button:hover {
            background: #E55A00;
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(255, 102, 0, 0.3);
          }
          
          .submit-button:disabled {
            background: #CCC;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }
          
          @media (max-width: 768px) {
            .welcome-title {
              font-size: 36px;
            }
            
            .welcome-subtitle {
              font-size: 18px;
            }
            
            .question-text {
              font-size: 24px;
            }
            
            .question-container,
            .terms-container {
              padding: 40px 30px;
            }
            
            .form-input {
              font-size: 18px;
            }
          }
          
          @media (max-width: 480px) {
            .ludus-form-container {
              padding: 15px;
            }
            
            .question-container,
            .terms-container {
              padding: 30px 25px;
            }
            
            .welcome-title {
              font-size: 28px;
            }
            
            .question-text {
              font-size: 22px;
            }
            
            .button-container {
              flex-direction: column;
              gap: 20px;
            }
            
            .next-button,
            .submit-button {
              width: 100%;
              padding: 16px;
            }
          }
        `}
      </style>
      
      {/* Progress Bar */}
      {!isWelcomeScreen() && (
        <div className="progress-bar" style={{ width: `${getProgress()}%` }}></div>
      )}
      
      <div className={`form-screen ${isAnimating ? 'animating' : ''}`}>
        {/* Welcome Screen */}
        {isWelcomeScreen() && (
          <div className="welcome-screen">
            <div className="ludus-logo">
              <img src="/logos/ludus-logo-dark.png" alt="LUDUS" />
            </div>
            <h1 className="welcome-title">{t('user.registration.title')}</h1>
            <p className="welcome-subtitle">
              {t('user.registration.subtitle')}
            </p>
            <p className="login-link">
              {t('user.registration.alreadyHaveAccount')} <Link to="/login">{t('common.login')}</Link>
            </p>
            <button className="start-button" onClick={handleNext}>
              {t('user.registration.getStarted')}
            </button>
          </div>
        )}
        
        {/* Question Screens */}
        {currentStep >= 0 && currentStep < conversationSteps.length && (
          <div className="question-screen">
            <div className="question-container">
              <h2 className="question-text">
                {getPersonalizedQuestion(currentStep)}
              </h2>
              
              <div className="input-container">
                <input
                  ref={inputRef}
                  type={getCurrentQuestion()?.type || 'text'}
                  className="form-input"
                  value={getCurrentValue()}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={getCurrentQuestion()?.placeholder}
                />
                
                {errors.current && (
                  <div className="error-message">{errors.current}</div>
                )}
              </div>
              
              <div className="button-container">
                <button
                  className="back-button"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                >
                  ← Back
                </button>
                
                <button
                  className="next-button"
                  onClick={handleNext}
                >
                  {getCurrentQuestion()?.buttonText || 'Continue'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Terms Screen */}
        {isTermsStep() && (
          <div className="terms-screen">
            <div className="terms-container">
              <h2 className="terms-title">
                {t('user.registration.terms.title', { name: formData.firstName })}
              </h2>
              
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  className="checkbox-input"
                  checked={acceptTerms}
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked);
                    if (errors.current) {
                      setErrors({});
                    }
                  }}
                />
                <label htmlFor="acceptTerms" className="checkbox-label">
                  {t('user.registration.terms.checkbox')}
                </label>
              </div>
              
              {errors.current && (
                <div className="error-message">{errors.current}</div>
              )}
              
              <button
                className="submit-button"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                {isSubmitting ? t('user.registration.terms.submitting') : t('user.registration.terms.submit')}
              </button>
              
              <div className="button-container" style={{ marginTop: '20px', justifyContent: 'center' }}>
                <button
                  className="back-button"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  ← Back
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRegistrationPage;