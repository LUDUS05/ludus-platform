import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input } from '../ui';
import Alert from '../ui/Alert';
import api from '../../services/api';

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Profile form data
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    profileImage: '',
    socialLinks: {
      instagram: '',
      twitter: '',
      linkedin: '',
      website: '',
      snapchat: ''
    },
    location: {
      city: '',
      country: 'Saudi Arabia'
    },
    interests: [],
    languages: [],
    availability: {
      weekdays: false,
      weekends: false,
      evenings: false,
      mornings: false
    },
    contactPreferences: {
      allowMessages: true,
      allowFriendRequests: true,
      showEmail: false,
      showPhone: false
    }
  });

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    } else if (currentUser) {
      setIsOwnProfile(true);
      setProfileUser(currentUser);
      populateFormData(currentUser);
      setLoading(false);
    }
  }, [userId, currentUser]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/users/profile/${userId}`);
      const userData = response.data.data;
      
      setProfileUser(userData);
      setIsOwnProfile(currentUser && currentUser._id === userId);
      populateFormData(userData);
    } catch (err) {
      setError('Failed to load user profile');
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const populateFormData = (user) => {
    setProfileData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      bio: user.bio || '',
      profileImage: user.profileImage || '',
      socialLinks: user.socialLinks || {
        instagram: '',
        twitter: '',
        linkedin: '',
        website: '',
        snapchat: ''
      },
      location: user.location || {
        city: '',
        country: 'Saudi Arabia'
      },
      interests: user.interests || [],
      languages: user.languages || [],
      availability: user.availability || {
        weekdays: false,
        weekends: false,
        evenings: false,
        mornings: false
      },
      contactPreferences: user.contactPreferences || {
        allowMessages: true,
        allowFriendRequests: true,
        showEmail: false,
        showPhone: false
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

  const handleArrayToggle = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await api.put('/api/users/profile', profileData);
      setProfileUser(response.data.data);
      setMessage('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSendMessage = () => {
    // Future: Navigate to messaging system
    navigate(`/messages/${userId}`);
  };

  const handleAddFriend = async () => {
    try {
      await api.post(`/api/users/friends/${userId}`);
      setMessage('Friend request sent');
    } catch (err) {
      setError('Failed to send friend request');
    }
  };

  const interestOptions = [
    'Fitness & Sports', 'Arts & Culture', 'Food & Dining', 'Outdoor Adventures',
    'Technology', 'Music', 'Travel', 'Photography', 'Reading', 'Gaming',
    'Cooking', 'Dancing', 'Volunteering', 'Business', 'Education'
  ];

  const languageOptions = [
    'English', 'Arabic', 'French', 'Spanish', 'Urdu', 'Hindi', 'Turkish', 'Persian'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ludus-orange"></div>
      </div>
    );
  }

  if (error && !profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/')} variant="outline">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {error && <Alert type="error" message={error} className="mb-6" />}
        {message && <Alert type="success" message={message} className="mb-6" />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Header */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                {/* Profile Image */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {profileData.profileImage ? (
                      <img
                        src={profileData.profileImage}
                        alt={`${profileData.firstName} ${profileData.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-4xl text-gray-400">
                        {profileData.firstName?.charAt(0)?.toUpperCase() || '👤'}
                      </div>
                    )}
                  </div>
                  {isOwnProfile && isEditing && (
                    <Button
                      size="sm"
                      className="absolute bottom-0 right-0 rounded-full"
                      onClick={() => {/* Handle image upload */}}
                    >
                      📷
                    </Button>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        {isEditing ? (
                          <div className="flex space-x-2">
                            <Input
                              value={profileData.firstName}
                              onChange={(e) => handleInputChange('firstName', e.target.value)}
                              placeholder="First Name"
                              className="w-32"
                            />
                            <Input
                              value={profileData.lastName}
                              onChange={(e) => handleInputChange('lastName', e.target.value)}
                              placeholder="Last Name"
                              className="w-32"
                            />
                          </div>
                        ) : (
                          `${profileData.firstName} ${profileData.lastName}`
                        )}
                      </h1>
                      <p className="text-gray-600 mt-1">
                        {profileData.location.city && `${profileData.location.city}, `}
                        {profileData.location.country}
                      </p>
                      {profileData.bio && (
                        <p className="text-gray-700 mt-2 max-w-2xl">
                          {isEditing ? (
                            <textarea
                              value={profileData.bio}
                              onChange={(e) => handleInputChange('bio', e.target.value)}
                              placeholder="Tell us about yourself..."
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
                    <div className="flex space-x-3 mt-4 md:mt-0">
                      {isOwnProfile ? (
                        <>
                          {isEditing ? (
                            <>
                              <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-ludus-orange hover:bg-ludus-orange-dark"
                              >
                                {saving ? 'Saving...' : 'Save Changes'}
                              </Button>
                              <Button
                                onClick={() => setIsEditing(false)}
                                variant="outline"
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button
                              onClick={() => setIsEditing(true)}
                              className="bg-ludus-orange hover:bg-ludus-orange-dark"
                            >
                              Edit Profile
                            </Button>
                          )}
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={handleSendMessage}
                            className="bg-ludus-orange hover:bg-ludus-orange-dark"
                          >
                            Send Message
                          </Button>
                          <Button
                            onClick={handleAddFriend}
                            variant="outline"
                          >
                            Add Friend
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>Connect your social media profiles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram
                    </label>
                    <Input
                      value={profileData.socialLinks.instagram}
                      onChange={(e) => handleNestedChange('socialLinks', 'instagram', e.target.value)}
                      placeholder="@username"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Twitter
                    </label>
                    <Input
                      value={profileData.socialLinks.twitter}
                      onChange={(e) => handleNestedChange('socialLinks', 'twitter', e.target.value)}
                      placeholder="@username"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      LinkedIn
                    </label>
                    <Input
                      value={profileData.socialLinks.linkedin}
                      onChange={(e) => handleNestedChange('socialLinks', 'linkedin', e.target.value)}
                      placeholder="linkedin.com/in/username"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <Input
                      value={profileData.socialLinks.website}
                      onChange={(e) => handleNestedChange('socialLinks', 'website', e.target.value)}
                      placeholder="https://yourwebsite.com"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Snapchat
                    </label>
                    <Input
                      value={profileData.socialLinks.snapchat}
                      onChange={(e) => handleNestedChange('socialLinks', 'snapchat', e.target.value)}
                      placeholder="@username"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interests */}
            <Card>
              <CardHeader>
                <CardTitle>Interests</CardTitle>
                <CardDescription>What activities and topics interest you?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {interestOptions.map((interest) => (
                    <label key={interest} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={profileData.interests.includes(interest)}
                        onChange={() => handleArrayToggle('interests', interest)}
                        disabled={!isEditing}
                        className="h-4 w-4 rounded border-gray-300 text-ludus-orange focus:ring-ludus-orange"
                      />
                      <span className="text-sm text-gray-700">{interest}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
                <CardDescription>Languages you speak</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {languageOptions.map((language) => (
                    <label key={language} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={profileData.languages.includes(language)}
                        onChange={() => handleArrayToggle('languages', language)}
                        disabled={!isEditing}
                        className="h-4 w-4 rounded border-gray-300 text-ludus-orange focus:ring-ludus-orange"
                      />
                      <span className="text-sm text-gray-700">{language}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
                <CardDescription>When are you typically available for activities?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={profileData.availability.weekdays}
                      onChange={(e) => handleNestedChange('availability', 'weekdays', e.target.checked)}
                      disabled={!isEditing}
                      className="h-4 w-4 rounded border-gray-300 text-ludus-orange focus:ring-ludus-orange"
                    />
                    <span className="text-sm text-gray-700">Weekdays</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={profileData.availability.weekends}
                      onChange={(e) => handleNestedChange('availability', 'weekends', e.target.checked)}
                      disabled={!isEditing}
                      className="h-4 w-4 rounded border-gray-300 text-ludus-orange focus:ring-ludus-orange"
                    />
                    <span className="text-sm text-gray-700">Weekends</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={profileData.availability.mornings}
                      onChange={(e) => handleNestedChange('availability', 'mornings', e.target.checked)}
                      disabled={!isEditing}
                      className="h-4 w-4 rounded border-gray-300 text-ludus-orange focus:ring-ludus-orange"
                    />
                    <span className="text-sm text-gray-700">Mornings</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={profileData.availability.evenings}
                      onChange={(e) => handleNestedChange('availability', 'evenings', e.target.checked)}
                      disabled={!isEditing}
                      className="h-4 w-4 rounded border-gray-300 text-ludus-orange focus:ring-ludus-orange"
                    />
                    <span className="text-sm text-gray-700">Evenings</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Preferences */}
            {isOwnProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Preferences</CardTitle>
                  <CardDescription>Control how others can contact you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profileData.contactPreferences.allowMessages}
                        onChange={(e) => handleNestedChange('contactPreferences', 'allowMessages', e.target.checked)}
                        disabled={!isEditing}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Allow direct messages</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profileData.contactPreferences.allowFriendRequests}
                        onChange={(e) => handleNestedChange('contactPreferences', 'allowFriendRequests', e.target.checked)}
                        disabled={!isEditing}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Allow friend requests</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profileData.contactPreferences.showEmail}
                        onChange={(e) => handleNestedChange('contactPreferences', 'showEmail', e.target.checked)}
                        disabled={!isEditing}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Show email address</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profileData.contactPreferences.showPhone}
                        onChange={(e) => handleNestedChange('contactPreferences', 'showPhone', e.target.checked)}
                        disabled={!isEditing}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Show phone number</span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Activities Joined</span>
                    <span className="text-sm font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Activities Hosted</span>
                    <span className="text-sm font-medium">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Friends</span>
                    <span className="text-sm font-medium">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="text-sm font-medium">
                      {profileUser?.createdAt ? new Date(profileUser.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Future: Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4 text-gray-500">
                  <div className="text-2xl mb-2">🎯</div>
                  <p className="text-sm">Recent activities will appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
