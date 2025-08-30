import React, { useState, useEffect } from 'react';
import { Activity } from '../entities/Activity';
import { User } from '../entities/User';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ActivityCard from '../components/ActivityCard';
import InterestSelector from '../components/InterestSelector';
import { Sparkles, Filter, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [user, setUser] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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

  const filteredActivities = activities.filter(activity => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'recommended' && user?.interests) {
      return user.interests.includes(activity.category);
    }
    if (activeFilter === 'trending') {
      return (activity.current_participants || 0) > ((activity.max_participants || 10) * 0.7);
    }
    return true;
  });

  if (showOnboarding) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="neumorphic rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-2xl font-black text-neumorphic mb-2">
            Welcome to LUDUS!
          </h1>
          <p className="text-gray-600">
            Let's personalize your experience. What are you interested in?
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
            Continue ({selectedInterests.length} selected)
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="neumorphic rounded-full w-16 h-16 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-neumorphic mb-2">
          اكتشف فعاليات مميزة
        </h1>
        <p className="text-gray-600">
          اعثر على أنشطة تناسب ذوقك
        </p>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'الكل', icon: Filter },
          { id: 'recommended', label: 'مقترحة لك', icon: Sparkles },
          { id: 'trending', label: 'الأكثر رواجًا', icon: TrendingUp }
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200 ${
              activeFilter === filter.id ? 'neumorphic-pressed' : 'neumorphic hover:neumorphic-subtle'
            }`}
          >
            <filter.icon className="w-4 h-4" />
            <span className="font-medium text-sm">{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Activities List */}
      <div>
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onTap={handleActivityTap}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="neumorphic rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600">
              لا توجد أنشطة. جرّب تعديل الفلاتر!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

