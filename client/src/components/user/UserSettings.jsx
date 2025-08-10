import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import SocialLogin from '../auth/SocialLogin';

const UserSettings = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Profile form data
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profileImage: ''
  });
  
  // Preferences form data
  const [preferencesData, setPreferencesData] = useState({
    language: 'en',
    participantGenderMix: 'no-preference',
    preferredTimes: [],
    activityTypes: [],
    categories: [],
    priceRange: { min: 0, max: 500 },
    radius: 25
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        profileImage: user.profileImage || ''
      });
      
      if (user.preferences) {
        setPreferencesData({
          language: user.preferences.language || 'en',
          participantGenderMix: user.preferences.participantGenderMix || 'no-preference',
          preferredTimes: user.preferences.preferredTimes || [],
          activityTypes: user.preferences.activityTypes || [],
          categories: user.preferences.categories || [],
          priceRange: user.preferences.priceRange || { min: 0, max: 500 },
          radius: user.preferences.radius || 25
        });
      }
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePreferenceChange = (field, value) => {
    setPreferencesData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayPreferenceToggle = (field, value) => {
    setPreferencesData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      // API call to update profile
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(profileData)
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        updateUser(updatedUser.data);
        setMessage('Profile updated successfully');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      // API call to update preferences
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

  const handleSocialLinkSuccess = () => {
    setMessage('Social account linked successfully');
    // Refresh user data
    window.location.reload();
  };

  const handleSocialLinkError = (error) => {
    setError('Failed to link social account');
  };

  const tabs = [
    { id: 'profile', label: 'Profile Information' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'social', label: 'Social Accounts' },
    { id: 'privacy', label: 'Privacy & Security' }
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
    { value: 'wellness', label: 'Wellness & Self-care' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      {/* Alert Messages */}
      {message && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-ludus-orange text-ludus-orange'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Profile Information Tab */}
      {activeTab === 'profile' && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  className="input-field"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </div>
        </Card>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Preferences</h2>
            <form onSubmit={handlePreferencesSubmit} className="space-y-6">
              
              {/* Language Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Language
                </label>
                <select
                  value={preferencesData.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="input-field"
                >
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>

              {/* Participant Gender Mix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Participant Gender Mix Preference
                </label>
                <select
                  value={preferencesData.participantGenderMix}
                  onChange={(e) => handlePreferenceChange('participantGenderMix', e.target.value)}
                  className="input-field"
                >
                  <option value="no-preference">No Preference</option>
                  <option value="mixed">Mixed Groups</option>
                  <option value="same-gender">Same Gender Only</option>
                </select>
              </div>

              {/* Preferred Times */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Times
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {timeOptions.map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferencesData.preferredTimes.includes(option.value)}
                        onChange={() => handleArrayPreferenceToggle('preferredTimes', option.value)}
                        className="mr-2"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Activity Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Activity Types
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {activityTypeOptions.map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferencesData.activityTypes.includes(option.value)}
                        onChange={() => handleArrayPreferenceToggle('activityTypes', option.value)}
                        className="mr-2"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Categories
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categoryOptions.map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferencesData.categories.includes(option.value)}
                        onChange={() => handleArrayPreferenceToggle('categories', option.value)}
                        className="mr-2"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (SAR)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      placeholder="Min"
                      value={preferencesData.priceRange.min}
                      onChange={(e) => handlePreferenceChange('priceRange', {
                        ...preferencesData.priceRange,
                        min: parseInt(e.target.value) || 0
                      })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Max"
                      value={preferencesData.priceRange.max}
                      onChange={(e) => handlePreferenceChange('priceRange', {
                        ...preferencesData.priceRange,
                        max: parseInt(e.target.value) || 500
                      })}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Updating...' : 'Update Preferences'}
              </Button>
            </form>
          </div>
        </Card>
      )}

      {/* Social Accounts Tab */}
      {activeTab === 'social' && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Social Account Connections</h2>
            
            <div className="space-y-4">
              {/* Connected Accounts Display */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Connected Accounts</h3>
                {user?.social ? (
                  <div className="space-y-2">
                    {user.social.google && (
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Google Connected
                        </div>
                        <span className="text-green-600 text-sm">✓ Linked</span>
                      </div>
                    )}
                    {user.social.facebook && (
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          Facebook Connected
                        </div>
                        <span className="text-green-600 text-sm">✓ Linked</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No social accounts connected</p>
                )}
              </div>

              {/* Link New Accounts */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Link Additional Accounts</h3>
                <SocialLogin 
                  onSuccess={handleSocialLinkSuccess}
                  onError={handleSocialLinkError}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Privacy & Security Tab */}
      {activeTab === 'privacy' && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Privacy & Security</h2>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Password</h3>
                <p className="text-gray-600 mb-3">Change your account password</p>
                <Button variant="outline">
                  Change Password
                </Button>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Delete Account</h3>
                <p className="text-gray-600 mb-3">Permanently delete your account and all data</p>
                <Button variant="destructive">
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default UserSettings;