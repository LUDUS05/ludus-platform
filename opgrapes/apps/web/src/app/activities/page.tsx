'use client';

import { useState, useEffect } from 'react';
import { ActivityCard } from '@/components/activities/ActivityCard';
import { SearchFilters } from '@/components/activities/SearchFilters';
import { CategoryNav } from '@/components/activities/CategoryNav';
import { ActivityGrid } from '@/components/activities/ActivityGrid';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

// Mock data for development - replace with API calls
const mockActivities = [
  {
    id: '1',
    title: 'Rock Climbing Adventure',
    description: 'Experience the thrill of rock climbing in the beautiful mountains',
    category: 'adventure',
    price: {
      amount: 89.99,
      currency: 'USD',
      perPerson: true
    },
    location: 'Mountain View, CA',
    duration: 180, // in minutes
    maxParticipants: 8,
    images: ['/images/rock-climbing.jpg'],
    rating: 4.8,
    reviewCount: 127,
    vendor: {
      id: '1',
      name: 'Adventure Co.',
      logo: '/images/adventure-co-logo.jpg',
      verified: true
    },
    tags: ['outdoor', 'adventure', 'climbing'],
    featured: true
  },
  {
    id: '2',
    title: 'Wine Tasting Experience',
    description: 'Discover local wines with expert sommeliers',
    category: 'food-drink',
    price: {
      amount: 65.00,
      currency: 'USD',
      perPerson: true
    },
    location: 'Napa Valley, CA',
    duration: 120, // in minutes
    maxParticipants: 12,
    images: ['/images/wine-tasting.jpg'],
    rating: 4.6,
    reviewCount: 89,
    vendor: {
      id: '2',
      name: 'Vineyard Tours',
      logo: '/images/vineyard-tours-logo.jpg',
      verified: true
    },
    tags: ['wine', 'tasting', 'culinary'],
    featured: false
  },
  {
    id: '3',
    title: 'Photography Workshop',
    description: 'Learn professional photography techniques',
    category: 'education',
    price: {
      amount: 120.00,
      currency: 'USD',
      perPerson: true
    },
    location: 'San Francisco, CA',
    duration: 240, // in minutes
    maxParticipants: 15,
    images: ['/images/photography.jpg'],
    rating: 4.9,
    reviewCount: 156,
    vendor: {
      id: '3',
      name: 'Photo Academy',
      logo: '/images/photo-academy-logo.jpg',
      verified: true
    },
    tags: ['photography', 'workshop', 'creative'],
    featured: true
  },
  {
    id: '4',
    title: 'Yoga Retreat',
    description: 'Rejuvenate your mind and body with our wellness retreat',
    category: 'wellness',
    price: {
      amount: 150.00,
      currency: 'USD',
      perPerson: true
    },
    location: 'Big Sur, CA',
    duration: 480, // in minutes
    maxParticipants: 20,
    images: ['/images/yoga-retreat.jpg'],
    rating: 4.7,
    reviewCount: 203,
    vendor: {
      id: '4',
      name: 'Zen Wellness',
      logo: '/images/zen-wellness-logo.jpg',
      verified: true
    },
    tags: ['yoga', 'wellness', 'retreat'],
    featured: false
  },
  {
    id: '5',
    title: 'Cooking Class',
    description: 'Master the art of Italian cuisine with our expert chefs',
    category: 'food-drink',
    price: {
      amount: 85.00,
      currency: 'USD',
      perPerson: true
    },
    location: 'San Francisco, CA',
    duration: 180, // in minutes
    maxParticipants: 10,
    images: ['/images/cooking-class.jpg'],
    rating: 4.8,
    reviewCount: 134,
    vendor: {
      id: '5',
      name: 'Culinary Institute',
      logo: '/images/culinary-institute-logo.jpg',
      verified: true
    },
    tags: ['cooking', 'culinary', 'italian'],
    featured: false
  },
  {
    id: '6',
    title: 'Hiking Adventure',
    description: 'Explore scenic trails and breathtaking views',
    category: 'outdoor',
    price: {
      amount: 45.00,
      currency: 'USD',
      perPerson: true
    },
    location: 'Yosemite, CA',
    duration: 300, // in minutes
    maxParticipants: 25,
    images: ['/images/hiking.jpg'],
    rating: 4.5,
    reviewCount: 278,
    vendor: {
      id: '6',
      name: 'Nature Trails',
      logo: '/images/nature-trails-logo.jpg',
      verified: true
    },
    tags: ['hiking', 'outdoor', 'nature'],
    featured: false
  }
];

// Available categories and locations for filtering
const availableCategories = ['adventure', 'food-drink', 'education', 'wellness', 'outdoor', 'entertainment', 'sports'];
const availableLocations = ['Mountain View, CA', 'Napa Valley, CA', 'San Francisco, CA', 'Big Sur, CA', 'Yosemite, CA'];

