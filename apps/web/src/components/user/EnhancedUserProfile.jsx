/**
 * @fileoverview Enhanced User Profile Component with RTL Support
 * @module components/user/EnhancedUserProfile
 * 
 * This component provides comprehensive user profile management including:
 * - Profile editing with RTL support
 * - Image upload functionality
 * - Social links management
 * - Preferences management
 * - Location management
 * - Statistics display
 * - Activity history
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTranslationWithFallback } from '../../hooks/useTranslationWithFallback';
import { userService } from '../../services/userService';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Alert } from '../ui';
import { Camera, MapPin, Globe, Users, Calendar, TrendingUp, Settings } from 'lucide-react';

const EnhancedUserProfile = ({ userId, isOwnProfile = false }) => {
  const { t } = useTranslationWithFallback();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form data
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    firstNameAr: '',
    lastNameAr: '',
    bio: '',
    bioAr: '',
    profileImage: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    socialLinks: {
      instagram: '',
      twitter: '',
      linkedin: '',
      website: '',
      snapchat: ''
    },
    location: {
      city: '',
      region: '',
      country: 'Saudi Arabia',
      address: '',
      coordinates: null
    },
    preferences: {
      language: 'ar',
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
      }
    }
  });

  // Statistics and activity data
  const [stats, setStats] = useState(null);
  const [activityHistory, setActivityHistory] = useState([]);
  const [preferenceOptions, setPreferenceOptions] = useState(null);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [profileResponse, statsResponse, activityResponse, preferencesResponse] = await Promise.all([
        userService.getUserProfile(),
        userService.getUserStats(),
        userService.getUserActivityHistory({ limit: 10 }),
        userService.getUserPreferences()
      ]);

      setUser(profileResponse.data.user);
      setStats(statsResponse.data.stats);
      setActivityHistory(activityResponse.data.activities);
      setPreferenceOptions(preferencesResponse.data.options);
      
      populateFormData(profileResponse.data.user);
    } catch (err) {
      setError(t('user.profileLoadError', 'Failed to load user profile'));
      console.error('Load user data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const populateFormData = (userData) => {
    setProfileData({
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      firstNameAr: userData.profile?.firstNameAr || '',
      lastNameAr: userData.profile?.lastNameAr || '',
      bio: userData.bio || '',
      bioAr: userData.profile?.bioAr || '',
      profileImage: userData.profileImage || '',
      phone: userData.phone || '',
      dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
      gender: userData.gender || '',
      socialLinks: userData.socialLinks || {
        instagram: '',
        twitter: '',
        linkedin: '',
        website: '',
        snapchat: ''
      },
      location: userData.location || {
        city: '',
        region: '',
        country: 'Saudi Arabia',
        address: '',
        coordinates: null
      },
      preferences: userData.preferences || {
        language: 'ar',
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
        }
      }
    });
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setProfileData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleArrayToggle = (parent, field, value) => {
    setProfileData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: prev[parent][field].includes(value)
          ? prev[parent][field].filter(item => item !== value)
          : [...prev[parent][field], value]
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      // Validate profile data
      const validation = userService.validateProfileData(profileData);
      if (!validation.isValid) {
        setError(Object.values(validation.errors).join(', '));
        setSaving(false);
        return;
      }

      // Update profile
      const response = await userService.updateUserProfile(profileData);
      setUser(response.data.user);
      setMessage(t('user.profileUpdated', 'Profile updated successfully'));
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || t('user.profileUpdateError', 'Failed to update profile'));
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // TODO: Implement image upload to Cloudinary
    // For now, create a mock URL
    const mockImageUrl = URL.createObjectURL(file);
    
    try {
      await userService.updateProfileImage(mockImageUrl);
      setProfileData(prev => ({ ...prev, profileImage: mockImageUrl }));
      setMessage(t('user.imageUpdated', 'Profile image updated successfully'));
    } catch (err) {
      setError(t('user.imageUpdateError', 'Failed to update profile image'));
    }
  };

  const tabs = [
    { id: 'profile', label: t('user.profile', 'Profile'), icon: Users },
    { id: 'preferences', label: t('user.preferences', 'Preferences'), icon: Settings },
    { id: 'activity', label: t('user.activity', 'Activity'), icon: Calendar },
    { id: 'stats', label: t('user.statistics', 'Statistics'), icon: TrendingUp }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={t('common.direction') || 'ltr'}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ludus-orange"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={t('common.direction') || 'ltr'}>
      <div className="max-w-6xl mx-auto px-4">
        {error && <Alert type="error" message={error} className="mb-6" />}
        {message && <Alert type="success" message={message} className="mb-6" />}

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {profileData.profileImage ? (
                    <img
                      src={profileData.profileImage}
                      alt={userService.formatUserDisplayName(profileData)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl text-gray-400">
                      {userService.getUserInitials(profileData)}
                    </div>
                  )}
                </div>
                {isOwnProfile && isEditing && (
                  <label className="absolute bottom-0 right-0 bg-ludus-orange text-white rounded-full p-2 cursor-pointer hover:bg-ludus-orange-dark transition-colors">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {isEditing ? (
                        <div className="flex space-x-2 rtl:space-x-reverse">
                          <Input
                            value={profileData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            placeholder={t('user.firstName', 'First Name')}
                            className="w-32"
                          />
                          <Input
                            value={profileData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            placeholder={t('user.lastName', 'Last Name')}
                            className="w-32"
                          />
                        </div>
                      ) : (
                        userService.formatUserDisplayName(profileData, profileData.preferences?.language)
                      )}
                    </h1>
                    <p className="text-gray-600 mt-1 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {userService.formatUserLocation(profileData)}
                    </p>
                    {profileData.bio && (
                      <p className="text-gray-700 mt-2 max-w-2xl">
                        {isEditing ? (
                          <textarea
                            value={profileData.bio}
                            onChange={(e) => handleInputChange('bio', e.target.value)}
                            placeholder={t('user.bioPlaceholder', 'Tell us about yourself...')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
                            rows={3}
                          />
                        ) : (
                          profileData.bio
                        )}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {isOwnProfile && (
                    <div className="flex space-x-3 mt-4 md:mt-0 rtl:space-x-reverse">
                      {isEditing ? (
                        <>
                          <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-ludus-orange hover:bg-ludus-orange-dark"
                          >
                            {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save Changes')}
                          </Button>
                          <Button
                            onClick={() => setIsEditing(false)}
                            variant="outline"
                          >
                            {t('common.cancel', 'Cancel')}
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => setIsEditing(true)}
                          className="bg-ludus-orange hover:bg-ludus-orange-dark"
                        >
                          {t('user.editProfile', 'Edit Profile')}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 rtl:space-x-reverse">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 rtl:space-x-reverse ${
                      activeTab === tab.id
                        ? 'border-ludus-orange text-ludus-orange'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'profile' && (
              <ProfileTab
                profileData={profileData}
                isEditing={isEditing}
                onInputChange={handleInputChange}
                onNestedChange={handleNestedChange}
                t={t}
              />
            )}
            {activeTab === 'preferences' && (
              <PreferencesTab
                profileData={profileData}
                isEditing={isEditing}
                onNestedChange={handleNestedChange}
                onArrayToggle={handleArrayToggle}
                preferenceOptions={preferenceOptions}
                t={t}
              />
            )}
            {activeTab === 'activity' && (
              <ActivityTab
                activityHistory={activityHistory}
                t={t}
              />
            )}
            {activeTab === 'stats' && (
              <StatsTab
                stats={stats}
                t={t}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  {t('user.quickStats', 'Quick Stats')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t('user.totalBookings', 'Total Bookings')}</span>
                    <span className="text-sm font-medium">{stats?.totalBookings || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t('user.completedBookings', 'Completed')}</span>
                    <span className="text-sm font-medium">{stats?.completedBookings || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t('user.totalSpent', 'Total Spent')}</span>
                    <span className="text-sm font-medium">
                      {stats?.totalSpent ? `${stats.totalSpent} SAR` : '0 SAR'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t('user.memberSince', 'Member Since')}</span>
                    <span className="text-sm font-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  {t('user.socialLinks', 'Social Links')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(profileData.socialLinks).map(([platform, url]) => (
                    <div key={platform} className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="text-sm text-gray-600 capitalize w-20">{platform}</span>
                      {isEditing ? (
                        <Input
                          value={url}
                          onChange={(e) => handleNestedChange('socialLinks', platform, e.target.value)}
                          placeholder={`@${platform}`}
                          className="flex-1"
                        />
                      ) : (
                        <span className="text-sm text-gray-900">{url || '-'}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Tab Component
const ProfileTab = ({ profileData, isEditing, onInputChange, onNestedChange, t }) => (
  <div className="space-y-6">
    {/* Basic Information */}
    <Card>
      <CardHeader>
        <CardTitle>{t('user.basicInformation', 'Basic Information')}</CardTitle>
        <CardDescription>{t('user.basicInformationDesc', 'Your personal details')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('user.phone', 'Phone Number')}
            </label>
            <Input
              value={profileData.phone}
              onChange={(e) => onInputChange('phone', e.target.value)}
              placeholder="+966XXXXXXXXX"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('user.dateOfBirth', 'Date of Birth')}
            </label>
            <Input
              type="date"
              value={profileData.dateOfBirth}
              onChange={(e) => onInputChange('dateOfBirth', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('user.gender', 'Gender')}
            </label>
            <select
              value={profileData.gender}
              onChange={(e) => onInputChange('gender', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">{t('user.selectGender', 'Select Gender')}</option>
              <option value="male">{t('user.male', 'Male')}</option>
              <option value="female">{t('user.female', 'Female')}</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Location Information */}
    <Card>
      <CardHeader>
        <CardTitle>{t('user.location', 'Location')}</CardTitle>
        <CardDescription>{t('user.locationDesc', 'Where are you located?')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('user.city', 'City')}
            </label>
            <Input
              value={profileData.location.city}
              onChange={(e) => onNestedChange('location', 'city', e.target.value)}
              placeholder={t('user.cityPlaceholder', 'Enter your city')}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('user.region', 'Region')}
            </label>
            <Input
              value={profileData.location.region}
              onChange={(e) => onNestedChange('location', 'region', e.target.value)}
              placeholder={t('user.regionPlaceholder', 'Enter your region')}
              disabled={!isEditing}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('user.address', 'Address')}
            </label>
            <Input
              value={profileData.location.address}
              onChange={(e) => onNestedChange('location', 'address', e.target.value)}
              placeholder={t('user.addressPlaceholder', 'Enter your full address')}
              disabled={!isEditing}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Preferences Tab Component
