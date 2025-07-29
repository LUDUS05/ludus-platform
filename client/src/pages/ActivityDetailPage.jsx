import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ActivityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activity, setActivity] = useState(null);
  const [relatedActivities, setRelatedActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [participantCount, setParticipantCount] = useState(1);

  useEffect(() => {
    fetchActivityDetails();
  }, [id]);

  const fetchActivityDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/activities/${id}`);
      setActivity(response.data.data.activity);
      setRelatedActivities(response.data.data.relatedActivities || []);
    } catch (error) {
      console.error('Failed to fetch activity details:', error);
      setError('Failed to load activity details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/activities/${id}` } });
      return;
    }

    // Navigate to booking page with current selections
    const params = new URLSearchParams({
      date: selectedDate,
      participants: participantCount.toString()
    });
    
    navigate(`/booking/${id}?${params}`);
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

  const calculateTotalPrice = () => {
    if (!activity?.pricing?.basePrice) return 0;
    return activity.pricing.basePrice * participantCount;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-8 text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">Activity Not Found</h2>
            <p className="text-red-700 mb-6">{error || 'The activity you are looking for does not exist.'}</p>
            <Link
              to="/activities"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse All Activities
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-700">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/activities" className="hover:text-gray-700">Activities</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{activity.title}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Activity Header */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
              {/* Activity Image */}
              <div className="h-64 md:h-80 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-6 flex items-center justify-center">
                <div className="text-white text-6xl">
                  {getCategoryIcon(activity.category)}
                </div>
              </div>

              {/* Activity Info */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {activity.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getCategoryIcon(activity.category)} {activity.category}
                    </span>
                    <span>📍 {activity.location?.city}, {activity.location?.state}</span>
                    {activity.vendor?.rating?.average > 0 && (
                      <span>⭐ {activity.vendor.rating.average.toFixed(1)} ({activity.vendor.rating.count || 0} reviews)</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {formatCurrency(activity.pricing?.basePrice)}
                  </div>
                  <div className="text-sm text-gray-500">per person</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Activity</h2>
              <p className="text-gray-700 leading-relaxed">
                {activity.description}
              </p>
            </div>

            {/* Details */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Duration</h3>
                  <p className="text-gray-600">
                    {activity.duration 
                      ? `${activity.duration.hours}h ${activity.duration.minutes}m`
                      : 'Varies'
                    }
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Group Size</h3>
                  <p className="text-gray-600">
                    {activity.maxParticipants ? `Up to ${activity.maxParticipants} people` : 'No limit'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Age Requirement</h3>
                  <p className="text-gray-600">{activity.ageRequirement || 'All ages'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Difficulty Level</h3>
                  <p className="text-gray-600">{activity.difficultyLevel || 'Beginner friendly'}</p>
                </div>
              </div>

              {activity.tags && activity.tags.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {activity.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Vendor Info */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About the Provider</h2>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {activity.vendor?.businessName?.charAt(0)}
                </div>
                <div className="flex-1">
                  <Link 
                    to={`/vendors/${activity.vendor?._id}`}
                    className="text-lg font-medium text-blue-600 hover:text-blue-500"
                  >
                    {activity.vendor?.businessName}
                  </Link>
                  <p className="text-gray-600 mb-2">
                    📍 {activity.vendor?.location?.city}, {activity.vendor?.location?.state}
                  </p>
                  {activity.vendor?.description && (
                    <p className="text-gray-700 text-sm mb-3">
                      {activity.vendor.description}
                    </p>
                  )}
                  {activity.vendor?.rating?.average > 0 && (
                    <div className="mb-3 flex items-center space-x-2">
                      <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                      <span className="text-sm text-gray-600">
                        {activity.vendor.rating.average.toFixed(1)} ({activity.vendor.rating.count || 0} reviews)
                      </span>
                    </div>
                  )}
                  <Link 
                    to={`/vendors/${activity.vendor?._id}`}
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                  >
                    View Vendor Profile →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Book This Activity</h3>

              {/* Date Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Participant Count */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Participants
                </label>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setParticipantCount(Math.max(1, participantCount - 1))}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center py-2 border-x border-gray-300">
                    {participantCount}
                  </span>
                  <button
                    onClick={() => setParticipantCount(
                      activity.maxParticipants 
                        ? Math.min(activity.maxParticipants, participantCount + 1)
                        : participantCount + 1
                    )}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Price Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    {formatCurrency(activity.pricing?.basePrice)} × {participantCount}
                  </span>
                  <span className="text-sm text-gray-900">
                    {formatCurrency(calculateTotalPrice())}
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-blue-600">
                      {formatCurrency(calculateTotalPrice())}
                    </span>
                  </div>
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={handleBookNow}
                disabled={!selectedDate}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {!isAuthenticated ? 'Login to Book' : 'Book Now'}
              </button>

              <p className="text-xs text-gray-500 mt-2 text-center">
                You won't be charged yet
              </p>
            </div>
          </div>
        </div>

        {/* Related Activities */}
        {relatedActivities.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Activities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedActivities.map((relatedActivity) => (
                <Link
                  key={relatedActivity._id}
                  to={`/activities/${relatedActivity._id}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden"
                >
                  <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="text-white text-2xl">
                      {getCategoryIcon(relatedActivity.category)}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {relatedActivity.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      by {relatedActivity.vendor?.businessName}
                    </p>
                    <div className="text-lg font-bold text-blue-600">
                      {formatCurrency(relatedActivity.pricing?.basePrice)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityDetailPage;