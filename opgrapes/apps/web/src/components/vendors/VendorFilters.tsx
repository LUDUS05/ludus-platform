'use client';

import { useState } from 'react';
import { Input } from '@opgrapes/ui/Input';
import { Select } from '@opgrapes/ui/Select';
import { Button } from '@opgrapes/ui/Button';
import { Checkbox } from '@opgrapes/ui/Checkbox';
import { Stack } from '@opgrapes/ui/Stack';
import { Text } from '@opgrapes/ui/Text';
import { Badge } from '@opgrapes/ui/Badge';
import { Card } from '@opgrapes/ui/Card';
import { 
  Star, 
  X,
  SlidersHorizontal,
  Building2
} from 'lucide-react';

interface VendorFiltersProps {
  onFiltersChange: (filters: VendorFilters) => void;
  className?: string;
}

export interface VendorFilters {
  search: string;
  location: string;
  rating: number;
  verified: boolean;
  featured: boolean;
  categories: string[];
  sortBy: 'name' | 'rating' | 'activityCount' | 'established';
  sortOrder: 'asc' | 'desc';
}

const defaultFilters: VendorFilters = {
  search: '',
  location: '',
  rating: 0,
  verified: false,
  featured: false,
  categories: [],
  sortBy: 'rating',
  sortOrder: 'desc',
};

const categoryOptions = [
  { value: 'outdoor', label: 'Outdoor & Adventure', icon: '🌲' },
  { value: 'water-sports', label: 'Water Sports', icon: '🏊' },
  { value: 'food-drink', label: 'Food & Drink', icon: '🍽️' },
  { value: 'cultural', label: 'Cultural & Arts', icon: '🎭' },
  { value: 'wellness', label: 'Wellness & Spa', icon: '🧘' },
  { value: 'education', label: 'Education & Learning', icon: '📚' },
  { value: 'art-craft', label: 'Art & Craft', icon: '🎨' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎪' },
  { value: 'technology', label: 'Technology', icon: '💻' },
  { value: 'fitness', label: 'Fitness & Sports', icon: '🏃' },
];

const locationOptions = [
  'San Francisco, CA',
  'Los Angeles, CA',
  'New York, NY',
  'Miami, FL',
  'Chicago, IL',
  'Austin, TX',
  'Seattle, WA',
  'Denver, CO',
  'Nashville, TN',
  'Portland, OR',
];

const sortOptions = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'activityCount', label: 'Most Activities' },
  { value: 'established', label: 'Longest Established' },
];

export function VendorFilters({ onFiltersChange, className }: VendorFiltersProps) {
  const [filters, setFilters] = useState<VendorFilters>(defaultFilters);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const updateFilters = (newFilters: Partial<VendorFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Count active filters
    const count = Object.entries(updatedFilters).reduce((acc, [key, value]) => {
      if (key === 'search' || key === 'location') {
        return acc + (value ? 1 : 0);
      }
      if (key === 'rating') {
        return acc + (typeof value === 'number' && value > 0 ? 1 : 0);
      }
      if (key === 'categories') {
        return acc + (Array.isArray(value) && value.length > 0 ? 1 : 0);
      }
      if (key === 'verified' || key === 'featured') {
        return acc + (value ? 1 : 0);
      }
      return acc;
    }, 0);
    
    setActiveFiltersCount(count);
    onFiltersChange(updatedFilters);
  };

  const handleSearchChange = (value: string) => {
    updateFilters({ search: value });
  };

  const handleLocationChange = (value: string) => {
    updateFilters({ location: value });
  };

  const handleRatingChange = (value: string) => {
    updateFilters({ rating: parseInt(value) || 0 });
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    updateFilters({ categories: newCategories });
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-');
    updateFilters({ 
      sortBy: sortBy as VendorFilters['sortBy'], 
      sortOrder: sortOrder as VendorFilters['sortOrder'] 
    });
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setActiveFiltersCount(0);
    onFiltersChange(defaultFilters);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className={className}>
      <div className="p-6">
        <Stack spacing="md">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 size={20} className="text-primary" />
              <Text as="div" size="lg" weight="semibold" className="text-lg font-semibold">
                Find Vendors
              </Text>
            </div>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Badge variant="primary" size="sm">
                  {activeFiltersCount} active
                </Badge>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={toggleExpanded}
                className="flex items-center gap-2"
              >
                {isExpanded ? <X size={16} /> : <SlidersHorizontal size={16} />}
                {isExpanded ? 'Hide' : 'Filters'}
              </Button>
            </div>
          </div>

          {/* Basic Search */}
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search vendors by name, description, or activities..."
                value={filters.search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-48">
              <Select
                placeholder="Location"
                value={filters.location}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleLocationChange(e.target.value)}
                options={[
                  { value: '', label: 'All Locations' },
                  ...locationOptions.map((location) => ({
                    value: location,
                    label: location
                  }))
                ]}
              />
            </div>
            <div className="w-48">
              <Select
                placeholder="Sort by"
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleSortChange(e.target.value)}
                options={sortOptions.map((option) => ({
                  value: `${option.value}-desc`,
                  label: option.label
                }))}
              />
            </div>
          </div>

          {/* Expanded Filters */}
          {isExpanded && (
            <div className="border-t pt-4">
              <Stack spacing="md">
                {/* Rating Filter */}
                <div>
                  <Text size="sm" weight="medium" className="mb-2">
                    Minimum Rating
                  </Text>
                  <div className="flex items-center gap-2">
                    <Select
                      value={filters.rating.toString()}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleRatingChange(e.target.value)}
                      className="w-32"
                      options={[
                        { value: '0', label: 'Any Rating' },
                        { value: '3', label: '3+ Stars' },
                        { value: '4', label: '4+ Stars' },
                        { value: '4.5', label: '4.5+ Stars' }
                      ]}
                    />
                    {filters.rating > 0 && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={`${
                              i < filters.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <Text size="sm" weight="medium" className="mb-2">
                    Categories
                  </Text>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {categoryOptions.map((category) => (
                      <label
                        key={category.value}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                      >
                        <Checkbox
                          checked={filters.categories.includes(category.value)}
                          onChange={() => handleCategoryToggle(category.value)}
                        />
                        <span className="text-sm">{category.icon} {category.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Boolean Filters */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.verified}
                      onChange={(e) => updateFilters({ verified: e.target.checked })}
                    />
                    <Text size="sm">Verified Vendors Only</Text>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.featured}
                      onChange={(e) => updateFilters({ featured: e.target.checked })}
                    />
                    <Text size="sm">Featured Vendors Only</Text>
                  </label>
                </div>

                {/* Clear Filters */}
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearFilters}
                    className="flex items-center gap-2"
                  >
                    <X size={16} />
                    Clear All Filters
                  </Button>
                </div>
              </Stack>
            </div>
          )}
        </Stack>
      </div>
    </Card>
  );
}