const PreferencesTab = ({ profileData, isEditing, onNestedChange, onArrayToggle, preferenceOptions, t }) => {
  const options = userService.getPreferenceOptions();
  
  return (
    <div className="space-y-6">
      {/* Interests */}
      <Card>
        <CardHeader>
          <CardTitle>{t('user.interests', 'Interests')}</CardTitle>
          <CardDescription>{t('user.interestsDesc', 'What activities interest you?')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {options.categories.map((interest) => (
              <label key={interest.value} className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={profileData.preferences.interests.includes(interest.value)}
                  onChange={() => onArrayToggle('preferences', 'interests', interest.value)}
                  disabled={!isEditing}
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

      {/* Activity Types */}
      <Card>
        <CardHeader>
          <CardTitle>{t('user.activityTypes', 'Activity Types')}</CardTitle>
          <CardDescription>{t('user.activityTypesDesc', 'What types of activities do you prefer?')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {options.activityTypes.map((type) => (
              <label key={type.value} className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={profileData.preferences.activityTypes.includes(type.value)}
                  onChange={() => onArrayToggle('preferences', 'activityTypes', type.value)}
                  disabled={!isEditing}
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

      {/* Preferred Times */}
      <Card>
        <CardHeader>
          <CardTitle>{t('user.preferredTimes', 'Preferred Times')}</CardTitle>
          <CardDescription>{t('user.preferredTimesDesc', 'When do you prefer to do activities?')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {options.preferredTimes.map((time) => (
              <label key={time.value} className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={profileData.preferences.preferredTimes.includes(time.value)}
                  onChange={() => onArrayToggle('preferences', 'preferredTimes', time.value)}
                  disabled={!isEditing}
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

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle>{t('user.languages', 'Languages')}</CardTitle>
          <CardDescription>{t('user.languagesDesc', 'What languages do you speak?')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {options.languages.map((language) => (
              <label key={language.value} className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={profileData.preferences.languages.includes(language.value)}
                  onChange={() => onArrayToggle('preferences', 'languages', language.value)}
                  disabled={!isEditing}
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

// Activity Tab Component
const ActivityTab = ({ activityHistory, t }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>{t('user.recentActivity', 'Recent Activity')}</CardTitle>
        <CardDescription>{t('user.recentActivityDesc', 'Your recent activity bookings')}</CardDescription>
      </CardHeader>
      <CardContent>
        {activityHistory.length > 0 ? (
          <div className="space-y-4">
            {activityHistory.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 rtl:space-x-reverse p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{activity.title}</h3>
                  <p className="text-sm text-gray-600">{activity.vendor}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.bookingDate).toLocaleDateString()} • {activity.timeSlot?.startTime}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                    activity.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    activity.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{t('user.noActivity', 'No activity history yet')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  </div>
);

// Stats Tab Component
const StatsTab = ({ stats, t }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('user.totalBookings', 'Total Bookings')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalBookings || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('user.completedBookings', 'Completed')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.completedBookings || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('user.favoriteActivities', 'Favorites')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.favoriteActivities || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-orange-600 font-bold">SAR</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('user.totalSpent', 'Total Spent')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalSpent || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default EnhancedUserProfile;
