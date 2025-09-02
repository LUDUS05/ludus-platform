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
          <div className="neo-empty-icon">
            <Sparkles className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-800 mb-2">
            مرحباً بك في لودس!
          </h1>
          <p className="text-gray-700">
            دعنا نخصص تجربتك. ما الذي يثير اهتمامك؟
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
            className={`neo-button primary ${
              selectedInterests.length === 0 ? 'disabled' : ''
            }`}
          >
            متابعة ({selectedInterests.length} محدد)
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="neo-loading">
        <div className="neo-spinner">
          <div className="neo-spinner-inner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-800 mb-2">
          اكتشف فعاليات مميزة
        </h1>
        <p className="text-gray-700">
          اعثر على أنشطة تناسب ذوقك
        </p>
      </div>

      {/* Filter Pills */}
      <div className="neo-filter-container">
        {[
          { id: 'all', label: 'الكل', icon: Filter },
          { id: 'recommended', label: 'مقترحة لك', icon: Sparkles },
          { id: 'trending', label: 'الأكثر رواجًا', icon: TrendingUp }
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`neo-filter-pill ${activeFilter === filter.id ? 'active' : ''}`}
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
          <div className="neo-empty-state">
            <div className="neo-empty-icon">
              <Sparkles className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-700">
              لا توجد أنشطة. جرّب تعديل الفلاتر!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

