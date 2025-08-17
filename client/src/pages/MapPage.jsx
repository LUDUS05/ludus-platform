import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GoogleMap from '../components/maps/GoogleMap';
import LocationSearch from '../components/maps/LocationSearch';
import ActivityCard from '../components/ui/ActivityCard';
import api from '../services/api';

const MapPage = () => {
  const { t } = useTranslation();
  
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 24.7136, lng: 46.6753 });
  const [mapZoom, setMapZoom] = useState(7);
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    priceMin: '',
    priceMax: '',
    date: '',
    search: ''
  });

  // Saudi Arabia major cities with coordinates
  const saudiCities = [
    { name: 'All Cities', value: '', coordinates: { lat: 24.7136, lng: 46.6753 } },
    { name: 'Riyadh', value: 'riyadh', coordinates: { lat: 24.7136, lng: 46.6753 } },
    { name: 'Jeddah', value: 'jeddah', coordinates: { lat: 21.4858, lng: 39.1925 } },
    { name: 'Dammam', value: 'dammam', coordinates: { lat: 26.4207, lng: 50.0888 } },
    { name: 'Makkah', value: 'makkah', coordinates: { lat: 21.3891, lng: 39.8579 } },
    { name: 'Madinah', value: 'madinah', coordinates: { lat: 24.5247, lng: 39.5692 } },
    { name: 'Khobar', value: 'khobar', coordinates: { lat: 26.2172, lng: 50.1971 } },
    { name: 'Abha', value: 'abha', coordinates: { lat: 18.2164, lng: 42.5053 } }
  ];

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'fitness', label: 'Fitness & Sports' },
    { value: 'arts', label: 'Arts & Culture' },
    { value: 'food', label: 'Food & Dining' },
    { value: 'outdoor', label: 'Outdoor Adventures' },
    { value: 'unique', label: 'Unique Experiences' },
    { value: 'wellness', label: 'Wellness & Self-care' }
  ];

  useEffect(() => {
    fetchActivities();
  }, [filters]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (key === 'priceMin') queryParams.append('minPrice', value);
          else if (key === 'priceMax') queryParams.append('maxPrice', value);
          else queryParams.append(key, value);
        }
      });

      const response = await api.get(`/activities?${queryParams.toString()}`);
      
      // Filter only activities that have location coordinates (from activity or vendor)
      const activitiesWithLocation = response.data.data.activities.filter(
        activity => activity.location?.coordinates || activity.vendor?.location?.coordinates
      );
      
      setActivities(activitiesWithLocation);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleActivitySelect = (activity) => {
    setSelectedActivity(activity);
  };

  const handleLocationSelect = (location) => {
    setMapCenter({ lat: location.lat, lng: location.lng });
    setMapZoom(13);
  };

  const handleClearFilters = () => {
    setFilters({
      category: '',
      city: '',
      priceMin: '',
      priceMax: '',
      date: '',
      search: ''
    });
    setSelectedActivity(null);
    setMapCenter({ lat: 24.7136, lng: 46.6753 });
    setMapZoom(7);
  };

  const getMapCenter = () => {
    const selectedCity = saudiCities.find(city => city.value === filters.city);
    return selectedCity ? selectedCity.coordinates : mapCenter;
  };

  const getMapZoom = () => {
    return filters.city ? 12 : mapZoom;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('map.title', 'Discover Activities Near You')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('map.subtitle', 'Explore local activities and events on the map')}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {loading ? 'Loading...' : `${activities.length} activities found`}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-4 lg:gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 mb-6 lg:mb-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {t('common.filter')}
                </h2>
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-ludus-orange hover:text-ludus-orange-dark"
                >
                  {t('common.clear')}
                </button>
              </div>

              <div className="space-y-4">
                {/* Location Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Location
                  </label>
                  <LocationSearch
                    onPlaceSelect={handleLocationSelect}
                    placeholder="Search for a location..."
                    className="w-full"
                  />
                </div>

                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.search')}
                  </label>
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-ludus-orange focus:border-ludus-orange"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-ludus-orange focus:border-ludus-orange"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <select
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-ludus-orange focus:border-ludus-orange"
                  >
                    {saudiCities.map(city => (
                      <option key={city.value} value={city.value}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (SAR)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceMin}
                      onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-ludus-orange focus:border-ludus-orange"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceMax}
                      onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-ludus-orange focus:border-ludus-orange"
                    />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-ludus-orange focus:border-ludus-orange"
                  />
                </div>
              </div>

              {/* Selected Activity Details */}
              {selectedActivity && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Selected Activity
                  </h3>
                  <ActivityCard
                    activity={selectedActivity}
                    className="w-full"
                    compact
                  />
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <GoogleMap
                activities={activities}
                center={getMapCenter()}
                zoom={getMapZoom()}
                onActivitySelect={handleActivitySelect}
                selectedActivityId={selectedActivity?._id}
                height="600px"
                className="w-full"
              />
            </div>

            {/* Map Legend */}
            <div className="mt-4 bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Map Legend
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {categories.slice(1).map(category => (
                  <div key={category.value} className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white"
                      style={{ 
                        backgroundColor: getCategoryColor(category.value),
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    />
                    <span className="text-xs text-gray-600">
                      {category.label.split(' & ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getCategoryColor = (category) => {
  const colors = {
    'fitness': '#10B981',
    'arts': '#8B5CF6',
    'food': '#F59E0B',
    'outdoor': '#059669',
    'unique': '#EF4444',
    'wellness': '#06B6D4',
    'default': '#6366F1'
  };
  return colors[category] || colors.default;
};

export default MapPage;