import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../styles/partner-registration.css';

const PartnerRegistrationPage = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsContent, setTermsContent] = useState('');
  const [loadingTerms, setLoadingTerms] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    const requiredFields = ['companyName', 'contactName', 'email', 'phone', 'description'];
    requiredFields.forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = `${getFieldLabel(field)} is required`;
      }
    });

    // Field-specific validations
    Object.keys(formData).forEach(field => {
      if (formData[field]) {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getFieldLabel = (fieldName) => {
    const labels = {
      companyName: 'Company Name',
      contactName: 'Contact Person Name',
      email: 'Email Address',
      phone: 'Phone Number',
      website: 'Website URL',
      description: 'Company Description'
    };
    return labels[fieldName] || fieldName;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!acceptTerms) {
      setErrors({ terms: 'You must accept the Terms and Conditions to proceed.' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      setShowSuccess(true);
      
      // Reset form after delay
      setTimeout(() => {
        setFormData({
          companyName: '',
          contactName: '',
          email: '',
          phone: '',
          website: '',
          description: ''
        });
        setShowSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ submit: 'Failed to submit registration. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="partner-registration-page">
        <div className="max-w-[700px] mx-auto px-10 py-16">
          <div className="text-center py-10">
            <h2 className="text-lg font-normal mb-2.5 tracking-wide">
              Registration Submitted
            </h2>
            <p className="text-sm text-gray-600 font-light">
              Thank you for your interest. We'll be in touch soon.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="partner-registration-page">
      
      <div className="max-w-[700px] mx-auto px-10 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-2xl font-normal mb-2.5 tracking-wide">
            Partner Registration
          </h1>
          <p className="text-sm text-gray-600 font-light">
            Join the LUDUS network and connect with our community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Company Name */}
          <div className={`form-group relative ${errors.companyName ? 'error' : ''}`}>
            <div className="relative w-full">
              <input
                type="text"
                name="companyName"
                className={`form-input ${formData.companyName ? 'has-value' : ''} ${errors.companyName ? 'error' : ''}`}
                placeholder=" "
                value={formData.companyName}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                required
                autoComplete="organization"
              />
              <label className="form-label">Company Name</label>
            </div>
            <div className="error-message">
              {errors.companyName}
            </div>
          </div>

          {/* Contact Name */}
          <div className={`form-group relative ${errors.contactName ? 'error' : ''}`}>
            <div className="relative w-full">
              <input
                type="text"
                name="contactName"
                className={`form-input ${formData.contactName ? 'has-value' : ''} ${errors.contactName ? 'error' : ''}`}
                placeholder=" "
                value={formData.contactName}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                required
                autoComplete="name"
              />
              <label className="form-label">Contact Person Name</label>
            </div>
            <div className="error-message">
              {errors.contactName}
            </div>
          </div>

          {/* Email */}
          <div className={`form-group relative ${errors.email ? 'error' : ''}`}>
            <div className="relative w-full">
              <input
                type="email"
                name="email"
                className={`form-input ${formData.email ? 'has-value' : ''} ${errors.email ? 'error' : ''}`}
                placeholder=" "
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                required
                autoComplete="email"
              />
              <label className="form-label">Email Address</label>
            </div>
            <div className="error-message">
              {errors.email}
            </div>
          </div>

          {/* Phone */}
          <div className={`form-group relative ${errors.phone ? 'error' : ''}`}>
            <div className="relative w-full">
              <input
                type="tel"
                name="phone"
                className={`form-input ${formData.phone ? 'has-value' : ''} ${errors.phone ? 'error' : ''}`}
                placeholder=" "
                value={formData.phone}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                required
                autoComplete="tel"
              />
              <label className="form-label">Phone Number</label>
            </div>
            <div className="error-message">
              {errors.phone}
            </div>
          </div>

          {/* Website */}
          <div className={`form-group relative ${errors.website ? 'error' : ''}`}>
            <div className="relative w-full">
              <input
                type="url"
                name="website"
                className={`form-input ${formData.website ? 'has-value' : ''} ${errors.website ? 'error' : ''}`}
                placeholder=" "
                value={formData.website}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                autoComplete="url"
              />
              <label className="form-label">Website URL (Optional)</label>
            </div>
            <div className="error-message">
              {errors.website}
            </div>
          </div>

          {/* Description */}
          <div className={`form-group relative ${errors.description ? 'error' : ''}`}>
            <div className="relative w-full">
              <textarea
                name="description"
                className={`form-textarea ${formData.description ? 'has-value' : ''} ${errors.description ? 'error' : ''}`}
                placeholder=" "
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                required
              />
              <label className="form-label">Company Description</label>
            </div>
            <div className="error-message">
              {errors.description}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className={`form-group relative ${errors.terms ? 'error' : ''}`}>
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked);
                  if (errors.terms) {
                    setErrors(prev => ({ ...prev, terms: '' }));
                  }
                }}
                className="mt-1 h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                style={{
                  accentColor: '#2a2a2a',
                  borderColor: errors.terms ? '#d73a49' : '#e0e0e0'
                }}
              />
              <label htmlFor="acceptTerms" className="text-sm font-light text-gray-700 leading-relaxed">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-gray-900 underline hover:text-gray-600 transition-colors font-normal"
                  style={{ fontFamily: 'inherit' }}
                >
                  Terms and Conditions
                </button>
                {' '}for LUDUS partners
              </label>
            </div>
            <div className="error-message ml-7">
              {errors.terms}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-16">
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>

        {/* Terms and Conditions Modal */}
        {showTermsModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto" style={{
            background: 'rgba(0, 0, 0, 0.5)'
          }}>
            <div className="min-h-screen px-4 text-center">
              <div className="fixed inset-0" onClick={() => setShowTermsModal(false)}></div>
              
              <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
              
              <div className="terms-modal inline-block w-full max-w-4xl p-8 my-8 text-left align-middle transition-all transform shadow-xl rounded-lg">
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
                      if (errors.terms) {
                        setErrors(prev => ({ ...prev, terms: '' }));
                      }
                    }}
                    className="submit-btn"
                  >
                    Accept Terms
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerRegistrationPage;