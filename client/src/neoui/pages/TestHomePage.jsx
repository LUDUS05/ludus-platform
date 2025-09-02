import React, { useState, useEffect } from 'react';
import { Activity } from '../entities/Activity';
import { User } from '../entities/User';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ActivityCard from '../components/ActivityCard';
import InterestSelector from '../components/InterestSelector';
import { Sparkles, Filter, TrendingUp, Search, MapPin, Clock, Users, Star, Heart, Calendar, ChevronLeft, Bookmark, Share2, Target, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

// Enhanced skeleton component for loading state
const ActivityCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 animate-pulse">
    <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl mb-4"></div>
    <div className="space-y-3">
      <div className="h-5 bg-gray-200 rounded-lg w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
      <div className="flex gap-2">
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </div>
    </div>
  </div>
);

// Enhanced activity card component matching the app design
const EnhancedActivityCard = ({ activity, onTap }) => (
  <motion.div
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
    className="bg-white rounded-2xl shadow-sm border border-gray-100 cursor-pointer overflow-hidden group"
    onClick={() => onTap(activity)}
  >
    {/* Image Section with Social Proof */}
    <div className="relative h-48 overflow-hidden">
      <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500"></div>
      
      {/* Social Proof Banner */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm rounded-t-2xl p-4 transform translate-y-1/2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white"></div>
              <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white"></div>
              <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white"></div>
            </div>
            <span className="text-sm font-medium text-gray-700">+12 Going</span>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            JOIN THEM
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
          <Share2 className="w-5 h-5 text-white" />
        </button>
        <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
          <Bookmark className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Category Badge */}
      <div className="absolute top-4 left-4">
        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-800">
          {activity.category || 'Music'}
        </span>
      </div>
    </div>

    {/* Content Section */}
    <div className="p-6 pt-12">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
          {activity.name || 'International Band Music Concert'}
        </h3>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium text-gray-600">4.8</span>
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">
        {activity.description || 'Enjoy your favorite dishes and have a lovely time with friends and family. Food from local food trucks will be available.'}
      </p>

      {/* Activity Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">14 December, 2023</div>
            <div className="text-xs text-gray-500">Tuesday, 4:00PM - 9:00PM</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">KAFD Conference Centre</div>
            <div className="text-xs text-gray-500">KAFD, Riyadh, KSA</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Organizer</div>
            <div className="text-xs text-gray-500">Erik Naz</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <Clock className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Duration</div>
            <div className="text-xs text-gray-500">5 hours</div>
          </div>
        </div>
      </div>

      {/* Price and Action Button */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-blue-600">
            {activity.price || 120} SAR
          </span>
          <span className="text-sm text-gray-500 ml-1">per ticket</span>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 flex items-center gap-2">
          BUY TICKET
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  </motion.div>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            {/* LUDUS Logo */}
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center shadow-lg relative">
                <div className="text-white text-2xl font-bold tracking-wider">LUDUS</div>
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">✨</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4 font-medium">DISCOVER, PLAY AND CONNECT</p>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Welcome to Ludus!
            </h1>
            <p className="text-gray-600 text-lg">
              Let's personalize your experience by selecting your interests
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <InterestSelector 
              selectedInterests={selectedInterests}
              onInterestsChange={setSelectedInterests}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <button
              onClick={handleOnboardingComplete}
              disabled={selectedInterests.length === 0}
              className={`w-full py-4 rounded-2xl font-bold text-white transition-all duration-300 transform hover:scale-105 ${
                selectedInterests.length > 0 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Continue with {selectedInterests.length} interest{selectedInterests.length !== 1 ? 's' : ''}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header with Back Button */}
        <div className="bg-white border-b border-gray-100 px-4 py-4">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Discover Activities</h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="relative">
            <input
              type="text"
              placeholder="Find for food or restaurant"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-2xl border-0 text-base focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 p-1">
              <Target className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[
              { id: 'sports', label: 'Sports', icon: '🏀', color: 'bg-red-500' },
              { id: 'music', label: 'Music', icon: '🎵', color: 'bg-purple-500' },
              { id: 'food', label: 'Food', icon: '🍽️', color: 'bg-green-500' },
              { id: 'art', label: 'Art', icon: '🎨', color: 'bg-blue-500' },
              { id: 'adventure', label: 'Adventure', icon: '🏔️', color: 'bg-orange-500' }
            ].map((category) => (
              <button
                key={category.id}
                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-2xl whitespace-nowrap transition-all duration-200 ${
                  activeFilter === category.id 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveFilter(category.id)}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="text-sm font-medium">{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Activities List */}
        <div className="px-4 py-4">
          {isLoading ? (
            <div className="space-y-4">
              <ActivityCardSkeleton />
              <ActivityCardSkeleton />
              <ActivityCardSkeleton />
            </div>
          ) : (
            <AnimatePresence>
              {filteredActivities.length > 0 ? (
                <div className="space-y-4">
                  {filteredActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <EnhancedActivityCard
                        activity={activity}
                        onTap={handleActivityTap}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <Search className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-3">
                    No activities found
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                    Try adjusting your search terms or filters to find more activities
                  </p>
                  <button 
                    onClick={handleResetFilters}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200"
                  >
                    Reset Filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
