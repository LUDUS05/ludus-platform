import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Input } from '../ui';
import Alert from '../ui/Alert';

const EnhancedUserPreferences = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Enhanced preferences form data
  const [preferencesData, setPreferencesData] = useState({
    // Basic preferences
    language: 'en',
    
    // Participation preferences
    participantPreferences: {
      ageGroups: {
        preferred: [],
        avoid: []
      },
      genders: {
        preferred: [],
        avoid: []
      },
      languages: {
        preferred: [],
        avoid: []
      },
      experienceLevels: {
        preferred: [],
        avoid: []
      },
      groupSizes: {
        preferred: [],
        avoid: []
      }
    },
    
    // Activity preferences
    activityPreferences: {
      preferredTimes: [],
      activityTypes: [],
      categories: [],
      priceRange: { min: 0, max: 500 },
      radius: 25,
      indoorOutdoor: 'both',
      physicalIntensity: 'moderate'
    },
    
    // Social preferences
    socialPreferences: {
      participantGenderMix: 'no-preference',
      socialInteraction: 'moderate',
      networking: true,
      teamBuilding: true,
      competitive: false
    },
    
    // Notification preferences
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: true,
      activityUpdates: true,
      socialUpdates: true,
      reminderNotifications: true
    }
  });

  useEffect(() => {
    if (user && user.preferences) {
      setPreferencesData({
        language: user.preferences.language || 'en',
        participantPreferences: {
          ageGroups: user.preferences.participantPreferences?.ageGroups || { preferred: [], avoid: [] },
          genders: user.preferences.participantPreferences?.genders || { preferred: [], avoid: [] },
          languages: user.preferences.participantPreferences?.languages || { preferred: [], avoid: [] },
          experienceLevels: user.preferences.participantPreferences?.experienceLevels || { preferred: [], avoid: [] },
          groupSizes: user.preferences.participantPreferences?.groupSizes || { preferred: [], avoid: [] }
        },
        activityPreferences: {
          preferredTimes: user.preferences.preferredTimes || [],
          activityTypes: user.preferences.activityTypes || [],
          categories: user.preferences.categories || [],
          priceRange: user.preferences.priceRange || { min: 0, max: 500 },
          radius: user.preferences.radius || 25,
          indoorOutdoor: user.preferences.indoorOutdoor || 'both',
          physicalIntensity: user.preferences.physicalIntensity || 'moderate'
        },
        socialPreferences: {
          participantGenderMix: user.preferences.participantGenderMix || 'no-preference',
          socialInteraction: user.preferences.socialInteraction || 'moderate',
          networking: user.preferences.networking !== undefined ? user.preferences.networking : true,
          teamBuilding: user.preferences.teamBuilding !== undefined ? user.preferences.teamBuilding : true,
          competitive: user.preferences.competitive || false
        },
        notifications: user.preferences.notifications || {
          email: true,
          sms: false,
          push: true,
          marketing: true,
          activityUpdates: true,
          socialUpdates: true,
          reminderNotifications: true
        }
      });
    }
  }, [user]);

  const handlePreferenceChange = (path, value) => {
    setPreferencesData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleArrayPreferenceToggle = (path, value, type = 'preferred') => {
    setPreferencesData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      const array = current[keys[keys.length - 1]][type];
      const newArray = array.includes(value)
        ? array.filter(item => item !== value)
        : [...array, value];
      
      current[keys[keys.length - 1]][type] = newArray;
      return newData;
    });
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await fetch('/api/users/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ preferences: preferencesData })
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        updateUser(updatedUser.data);
        setMessage('Preferences updated successfully');
      } else {
        throw new Error('Failed to update preferences');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Options for different preference categories
  const ageGroupOptions = [
    { value: '18-25', label: '18-25 years' },
    { value: '26-35', label: '26-35 years' },
    { value: '36-45', label: '36-45 years' },
    { value: '46-55', label: '46-55 years' },
    { value: '56-65', label: '56-65 years' },
    { value: '65+', label: '65+ years' }
  ];

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'العربية (Arabic)' },
    { value: 'fr', label: 'Français (French)' },
    { value: 'es', label: 'Español (Spanish)' },
    { value: 'ur', label: 'اردو (Urdu)' },
    { value: 'hi', label: 'हिन्दी (Hindi)' }
  ];

  const experienceLevelOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ];

  const groupSizeOptions = [
    { value: 'small', label: 'Small (2-5 people)' },
    { value: 'medium', label: 'Medium (6-15 people)' },
    { value: 'large', label: 'Large (16-30 people)' },
    { value: 'very-large', label: 'Very Large (30+ people)' }
  ];

  const timeOptions = [
    { value: 'weekday-morning', label: 'Weekday Mornings' },
    { value: 'weekday-afternoon', label: 'Weekday Afternoons' },
    { value: 'weekday-evening', label: 'Weekday Evenings' },
    { value: 'weekend-morning', label: 'Weekend Mornings' },
    { value: 'weekend-afternoon', label: 'Weekend Afternoons' },
    { value: 'weekend-evening', label: 'Weekend Evenings' }
  ];

  const activityTypeOptions = [
    { value: 'indoor', label: 'Indoor Activities' },
    { value: 'outdoor', label: 'Outdoor Activities' },
    { value: 'physical', label: 'Physical Activities' },
    { value: 'mental', label: 'Mental Activities' },
    { value: 'social', label: 'Social Activities' },
    { value: 'solo', label: 'Solo Activities' },
    { value: 'group', label: 'Group Activities' }
  ];

  const categoryOptions = [
    { value: 'fitness', label: 'Fitness & Sports' },
    { value: 'arts', label: 'Arts & Culture' },
    { value: 'food', label: 'Food & Dining' },
    { value: 'outdoor', label: 'Outdoor Adventures' },
    { value: 'unique', label: 'Unique Experiences' },
    { value: 'wellness', label: 'Wellness & Health' }
  ];

  const PreferenceSection = ({ title, description, children }) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );

  const PreferenceGroup = ({ title, children }) => (
    <div className="mb-6">
      <h4 className="text-md font-medium text-gray-900 mb-3">{title}</h4>
      {children}
    </div>
  );

  const CheckboxGroup = ({ options, selected, onChange, type = 'preferred' }) => (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => (
        <label key={option.value} className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selected.includes(option.value)}
            onChange={() => onChange(option.value, type)}
            className="h-4 w-4 rounded border-gray-300 text-ludus-orange focus:ring-ludus-orange"
          />
          <span className="text-sm text-gray-700">{option.label}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Participation Preferences</h1>
        <p className="text-gray-600">
          Customize your activity discovery and participation preferences to find the perfect matches.
        </p>
      </div>

      {error && <Alert type="error" message={error} className="mb-6" />}
      {message && <Alert type="success" message={message} className="mb-6" />}

      <form onSubmit={handlePreferencesSubmit} className="space-y-6">
        {/* Basic Preferences */}
        <PreferenceSection
          title="Basic Preferences"
          description="Set your fundamental preferences for the platform"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Language
              </label>
              <select
                value={preferencesData.language}
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
        </PreferenceSection>

        {/* Participant Preferences */}
        <PreferenceSection
          title="Participant Preferences"
          description="Define your preferences for other participants in activities"
        >
          <div className="space-y-6">
            {/* Age Groups */}
            <PreferenceGroup title="Age Groups">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Preferred Age Groups</h5>
                  <CheckboxGroup
                    options={ageGroupOptions}
                    selected={preferencesData.participantPreferences.ageGroups.preferred}
                    onChange={(value) => handleArrayPreferenceToggle('participantPreferences.ageGroups', value, 'preferred')}
                  />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Avoid Age Groups</h5>
                  <CheckboxGroup
                    options={ageGroupOptions}
                    selected={preferencesData.participantPreferences.ageGroups.avoid}
                    onChange={(value) => handleArrayPreferenceToggle('participantPreferences.ageGroups', value, 'avoid')}
                  />
                </div>
              </div>
            </PreferenceGroup>

            {/* Genders */}
            <PreferenceGroup title="Gender Preferences">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Preferred Genders</h5>
                  <CheckboxGroup
                    options={genderOptions}
                    selected={preferencesData.participantPreferences.genders.preferred}
                    onChange={(value) => handleArrayPreferenceToggle('participantPreferences.genders', value, 'preferred')}
                  />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Avoid Genders</h5>
                  <CheckboxGroup
                    options={genderOptions}
                    selected={preferencesData.participantPreferences.genders.avoid}
                    onChange={(value) => handleArrayPreferenceToggle('participantPreferences.genders', value, 'avoid')}
                  />
                </div>
              </div>
            </PreferenceGroup>

            {/* Languages */}
            <PreferenceGroup title="Language Preferences">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Preferred Languages</h5>
                  <CheckboxGroup
                    options={languageOptions}
                    selected={preferencesData.participantPreferences.languages.preferred}
                    onChange={(value) => handleArrayPreferenceToggle('participantPreferences.languages', value, 'preferred')}
                  />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Avoid Languages</h5>
                  <CheckboxGroup
                    options={languageOptions}
                    selected={preferencesData.participantPreferences.languages.avoid}
                    onChange={(value) => handleArrayPreferenceToggle('participantPreferences.languages', value, 'avoid')}
                  />
                </div>
              </div>
            </PreferenceGroup>

            {/* Experience Levels */}
            <PreferenceGroup title="Experience Level Preferences">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Preferred Experience Levels</h5>
                  <CheckboxGroup
                    options={experienceLevelOptions}
                    selected={preferencesData.participantPreferences.experienceLevels.preferred}
                    onChange={(value) => handleArrayPreferenceToggle('participantPreferences.experienceLevels', value, 'preferred')}
                  />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Avoid Experience Levels</h5>
                  <CheckboxGroup
                    options={experienceLevelOptions}
                    selected={preferencesData.participantPreferences.experienceLevels.avoid}
                    onChange={(value) => handleArrayPreferenceToggle('participantPreferences.experienceLevels', value, 'avoid')}
                  />
                </div>
              </div>
            </PreferenceGroup>

            {/* Group Sizes */}
            <PreferenceGroup title="Group Size Preferences">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Preferred Group Sizes</h5>
                  <CheckboxGroup
                    options={groupSizeOptions}
                    selected={preferencesData.participantPreferences.groupSizes.preferred}
                    onChange={(value) => handleArrayPreferenceToggle('participantPreferences.groupSizes', value, 'preferred')}
                  />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Avoid Group Sizes</h5>
                  <CheckboxGroup
                    options={groupSizeOptions}
                    selected={preferencesData.participantPreferences.groupSizes.avoid}
                    onChange={(value) => handleArrayPreferenceToggle('participantPreferences.groupSizes', value, 'avoid')}
                  />
                </div>
              </div>
            </PreferenceGroup>
          </div>
        </PreferenceSection>

        {/* Activity Preferences */}
        <PreferenceSection
          title="Activity Preferences"
          description="Set your preferences for activities and experiences"
        >
          <div className="space-y-6">
            <PreferenceGroup title="Preferred Times">
              <CheckboxGroup
                options={timeOptions}
                selected={preferencesData.activityPreferences.preferredTimes}
                onChange={(value) => {
                  const newTimes = preferencesData.activityPreferences.preferredTimes.includes(value)
                    ? preferencesData.activityPreferences.preferredTimes.filter(t => t !== value)
                    : [...preferencesData.activityPreferences.preferredTimes, value];
                  handlePreferenceChange('activityPreferences.preferredTimes', newTimes);
                }}
              />
            </PreferenceGroup>

            <PreferenceGroup title="Activity Types">
              <CheckboxGroup
                options={activityTypeOptions}
                selected={preferencesData.activityPreferences.activityTypes}
                onChange={(value) => {
                  const newTypes = preferencesData.activityPreferences.activityTypes.includes(value)
                    ? preferencesData.activityPreferences.activityTypes.filter(t => t !== value)
                    : [...preferencesData.activityPreferences.activityTypes, value];
                  handlePreferenceChange('activityPreferences.activityTypes', newTypes);
                }}
              />
            </PreferenceGroup>

            <PreferenceGroup title="Categories">
              <CheckboxGroup
                options={categoryOptions}
                selected={preferencesData.activityPreferences.categories}
                onChange={(value) => {
                  const newCategories = preferencesData.activityPreferences.categories.includes(value)
                    ? preferencesData.activityPreferences.categories.filter(c => c !== value)
                    : [...preferencesData.activityPreferences.categories, value];
                  handlePreferenceChange('activityPreferences.categories', newCategories);
                }}
              />
            </PreferenceGroup>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Indoor/Outdoor Preference
                </label>
                <select
                  value={preferencesData.activityPreferences.indoorOutdoor}
                  onChange={(e) => handlePreferenceChange('activityPreferences.indoorOutdoor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
                >
                  <option value="both">Both</option>
                  <option value="indoor">Indoor Only</option>
                  <option value="outdoor">Outdoor Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Physical Intensity
                </label>
                <select
                  value={preferencesData.activityPreferences.physicalIntensity}
                  onChange={(e) => handlePreferenceChange('activityPreferences.physicalIntensity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                  <option value="very-high">Very High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Radius (km)
                </label>
                <Input
                  type="number"
                  value={preferencesData.activityPreferences.radius}
                  onChange={(e) => handlePreferenceChange('activityPreferences.radius', parseInt(e.target.value))}
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range (SAR)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  value={preferencesData.activityPreferences.priceRange.min}
                  onChange={(e) => handlePreferenceChange('activityPreferences.priceRange.min', parseInt(e.target.value))}
                  placeholder="Min price"
                  min="0"
                />
                <Input
                  type="number"
                  value={preferencesData.activityPreferences.priceRange.max}
                  onChange={(e) => handlePreferenceChange('activityPreferences.priceRange.max', parseInt(e.target.value))}
                  placeholder="Max price"
                  min="0"
                />
              </div>
            </div>
          </div>
        </PreferenceSection>

        {/* Social Preferences */}
        <PreferenceSection
          title="Social Preferences"
          description="Define your social interaction preferences"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Participant Gender Mix
                </label>
                <select
                  value={preferencesData.socialPreferences.participantGenderMix}
                  onChange={(e) => handlePreferenceChange('socialPreferences.participantGenderMix', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
                >
                  <option value="no-preference">No Preference</option>
                  <option value="mixed">Mixed Groups</option>
                  <option value="same-gender">Same Gender Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Social Interaction Level
                </label>
                <select
                  value={preferencesData.socialPreferences.socialInteraction}
                  onChange={(e) => handlePreferenceChange('socialPreferences.socialInteraction', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
                >
                  <option value="minimal">Minimal</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Social Features</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferencesData.socialPreferences.networking}
                    onChange={(e) => handlePreferenceChange('socialPreferences.networking', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Enable networking opportunities</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferencesData.socialPreferences.teamBuilding}
                    onChange={(e) => handlePreferenceChange('socialPreferences.teamBuilding', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Participate in team building activities</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferencesData.socialPreferences.competitive}
                    onChange={(e) => handlePreferenceChange('socialPreferences.competitive', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Join competitive activities</span>
                </label>
              </div>
            </div>
          </div>
        </PreferenceSection>

        {/* Notification Preferences */}
        <PreferenceSection
          title="Notification Preferences"
          description="Control how and when you receive notifications"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferencesData.notifications.email}
                  onChange={(e) => handlePreferenceChange('notifications.email', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Email notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferencesData.notifications.sms}
                  onChange={(e) => handlePreferenceChange('notifications.sms', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">SMS notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferencesData.notifications.push}
                  onChange={(e) => handlePreferenceChange('notifications.push', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Push notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferencesData.notifications.marketing}
                  onChange={(e) => handlePreferenceChange('notifications.marketing', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Marketing notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferencesData.notifications.activityUpdates}
                  onChange={(e) => handlePreferenceChange('notifications.activityUpdates', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Activity updates</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferencesData.notifications.socialUpdates}
                  onChange={(e) => handlePreferenceChange('notifications.socialUpdates', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Social updates</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferencesData.notifications.reminderNotifications}
                  onChange={(e) => handlePreferenceChange('notifications.reminderNotifications', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Reminder notifications</span>
              </label>
            </div>
          </div>
        </PreferenceSection>

        <CardFooter className="flex justify-end">
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-ludus-orange hover:bg-ludus-orange-dark"
          >
            {loading ? 'Updating...' : 'Update Preferences'}
          </Button>
        </CardFooter>
      </form>
    </div>
  );
};

export default EnhancedUserPreferences;
