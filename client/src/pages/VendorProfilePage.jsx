import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { vendorService } from '../services/vendorService';

const VendorProfilePage = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [activities, setActivities] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('activities');
  
  const [activityFilters, setActivityFilters] = useState({
    category: '',
    sortBy: 'createdAt'
  });
  
  const [activitiesPagination, setActivitiesPagination] = useState({
    page: 1,
    limit: 8,
    totalPages: 1,
    totalActivities: 0
  });

  const [reviewsPagination, setReviewsPagination] = useState({
    page: 1,
    limit: 5,
    totalPages: 1,
    totalReviews: 0
  });

  useEffect(() => {
    fetchVendorData();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'activities') {
      fetchVendorActivities();
    } else if (activeTab === 'reviews') {
      fetchVendorReviews();
    }
  }, [activeTab, activityFilters, activitiesPagination.page, reviewsPagination.page]);

  const fetchVendorData = async () => {
    try {
      setLoading(true);
      const response = await vendorService.getVendorProfile(id);
      setVendor(response.data.vendor);
    } catch (error) {
      console.error('Failed to fetch vendor data:', error);
      setError('Failed to load vendor information');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorActivities = async () => {
    try {
      const params = {
        page: activitiesPagination.page,
        limit: activitiesPagination.limit,
        ...activityFilters
      };

      const response = await vendorService.getVendorActivities(id, params);
      setActivities(response.data.activities);
      setActivitiesPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
    } catch (error) {
      console.error('Failed to fetch vendor activities:', error);
    }
  };

  const fetchVendorReviews = async () => {
    try {
      const params = {
        page: reviewsPagination.page,
        limit: reviewsPagination.limit
      };

      const response = await vendorService.getVendorReviews(id, params);
      setReviews(response.data.reviews);
      setReviewsPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
    } catch (error) {
      console.error('Failed to fetch vendor reviews:', error);
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

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<span key={i} className="text-gray-300">★</span>);
    }
    return stars;
  };

  const getBusinessHoursForDay = (day) => {
    if (!vendor?.businessHours) return null;
    return vendor.businessHours.find(h => h.day === day.toLowerCase());
  };

  const formatBusinessHours = () => {
    if (!vendor?.businessHours) return [];
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return days.map((day, index) => {
      const hours = getBusinessHoursForDay(day);
      return {
        day: dayNames[index],
        isOpen: hours?.isOpen || false,
        hours: hours?.isOpen ? `${hours.openTime} - ${hours.closeTime}` : 'Closed'
      };
    });
  };

  const tabs = [
    { id: 'activities', label: 'Activities', icon: '🎯', count: vendor?.statistics?.totalActivities || 0 },
    { id: 'about', label: 'About', icon: 'ℹ️' },
    { id: 'reviews', label: 'Reviews', icon: '⭐', count: vendor?.statistics?.totalReviews || 0 },
    { id: 'contact', label: 'Contact', icon: '📞' }
  ];

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

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-8 text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">Vendor Not Found</h2>
            <p className="text-red-700 mb-6">{error || 'The vendor you are looking for does not exist.'}</p>
            <Link
              to="/activities"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse Activities
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
            <span className="text-gray-900">{vendor.businessName}</span>
          </div>
        </nav>

        {/* Vendor Header */}
        <div className="bg-white rounded-lg shadow border border-gray-200 mb-8">
          {/* Banner */}
          <div className="h-64 bg-gradient-to-r from-blue-600 to-purple-700 rounded-t-lg relative">
            <div className="absolute inset-0 bg-black bg-opacity-20 rounded-t-lg"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-4xl font-bold mb-2">{vendor.businessName}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {renderStars(vendor.rating?.average || 0)}
                  <span className="ml-2 text-white font-medium">
                    {vendor.rating?.average?.toFixed(1) || '0.0'} ({vendor.rating?.count || 0} reviews)
                  </span>
                </div>
                <span className="text-white">📍 {vendor.location?.city}, {vendor.location?.state}</span>
              </div>
            </div>
          </div>

          {/* Vendor Info */}
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  {vendor.categories?.map((category, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {vendor.description}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{vendor.statistics?.totalActivities || 0}</div>
                <div className="text-sm text-gray-600">Activities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{vendor.statistics?.totalBookings || 0}</div>
                <div className="text-sm text-gray-600">Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {vendor.statistics?.avgActivityPrice ? formatCurrency(vendor.statistics.avgActivityPrice) : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Avg. Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{vendor.rating?.average?.toFixed(1) || '0.0'}</div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
            </div>
          </div>
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
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <div className="space-y-6">
              {/* Activities Filter */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={activityFilters.category}
                      onChange={(e) => setActivityFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Categories</option>
                      {vendor.categories?.map(category => (
                        <option key={category} value={category}>
                          {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <select
                      value={activityFilters.sortBy}
                      onChange={(e) => setActivityFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="createdAt">Latest</option>
                      <option value="pricing.basePrice">Price: Low to High</option>
                      <option value="-pricing.basePrice">Price: High to Low</option>
                      <option value="title">Name A-Z</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Activities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {activities.map((activity) => (
                  <Link
                    key={activity._id}
                    to={`/activities/${activity._id}`}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden"
                  >
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <div className="text-white text-4xl">
                        {getCategoryIcon(activity.category)}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {activity.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {activity.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-blue-600">
                          {formatCurrency(activity.pricing?.basePrice)}
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {activity.category}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Activities Pagination */}
              {activitiesPagination.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setActivitiesPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={activitiesPagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Page {activitiesPagination.page} of {activitiesPagination.totalPages}
                  </span>
                  <button
                    onClick={() => setActivitiesPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={activitiesPagination.page === activitiesPagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}

              {activities.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-4">🎯</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                  <p className="text-gray-500">This vendor doesn't have any activities yet.</p>
                </div>
              )}
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">About {vendor.businessName}</h2>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {vendor.description}
                  </p>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Specialties</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {vendor.categories?.map((category, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                      </span>
                    ))}
                  </div>

                  {vendor.credentials && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Credentials</h3>
                      <div className="space-y-2">
                        {vendor.credentials.licenses?.map((license, index) => (
                          <div key={index} className="flex items-center text-gray-700">
                            <span className="text-green-500 mr-2">✓</span>
                            {license}
                          </div>
                        ))}
                        {vendor.credentials.certifications?.map((cert, index) => (
                          <div key={index} className="flex items-center text-gray-700">
                            <span className="text-blue-500 mr-2">🏆</span>
                            {cert}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Hours</h3>
                  <div className="space-y-2 mb-6">
                    {formatBusinessHours().map((day, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-900">{day.day}</span>
                        <span className={`text-sm ${day.isOpen ? 'text-gray-700' : 'text-red-500'}`}>
                          {day.hours}
                        </span>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Location</h3>
                  <div className="space-y-2">
                    <div className="text-gray-700">
                      📍 {vendor.location?.address}
                    </div>
                    <div className="text-gray-700">
                      {vendor.location?.city}, {vendor.location?.state} {vendor.location?.zipCode}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {reviews.length > 0 ? (
                <>
                  {reviews.map((review, index) => (
                    <div key={index} className="bg-white rounded-lg shadow border border-gray-200 p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {review.user?.firstName?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {review.user?.firstName} {review.user?.lastName}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <div className="flex">{renderStars(review.rating)}</div>
                                <span className="text-sm text-gray-500">
                                  {new Date(review.date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            {review.activity && (
                              <Link
                                to={`/activities/${review.activity._id}`}
                                className="text-sm text-blue-600 hover:text-blue-500"
                              >
                                {review.activity.title}
                              </Link>
                            )}
                          </div>
                          {review.comment && (
                            <p className="text-gray-700">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Reviews Pagination */}
                  {reviewsPagination.totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => setReviewsPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={reviewsPagination.page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-gray-700">
                        Page {reviewsPagination.page} of {reviewsPagination.totalPages}
                      </span>
                      <button
                        onClick={() => setReviewsPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={reviewsPagination.page === reviewsPagination.totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
                  <div className="text-gray-400 text-4xl mb-4">⭐</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                  <p className="text-gray-500">Be the first to review this vendor!</p>
                </div>
              )}
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600">📧</span>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <a href={`mailto:${vendor.contactInfo?.email}`} className="text-blue-600 hover:text-blue-500">
                          {vendor.contactInfo?.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600">📞</span>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Phone</div>
                        <a href={`tel:${vendor.contactInfo?.phone}`} className="text-green-600 hover:text-green-500">
                          {vendor.contactInfo?.phone}
                        </a>
                      </div>
                    </div>

                    {vendor.contactInfo?.website && (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600">🌐</span>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Website</div>
                          <a 
                            href={vendor.contactInfo.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-500"
                          >
                            Visit Website
                          </a>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-600">📍</span>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Address</div>
                        <div className="text-gray-900">
                          {vendor.location?.address}<br />
                          {vendor.location?.city}, {vendor.location?.state} {vendor.location?.zipCode}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Social Media */}
                  {vendor.contactInfo?.socialMedia && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow Us</h3>
                      <div className="flex space-x-4">
                        {vendor.contactInfo.socialMedia.facebook && (
                          <a
                            href={vendor.contactInfo.socialMedia.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700"
                          >
                            f
                          </a>
                        )}
                        {vendor.contactInfo.socialMedia.instagram && (
                          <a
                            href={vendor.contactInfo.socialMedia.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center hover:bg-pink-700"
                          >
                            📷
                          </a>
                        )}
                        {vendor.contactInfo.socialMedia.twitter && (
                          <a
                            href={vendor.contactInfo.socialMedia.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-sky-500 text-white rounded-full flex items-center justify-center hover:bg-sky-600"
                          >
                            🐦
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h3>
                  <div className="space-y-2">
                    {formatBusinessHours().map((day, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-900">{day.day}</span>
                        <span className={`text-sm ${day.isOpen ? 'text-gray-700' : 'text-red-500'}`}>
                          {day.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorProfilePage;