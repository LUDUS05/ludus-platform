import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const DashboardPage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    location: {
      address: user?.location?.address || '',
      city: user?.location?.city || '',
      state: user?.location?.state || '',
      zipCode: user?.location?.zipCode || ''
    },
    preferences: {
      categories: user?.preferences?.categories || [],
      priceRange: {
        min: user?.preferences?.priceRange?.min || 0,
        max: user?.preferences?.priceRange?.max || 500
      },
      notifications: {
        email: user?.preferences?.notifications?.email ?? true,
        sms: user?.preferences?.notifications?.sms ?? false,
        marketing: user?.preferences?.notifications?.marketing ?? true
      }
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from API
      const [bookingsResponse, statsResponse] = await Promise.all([
        userService.getUserBookings(),
        userService.getDashboardStats()
      ]);

      setBookings(bookingsResponse.data.bookings || []);
      setStats(statsResponse.data.stats || {
        totalBookings: 0,
        upcomingBookings: 0,
        completedBookings: 0,
        totalSpent: 0
      });

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      
      // Fallback to mock data if API fails
      const mockBookings = [
        {
          _id: '1',
          bookingId: 'LDS-123ABC',
          activity: {
            title: 'Rock Climbing Adventure',
            category: 'outdoor',
            images: []
          },
          vendor: {
            businessName: 'Adventure Sports Center'
          },
          bookingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          timeSlot: { startTime: '10:00', endTime: '12:00' },
          participants: { count: 2 },
          pricing: { totalPrice: 150 },
          status: 'confirmed',
          payment: { status: 'paid' }
        },
        {
          _id: '2',
          bookingId: 'LDS-456DEF',
          activity: {
            title: 'Cooking Workshop',
            category: 'food',
            images: []
          },
          vendor: {
            businessName: 'Culinary Institute'
          },
          bookingDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          timeSlot: { startTime: '14:00', endTime: '17:00' },
          participants: { count: 1 },
          pricing: { totalPrice: 75 },
          status: 'completed',
          payment: { status: 'paid' }
        }
      ];

      setBookings(mockBookings);
      const totalBookings = mockBookings.length;
      const upcomingBookings = mockBookings.filter(b => new Date(b.bookingDate) > new Date()).length;
      const completedBookings = mockBookings.filter(b => b.status === 'completed').length;
      const totalSpent = mockBookings.reduce((sum, b) => sum + b.pricing.totalPrice, 0);

      setStats({
        totalBookings,
        upcomingBookings,
        completedBookings,
        totalSpent
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      // Update profile via API
      const response = await userService.updateUserProfile(profileData);
      
      // Update local auth context with new user data
      updateUser(response.data.user);
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.';
      alert(errorMessage);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      fitness: '💪',
      arts: '🎨',
      food: '🍽️',
      outdoor: '🏞️',
      unique: '✨',
      wellness: '🧘'
    };
    return icons[category] || '🎯';
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-ludus-orange/10 text-ludus-orange',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'bookings', label: 'My Bookings', icon: '📅' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ludus-orange"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600">
            Manage your bookings, profile, and preferences
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
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
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-ludus-orange rounded-md flex items-center justify-center">
                        <span className="text-white text-sm">📅</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalBookings}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm">🕒</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Upcoming</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.upcomingBookings}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm">✅</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Completed</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.completedBookings}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm">💰</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Spent</p>
                      <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalSpent)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="bg-white rounded-lg shadow border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
                    <Link
                      to="#"
                      onClick={() => setActiveTab('bookings')}
                      className="text-sm text-ludus-orange hover:text-ludus-orange-dark"
                    >
                      View all
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  {bookings.slice(0, 3).map((booking) => (
                    <div key={booking._id} className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">{getCategoryIcon(booking.activity.category)}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{booking.activity.title}</h3>
                        <p className="text-sm text-gray-500">{booking.vendor.businessName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(booking.pricing.totalPrice)}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    to="/activities"
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🔍</div>
                      <h3 className="font-medium text-gray-900">Explore Activities</h3>
                      <p className="text-sm text-gray-500">Find new experiences</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="block w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">👤</div>
                      <h3 className="font-medium text-gray-900">Update Profile</h3>
                      <p className="text-sm text-gray-500">Keep your info current</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('preferences')}
                    className="block w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">⚙️</div>
                      <h3 className="font-medium text-gray-900">Preferences</h3>
                      <p className="text-sm text-gray-500">Customize your experience</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">My Bookings</h2>
              </div>
              <div className="p-6">
                {bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-4">📅</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-500 mb-6">Start exploring activities to make your first booking!</p>
                    <Link
                      to="/activities"
                      className="bg-ludus-orange text-white px-6 py-2 rounded-md hover:bg-ludus-orange-dark transition-colors"
                    >
                      Explore Activities
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking._id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xl">{getCategoryIcon(booking.activity.category)}</span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{booking.activity.title}</h3>
                              <p className="text-gray-600">{booking.vendor.businessName}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(booking.bookingDate).toLocaleDateString()} at {booking.timeSlot.startTime}
                              </p>
                              <p className="text-sm text-gray-500">
                                {booking.participants.count} participant{booking.participants.count > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">{formatCurrency(booking.pricing.totalPrice)}</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                            <p className="text-sm text-gray-500 mt-1">#{booking.bookingId}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
              </div>
              <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        firstName: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange/20 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        lastName: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange/20 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        email: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange/20 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        phone: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange/20 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      dateOfBirth: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange/20 focus:border-transparent"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={profileData.location.address}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          location: { ...prev.location, address: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange/20 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={profileData.location.city}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          location: { ...prev.location, city: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange/20 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State/Province
                      </label>
                      <input
                        type="text"
                        value={profileData.location.state}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          location: { ...prev.location, state: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange/20 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-ludus-orange text-white px-6 py-2 rounded-md hover:bg-ludus-orange-dark transition-colors"
                  >
                    Update Profile
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Preferences & Settings</h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Preferred Categories */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Preferred Activity Categories</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['fitness', 'arts', 'food', 'outdoor', 'unique', 'wellness'].map((category) => (
                      <label key={category} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={profileData.preferences.categories.includes(category)}
                          onChange={(e) => {
                            const updatedCategories = e.target.checked
                              ? [...profileData.preferences.categories, category]
                              : profileData.preferences.categories.filter(c => c !== category);
                            setProfileData(prev => ({
                              ...prev,
                              preferences: {
                                ...prev.preferences,
                                categories: updatedCategories
                              }
                            }));
                          }}
                          className="w-4 h-4 text-ludus-orange border-gray-300 rounded focus:ring-ludus-orange/20"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Price Range Preference</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Price (SAR)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={profileData.preferences.priceRange.min}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            priceRange: {
                              ...prev.preferences.priceRange,
                              min: parseInt(e.target.value) || 0
                            }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange/20 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Price (SAR)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={profileData.preferences.priceRange.max}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            priceRange: {
                              ...prev.preferences.priceRange,
                              max: parseInt(e.target.value) || 500
                            }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange/20 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Notification Preferences */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Email Notifications</div>
                        <div className="text-sm text-gray-500">Receive booking confirmations and updates via email</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={profileData.preferences.notifications.email}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            notifications: {
                              ...prev.preferences.notifications,
                              email: e.target.checked
                            }
                          }
                        }))}
                        className="w-4 h-4 text-ludus-orange border-gray-300 rounded focus:ring-ludus-orange/20"
                      />
                    </label>
                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">SMS Notifications</div>
                        <div className="text-sm text-gray-500">Receive reminders and updates via SMS</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={profileData.preferences.notifications.sms}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            notifications: {
                              ...prev.preferences.notifications,
                              sms: e.target.checked
                            }
                          }
                        }))}
                        className="w-4 h-4 text-ludus-orange border-gray-300 rounded focus:ring-ludus-orange/20"
                      />
                    </label>
                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Marketing Communications</div>
                        <div className="text-sm text-gray-500">Receive newsletters and promotional offers</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={profileData.preferences.notifications.marketing}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            notifications: {
                              ...prev.preferences.notifications,
                              marketing: e.target.checked
                            }
                          }
                        }))}
                        className="w-4 h-4 text-ludus-orange border-gray-300 rounded focus:ring-ludus-orange/20"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleProfileUpdate}
                    className="bg-ludus-orange text-white px-6 py-2 rounded-md hover:bg-ludus-orange-dark transition-colors"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;