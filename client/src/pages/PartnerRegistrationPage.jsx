import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const PartnerRegistrationPage = () => {
  const { t } = useTranslation();
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
        return value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, '')) 
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
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
      <div className="min-h-screen" style={{
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        background: '#fefefe',
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.02) 1px, transparent 0)',
        backgroundSize: '20px 20px',
        color: '#2a2a2a'
      }}>
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
    <div className="min-h-screen" style={{
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      background: '#fefefe',
      backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.02) 1px, transparent 0)',
      backgroundSize: '20px 20px',
      color: '#2a2a2a',
      lineHeight: 1.6
    }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&display=swap');
          
          .form-input, .form-textarea {
            font-family: inherit;
            font-size: 16px;
            font-weight: 400;
            background: transparent;
            border: none;
            border-bottom: 2px solid #e0e0e0;
            padding: 12px 0 8px 0;
            outline: none;
            color: #2a2a2a;
            transition: border-color 0.3s ease;
            caret-color: #2a2a2a;
            caret-width: 2px;
            width: 100%;
          }
          
          .form-input:focus, .form-textarea:focus {
            border-bottom-color: #2a2a2a;
            animation: underline-glow 0.3s ease;
          }
          
          @keyframes underline-glow {
            0% { border-bottom-color: #e0e0e0; }
            50% { border-bottom-color: #666; }
            100% { border-bottom-color: #2a2a2a; }
          }
          
          .form-input::placeholder, .form-textarea::placeholder {
            color: transparent;
          }
          
          .form-label {
            position: absolute;
            left: 0;
            top: 12px;
            font-size: 16px;
            color: #999;
            transition: all 0.3s ease;
            pointer-events: none;
            font-weight: 300;
          }
          
          .form-input:focus + .form-label,
          .form-input.has-value + .form-label,
          .form-textarea:focus + .form-label,
          .form-textarea.has-value + .form-label {
            top: -8px;
            font-size: 12px;
            color: #666;
            transform: translateY(-4px);
          }
          
          .form-textarea {
            resize: vertical;
            min-height: 80px;
          }
          
          .error-message {
            font-size: 12px;
            color: #d73a49;
            margin-top: 5px;
            font-weight: 300;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          
          .form-input.error, .form-textarea.error {
            border-bottom-color: #d73a49;
            animation: error-shake 0.3s ease;
          }
          
          .form-input.error + .form-label,
          .form-textarea.error + .form-label {
            color: #d73a49;
          }
          
          .form-group.error .error-message {
            opacity: 1;
          }
          
          @keyframes error-shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-2px); }
            75% { transform: translateX(2px); }
          }
          
          .submit-btn {
            font-family: inherit;
            font-size: 16px;
            font-weight: 400;
            background: transparent;
            border: none;
            color: #2a2a2a;
            cursor: pointer;
            text-decoration: none;
            position: relative;
            padding: 0;
            transition: all 0.3s ease;
          }
          
          .submit-btn::before {
            content: '[';
            margin-right: 2px;
          }
          
          .submit-btn::after {
            content: ']';
            margin-left: 2px;
          }
          
          .submit-btn:hover {
            color: #666;
          }
          
          .submit-btn:hover::before,
          .submit-btn:hover::after {
            animation: bracket-blink 0.5s ease;
          }
          
          @keyframes bracket-blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          
          .submit-btn:active {
            transform: translateY(1px);
          }
          
          .submit-btn:disabled {
            color: #ccc;
            cursor: not-allowed;
          }
          
          @media (max-width: 768px) {
            .container {
              padding: 40px 20px;
              max-width: 100%;
            }
            
            .form-header h1 {
              font-size: 20px;
            }
            
            .form-input,
            .form-textarea,
            .form-label {
              font-size: 14px;
            }
            
            .form-input:focus + .form-label,
            .form-input.has-value + .form-label,
            .form-textarea:focus + .form-label,
            .form-textarea.has-value + .form-label {
              font-size: 11px;
            }
            
            .form-group {
              margin-bottom: 35px;
            }
          }
          
          @media (max-width: 480px) {
            .container {
              padding: 30px 15px;
            }
            
            .form-header {
              margin-bottom: 40px;
            }
            
            .form-group {
              margin-bottom: 30px;
            }
          }
        `}
      </style>
      
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
      </div>
    </div>
  );
};

export default PartnerRegistrationPage;