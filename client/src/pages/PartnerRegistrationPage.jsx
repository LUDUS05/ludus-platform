import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import api from '../services/api';

const PartnerRegistrationPage = () => {
  const { t } = useTranslation();
  // Form data with personalized responses
  const [formData, setFormData] = useState({
    contactName: '',
    companyName: '',
    email: '',
    phone: '',
    website: '',
    description: ''
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
  
  // Terms modal state
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsContent, setTermsContent] = useState('');
  const [loadingTerms, setLoadingTerms] = useState(false);
  
  // Conversational questions configuration
  const conversationSteps = [
    // Welcome screen is step -1
    {
      key: 'contactName',
      question: t('partner.registration.questions.contactName.question'),
      placeholder: t('partner.registration.questions.contactName.placeholder'),
      type: 'text',
      required: true,
      buttonText: t('partner.registration.questions.contactName.buttonText')
    },
    {
      key: 'companyName',
      question: (name) => t('partner.registration.questions.companyName.question', { name: name ? `, ${name}` : '' }),
      placeholder: t('partner.registration.questions.companyName.placeholder'),
      type: 'text',
      required: true,
      buttonText: t('partner.registration.questions.companyName.buttonText')
    },
    {
      key: 'email',
      question: (name, company) => t('partner.registration.questions.email.question', { name: name ? `, ${name}` : '' }),
      placeholder: t('partner.registration.questions.email.placeholder'),
      type: 'email',
      required: true,
      buttonText: t('partner.registration.questions.email.buttonText')
    },
    {
      key: 'phone',
      question: t('partner.registration.questions.phone.question'),
      placeholder: t('partner.registration.questions.phone.placeholder'),
      type: 'tel',
      required: true,
      buttonText: t('partner.registration.questions.phone.buttonText')
    },
    {
      key: 'website',
      question: (name, company) => t('partner.registration.questions.website.question', { company: company || t('common.business', 'your business') }),
      placeholder: t('partner.registration.questions.website.placeholder'),
      type: 'url',
      required: false,
      buttonText: t('partner.registration.questions.website.buttonText')
    },
    {
      key: 'description',
      question: (name, company) => t('partner.registration.questions.description.question', { company: company || t('common.business', 'your business') }),
      placeholder: t('partner.registration.questions.description.placeholder'),
      type: 'textarea',
      required: true,
      buttonText: t('partner.registration.questions.description.buttonText')
    }
    // Terms step and success are handled separately
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
      return question(formData.contactName, formData.companyName);
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
      return t('partner.registration.validation.required');
    }
    
    switch (question.key) {
      case 'email':
        return value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) 
          ? t('partner.registration.validation.invalidEmail') 
          : '';
      case 'website':
        return value && !/^https?:\/\/.+\..+/.test(value) 
          ? t('partner.registration.validation.invalidWebsite') 
          : '';
      case 'phone':
        return value && !/^[+]?[\d\s\-\(\)]{10,}$/.test(value) 
          ? t('partner.registration.validation.invalidPhone') 
          : '';
      case 'description':
        return value && value.length < 20 
          ? t('partner.registration.validation.descriptionTooShort') 
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

  const handleKeyPress = (e) => {
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

  // Fetch Terms and Conditions content
  const fetchTermsContent = useCallback(async () => {
    try {
      setLoadingTerms(true);
      const response = await axios.get('/api/pages/by-url/partner-terms-and-conditions');
      setTermsContent(response.data.content || getDefaultTermsContent());
    } catch (error) {
      console.error('Failed to fetch terms:', error);
      setTermsContent(getDefaultTermsContent());
    } finally {
      setLoadingTerms(false);
    }
  }, []);

  const getDefaultTermsContent = () => {
    return `
      <h3>${t('partner.registration.defaultTerms.title')}</h3>
      <p><strong>${t('partner.registration.defaultTerms.lastUpdated', { date: new Date().toLocaleDateString() })}</strong></p>
      
      <h4>${t('partner.registration.defaultTerms.section1.title')}</h4>
      <p>${t('partner.registration.defaultTerms.section1.content')}</p>
      
      <h4>${t('partner.registration.defaultTerms.section2.title')}</h4>
      <p>${t('partner.registration.defaultTerms.section2.content')}</p>
      
      <h4>${t('partner.registration.defaultTerms.section3.title')}</h4>
      <p>${t('partner.registration.defaultTerms.section3.content')}</p>
      
      <h4>${t('partner.registration.defaultTerms.section4.title')}</h4>
      <p>${t('partner.registration.defaultTerms.section4.content')}</p>
      
      <h4>${t('partner.registration.defaultTerms.section5.title')}</h4>
      <p>${t('partner.registration.defaultTerms.section5.content')}</p>
      
      <h4>${t('partner.registration.defaultTerms.section6.title')}</h4>
      <p>${t('partner.registration.defaultTerms.section6.content')}</p>
      
      <h4>${t('partner.registration.defaultTerms.section7.title')}</h4>
      <p>${t('partner.registration.defaultTerms.section7.content')}</p>
      
      <p>${t('partner.registration.defaultTerms.contact')}</p>
    `;
  };

  useEffect(() => {
    fetchTermsContent();
  }, [fetchTermsContent]);

  const handleSubmit = async () => {
    if (!acceptTerms) {
      setErrors({ current: t('partner.registration.validation.termsRequired') });
      return;
    }

    setIsSubmitting(true);

    try {
      // Send vendor registration to backend
      const response = await api.post('/vendors', {
        contactName: formData.contactName,
        companyName: formData.companyName,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        description: formData.description
      });

      if (response.data.success) {
        // Show success message
        setShowSuccess(true);
      } else {
        setErrors({ current: response.data.message || t('partner.registration.validation.submissionError') });
      }

    } catch (error) {
      console.error('Submission error:', error);
      const errorMessage = error.response?.data?.message || t('partner.registration.validation.submissionError');
      setErrors({ current: errorMessage });
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
            
            .success-details {
              background: #F8F9FA;
              border-radius: 12px;
              padding: 24px;
              text-align: left;
            }
            
            .success-details h4 {
              color: #2B2B2B;
              font-weight: 500;
              margin-bottom: 12px;
              font-size: 16px;
            }
            
            .success-details ul {
              color: #666;
              font-size: 15px;
              line-height: 1.5;
              margin: 0;
              padding-left: 20px;
            }
            
            .success-details li {
              margin-bottom: 8px;
            }
          `}
        </style>
        
        <div className="success-screen">
          <div className="success-icon">
            <span className="success-checkmark">✓</span>
          </div>
          
          <h1 className="success-title">{t('partner.registration.success.title')}</h1>
          
          <p className="success-message">
            {t('partner.registration.success.message', { name: formData.contactName, company: formData.companyName })}
          </p>
          
          <div className="success-details">
            <h4>{t('partner.registration.success.nextSteps.title')}</h4>
            <ul>
              <li>{t('partner.registration.success.nextSteps.step1')}</li>
              <li>{t('partner.registration.success.nextSteps.step2', { email: formData.email })}</li>
              <li>{t('partner.registration.success.nextSteps.step3')}</li>
              <li>{t('partner.registration.success.nextSteps.step4')}</li>
            </ul>
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
            margin-bottom: 50px;
            line-height: 1.4;
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
          
          .form-textarea {
            width: 100%;
            border: 3px solid #E5E5E5;
            border-radius: 12px;
            background: transparent;
            padding: 20px;
            font-size: 18px;
            color: #2B2B2B;
            outline: none;
            resize: vertical;
            min-height: 120px;
            transition: border-color 0.3s ease;
            font-family: inherit;
            line-height: 1.5;
          }
          
          .form-textarea:focus {
            border-color: #FF6600;
          }
          
          .form-textarea::placeholder {
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
            
            .form-textarea {
              font-size: 16px;
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
            <h1 className="welcome-title">{t('partner.registration.title')}</h1>
            <p className="welcome-subtitle">
              {t('partner.registration.subtitle')}
            </p>
            <button className="start-button" onClick={handleNext}>
              {t('partner.registration.getStarted')}
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
                {getCurrentQuestion()?.type === 'textarea' ? (
                  <textarea
                    ref={inputRef}
                    className="form-textarea"
                    value={getCurrentValue()}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder={getCurrentQuestion()?.placeholder}
                    rows={4}
                  />
                ) : (
                  <input
                    ref={inputRef}
                    type={getCurrentQuestion()?.type || 'text'}
                    className="form-input"
                    value={getCurrentValue()}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder={getCurrentQuestion()?.placeholder}
                  />
                )}
                
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
                {t('partner.registration.terms.title', { name: formData.contactName })}
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
                  {t('partner.registration.terms.checkbox').split('Terms and Conditions').map((part, index) => {
                    if (index === 0) return part;
                    return (
                      <React.Fragment key={index}>
                        <span
                          className="terms-link"
                          onClick={() => setShowTermsModal(true)}
                        >
                          {t('partner.registration.terms.link')}
                        </span>
                        {part}
                      </React.Fragment>
                    );
                  })}
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
                {isSubmitting ? t('partner.registration.terms.submitting') : t('partner.registration.terms.submit')}
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

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{
          background: 'rgba(0, 0, 0, 0.5)'
        }}>
          <div className="min-h-screen px-4 text-center">
            <div className="fixed inset-0" onClick={() => setShowTermsModal(false)}></div>
            
            <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block w-full max-w-4xl p-8 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {t('partner.registration.terms.modalTitle')}
                </h3>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {loadingTerms ? (
                  <div className="text-center py-8">
                    <div className="text-gray-600">{t('partner.registration.terms.loading')}</div>
                  </div>
                ) : (
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: termsContent }}
                  />
                )}
              </div>
              
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {t('partner.registration.terms.close')}
                </button>
                <button
                  onClick={() => {
                    setAcceptTerms(true);
                    setShowTermsModal(false);
                    setErrors({});
                  }}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  {t('partner.registration.terms.accept')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerRegistrationPage;