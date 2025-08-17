'use client';

import { useState, useEffect } from 'react';
import { VendorGrid } from '@/components/vendors/VendorGrid';
import { VendorFilters, VendorFilters as VendorFiltersType } from '@/components/vendors/VendorFilters';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Text } from 'ui/Text';
import { Building2, Star, MapPin, Users } from 'lucide-react';

// Mock data for development - replace with API calls
const mockVendors = [
  {
    id: '1',
    name: 'Adventure Co.',
    description: 'Leading adventure company with over 10 years of experience in outdoor activities and extreme sports.',
    logo: '/images/adventure-co-logo.jpg',
    verified: true,
    rating: 4.9,
    reviewCount: 342,
    location: 'Mountain View, CA',
    established: '2014',
    activityCount: 15,
    categories: ['adventure', 'outdoor', 'water-sports'],
    contact: {
      phone: '+1 (555) 123-4567',
      email: 'info@adventureco.com',
      website: 'adventureco.com'
    },
    featured: true
  },
  {
    id: '2',
    name: 'Vineyard Tours',
    description: 'Premium wine tasting experiences in the heart of Napa Valley. Discover local wines with expert sommeliers.',
    logo: '/images/vineyard-tours-logo.jpg',
    verified: true,
    rating: 4.6,
    reviewCount: 89,
    location: 'Napa Valley, CA',
    established: '2012',
    activityCount: 8,
    categories: ['food-drink', 'cultural', 'wellness'],
    contact: {
      phone: '+1 (555) 234-5678',
      email: 'info@vineyardtours.com',
      website: 'vineyardtours.com'
    },
    featured: false
  },
  {
    id: '3',
    name: 'Photo Academy',
    description: 'Learn professional photography techniques from award-winning photographers in beautiful locations.',
    logo: '/images/photo-academy-logo.jpg',
    verified: true,
    rating: 4.9,
    reviewCount: 156,
    location: 'San Francisco, CA',
    established: '2016',
    activityCount: 12,
    categories: ['education', 'art-craft', 'outdoor'],
    contact: {
      phone: '+1 (555) 345-6789',
      email: 'info@photoacademy.com',
      website: 'photoacademy.com'
    },
    featured: true
  },
  {
    id: '4',
    name: 'Zen Wellness',
    description: 'Rejuvenate your mind and body with our wellness retreats and yoga experiences.',
    logo: '/images/zen-wellness-logo.jpg',
    verified: true,
    rating: 4.7,
    reviewCount: 203,
    location: 'Big Sur, CA',
    established: '2018',
    activityCount: 6,
    categories: ['wellness', 'outdoor', 'cultural'],
    contact: {
      phone: '+1 (555) 456-7890',
      email: 'info@zenwellness.com',
      website: 'zenwellness.com'
    },
    featured: false
  },
  {
    id: '5',
    name: 'Culinary Institute',
    description: 'Master the art of cooking with our expert chefs in hands-on culinary workshops.',
    logo: '/images/culinary-institute-logo.jpg',
    verified: true,
    rating: 4.8,
    reviewCount: 134,
    location: 'San Francisco, CA',
    established: '2015',
    activityCount: 10,
    categories: ['food-drink', 'education', 'cultural'],
    contact: {
      phone: '+1 (555) 567-8901',
      email: 'info@culinaryinstitute.com',
      website: 'culinaryinstitute.com'
    },
    featured: false
  },
  {
    id: '6',
    name: 'Nature Trails',
    description: 'Explore scenic trails and breathtaking views with our guided hiking adventures.',
    logo: '/images/nature-trails-logo.jpg',
    verified: true,
    rating: 4.5,
    reviewCount: 278,
    location: 'Yosemite, CA',
    established: '2013',
    activityCount: 20,
    categories: ['outdoor', 'adventure', 'wellness'],
    contact: {
      phone: '+1 (555) 678-9012',
      email: 'info@naturetrails.com',
      website: 'naturetrails.com'
    },
    featured: false
  }
];

export default function VendorsPage() {
  const [vendors, setVendors] = useState(mockVendors);
  const [filteredVendors, setFilteredVendors] = useState(mockVendors);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // In production, fetch vendors from API
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleFiltersChange = (filters: VendorFiltersType) => {
    // Apply filters to vendors
    let filtered = [...vendors];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(vendor =>
        vendor.name.toLowerCase().includes(searchLower) ||
        vendor.description.toLowerCase().includes(searchLower) ||
        vendor.categories.some(cat => cat.toLowerCase().includes(searchLower))
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(vendor => vendor.location === filters.location);
    }

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(vendor => vendor.rating >= filters.rating);
    }

    // Verified filter
    if (filters.verified) {
      filtered = filtered.filter(vendor => vendor.verified);
    }

    // Featured filter
    if (filters.featured) {
      filtered = filtered.filter(vendor => vendor.featured);
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(vendor =>
        filters.categories.some(cat => vendor.categories.includes(cat))
      );
    }

    // Sort vendors
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return filters.sortOrder === 'asc' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case 'rating':
          return filters.sortOrder === 'asc' 
            ? a.rating - b.rating
            : b.rating - a.rating;
        case 'activityCount':
          return filters.sortOrder === 'asc' 
            ? a.activityCount - b.activityCount
            : b.activityCount - a.activityCount;
        case 'established':
          return filters.sortOrder === 'asc' 
            ? parseInt(a.established) - parseInt(b.established)
            : parseInt(b.established) - parseInt(a.established);
        default:
          return 0;
      }
    });

    setFilteredVendors(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Discover Amazing Vendors
          </h1>
          <p className="text-lg text-gray-600">
            Find trusted activity providers and book unforgettable experiences
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <VendorFilters
            onFiltersChange={handleFiltersChange}
          />
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredVendors.length} vendors found
            </p>
          </div>
        </div>

        {/* Vendors Display */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        ) : filteredVendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or browse all categories
            </p>
            <button
              onClick={() => handleFiltersChange({
                search: '',
                location: '',
                rating: 0,
                verified: false,
                featured: false,
                categories: [],
                sortBy: 'rating',
                sortOrder: 'desc'
              })}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
