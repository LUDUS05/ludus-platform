import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import ProgressiveImage from '../components/ui/ProgressiveImage';

const ActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt'
  });
  
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    cities: [],
    priceRange: { minPrice: 0, maxPrice: 0 }
  });
  
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12,
    totalPages: 1,
    totalActivities: 0
  });

  useEffect(() => {
    fetchActivities();
  }, [filters, pagination.page]);

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (pagination.page > 1) params.set('page', pagination.page);
    setSearchParams(params);
  }, [filters, pagination.page, setSearchParams]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const response = await api.get(`/activities?${params}`);
      setActivities(response.data.data.activities);
      setFilterOptions(response.data.data.filters);
      setPagination(prev => ({
        ...prev,
        ...response.data.data.pagination
      }));
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
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

  const sortOptions = [
    { value: 'createdAt', label: 'Latest' },
    { value: 'pricing.basePrice', label: 'Price: Low to High' },
    { value: '-pricing.basePrice', label: 'Price: High to Low' },
    { value: 'title', label: 'Name A-Z' },
    { value: '-totalBookings', label: 'Most Popular' }
  ];

  if (loading && activities.length === 0) {
    return (
      <div className="min-h-screen bg-soft-white dark:bg-dark-bg-primary">
        <div className="max-w-7xl mx-auto container-padding py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-ludus-orange dark:border-dark-ludus-orange border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-white dark:bg-dark-bg-primary">
      <div className="max-w-7xl mx-auto container-padding py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-display-lg font-bold text-charcoal dark:text-dark-text-primary mb-2">
            Discover Amazing Activities
          </h1>
          <p className="text-body-md text-charcoal-light dark:text-dark-text-secondary">
            Find and book unique experiences in Saudi Arabia
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <Input
                label="Search"
                type="text"
                placeholder="Search activities..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-label font-medium text-charcoal dark:text-dark-text-primary mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input-field"
              >
                <option value="">All Categories</option>
                {filterOptions.categories.map(category => (
                  <option key={category} value={category}>
                    {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-label font-medium text-charcoal dark:text-dark-text-primary mb-2">
                City
              </label>
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="input-field"
              >
                <option value="">All Cities</option>
                {filterOptions.cities.map(city => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <Input
                label="Min Price (SAR)"
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
            </div>

            {/* Sort */}
            <div>
              <label className="block text-label font-medium text-charcoal dark:text-dark-text-primary mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="input-field"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-body-sm text-charcoal-light dark:text-dark-text-secondary">
              {pagination.totalActivities} activities found
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {activities.map((activity) => (
            <Link
              key={activity._id}
              to={`/activities/${activity._id}`}
              className="group"
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                {/* Activity Image */}
                <div className="h-48 relative overflow-hidden">
                  <ProgressiveImage
                    src={`https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center&auto=format&q=80`}
                    alt={activity.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    fallback={
                      <div className="w-full h-full bg-gradient-to-br from-ludus-orange to-ludus-orange-dark flex items-center justify-center">
                        <div className="text-white text-4xl">
                          {getCategoryIcon(activity.category)}
                        </div>
                      </div>
                    }
                  />
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-charcoal backdrop-blur-sm">
                      {getCategoryIcon(activity.category)} {activity.category}
                    </span>
                  </div>
                </div>

                {/* Activity Info */}
                <div className="p-4">
                  <h3 className="text-body-lg font-semibold text-charcoal dark:text-dark-text-primary mb-2 line-clamp-2">
                    {activity.title}
                  </h3>

                  <p className="text-body-sm text-charcoal-light dark:text-dark-text-secondary mb-3 line-clamp-2">
                    {activity.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <div className="text-body-sm text-charcoal-light dark:text-dark-text-secondary">
                      📍 {activity.location?.city}
                    </div>
                    {activity.vendor?.rating?.average > 0 && (
                      <div className="flex items-center text-body-sm text-charcoal-light dark:text-dark-text-secondary">
                        ⭐ {activity.vendor.rating.average.toFixed(1)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-body-lg font-bold text-ludus-orange dark:text-dark-ludus-orange">
                      {formatCurrency(activity.pricing?.basePrice)}
                    </div>
                    <Link
                      to={`/vendors/${activity.vendor?._id}`}
                      className="text-body-sm text-charcoal-light dark:text-dark-text-secondary hover:text-ludus-orange dark:hover:text-dark-ludus-orange transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      by {activity.vendor?.businessName}
                    </Link>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {activities.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-body-lg font-semibold text-charcoal dark:text-dark-text-primary mb-2">No activities found</h3>
            <p className="text-body-md text-charcoal-light dark:text-dark-text-secondary mb-6">
              Try adjusting your search filters or browse all activities
            </p>
            <Button onClick={resetFilters} variant="primary">
              Show All Activities
            </Button>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {[...Array(pagination.totalPages)].map((_, index) => {
                const pageNum = index + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitiesPage;