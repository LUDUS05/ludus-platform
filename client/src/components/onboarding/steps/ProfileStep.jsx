import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import onboardingService from '../../../services/onboardingService';

const ProfileStep = ({ config, stepData, onComplete, onBack, onSkip, t }) => {
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [formData, setFormData] = useState(stepData || {});
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  const fields = config?.profileConfig?.fields || [
    {
      fieldId: 'firstName',
      label: { en: 'First Name', ar: 'الاسم الأول' },
      placeholder: { en: 'Enter your first name', ar: 'أدخل اسمك الأول' },
      isRequired: true,
      order: 0
    },
    {
      fieldId: 'lastName',
      label: { en: 'Last Name', ar: 'اسم العائلة' },
      placeholder: { en: 'Enter your last name', ar: 'أدخل اسم العائلة' },
      isRequired: true,
      order: 1
    },
    {
      fieldId: 'email',
      label: { en: 'Email', ar: 'البريد الإلكتروني' },
      placeholder: { en: 'example@email.com', ar: 'example@email.com' },
      isRequired: true,
      order: 2
    },
    {
      fieldId: 'phone',
      label: { en: 'Phone', ar: 'الهاتف' },
      placeholder: { en: '+966 XX XXX XXXX', ar: '+966 XX XXX XXXX' },
      isRequired: false,
      order: 3
    }
  ].sort((a, b) => a.order - b.order);

  const currentField = fields[currentFieldIndex];

  useEffect(() => {
    // Pre-fill email if available from auth
    if (currentField?.fieldId === 'email' && !formData.email) {
      // This would come from auth context
      // setFormData(prev => ({ ...prev, email: userEmail }));
    }
  }, [currentField]);

  const validateField = (fieldId, value) => {
    const field = fields.find(f => f.fieldId === fieldId);
    if (!field) return [];

    return onboardingService.validateField(fieldId, value, {
      required: field.isRequired,
      ...field.validation
    });
  };

  const handleInputChange = (value) => {
    const fieldId = currentField.fieldId;
    
    // Format phone number if needed
    if (fieldId === 'phone') {
      value = onboardingService.formatPhoneNumber(value);
    }

    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));

    // Clear errors for this field
    setErrors(prev => ({
      ...prev,
      [fieldId]: []
    }));
  };

  const handleNext = async () => {
    const fieldId = currentField.fieldId;
    const value = formData[fieldId] || '';

    setIsValidating(true);

    // Validate current field
    const fieldErrors = validateField(fieldId, value);
    
    if (fieldErrors.length > 0) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: fieldErrors
      }));
      setIsValidating(false);
      return;
    }

    // Move to next field or complete step
    if (currentFieldIndex < fields.length - 1) {
      setCurrentFieldIndex(currentFieldIndex + 1);
    } else {
      // Complete the step
      onComplete(formData);
    }

    setIsValidating(false);
  };

  const handleBack = () => {
    if (currentFieldIndex > 0) {
      setCurrentFieldIndex(currentFieldIndex - 1);
    } else {
      onBack();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleNext();
    }
  };

  const getFieldQuestion = (field) => {
    const questions = {
      firstName: t('onboarding.steps.profile.questions.firstName.question'),
      lastName: t('onboarding.steps.profile.questions.lastName.question', { name: formData.firstName || '' }),
      email: t('onboarding.steps.profile.questions.email.question'),
      phone: t('onboarding.steps.profile.questions.phone.question'),
      dateOfBirth: t('onboarding.steps.profile.questions.dateOfBirth.question')
    };
    return questions[field.fieldId] || field.label.en;
  };

  const getFieldPlaceholder = (field) => {
    const placeholders = {
      firstName: t('onboarding.steps.profile.questions.firstName.placeholder'),
      lastName: t('onboarding.steps.profile.questions.lastName.placeholder'),
      email: t('onboarding.steps.profile.questions.email.placeholder'),
      phone: t('onboarding.steps.profile.questions.phone.placeholder'),
      dateOfBirth: t('onboarding.steps.profile.questions.dateOfBirth.placeholder')
    };
    return placeholders[field.fieldId] || field.placeholder.en;
  };

  const getErrorMessage = (fieldId, errors) => {
    if (errors.length === 0) return null;
    
    const errorMessages = {
      required: t('onboarding.validation.required'),
      invalidEmail: t('onboarding.validation.invalidEmail'),
      invalidPhone: t('onboarding.validation.invalidPhone'),
      minLength: t('onboarding.validation.minLength'),
      maxLength: t('onboarding.validation.maxLength')
    };

    return errorMessages[errors[0]] || errors[0];
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <motion.div
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-700 mb-2">
              <span>{currentFieldIndex + 1} of {fields.length}</span>
              <span>{Math.round(((currentFieldIndex + 1) / fields.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentFieldIndex + 1) / fields.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFieldIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {getFieldQuestion(currentField)}
              </h2>
            </motion.div>
          </AnimatePresence>

          {/* Input Field */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`input-${currentFieldIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <Input
                type={currentField.fieldId === 'email' ? 'email' : 
                      currentField.fieldId === 'phone' ? 'tel' :
                      currentField.fieldId === 'dateOfBirth' ? 'date' : 'text'}
                value={formData[currentField.fieldId] || ''}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={getFieldPlaceholder(currentField)}
                className="w-full text-lg py-4 px-4"
              />
              
              {/* Error message */}
              {errors[currentField.fieldId] && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600"
                >
                  {getErrorMessage(currentField.fieldId, errors[currentField.fieldId])}
                </motion.p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleBack}
                variant="outline"
                disabled={isValidating}
              >
                {t('back')}
              </Button>
              {onSkip && (
                <Button
                  onClick={() => onSkip()}
                  variant="outline"
                  disabled={isValidating}
                >
                  {t('onboarding.completeLater')}
                </Button>
              )}
            </div>
            
            <Button
              onClick={handleNext}
              variant="primary"
              disabled={isValidating || !formData[currentField.fieldId]?.trim()}
              className="min-w-[120px]"
            >
              {isValidating ? t('common.loading') : t('continue')}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileStep;