export default function ActivitiesPage() {
  const [activities, setActivities] = useState(mockActivities);
  const [filteredActivities, setFilteredActivities] = useState(mockActivities);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high' | 'rating' | 'duration'>('relevance');
  const [savedActivities, setSavedActivities] = useState<string[]>([]);
  
  // Search filters state
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
    priceRange: [0, 200] as [number, number],
    duration: '',
    rating: '',
    participants: '',
    date: ''
  });

  // Load saved activities from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedActivities');
    if (saved) {
      setSavedActivities(JSON.parse(saved));
    }
  }, []);

  // Save activities to localStorage when changed
  useEffect(() => {
    localStorage.setItem('savedActivities', JSON.stringify(savedActivities));
  }, [savedActivities]);

  // Filter activities based on search criteria
  useEffect(() => {
    setLoading(true);
    
    const filtered = activities.filter(activity => {
      const matchesSearch = filters.search === '' || 
        activity.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        activity.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        activity.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()));
      
      const matchesCategory = filters.category === '' || activity.category === filters.category;
      
      const matchesPrice = activity.price.amount >= filters.priceRange[0] && activity.price.amount <= filters.priceRange[1];
      
      const matchesLocation = filters.location === '' || activity.location === filters.location;
      
      const matchesDuration = filters.duration === '' || (() => {
        const [min, max] = filters.duration.split('-').map(Number);
        if (filters.duration === '480+') {
          return activity.duration >= 480;
        }
        return activity.duration >= min && activity.duration <= max;
      })();
      
      const matchesRating = filters.rating === '' || activity.rating >= parseFloat(filters.rating);
      
      const matchesParticipants = filters.participants === '' || (() => {
        const [min, max] = filters.participants.split('-').map(Number);
        if (filters.participants === '10+') {
          return activity.maxParticipants >= 10;
        }
        return activity.maxParticipants >= min && activity.maxParticipants <= max;
      })();
      
      const matchesDate = filters.date === '' || true; // TODO: Implement date availability checking
      
      return matchesSearch && matchesCategory && matchesPrice && matchesLocation && 
             matchesDuration && matchesRating && matchesParticipants && matchesDate;
    });
    
    // Sort activities
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price.amount - b.price.amount;
        case 'price-high':
          return b.price.amount - a.price.amount;
        case 'rating':
          return b.rating - a.rating;
        case 'duration':
          return a.duration - b.duration;
        default:
          return 0; // relevance - keep original order
      }
    });
    
    setFilteredActivities(sorted);
    setLoading(false);
  }, [activities, filters, sortBy]);

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleFiltersReset = () => {
    setFilters({
      search: '',
      category: '',
      location: '',
      priceRange: [0, 200],
      duration: '',
      rating: '',
      participants: '',
      date: ''
    });
  };

  const handleSaveActivity = (activityId: string) => {
    setSavedActivities(prev => {
      if (prev.includes(activityId)) {
        return prev.filter(id => id !== activityId);
      } else {
        return [...prev, activityId];
      }
    });
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Discover Amazing Activities
          </h1>
          <p className="text-lg text-gray-600">
            Find and book unique experiences in your area
          </p>
        </div>

        {/* Category Navigation */}
        <CategoryNav 
          selectedCategory={filters.category}
          onCategoryChange={(category) => setFilters(prev => ({ ...prev, category }))}
        />

        {/* Search and Filters */}
        <div className="mb-6">
          <SearchFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleFiltersReset}
            categories={availableCategories}
            locations={availableLocations}
          />
        </div>

        {/* Results Header with Sorting */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">
                {filteredActivities.length} activities found
              </p>
              {filters.search && (
                <span className="text-sm text-blue-600">
                  for "{filters.search}"
                </span>
              )}
              {savedActivities.length > 0 && (
                <span className="text-sm text-green-600">
                  {savedActivities.length} saved
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="duration">Shortest Duration</option>
                </select>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Grid view"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="List view"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Activities Display */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        ) : filteredActivities.length > 0 ? (
          <ActivityGrid 
            activities={filteredActivities}
            viewMode={viewMode}
            onSave={handleSaveActivity}
            savedActivities={savedActivities}
          />
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search 
                ? `No activities match "${filters.search}". Try adjusting your search criteria.`
                : 'Try adjusting your search criteria or browse all categories'
              }
            </p>
            <button
              onClick={handleFiltersReset}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Quick Actions */}
        {filteredActivities.length > 0 && (
          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Can't find what you're looking for?
              </h3>
              <p className="text-gray-600 mb-4">
                Let us know what type of activity you'd like to see, and we'll add it to our collection.
              </p>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                Suggest an Activity
              </button>
            </div>
          </div>
        )}

        {/* Saved Activities Summary */}
        {savedActivities.length > 0 && (
          <div className="mt-8 bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-900">
                  You have {savedActivities.length} saved {savedActivities.length === 1 ? 'activity' : 'activities'}
                </h3>
                <p className="text-sm text-blue-700">
                  View your saved activities to plan your next adventure
                </p>
              </div>
              <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors">
                View Saved
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
