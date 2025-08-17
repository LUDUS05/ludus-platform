import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import Alert from '../ui/Alert';
import { cn } from '../../utils/cn';
import { 
  User, 
  Mail, 
  Phone, 
  MessageSquare, 
  Send, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const ContactForm = ({ className, onSubmit, ...props }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    source: 'contact_form'
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('contact.form.errors.nameRequired', 'Name is required');
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('contact.form.errors.emailRequired', 'Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contact.form.errors.emailInvalid', 'Please enter a valid email');
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = t('contact.form.errors.subjectRequired', 'Subject is required');
    }
    
    if (!formData.message.trim()) {
      newErrors.message = t('contact.form.errors.messageRequired', 'Message is required');
    } else if (formData.message.length < 10) {
      newErrors.message = t('contact.form.errors.messageMinLength', 'Message must be at least 10 characters');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // If onSubmit prop is provided, use it; otherwise, use default API call
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Default API call (you can implement your contact API endpoint)
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }
      }

      setSubmitStatus('success');
      setIsSubmitted(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          source: 'contact_form'
        });
        setIsSubmitted(false);
        setSubmitStatus(null);
      }, 3000);

    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      source: 'contact_form'
    });
    setErrors({});
    setSubmitStatus(null);
    setIsSubmitted(false);
  };

  if (isSubmitted && submitStatus === 'success') {
    return (
      <Card className={cn('max-w-2xl mx-auto', className)} {...props}>
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-success-green/10 mb-6">
            <CheckCircle2 className="w-8 h-8 text-success-green" />
          </div>
          <h3 className="text-2xl font-bold text-ludus-dark mb-4">
            {t('contact.form.success.title', 'Message Sent Successfully!')}
          </h3>
          <p className="text-ludus-gray-600 mb-8 max-w-md mx-auto">
            {t('contact.form.success.message', 'Thank you for reaching out! We\'ll get back to you within 24 hours.')}
          </p>
          <Button variant="ghost" onClick={resetForm}>
            {t('contact.form.success.sendAnother', 'Send Another Message')}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('max-w-2xl mx-auto', className)} {...props}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-ludus-orange/10 mb-6">
          <Sparkles className="w-8 h-8 text-ludus-orange" />
        </div>
        <h2 className="text-3xl font-bold text-ludus-dark mb-4">
          {t('contact.form.title', 'Get in Touch')}
        </h2>
        <p className="text-ludus-gray-600 max-w-md mx-auto">
          {t('contact.form.subtitle', 'Have a question or want to work together? We\'d love to hear from you.')}
        </p>
      </div>

      {/* Status Messages */}
      {submitStatus === 'error' && (
        <Alert 
          type="error" 
          className="mb-6"
          title={t('contact.form.error.title', 'Failed to Send Message')}
        >
          {t('contact.form.error.message', 'Something went wrong. Please try again or contact us directly.')}
        </Alert>
      )}

      {/* Contact Form */}
      <form onSubmit={handleSubmit} className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Name and Email Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label={t('contact.form.name.label', 'Full Name')}
            placeholder={t('contact.form.name.placeholder', 'Enter your full name')}
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
            icon={User}
            required
            disabled={isSubmitting}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
          
          <Input
            type="email"
            label={t('contact.form.email.label', 'Email Address')}
            placeholder={t('contact.form.email.placeholder', 'Enter your email')}
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            icon={Mail}
            required
            disabled={isSubmitting}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>

        {/* Phone and Subject Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            type="tel"
            label={t('contact.form.phone.label', 'Phone Number')}
            placeholder={t('contact.form.phone.placeholder', '+966 50 123 4567')}
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            error={errors.phone}
            icon={Phone}
            disabled={isSubmitting}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
          
          <Input
            label={t('contact.form.subject.label', 'Subject')}
            placeholder={t('contact.form.subject.placeholder', 'What is this about?')}
            value={formData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            error={errors.subject}
            icon={MessageSquare}
            required
            disabled={isSubmitting}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ludus-dark">
            {t('contact.form.message.label', 'Message')} *
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-ludus-gray-400 z-10" />
            <textarea
              className={cn(
                'w-full pl-12 pr-4 py-3 rounded-xl border-2 bg-white text-ludus-dark placeholder-ludus-gray-400 focus:outline-none focus:ring-2 focus:ring-ludus-orange/20 transition-colors duration-200 resize-none',
                errors.message 
                  ? 'border-error-red focus:border-error-red focus:ring-error-red/20' 
                  : 'border-warm focus:border-ludus-orange'
              )}
              placeholder={t('contact.form.message.placeholder', 'Tell us more about your inquiry...')}
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={6}
              required
              disabled={isSubmitting}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>
          {errors.message && (
            <p className="text-sm text-error-red">{errors.message}</p>
          )}
          <div className="flex justify-between items-center">
            <span className="text-xs text-ludus-gray-500">
              {t('contact.form.message.minLength', 'Minimum 10 characters')}
            </span>
            <span className="text-xs text-ludus-gray-500">
              {formData.message.length}/1000
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="w-full"
          >
            <Send className="w-5 h-5 mr-3" />
            {isSubmitting 
              ? t('contact.form.submit.sending', 'Sending Message...') 
              : t('contact.form.submit.send', 'Send Message')
            }
          </Button>
        </div>

        {/* Footer Note */}
        <div className="text-center pt-4">
          <p className="text-sm text-ludus-gray-500">
            {t('contact.form.footer', 'We typically respond within 24 hours during business days.')}
          </p>
        </div>
      </form>
    </Card>
  );
};

export default ContactForm;