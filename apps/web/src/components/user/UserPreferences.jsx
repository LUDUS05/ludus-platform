/**
 * @fileoverview User Preferences Management Component with RTL Support
 * @module components/user/UserPreferences
 * 
 * This component provides comprehensive user preferences management including:
 * - Activity preferences
 * - Notification settings
 * - Language and location preferences
 * - Social preferences
 * - Privacy settings
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useTranslationWithFallback from '../../hooks/useTranslationWithFallback';
import { userService } from '../../services/userService';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Alert, Switch } from '../ui';
import { Bell, Globe, MapPin, Users, Shield, Heart, Clock, DollarSign } from 'lucide-react';

const UserPreferences = () => {
  const { t } = useTranslationWithFallback();
  const [preferences, setPreferences] = useState({
    language: 'ar',
    timezone: 'Asia/Riyadh',
    interests: [],
    activityTypes: [],
    preferredTimes: [],
    languages: [],
    priceRange: { min: 0, max: 1000 },
    radius: 25,
    participantGenderMix: 'no-preference',
    socialPreferences: {
      socialInteraction: 'moderate',
      networking: true,
      teamBuilding: true,
      competitive: false
    },
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: true,
      activityUpdates: true,
      socialUpdates: true,
      reminderNotifications: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      showLocation: true,
      showActivityHistory: true
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [activeSection, setActiveSection] = useState('general');

  const sections = [
    { id: 'general', label: t('preferences.general', 'General'), icon: Globe },
    { id: 'activities', label: t('preferences.activities', 'Activities'), icon: Heart },
    { id: 'notifications', label: t('preferences.notifications', 'Notifications'), icon: Bell },
    { id: 'privacy', label: t('preferences.privacy', 'Privacy'), icon: Shield },
    { id: 'location', label: t('preferences.location', 'Location'), icon: MapPin }
  ];

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserPreferences();
      setPreferences(response.data.preferences);
    } catch (err) {
      setError(t('preferences.loadError', 'Failed to load preferences'));
      console.error('Load preferences error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (path, value) => {
    setPreferences(prev => {
      const newPrefs = { ...prev };
      const keys = path.split('.');
      let current = newPrefs;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newPrefs;
    });
  };

  const handleArrayToggle = (path, value) => {
    setPreferences(prev => {
      const newPrefs = { ...prev };
      const keys = path.split('.');
      let current = newPrefs;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      const array = current[keys[keys.length - 1]];
      if (array.includes(value)) {
        current[keys[keys.length - 1]] = array.filter(item => item !== value);
      } else {
        current[keys[keys.length - 1]] = [...array, value];
      }
      
      return newPrefs;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await userService.updateUserPreferences(preferences);
      setMessage(t('preferences.saved', 'Preferences saved successfully'));
    } catch (err) {
      setError(err.response?.data?.message || t('preferences.saveError', 'Failed to save preferences'));
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setPreferences({
      language: 'ar',
      timezone: 'Asia/Riyadh',
      interests: [],
      activityTypes: [],
      preferredTimes: [],
      languages: [],
      priceRange: { min: 0, max: 1000 },
      radius: 25,
      participantGenderMix: 'no-preference',
      socialPreferences: {
        socialInteraction: 'moderate',
        networking: true,
        teamBuilding: true,
        competitive: false
      },
      notifications: {
        email: true,
        sms: false,
        push: true,
        marketing: true,
        activityUpdates: true,
        socialUpdates: true,
        reminderNotifications: true
      },
      privacy: {
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        showLocation: true,
        showActivityHistory: true
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={t('common.direction') || 'ltr'}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ludus-orange"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={t('common.direction') || 'ltr'}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('preferences.title', 'Preferences')}
          </h1>
          <p className="text-gray-600">
            {t('preferences.description', 'Customize your LUDUS experience')}
          </p>
        </div>

        {error && <Alert type="error" message={error} className="mb-6" />}
        {message && <Alert type="success" message={message} className="mb-6" />}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeSection === section.id
                            ? 'bg-ludus-orange text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{section.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeSection === 'general' && (
              <GeneralPreferences
                preferences={preferences}
                onPreferenceChange={handlePreferenceChange}
                t={t}
              />
            )}
            {activeSection === 'activities' && (
              <ActivityPreferences
                preferences={preferences}
                onPreferenceChange={handlePreferenceChange}
                onArrayToggle={handleArrayToggle}
                t={t}
              />
            )}
            {activeSection === 'notifications' && (
              <NotificationPreferences
                preferences={preferences}
                onPreferenceChange={handlePreferenceChange}
                t={t}
              />
            )}
            {activeSection === 'privacy' && (
              <PrivacyPreferences
                preferences={preferences}
                onPreferenceChange={handlePreferenceChange}
                t={t}
              />
            )}
            {activeSection === 'location' && (
              <LocationPreferences
                preferences={preferences}
                onPreferenceChange={handlePreferenceChange}
                t={t}
              />
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 rtl:space-x-reverse mt-8">
              <Button
                onClick={resetToDefaults}
                variant="outline"
                disabled={saving}
              >
                {t('preferences.reset', 'Reset to Defaults')}
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-ludus-orange hover:bg-ludus-orange-dark"
              >
                {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save Changes')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// General Preferences Component
const GeneralPreferences = ({ preferences, onPreferenceChange, t }) => {
  const options = userService.getPreferenceOptions();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('preferences.language', 'Language & Region')}</CardTitle>
          <CardDescription>{t('preferences.languageDesc', 'Choose your preferred language and timezone')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('preferences.language', 'Language')}
              </label>
              <select
                value={preferences.language}
                onChange={(e) => onPreferenceChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('preferences.timezone', 'Timezone')}
              </label>
              <select
                value={preferences.timezone}
                onChange={(e) => onPreferenceChange('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
              >
                <option value="Asia/Riyadh">Asia/Riyadh (GMT+3)</option>
                <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
                <option value="Asia/Kuwait">Asia/Kuwait (GMT+3)</option>
                <option value="Asia/Bahrain">Asia/Bahrain (GMT+3)</option>
                <option value="Asia/Qatar">Asia/Qatar (GMT+3)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('preferences.languages', 'Languages You Speak')}</CardTitle>
          <CardDescription>{t('preferences.languagesDesc', 'Select all languages you can communicate in')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {options.languages.map((language) => (
              <label key={language.value} className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={preferences.languages.includes(language.value)}
                  onChange={() => onArrayToggle('languages', language.value)}
                  className="h-4 w-4 rounded border-gray-300 text-ludus-orange focus:ring-ludus-orange"
                />
                <span className="text-sm text-gray-700 flex items-center">
                  <span className="mr-1">{language.flag}</span>
                  {language.label}
                </span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Activity Preferences Component
const ActivityPreferences = ({ preferences, onPreferenceChange, onArrayToggle, t }) => {
  const options = userService.getPreferenceOptions();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('preferences.interests', 'Interests')}</CardTitle>
          <CardDescription>{t('preferences.interestsDesc', 'What activities interest you?')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {options.categories.map((interest) => (
              <label key={interest.value} className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={preferences.interests.includes(interest.value)}
                  onChange={() => onArrayToggle('interests', interest.value)}
                  className="h-4 w-4 rounded border-gray-300 text-ludus-orange focus:ring-ludus-orange"
                />
                <span className="text-sm text-gray-700 flex items-center">
                  <span className="mr-1">{interest.icon}</span>
                  {interest.label}
                </span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('preferences.activityTypes', 'Activity Types')}</CardTitle>
          <CardDescription>{t('preferences.activityTypesDesc', 'What types of activities do you prefer?')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {options.activityTypes.map((type) => (
              <label key={type.value} className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={preferences.activityTypes.includes(type.value)}
                  onChange={() => onArrayToggle('activityTypes', type.value)}
                  className="h-4 w-4 rounded border-gray-300 text-ludus-orange focus:ring-ludus-orange"
                />
                <span className="text-sm text-gray-700 flex items-center">
                  <span className="mr-1">{type.icon}</span>
                  {type.label}
                </span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('preferences.preferredTimes', 'Preferred Times')}</CardTitle>
          <CardDescription>{t('preferences.preferredTimesDesc', 'When do you prefer to do activities?')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {options.preferredTimes.map((time) => (
              <label key={time.value} className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={preferences.preferredTimes.includes(time.value)}
                  onChange={() => onArrayToggle('preferredTimes', time.value)}
                  className="h-4 w-4 rounded border-gray-300 text-ludus-orange focus:ring-ludus-orange"
                />
                <span className="text-sm text-gray-700 flex items-center">
                  <span className="mr-1">{time.icon}</span>
                  {time.label}
                </span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('preferences.priceRange', 'Price Range')}</CardTitle>
          <CardDescription>{t('preferences.priceRangeDesc', 'What price range works for you?')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('preferences.minPrice', 'Minimum Price (SAR)')}
                </label>
                <Input
                  type="number"
                  value={preferences.priceRange.min}
                  onChange={(e) => onPreferenceChange('priceRange.min', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('preferences.maxPrice', 'Maximum Price (SAR)')}
                </label>
                <Input
                  type="number"
                  value={preferences.priceRange.max}
                  onChange={(e) => onPreferenceChange('priceRange.max', parseInt(e.target.value) || 1000)}
                  min="0"
                />
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {t('preferences.priceRangeNote', 'Activities within this range will be prioritized in your recommendations')}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('preferences.socialPreferences', 'Social Preferences')}</CardTitle>
          <CardDescription>{t('preferences.socialPreferencesDesc', 'How do you like to interact with others?')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('preferences.socialInteraction', 'Social Interaction Level')}
              </label>
              <select
                value={preferences.socialPreferences.socialInteraction}
                onChange={(e) => onPreferenceChange('socialPreferences.socialInteraction', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
              >
                <option value="minimal">{t('preferences.minimal', 'Minimal')}</option>
                <option value="moderate">{t('preferences.moderate', 'Moderate')}</option>
                <option value="high">{t('preferences.high', 'High')}</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={preferences.socialPreferences.networking}
                  onChange={(e) => onPreferenceChange('socialPreferences.networking', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-ludus-orange focus:ring-ludus-orange"
                />
                <span className="text-sm text-gray-700">{t('preferences.networking', 'I enjoy networking')}</span>
              </label>
              <label className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={preferences.socialPreferences.teamBuilding}
                  onChange={(e) => onPreferenceChange('socialPreferences.teamBuilding', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-ludus-orange focus:ring-ludus-orange"
                />
                <span className="text-sm text-gray-700">{t('preferences.teamBuilding', 'I enjoy team building activities')}</span>
              </label>
              <label className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={preferences.socialPreferences.competitive}
                  onChange={(e) => onPreferenceChange('socialPreferences.competitive', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-ludus-orange focus:ring-ludus-orange"
                />
                <span className="text-sm text-gray-700">{t('preferences.competitive', 'I enjoy competitive activities')}</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Notification Preferences Component
const NotificationPreferences = ({ preferences, onPreferenceChange, t }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('preferences.notificationChannels', 'Notification Channels')}</CardTitle>
          <CardDescription>{t('preferences.notificationChannelsDesc', 'Choose how you want to receive notifications')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{t('preferences.emailNotifications', 'Email Notifications')}</h3>
                <p className="text-sm text-gray-500">{t('preferences.emailNotificationsDesc', 'Receive notifications via email')}</p>
              </div>
              <Switch
                checked={preferences.notifications.email}
                onChange={(checked) => onPreferenceChange('notifications.email', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{t('preferences.smsNotifications', 'SMS Notifications')}</h3>
                <p className="text-sm text-gray-500">{t('preferences.smsNotificationsDesc', 'Receive notifications via SMS')}</p>
              </div>
              <Switch
                checked={preferences.notifications.sms}
                onChange={(checked) => onPreferenceChange('notifications.sms', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{t('preferences.pushNotifications', 'Push Notifications')}</h3>
                <p className="text-sm text-gray-500">{t('preferences.pushNotificationsDesc', 'Receive push notifications on your device')}</p>
              </div>
              <Switch
                checked={preferences.notifications.push}
                onChange={(checked) => onPreferenceChange('notifications.push', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('preferences.notificationTypes', 'Notification Types')}</CardTitle>
          <CardDescription>{t('preferences.notificationTypesDesc', 'Choose what types of notifications you want to receive')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{t('preferences.activityUpdates', 'Activity Updates')}</h3>
                <p className="text-sm text-gray-500">{t('preferences.activityUpdatesDesc', 'Updates about your booked activities')}</p>
              </div>
              <Switch
                checked={preferences.notifications.activityUpdates}
                onChange={(checked) => onPreferenceChange('notifications.activityUpdates', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{t('preferences.socialUpdates', 'Social Updates')}</h3>
                <p className="text-sm text-gray-500">{t('preferences.socialUpdatesDesc', 'Updates about friends and social activities')}</p>
              </div>
              <Switch
                checked={preferences.notifications.socialUpdates}
                onChange={(checked) => onPreferenceChange('notifications.socialUpdates', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{t('preferences.reminderNotifications', 'Reminder Notifications')}</h3>
                <p className="text-sm text-gray-500">{t('preferences.reminderNotificationsDesc', 'Reminders for upcoming activities')}</p>
              </div>
              <Switch
                checked={preferences.notifications.reminderNotifications}
                onChange={(checked) => onPreferenceChange('notifications.reminderNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{t('preferences.marketingNotifications', 'Marketing Notifications')}</h3>
                <p className="text-sm text-gray-500">{t('preferences.marketingNotificationsDesc', 'Promotional offers and new activity announcements')}</p>
              </div>
              <Switch
                checked={preferences.notifications.marketing}
                onChange={(checked) => onPreferenceChange('notifications.marketing', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Privacy Preferences Component
const PrivacyPreferences = ({ preferences, onPreferenceChange, t }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('preferences.profileVisibility', 'Profile Visibility')}</CardTitle>
          <CardDescription>{t('preferences.profileVisibilityDesc', 'Control who can see your profile information')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('preferences.profileVisibility', 'Profile Visibility')}
              </label>
              <select
                value={preferences.privacy.profileVisibility}
                onChange={(e) => onPreferenceChange('privacy.profileVisibility', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
              >
                <option value="public">{t('preferences.public', 'Public - Everyone can see')}</option>
                <option value="friends">{t('preferences.friends', 'Friends only')}</option>
                <option value="private">{t('preferences.private', 'Private - Only me')}</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={preferences.privacy.showEmail}
                  onChange={(e) => onPreferenceChange('privacy.showEmail', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-ludus-orange focus:ring-ludus-orange"
                />
                <span className="text-sm text-gray-700">{t('preferences.showEmail', 'Show email address')}</span>
              </label>
              <label className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={preferences.privacy.showPhone}
                  onChange={(e) => onPreferenceChange('privacy.showPhone', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-ludus-orange focus:ring-ludus-orange"
                />
                <span className="text-sm text-gray-700">{t('preferences.showPhone', 'Show phone number')}</span>
              </label>
              <label className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={preferences.privacy.showLocation}
                  onChange={(e) => onPreferenceChange('privacy.showLocation', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-ludus-orange focus:ring-ludus-orange"
                />
                <span className="text-sm text-gray-700">{t('preferences.showLocation', 'Show location')}</span>
              </label>
              <label className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={preferences.privacy.showActivityHistory}
                  onChange={(e) => onPreferenceChange('privacy.showActivityHistory', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-ludus-orange focus:ring-ludus-orange"
                />
                <span className="text-sm text-gray-700">{t('preferences.showActivityHistory', 'Show activity history')}</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Location Preferences Component
const LocationPreferences = ({ preferences, onPreferenceChange, t }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('preferences.searchRadius', 'Search Radius')}</CardTitle>
          <CardDescription>{t('preferences.searchRadiusDesc', 'How far are you willing to travel for activities?')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('preferences.radius', 'Search Radius (km)')}
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={preferences.radius}
                onChange={(e) => onPreferenceChange('radius', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>1 km</span>
                <span className="font-medium">{preferences.radius} km</span>
                <span>100 km</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {t('preferences.radiusNote', 'Activities within this radius will be shown in your search results')}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('preferences.participantGenderMix', 'Participant Gender Mix')}</CardTitle>
          <CardDescription>{t('preferences.participantGenderMixDesc', 'What gender mix do you prefer for activities?')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <label className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="radio"
                name="participantGenderMix"
                value="no-preference"
                checked={preferences.participantGenderMix === 'no-preference'}
                onChange={(e) => onPreferenceChange('participantGenderMix', e.target.value)}
                className="h-4 w-4 text-ludus-orange focus:ring-ludus-orange"
              />
              <span className="text-sm text-gray-700">{t('preferences.noPreference', 'No preference')}</span>
            </label>
            <label className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="radio"
                name="participantGenderMix"
                value="mixed"
                checked={preferences.participantGenderMix === 'mixed'}
                onChange={(e) => onPreferenceChange('participantGenderMix', e.target.value)}
                className="h-4 w-4 text-ludus-orange focus:ring-ludus-orange"
              />
              <span className="text-sm text-gray-700">{t('preferences.mixed', 'Mixed gender groups')}</span>
            </label>
            <label className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="radio"
                name="participantGenderMix"
                value="same-gender"
                checked={preferences.participantGenderMix === 'same-gender'}
                onChange={(e) => onPreferenceChange('participantGenderMix', e.target.value)}
                className="h-4 w-4 text-ludus-orange focus:ring-ludus-orange"
              />
              <span className="text-sm text-gray-700">{t('preferences.sameGender', 'Same gender groups')}</span>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPreferences;
