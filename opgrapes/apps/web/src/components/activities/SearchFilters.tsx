'use client';

import { useState, useEffect } from 'react';
import { Card } from 'ui/Card';
import { Button } from 'ui/Button';
import { Input } from 'ui/Input';
import { Select } from 'ui/Select';
import { Text } from 'ui/Text';
import { Stack } from 'ui/Stack';
import { Badge } from 'ui/Badge';

export interface SearchFilters {
  search: string;
  category: string;
  location: string;
  priceRange: [number, number];
  duration: string;
  rating: string;
  participants: string;
  date: string;
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onReset: () => void;
  categories: string[];
  locations: string[];
}

export function SearchFilters({ 
  filters, 
  onFiltersChange, 
  onReset, 
  categories, 
  locations 
}: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriceRangeChange = (index: number, value: string) => {
    const newPriceRange: [number, number] = [...localFilters.priceRange];
    newPriceRange[index] = parseFloat(value) || 0;
    setLocalFilters({ ...localFilters, priceRange: newPriceRange });
  };

  const handlePriceSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const newPriceRange: [number, number] = [0, value];
    setLocalFilters({ ...localFilters, priceRange: newPriceRange });
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleReset = () => {
    const resetFilters: SearchFilters = {
      search: '',
      category: '',
      location: '',
      priceRange: [0, 500],
      duration: '',
      rating: '',
      participants: '',
      date: ''
    };
    setLocalFilters(resetFilters);
    onReset();
  };

  const activeFilterCount = Object.values(filters).filter(value => 
    value !== '' && 
    (Array.isArray(value) ? value[0] !== 0 || value[1] !== 500 : true)
  ).length;

  return (
    <Card className="mb-6">
      <div className="p-6">
        <Stack spacing="md">
          {/* Basic Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5">
                🔍
              </div>
              <Input
                placeholder="Search activities, locations, or categories..."
                value={localFilters.search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2"
              >
                ⚙️
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <Badge variant="primary" size="sm">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  onClick={handleReset}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                  <span className="hidden sm:inline ml-1">Clear</span>
                </Button>
              )}
            </div>
          </div>

          {/* Expanded Advanced Filters */}
          {isExpanded && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <Text size="sm" weight="medium" className="mb-2 block">
                    Category
                  </Text>
                  <Select
                    value={localFilters.category}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('category', e.target.value)}
                    options={[
                      { value: '', label: 'All Categories' },
                      ...categories.map((category) => ({
                        value: category,
                        label: category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')
                      }))
                    ]}
                  />
                </div>

                {/* Location Filter */}
                <div>
                  <Text size="sm" weight="medium" className="mb-2 block">
                    Location
                  </Text>
                  <Select
                    value={localFilters.location}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('location', e.target.value)}
                    options={[
                      { value: '', label: 'All Locations' },
                      ...locations.map((location) => ({
                        value: location,
                        label: location
                      }))
                    ]}
                  />
                </div>

                {/* Duration Filter */}
                <div>
                  <Text size="sm" weight="medium" className="mb-2 block">
                    Duration
                  </Text>
                  <Select
                    value={localFilters.duration}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('duration', e.target.value)}
                    options={[
                      { value: '', label: 'Any Duration' },
                      { value: '0-60', label: 'Under 1 hour' },
                      { value: '60-120', label: '1-2 hours' },
                      { value: '120-240', label: '2-4 hours' },
                      { value: '240-480', label: '4-8 hours' },
                      { value: '480+', label: 'Over 8 hours' }
                    ]}
                  />
                </div>

                {/* Rating Filter */}
                <div>
                  <Text size="sm" weight="medium" className="mb-2 block">
                    Minimum Rating
                  </Text>
                  <Select
                    value={localFilters.rating}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('rating', e.target.value)}
                    options={[
                      { value: '', label: 'Any Rating' },
                      { value: '4.5', label: '4.5+ stars' },
                      { value: '4.0', label: '4.0+ stars' },
                      { value: '3.5', label: '3.5+ stars' },
                      { value: '3.0', label: '3.0+ stars' }
                    ]}
                  />
                </div>
              </div>

              {/* Price Range Section */}
              <div className="mt-6 border-t pt-4">
                <Text size="sm" weight="medium" className="mb-4 block">
                  Price Range: ${localFilters.priceRange[0]} - ${localFilters.priceRange[1]}
                </Text>
                
                {/* Price Range Slider */}
                <div className="mb-4">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={localFilters.priceRange[1]}
                    onChange={handlePriceSliderChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$0</span>
                    <span>$100</span>
                    <span>$200</span>
                    <span>$300</span>
                    <span>$400</span>
                    <span>$500</span>
                  </div>
                </div>

                {/* Price Range Inputs */}
                <div className="flex gap-3 items-center">
                  <div className="flex-1">
                    <Text size="xs" color="gray" className="mb-1 block">Min Price</Text>
                    <Input
                      type="number"
                      min="0"
                      max={localFilters.priceRange[1]}
                      placeholder="Min"
                      value={localFilters.priceRange[0]}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceRangeChange(0, e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <span className="text-gray-500 text-center">to</span>
                  <div className="flex-1">
                    <Text size="xs" color="gray" className="mb-1 block">Max Price</Text>
                    <Input
                      type="number"
                      min={localFilters.priceRange[0]}
                      max="1000"
                      placeholder="Max"
                      value={localFilters.priceRange[1]}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceRangeChange(1, e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Filters Row */}
              <div className="mt-6 border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Participants Filter */}
                  <div>
                    <Text size="sm" weight="medium" className="mb-2 block">
                      Max Participants
                    </Text>
                    <Select
                      value={localFilters.participants}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('participants', e.target.value)}
                      options={[
                        { value: '', label: 'Any Group Size' },
                        { value: '1-2', label: '1-2 people' },
                        { value: '3-5', label: '3-5 people' },
                        { value: '6-10', label: '6-10 people' },
                        { value: '10+', label: '10+ people' }
                      ]}
                    />
                  </div>

                  {/* Date Filter */}
                  <div>
                    <Text size="sm" weight="medium" className="mb-2 block">
                      Available Date
                    </Text>
                    <Input
                      type="date"
                      value={localFilters.date}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>

              {/* Apply Filters Button */}
              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
                  Reset All Filters
                </Button>
                <Button variant="primary" onClick={handleApplyFilters} className="w-full sm:w-auto">
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </Stack>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>
    </Card>
  );
}
