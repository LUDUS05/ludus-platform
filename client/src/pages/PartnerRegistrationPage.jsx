import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const PartnerRegistrationPage = () => {
  // Form data
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    description: ''
  });
  
  // Typewriter progression state
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [currentValue, setCurrentValue] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Original form state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Refs
  const inputRef = useRef(null);
  
  // Terms modal state
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsContent, setTermsContent] = useState('');
  const [loadingTerms, setLoadingTerms] = useState(false);
  
  // Form fields configuration
  const formFields = [
    {
      key: 'companyName',
      label: 'Company Name',
      type: 'text',
      required: true,
      placeholder: 'Enter your company name...'
    },
    {
      key: 'contactName', 
      label: 'Contact Person Name',
      type: 'text',
      required: true,
      placeholder: 'Enter contact person name...'
    },
    {
      key: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'Enter email address...'
    },
    {
      key: 'phone',
      label: 'Phone Number',
      type: 'tel', 
      required: true,
      placeholder: 'Enter phone number...'
    },
    {
      key: 'website',
      label: 'Website URL',
      type: 'url',
      required: false,
      placeholder: 'Enter website URL (optional)...'
    },
    {
      key: 'description',
      label: 'Company Description',
      type: 'textarea',
      required: true,
      placeholder: 'Describe your company and services...'
    }
  ];

  // Get current field
  const getCurrentField = () => formFields[currentStep];
  const isLastStep = () => currentStep === formFields.length;
  const isTermsStep = () => currentStep === formFields.length;
  
  // Typewriter effects
  useEffect(() => {
    // Blinking cursor effect
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    
    return () => clearInterval(cursorInterval);
  }, []);
  
  useEffect(() => {
    // Focus input when step changes
    if (inputRef.current && !isLastStep()) {
      inputRef.current.focus();
    }
  }, [currentStep]);
  
  // Initialize current value from form data when step changes
  useEffect(() => {
    if (!isLastStep()) {
      const field = getCurrentField();
      setCurrentValue(formData[field.key] || '');
    }
  }, [currentStep, formData]);

  const validateCurrentField = (value) => {
    if (!value && getCurrentField()?.required) {
      return `${getCurrentField().label} is required`;
    }
    
    const field = getCurrentField();
    switch (field?.key) {
      case 'email':
        return value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) 
          ? 'Please enter a valid email address' 
          : '';
      case 'website':
        return value && !/^https?:\/\/.+\..+/.test(value) 
          ? 'Please enter a valid URL (include http:// or https://)' 
          : '';
      case 'phone':
        return value && !/^[+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-()]/g, '')) 
          ? 'Please enter a valid phone number' 
          : '';
      case 'description':
        return value && value.length < 10 
          ? 'Company description must be at least 10 characters' 
          : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCurrentValue(value);
    setIsTyping(value.length > 0);
    
    // Update form data
    if (!isLastStep()) {
      const field = getCurrentField();
      setFormData(prev => ({ ...prev, [field.key]: value }));
    }
    
    // Clear errors when typing
    const error = validateCurrentField(value);
    if (!error && errors.current) {
      setErrors(prev => ({ ...prev, current: '' }));
    }
  };

  const handleNext = () => {
    if (isLastStep()) return;
    
    const field = getCurrentField();
    const value = currentValue.trim();
    const error = validateCurrentField(value);
    
    if (error) {
      setErrors(prev => ({ ...prev, current: error }));
      // Shake animation
      if (inputRef.current) {
        inputRef.current.style.animation = 'shake 0.3s ease-in-out';
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.style.animation = '';
          }
        }, 300);
      }
      return;
    }
    
    // Update form data
    setFormData(prev => ({ ...prev, [field.key]: value }));
    
    // Animate to next step
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
      setCurrentValue('');
      setIsTyping(false);
      setIsAnimating(false);
      setErrors(prev => ({ ...prev, current: '' }));
    }, 300);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isTermsStep()) {
        handleSubmit();
      } else {
        handleNext();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
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
      // Try to fetch terms from a dedicated page or fallback to default
      const response = await axios.get('/api/pages/by-url/partner-terms-and-conditions');
      setTermsContent(response.data.content || getDefaultTermsContent());
    } catch (error) {
      console.error('Failed to fetch terms:', error);
      // Use default terms if API fails
      setTermsContent(getDefaultTermsContent());
    } finally {
      setLoadingTerms(false);
    }
  }, []);

  const getDefaultTermsContent = () => {
    return `
      <h3>Partner Terms and Conditions</h3>
      <p><strong>Last updated: ${new Date().toLocaleDateString()}</strong></p>
      
      <h4>1. Agreement to Terms</h4>
      <p>By applying to become a LUDUS partner, you agree to be bound by these Terms and Conditions.</p>
      
      <h4>2. Eligibility</h4>
      <p>You must be a legitimate business entity authorized to provide services in Saudi Arabia.</p>
      
      <h4>3. Application Review</h4>
      <p>LUDUS reserves the right to approve or reject any partnership application at our discretion.</p>
      
      <h4>4. Service Standards</h4>
      <p>Partners must maintain high service standards and comply with all applicable laws and regulations.</p>
      
      <h4>5. Commission Structure</h4>
      <p>Commission rates and payment terms will be discussed and agreed upon during the approval process.</p>
      
      <h4>6. Data Protection</h4>
      <p>All customer data must be handled in accordance with Saudi data protection laws and LUDUS privacy policies.</p>
      
      <h4>7. Termination</h4>
      <p>Either party may terminate this agreement with 30 days written notice.</p>
      
      <p>For questions about these terms, contact us at <a href="mailto:partners@letsludus.com">partners@letsludus.com</a></p>
    `;
  };

  useEffect(() => {
    fetchTermsContent();
  }, [fetchTermsContent]);

  const handleSubmit = async () => {
    if (!acceptTerms) {
      setErrors({ current: 'You must accept the Terms and Conditions to proceed.' });
      return;
    }

    setIsSubmitting(true);
    setIsComplete(true);

    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      setShowSuccess(true);

    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ current: 'Failed to submit registration. Please try again.' });
      setIsComplete(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (showSuccess) {
    return (
      <div className="typewriter-container">
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&display=swap');
            
            .typewriter-container {
              font-family: 'IBM Plex Mono', 'Courier New', monospace;
              background: #f9f9f7;
              background-image: 
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 24px,
                  rgba(0,0,0,0.03) 25px,
                  rgba(0,0,0,0.03) 26px
                ),
                radial-gradient(circle at 2px 2px, rgba(0,0,0,0.02) 1px, transparent 0);
              background-size: 100% 26px, 20px 20px;
              color: #2a2a2a;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            
            .success-content {
              text-align: center;
              max-width: 600px;
              line-height: 1.8;
            }
            
            .success-title {
              font-size: 24px;
              font-weight: 400;
              margin-bottom: 20px;
              letter-spacing: 2px;
            }
            
            .success-message {
              font-size: 16px;
              font-weight: 300;
              color: #666;
              margin-bottom: 30px;
            }
            
            .typing-animation {
              border-right: 2px solid #2a2a2a;
              animation: blink 1s infinite;
            }
            
            @keyframes blink {
              0%, 50% { border-color: #2a2a2a; }
              51%, 100% { border-color: transparent; }
            }
          `}
        </style>
        <div className="success-content">
          <h1 className="success-title typing-animation">Registration Submitted</h1>
          <p className="success-message">
            Thank you for your interest in partnering with LUDUS.<br/>
            We'll review your application and be in touch soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="typewriter-container">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&display=swap');
          
          .typewriter-container {
            font-family: 'IBM Plex Mono', 'Courier New', monospace;
            background: #f9f9f7;
            background-image: 
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 24px,
                rgba(0,0,0,0.03) 25px,
                rgba(0,0,0,0.03) 26px
              ),
              radial-gradient(circle at 2px 2px, rgba(0,0,0,0.02) 1px, transparent 0);
            background-size: 100% 26px, 20px 20px;
            color: #2a2a2a;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          
          .typewriter-form {
            max-width: 800px;
            width: 100%;
            position: relative;
          }
          
          .progress-indicator {
            position: absolute;
            top: -60px;
            right: 0;
            font-size: 14px;
            color: #666;
            font-weight: 300;
            letter-spacing: 1px;
          }
          
          .form-title {
            font-size: 18px;
            font-weight: 300;
            margin-bottom: 40px;
            letter-spacing: 2px;
            color: #444;
            text-transform: uppercase;
          }
          
          .field-container {
            position: relative;
            min-height: 100px;
            display: flex;
            align-items: center;
            transition: all 0.3s ease;
          }
          
          .field-container.animating {
            transform: translateX(-50px);
            opacity: 0.7;
          }
          
          .field-label {
            font-size: 16px;
            color: #666;
            margin-bottom: 8px;
            font-weight: 300;
            letter-spacing: 0.5px;
          }
          
          .field-input-container {
            position: relative;
            width: 100%;
          }
          
          .field-input {
            font-family: inherit;
            font-size: 24px;
            font-weight: 400;
            background: transparent;
            border: none;
            border-bottom: 3px solid #ddd;
            padding: 8px 0;
            width: 100%;
            outline: none;
            color: #2a2a2a;
            caret-color: #2a2a2a;
            caret-width: 2px;
            transition: border-color 0.3s ease;
            letter-spacing: 1px;
          }
          
          .field-input:focus {
            border-bottom-color: #2a2a2a;
          }
          
          .field-input.error {
            border-bottom-color: #d73a49;
            animation: shake 0.3s ease-in-out;
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          
          .field-textarea {
            font-family: inherit;
            font-size: 20px;
            font-weight: 400;
            background: transparent;
            border: none;
            border-bottom: 3px solid #ddd;
            padding: 8px 0;
            width: 100%;
            outline: none;
            color: #2a2a2a;
            caret-color: #2a2a2a;
            resize: none;
            min-height: 60px;
            transition: border-color 0.3s ease;
            letter-spacing: 0.5px;
            line-height: 1.4;
          }
          
          .field-textarea:focus {
            border-bottom-color: #2a2a2a;
          }
          
          .cursor {
            display: inline-block;
            width: 2px;
            height: 24px;
            background: #2a2a2a;
            margin-left: 2px;
            animation: blink 1s infinite;
            vertical-align: bottom;
          }
          
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
          
          .error-message {
            position: absolute;
            bottom: -25px;
            left: 0;
            font-size: 14px;
            color: #d73a49;
            font-weight: 300;
            animation: fadeIn 0.3s ease;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .navigation {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .nav-button {
            font-family: inherit;
            font-size: 16px;
            font-weight: 400;
            background: transparent;
            border: none;
            color: #2a2a2a;
            cursor: pointer;
            padding: 8px 16px;
            transition: all 0.3s ease;
            letter-spacing: 1px;
          }
          
          .nav-button:hover {
            color: #666;
          }
          
          .nav-button:disabled {
            color: #ccc;
            cursor: not-allowed;
          }
          
          .next-button::before {
            content: '[';
            margin-right: 2px;
          }
          
          .next-button::after {
            content: ']';
            margin-left: 2px;
          }
          
          .back-button::before {
            content: '< ';
          }
          
          .terms-step {
            text-align: center;
            padding: 40px 0;
          }
          
          .terms-checkbox {
            margin: 30px 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
          }
          
          .checkbox-input {
            width: 18px;
            height: 18px;
            accent-color: #2a2a2a;
          }
          
          .checkbox-label {
            font-size: 16px;
            font-weight: 300;
            color: #666;
            cursor: pointer;
          }
          
          .terms-link {
            color: #2a2a2a;
            text-decoration: underline;
            cursor: pointer;
            transition: color 0.3s ease;
          }
          
          .terms-link:hover {
            color: #666;
          }
          
          .submit-button {
            font-family: inherit;
            font-size: 20px;
            font-weight: 400;
            background: transparent;
            border: none;
            color: #2a2a2a;
            cursor: pointer;
            padding: 12px 24px;
            transition: all 0.3s ease;
            letter-spacing: 2px;
            margin-top: 20px;
          }
          
          .submit-button::before {
            content: '[';
            margin-right: 4px;
          }
          
          .submit-button::after {
            content: ']';
            margin-left: 4px;
          }
          
          .submit-button:hover {
            color: #666;
            transform: scale(1.05);
          }
          
          .submit-button:disabled {
            color: #ccc;
            cursor: not-allowed;
            transform: none;
          }
          
          @media (max-width: 768px) {
            .field-input {
              font-size: 20px;
            }
            
            .field-textarea {
              font-size: 18px;
            }
            
            .typewriter-container {
              padding: 15px;
            }
            
            .progress-indicator {
              top: -40px;
              font-size: 12px;
            }
          }
        `}
      </style>
      
      <div className="typewriter-form">
        {!isTermsStep() && (
          <div className="progress-indicator">
            Step {currentStep + 1} of {formFields.length + 1}
          </div>
        )}
        
        <h1 className="form-title">Partner Registration</h1>
        
        {!isTermsStep() && !isComplete && (
          <div className={`field-container ${isAnimating ? 'animating' : ''}`}>
            <div className="field-input-container">
              <div className="field-label">{getCurrentField()?.label}</div>
              
              {getCurrentField()?.type === 'textarea' ? (
                <textarea
                  ref={inputRef}
                  className={`field-textarea ${errors.current ? 'error' : ''}`}
                  value={currentValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder={getCurrentField()?.placeholder}
                  rows={3}
                />
              ) : (
                <input
                  ref={inputRef}
                  type={getCurrentField()?.type || 'text'}
                  className={`field-input ${errors.current ? 'error' : ''}`}
                  value={currentValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder={getCurrentField()?.placeholder}
                />
              )}
              
              {!isTyping && showCursor && <span className="cursor"></span>}
              
              {errors.current && (
                <div className="error-message">{errors.current}</div>
              )}
            </div>
          </div>
        )}
        
        {isTermsStep() && !isComplete && (
          <div className="terms-step">
            <h2>Terms and Conditions</h2>
            <div className="terms-checkbox">
              <input
                type="checkbox"
                id="acceptTerms"
                className="checkbox-input"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked);
                  if (errors.current) {
                    setErrors(prev => ({ ...prev, current: '' }));
                  }
                }}
              />
              <label htmlFor="acceptTerms" className="checkbox-label">
                I agree to the{' '}
                <span
                  className="terms-link"
                  onClick={() => setShowTermsModal(true)}
                >
                  Terms and Conditions
                </span>
                {' '}for LUDUS partners
              </label>
            </div>
            
            {errors.current && (
              <div className="error-message" style={{ textAlign: 'center', position: 'relative', bottom: 'auto' }}>
                {errors.current}
              </div>
            )}
            
            <button
              className="submit-button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Registration'}
            </button>
          </div>
        )}
        
        {isComplete && !showSuccess && (
          <div className="terms-step">
            <h2>Processing Registration...</h2>
            <div style={{ margin: '40px 0', textAlign: 'center' }}>
              <span className="cursor"></span>
            </div>
          </div>
        )}
        
        {!isTermsStep() && !isComplete && (
          <div className="navigation">
            <button
              className="nav-button back-button"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </button>
            
            <div style={{ fontSize: '14px', color: '#999' }}>
              Press Enter to continue
            </div>
            
            <button
              className="nav-button next-button"
              onClick={handleNext}
            >
              {currentStep === formFields.length - 1 ? 'Review' : 'Next'}
            </button>
          </div>
        )}
      </div>

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{
          background: 'rgba(0, 0, 0, 0.5)'
        }}>
          <div className="min-h-screen px-4 text-center">
            <div className="fixed inset-0" onClick={() => setShowTermsModal(false)}></div>
            
            <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block w-full max-w-4xl p-8 my-8 text-left align-middle transition-all transform shadow-xl rounded-lg"
                 style={{
                   background: '#f9f9f7',
                   fontFamily: 'IBM Plex Mono, Courier New, monospace',
                   color: '#2a2a2a'
                 }}>
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-normal tracking-wide">
                  Terms and Conditions
                </h3>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl font-light"
                >
                  ×
                </button>
              </div>
              
              <div className="max-h-96 overflow-y-auto pr-2" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#2a2a2a #e0e0e0'
              }}>
                {loadingTerms ? (
                  <div className="text-center py-8">
                    <div className="text-sm text-gray-600">Loading terms...</div>
                  </div>
                ) : (
                  <div 
                    className="prose prose-sm max-w-none"
                    style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#2a2a2a'
                    }}
                    dangerouslySetInnerHTML={{ __html: termsContent }}
                  />
                )}
              </div>
              
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-light"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setAcceptTerms(true);
                    setShowTermsModal(false);
                    if (errors.current) {
                      setErrors(prev => ({ ...prev, current: '' }));
                    }
                  }}
                  className="px-4 py-2 text-gray-900 hover:text-gray-700 transition-colors font-normal"
                >
                  [Accept Terms]
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