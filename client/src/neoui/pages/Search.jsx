import React, { useState, useEffect, useCallback } from 'react';
import { Activity } from '../entities/Activity';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ActivityCard from '../components/ActivityCard';
import { Search as SearchIcon, MapPin, DollarSign, SlidersHorizontal } from 'lucide-react';

export default function SearchPage() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['all', 'sports', 'music', 'art', 'food', 'outdoor', 'fitness', 'workshops', 'nightlife', 'culture'];
  const priceRanges = [
    { id: 'all', label: 'All Prices' },
    { id: '0-25', label: 'Under $25' },
    { id: '25-50', label: '$25 - $50' },
    { id: '50-100', label: '$50 - $100' },
    { id: '100+', label: '$100+' }
  ];

  const filterActivities = useCallback(() => {
    let filtered = [...activities];

    if (searchQuery) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.vendor_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(activity => activity.category === selectedCategory);
    }

    if (priceRange !== 'all') {
      filtered = filtered.filter(activity => {
        const price = activity.price;
        switch (priceRange) {
          case '0-25':
            return price < 25;
          case '25-50':
            return price >= 25 && price < 50;
          case '50-100':
            return price >= 50 && price < 100;
          case '100+':
            return price >= 100;
          default:
            return true;
        }
      });
    }

    setFilteredActivities(filtered);
  }, [searchQuery, selectedCategory, priceRange, activities]);

  useEffect(() => {
    const loadActivities = async () => {
      const activitiesList = await Activity.list('-created_date');
      setActivities(activitiesList);
    };
    loadActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [filterActivities]);

  const handleActivityTap = (activity) => {
    navigate(createPageUrl(`ActivityDetails?id=${activity.id}`));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange('all');
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="neumorphic rounded-2xl p-4 flex items-center gap-3">
          <SearchIcon className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search activities, locations, hosts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-neumorphic placeholder-gray-500 outline-none"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl transition-all duration-200 ${
              showFilters ? 'neumorphic-pressed' : 'neumorphic-subtle hover:neumorphic'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="neumorphic rounded-2xl p-4 mb-6 space-y-4">
          {/* Categories */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-gray-600" />
              <span className="font-semibold text-neumorphic text-sm">Category</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    selectedCategory === category 
                      ? 'neumorphic-pressed text-blue-600' 
                      : 'neumorphic-subtle hover:neumorphic text-gray-600'
                  }`}
                >
                  {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-gray-600" />
              <span className="font-semibold text-neumorphic text-sm">Price Range</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {priceRanges.map((range) => (
                <button
                  key={range.id}
                  onClick={() => setPriceRange(range.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    priceRange === range.id 
                      ? 'neumorphic-pressed text-blue-600' 
                      : 'neumorphic-subtle hover:neumorphic text-gray-600'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={clearFilters}
            className="w-full py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Activities */}
      <div>
        {filteredActivities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} onTap={handleActivityTap} />
        ))}
      </div>
    </div>
  );
}

