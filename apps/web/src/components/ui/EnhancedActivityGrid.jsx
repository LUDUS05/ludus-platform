// frontend/src/components/ui/EnhancedActivityGrid.jsx
import React, { useState, useEffect, useRef } from 'react';
import { gsap } from '../../utils/gsap-setup';
import { animationPresets, staggerConfigs } from '../../utils/gsap-setup';
import { apiService } from '../../services/apiService';
import { notificationService } from '../../services/notificationService';
import EnhancedActivityCard from './EnhancedActivityCard';

const EnhancedActivityGrid = ({ 
  filters = {}, 
  showFilters = true, 
  onActivitySelect,
  className = '' 
}) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [appliedFilters, setAppliedFilters] = useState(filters);
  
  const gridRef = useRef(null);
  const loadingRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    loadActivities();
    setupInfiniteScroll();
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (JSON.stringify(appliedFilters) !== JSON.stringify(filters)) {
      setAppliedFilters(filters);
      setPage(1);
      setActivities([]);
      loadActivities(true);
    }
  }, [filters]);

  const loadActivities = async (reset = false) => {
    if (loading && !reset) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getActivities({
        page: reset ? 1 : page,
        limit: 12,
        ...appliedFilters
      });

      if (response.success) {
        const newActivities = response.data || [];
        
        if (reset) {
          setActivities(newActivities);
          animateGridReset();
        } else {
          setActivities(prev => [...prev, ...newActivities]);
          animateNewActivities(newActivities);
        }
        
        setHasMore(newActivities.length === 12);
        setPage(prev => reset ? 2 : prev + 1);
      }
    } catch (error) {
      setError(error.message);
      notificationService.show('error', 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const setupInfiniteScroll = () => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadActivities();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }
  };

  const animateGridReset = () => {
    if (!gridRef.current) return;
    
    const cards = gridRef.current.querySelectorAll('.activity-card');
    
    // Hide existing cards
    gsap.to(cards, {
      duration: 0.3,
      opacity: 0,
      scale: 0.9,
      ease: 'power2.in'
    });
    
    // Show loading skeleton
    showLoadingSkeleton();
  };

  const animateNewActivities = (newActivities) => {
    if (!gridRef.current) return;
    
    const cards = gridRef.current.querySelectorAll('.activity-card');
    const newCards = cards.slice(-newActivities.length);
    
    // Hide loading skeleton
    hideLoadingSkeleton();
    
    // Animate new cards
    gsap.fromTo(newCards, 
      { 
        y: 60, 
        opacity: 0, 
        scale: 0.9 
      },
      {
        duration: 0.6,
        y: 0,
        opacity: 1,
        scale: 1,
        stagger: staggerConfigs.cards.stagger,
        ease: 'power3.out'
      }
    );
  };

  const showLoadingSkeleton = () => {
    const skeleton = document.querySelector('.loading-skeleton');
    if (skeleton) {
      gsap.to(skeleton, { duration: 0.3, opacity: 1 });
      
      gsap.to(skeleton.querySelectorAll('.skeleton-item'), {
        duration: 1.5,
        opacity: 0.3,
        repeat: -1,
        yoyo: true,
        stagger: 0.2,
        ease: 'power2.inOut'
      });
    }
  };

  const hideLoadingSkeleton = () => {
    const skeleton = document.querySelector('.loading-skeleton');
    if (skeleton) {
      gsap.to(skeleton, { duration: 0.2, opacity: 0 });
    }
  };

  const handleActivityJoin = (activityId, joined) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === activityId 
          ? { 
              ...activity, 
              attendees: joined 
                ? (activity.attendees || 0) + 1 
                : Math.max((activity.attendees || 0) - 1, 0),
              isJoined: joined 
            }
          : activity
      )
    );
  };

  const handleActivityLike = (activityId, liked) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === activityId 
          ? { 
              ...activity, 
              likes: liked 
                ? (activity.likes || 0) + 1 
                : Math.max((activity.likes || 0) - 1, 0),
              isLiked: liked 
            }
          : activity
      )
    );
  };

  const handleRetry = () => {
    setError(null);
    loadActivities(true);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">حدث خطأ في تحميل الأنشطة</div>
        <button
          onClick={handleRetry}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className={`enhanced-activity-grid ${className}`}>
      {/* Loading Skeleton */}
      <div className="loading-skeleton opacity-0 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="skeleton-item bg-gray-200 rounded-xl h-80 animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Activities Grid */}
      <div 
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {activities.map((activity, index) => (
          <EnhancedActivityCard
            key={activity.id}
            activity={activity}
            index={index}
            onJoin={handleActivityJoin}
            onLike={handleActivityLike}
          />
        ))}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div 
          ref={loadingRef}
          className="flex justify-center py-8"
        >
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && activities.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>تم عرض جميع الأنشطة المتاحة</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && activities.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد أنشطة متاحة</h3>
          <p className="text-gray-500">جرب تغيير الفلاتر أو تحقق مرة أخرى لاحقاً</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedActivityGrid;
