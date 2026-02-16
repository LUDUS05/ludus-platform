import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/Button';
import { motion } from 'framer-motion';

const PreferencesStep = ({ config, stepData, onComplete, onBack, t }) => {
  const [preferences, setPreferences] = useState(stepData || {});

  const defaultPreferences = [
    {
      preferenceId: 'language',
      label: { en: 'Language', ar: 'اللغة' },
      description: { en: 'Choose your preferred language', ar: 'اختر لغتك المفضلة' },
      type: 'select',
      options: [
        { value: 'ar', label: { en: 'العربية', ar: 'العربية' } },
        { value: 'en', label: { en: 'English', ar: 'English' } }
      ],
      defaultValue: 'ar'
    },
    {
      preferenceId: 'theme',
      label: { en: 'Theme', ar: 'المظهر' },
      description: { en: 'Choose your preferred theme', ar: 'اختر مظهرك المفضل' },
      type: 'select',
      options: [
        { value: 'light', label: { en: 'Light', ar: 'فاتح' } },
        { value: 'dark', label: { en: 'Dark', ar: 'داكن' } }
      ],
      defaultValue: 'light'
    },
    {
      preferenceId: 'locationSharing',
      label: { en: 'Location Sharing', ar: 'مشاركة الموقع' },
      description: { en: 'Enable for better recommendations', ar: 'تفعيل للحصول على توصيات أفضل' },
      type: 'toggle',
      defaultValue: false
    },
    {
      preferenceId: 'emailNotifications',
      label: { en: 'Email Notifications', ar: 'إشعارات البريد الإلكتروني' },
      description: { en: 'Activity recommendations and updates', ar: 'توصيات الأنشطة والتحديثات' },
      type: 'toggle',
      defaultValue: true
    },
    {
      preferenceId: 'pushNotifications',
      label: { en: 'Push Notifications', ar: 'الإشعارات الفورية' },
      description: { en: 'Booking confirmations and updates', ar: 'تأكيدات الحجز والتحديثات' },
      type: 'toggle',
      defaultValue: true
    },
    {
      preferenceId: 'profileVisibility',
      label: { en: 'Profile Visibility', ar: 'رؤية الملف الشخصي' },
      description: { en: 'Control who can see your profile', ar: 'تحكم في من يمكنه رؤية ملفك الشخصي' },
      type: 'select',
      options: [
        { value: 'public', label: { en: 'Public', ar: 'عام' } },
        { value: 'friends', label: { en: 'Friends Only', ar: 'الأصدقاء فقط' } }
      ],
      defaultValue: 'public'
    }
  ];

  const preferencesConfig = config?.preferencesConfig?.preferences || defaultPreferences;

  useEffect(() => {
    // Initialize preferences with default values
    setPreferences(prev => {
      const initialPreferences = {};
      let hasChanges = false;
      preferencesConfig.forEach(pref => {
        if (prev[pref.preferenceId] === undefined) {
          initialPreferences[pref.preferenceId] = pref.defaultValue;
          hasChanges = true;
        }
      });
      return hasChanges ? { ...prev, ...initialPreferences } : prev;
    });
  }, [preferencesConfig]);

  const handlePreferenceChange = (preferenceId, value) => {
    setPreferences(prev => ({
      ...prev,
      [preferenceId]: value
    }));
  };

  const handleContinue = () => {
    onComplete(preferences);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const renderPreference = (preference) => {
    const value = preferences[preference.preferenceId];

    if (preference.type === 'toggle') {
      return (
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {preference.label.en}
            </h3>
            <p className="text-sm text-gray-600">
              {preference.description.en}
            </p>
          </div>
          <button
            onClick={() => handlePreferenceChange(preference.preferenceId, !value)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${value ? 'bg-purple-600' : 'bg-gray-200'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${value ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      );
    }

    if (preference.type === 'select') {
      return (
        <div className="p-4 bg-white rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">
            {preference.label.en}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {preference.description.en}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {preference.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handlePreferenceChange(preference.preferenceId, option.value)}
                className={`
                  p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium
                  ${value === option.value
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
                  }
                `}
              >
                {option.label.en}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-2xl w-full">
        <motion.div
          variants={itemVariants}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {config?.preferencesConfig?.title?.en || t('onboarding.steps.preferences.title')}
            </h2>
            <p className="text-gray-600 text-lg">
              Customize your LUDUS experience
            </p>
          </div>

          {/* Preferences */}
          <div className="space-y-6 mb-8">
            {preferencesConfig.map((preference) => (
              <motion.div
                key={preference.preferenceId}
                variants={itemVariants}
              >
                {renderPreference(preference)}
              </motion.div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              onClick={onBack}
              variant="outline"
            >
              {t('back')}
            </Button>

            <Button
              onClick={handleContinue}
              variant="primary"
              className="min-w-[120px]"
            >
              {t('complete')}
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PreferencesStep;
