import React, { useState, useEffect } from 'react';
import { Activity } from '../entities/Activity';
import { User } from '../entities/User';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ActivityCard from '../components/ActivityCard';
import InterestSelector from '../components/InterestSelector';
import { Sparkles, Filter, TrendingUp, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

// Skeleton component for loading state
const ActivityCardSkeleton = () => (
  <div className="neumorphic p-4 rounded-lg mb-4 animate-pulse">
    <div className="h-40 bg-gray-300 rounded-md mb-4"></div>
    <div className="h-6 bg-gray-300 rounded-md mb-2 w-3/4"></div>
    <div className="h-4 bg-gray-300 rounded-md w-1/2"></div>
  </div>
);

export default function TestHomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activities, setActivities] = useState([]);
  const [user, setUser] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      if (!currentUser.interests || currentUser.interests.length === 0) {
        setShowOnboarding(true);
      } else {
        setSelectedInterests(currentUser.interests);
      }

      const activitiesList = await Activity.list('-created_date');
      setActivities(activitiesList);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  };

  const handleOnboardingComplete = async () => {
    if (selectedInterests.length > 0) {
      await User.updateMyUserData({ interests: selectedInterests });
      setShowOnboarding(false);
      setUser(prev => ({ ...prev, interests: selectedInterests }));
    }
  };

  const handleActivityTap = (activity) => {
    navigate(createPageUrl(`ActivityDetails?id=${activity.id}`));
  };

  const handleResetFilters = () => {
    setActiveFilter('all');
    setSearchTerm('');
  };

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = () => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'recommended' && user?.interests) {
        return user.interests.includes(activity.category);
      }
      if (activeFilter === 'trending') {
        return (activity.current_participants || 0) > ((activity.max_participants || 10) * 0.7);
      }
      return true;
    };
    const matchesSearch = () => {
      if (!searchTerm) return true;
      return activity.name.toLowerCase().includes(searchTerm.toLowerCase());
    };
    return matchesFilter() && matchesSearch();
  });

  if (showOnboarding) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="neumorphic rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-800 mb-2">
            {t('home.welcome')}
          </h1>
          <p className="text-gray-700">
            {t('home.personalize')}
          </p>
        </div>

        <InterestSelector 
          selectedInterests={selectedInterests}
          onInterestsChange={setSelectedInterests}
        />

        <div className="mt-8">
          <button
            onClick={handleOnboardingComplete}
            disabled={selectedInterests.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-200 ${
              selectedInterests.length > 0 
                ? 'bg-blue-600 hover:bg-blue-700 neumorphic' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {t('home.continue')} ({selectedInterests.length})
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-800 mb-2">
          {t('home.discover')}
        </h1>
        <p className="text-gray-700">
          {t('home.findActivities')}
        </p>
      </div>
      
      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder={t('home.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 neumorphic-inset rounded-xl"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {/* Filter Pills */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'all', label: t('home.filters.all'), icon: Filter },
          { id: 'recommended', label: t('home.filters.recommended'), icon: Sparkles },
          { id: 'trending', label: t('home.filters.trending'), icon: TrendingUp }
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200 ${
              activeFilter === filter.id 
                ? 'neumorphic-pressed text-blue-600' 
                : 'neumorphic hover:neumorphic-subtle text-gray-800'
            }`}
          >
            <filter.icon className={`w-4 h-4 ${
              activeFilter === filter.id ? 'text-blue-600' : 'text-gray-700'
            }`} />
            <span className="font-medium text-sm">{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Activities List */}
      <div>
        {isLoading ? (
          <div>
            <ActivityCardSkeleton />
            <ActivityCardSkeleton />
            <ActivityCardSkeleton />
          </div>
        ) : (
          <AnimatePresence>
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ActivityCard
                    activity={activity}
                    onTap={handleActivityTap}
                  />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="neumorphic rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-700 mb-4">
                  {t('home.noActivities')}
                </p>
                <button 
                  onClick={handleResetFilters}
                  className="neumorphic-button"
                >
                  {t('home.resetFilters')}
                </button>
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
