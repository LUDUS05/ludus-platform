import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';

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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
      <div className="min-h-screen bg-soft-white dark:dark-bg-primary py-20">
        <div className="max-w-2xl mx-auto container-padding">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-display-sm font-bold text-charcoal dark:dark-text-primary mb-4">
              Registration Submitted
            </h2>
            <p className="text-body-md text-charcoal-light dark:dark-text-secondary">
              Thank you for your interest in becoming a LUDUS partner. We'll review your application and get back to you soon.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-white dark:dark-bg-primary py-20">
      <div className="max-w-2xl mx-auto container-padding">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-display-lg font-bold text-charcoal dark:dark-text-primary mb-4">
            Partner Registration
          </h1>
          <p className="text-body-lg text-charcoal-light dark:dark-text-secondary">
            Join the LUDUS network and connect with our community of explorers
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-lg p-8">
          {errors.submit && (
            <Alert
              type="error"
              message={errors.submit}
              onClose={() => setErrors(prev => ({ ...prev, submit: '' }))}
              className="mb-6"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-label-sm font-medium text-charcoal dark:dark-text-primary mb-2">
                Company Name *
              </label>
              <Input
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="Enter your company name"
                error={errors.companyName}
                required
              />
            </div>

            {/* Contact Name */}
            <div>
              <label className="block text-label-sm font-medium text-charcoal dark:dark-text-primary mb-2">
                Contact Person Name *
              </label>
              <Input
                name="contactName"
                value={formData.contactName}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="Enter contact person's full name"
                error={errors.contactName}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-label-sm font-medium text-charcoal dark:dark-text-primary mb-2">
                Email Address *
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="Enter your business email"
                error={errors.email}
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-label-sm font-medium text-charcoal dark:dark-text-primary mb-2">
                Phone Number *
              </label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="Enter your phone number"
                error={errors.phone}
                required
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-label-sm font-medium text-charcoal dark:dark-text-primary mb-2">
                Website URL
              </label>
              <Input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="https://your-website.com (optional)"
                error={errors.website}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-label-sm font-medium text-charcoal dark:dark-text-primary mb-2">
                Company Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="Tell us about your company and the services you offer"
                rows={4}
                className={`w-full px-4 py-3 border-2 rounded-xl transition-colors duration-200 
                  ${errors.description 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-pearl dark:border-dark-pearl focus:border-ludus-orange dark:focus:border-dark-ludus-orange'
                  } 
                  bg-white dark:bg-dark-bg-primary text-charcoal dark:dark-text-primary 
                  placeholder-charcoal-light/60 dark:placeholder-dark-text-secondary/60 
                  focus:outline-none focus:ring-0 resize-vertical min-h-[120px]`}
                required
              />
              {errors.description && (
                <p className="mt-2 text-label-xs text-red-600 dark:text-red-400">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-ludus-orange hover:bg-ludus-orange/90 text-white font-medium py-4 text-body-md"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Submitting...
                  </span>
                ) : (
                  'Submit Registration'
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-body-sm text-charcoal-light dark:dark-text-secondary">
            Our team will review your application and contact you within 2-3 business days.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PartnerRegistrationPage;