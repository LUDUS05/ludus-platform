import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Filter, 
  TrendingUp, 
  Search, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Heart,
  Share2,
  Calendar,
  Zap,
  Award,
  Eye,
  Bookmark
} from 'lucide-react';

// Mock data for demonstration
const MOCK_ACTIVITIES = [
  {
    id: 1,
    title: "مغامرة في الصحراء",
    description: "تجربة فريدة في قلب الصحراء مع ركوب الجمال ومشاهدة الغروب",
    category: "outdoor",
    price: 299,
    location: "الرياض، المملكة العربية السعودية",
    duration: "6 ساعات",
    current_participants: 8,
    max_participants: 15,
    vendor_name: "مغامرات الصحراء",
    vendor_rating: 4.8,
    image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    is_featured: true,
    is_trending: true,
    tags: ["مغامرة", "صحراء", "جمال"]
  },
  {
    id: 2,
    title: "ورشة الطبخ التقليدي",
    description: "تعلم أسرار الطبخ السعودي التقليدي مع أفضل الشيفات المحليين",
    category: "food",
    price: 199,
    location: "جدة، المملكة العربية السعودية",
    duration: "4 ساعات",
    current_participants: 12,
    max_participants: 20,
    vendor_name: "مطبخ الأصالة",
    vendor_rating: 4.9,
    image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    is_featured: false,
    is_trending: true,
    tags: ["طبخ", "تقليدي", "سعودي"]
  },
  {
    id: 3,
    title: "جلسة موسيقية كلاسيكية",
    description: "استمتع بأجمل المقطوعات الموسيقية الكلاسيكية في جو راقي",
    category: "music",
    price: 150,
    location: "الدمام، المملكة العربية السعودية",
    duration: "3 ساعات",
    current_participants: 25,
    max_participants: 50,
    vendor_name: "أوركسترا الخليج",
    vendor_rating: 4.7,
    image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
    is_featured: true,
    is_trending: false,
    tags: ["موسيقى", "كلاسيكية", "أوركسترا"]
  }
];

const INTERESTS = [
  { id: 'sports', name: 'الرياضة', emoji: '⚽', color: 'bg-blue-500' },
  { id: 'music', name: 'الموسيقى', emoji: '🎵', color: 'bg-purple-500' },
  { id: 'art', name: 'الفنون', emoji: '🎨', color: 'bg-pink-500' },
  { id: 'food', name: 'الطعام', emoji: '🍽️', color: 'bg-orange-500' },
  { id: 'outdoor', name: 'الهواء الطلق', emoji: '🌲', color: 'bg-green-500' },
  { id: 'fitness', name: 'اللياقة', emoji: '💪', color: 'bg-red-500' },
  { id: 'workshops', name: 'الورش', emoji: '🛠️', color: 'bg-yellow-500' },
  { id: 'nightlife', name: 'السهرات', emoji: '🌙', color: 'bg-indigo-500' },
  { id: 'culture', name: 'الثقافة', emoji: '🎭', color: 'bg-teal-500' }
];

export default function TestHomePage() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [likedActivities, setLikedActivities] = useState(new Set());
  const [bookmarkedActivities, setBookmarkedActivities] = useState(new Set());

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setActivities(MOCK_ACTIVITIES);
      setIsLoading(false);
      
      // Check if user has interests (simulate)
      if (Math.random() > 0.5) {
        setShowOnboarding(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleOnboardingComplete = () => {
    if (selectedInterests.length > 0) {
      setShowOnboarding(false);
      // Here you would typically save to backend
    }
  };

  const handleActivityTap = (activity) => {
    navigate(`/activity/${activity.id}`);
  };

  const toggleLike = (activityId, e) => {
    e.stopPropagation();
    setLikedActivities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  const toggleBookmark = (activityId, e) => {
    e.stopPropagation();
    setBookmarkedActivities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  const filteredActivities = activities.filter(activity => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'recommended' && selectedInterests.length > 0) {
      return selectedInterests.includes(activity.category);
    }
    if (activeFilter === 'trending') {
      return activity.is_trending;
    }
    if (activeFilter === 'featured') {
      return activity.is_featured;
    }
    return true;
  }).filter(activity => 
    searchQuery === '' || 
    activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-md mx-auto">
          {/* Welcome Animation */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="neumorphic-elevated rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center animate-neumorphic-pulse">
              <Sparkles className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-black text-gray-800 mb-3">
              مرحباً بك في لودس!
            </h1>
            <p className="text-gray-700 text-lg leading-relaxed">
              دعنا نخصص تجربتك. اختر اهتماماتك لنقدم لك أفضل الأنشطة
            </p>
          </div>

          {/* Interest Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              ما الذي يثير اهتمامك؟
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {INTERESTS.map((interest) => {
                const isSelected = selectedInterests.includes(interest.id);
                return (
                  <div
                    key={interest.id}
                    onClick={() => {
                      const newInterests = isSelected
                        ? selectedInterests.filter(id => id !== interest.id)
                        : [...selectedInterests, interest.id];
                      setSelectedInterests(newInterests);
                    }}
                    className={`neumorphic rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                      isSelected 
                        ? 'neumorphic-pressed scale-95' 
                        : 'hover:scale-105'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{interest.emoji}</span>
                        <span className="font-medium text-gray-800">
                          {interest.name}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="neumorphic-subtle rounded-full p-2">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Continue Button */}
          <div className="neumorphic rounded-2xl p-6">
            <button
              onClick={handleOnboardingComplete}
              disabled={selectedInterests.length === 0}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 ${
                selectedInterests.length > 0 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 active:scale-95' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              متابعة ({selectedInterests.length} محدد)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="neumorphic rounded-full w-20 h-20 flex items-center justify-center mb-4 animate-neumorphic-pulse">
            <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
          <p className="text-gray-700 font-medium">جاري تحميل الأنشطة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="neumorphic-subtle mx-4 mt-6 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black text-gray-800 mb-2">
              اكتشف فعاليات مميزة
            </h1>
            <p className="text-gray-700">
              اعثر على أنشطة تناسب ذوقك واهتماماتك
            </p>
          </div>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="neumorphic rounded-full p-3 hover:scale-110 transition-transform duration-200"
          >
            <Search className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="neumorphic rounded-xl p-4 mb-4 animate-slide-up">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="ابحث عن أنشطة، أماكن، أو فئات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-gray-800 placeholder-gray-500 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Filter Pills */}
      <div className="px-4 mb-6">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'all', label: 'الكل', icon: Filter, count: activities.length },
            { id: 'recommended', label: 'مقترحة لك', icon: Sparkles, count: activities.filter(a => selectedInterests.includes(a.category)).length },
            { id: 'trending', label: 'الأكثر رواجًا', icon: TrendingUp, count: activities.filter(a => a.is_trending).length },
            { id: 'featured', label: 'مميزة', icon: Award, count: activities.filter(a => a.is_featured).length }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`neumorphic flex items-center gap-2 px-4 py-3 rounded-xl whitespace-nowrap transition-all duration-300 ${
                activeFilter === filter.id 
                  ? 'neumorphic-pressed text-blue-600 scale-105' 
                  : 'hover:scale-105 text-gray-800'
              }`}
            >
              <filter.icon className={`w-4 h-4 ${
                activeFilter === filter.id ? 'text-blue-600' : 'text-gray-700'
              }`} />
              <span className="font-medium text-sm">{filter.label}</span>
              <span className="neumorphic-subtle rounded-full px-2 py-1 text-xs font-bold">
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Activities List */}
      <div className="px-4 pb-6">
        {filteredActivities.length > 0 ? (
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => (
              <div
                key={activity.id}
                className="neumorphic rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleActivityTap(activity)}
              >
                {/* Image Section */}
                <div className="relative mb-4">
                  <img 
                    src={activity.image_url} 
                    alt={activity.title}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  
                  {/* Price Badge */}
                  <div className="absolute top-3 left-3 neumorphic-subtle rounded-full px-3 py-2">
                    <span className="text-sm font-bold text-gray-800">
                      ر.س {activity.price}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={(e) => toggleLike(activity.id, e)}
                      className={`neumorphic-subtle rounded-full p-2 transition-all duration-200 ${
                        likedActivities.has(activity.id) 
                          ? 'text-red-500 scale-110' 
                          : 'text-gray-600 hover:text-red-500 hover:scale-110'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${
                        likedActivities.has(activity.id) ? 'fill-current' : ''
                      }`} />
                    </button>
                    <button
                      onClick={(e) => toggleBookmark(activity.id, e)}
                      className={`neumorphic-subtle rounded-full p-2 transition-all duration-200 ${
                        bookmarkedActivities.has(activity.id) 
                          ? 'text-blue-500 scale-110' 
                          : 'text-gray-600 hover:text-blue-500 hover:scale-110'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${
                        bookmarkedActivities.has(activity.id) ? 'fill-current' : ''
                      }`} />
                    </button>
                  </div>

                  {/* Featured Badge */}
                  {activity.is_featured && (
                    <div className="absolute bottom-3 left-3 neumorphic-subtle rounded-full px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500">
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        مميز
                      </span>
                    </div>
                  )}

                  {/* Trending Badge */}
                  {activity.is_trending && (
                    <div className="absolute bottom-3 right-3 neumorphic-subtle rounded-full px-3 py-1 bg-gradient-to-r from-red-400 to-pink-500">
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        رائج
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 leading-tight">
                      {activity.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="neumorphic-subtle rounded-full px-3 py-1">
                        <span className="text-xs font-medium text-gray-700">
                          {activity.category?.toUpperCase?.()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" />
                        <span className="text-sm font-medium text-gray-800">
                          {activity.vendor_rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed">
                    {activity.description?.length > 100 
                      ? `${activity.description.substring(0, 100)}...` 
                      : activity.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {activity.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="neumorphic-subtle rounded-full px-2 py-1 text-xs text-gray-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Activity Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="truncate">{activity.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-green-500" />
                      <span>{activity.duration}</span>
                    </div>
                  </div>

                  {/* Participants and Vendor */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-700">
                      <Users className="w-4 h-4 mr-2 text-purple-500" />
                      <span>{activity.current_participants}/{activity.max_participants}</span>
                    </div>
                    <span className="text-xs text-gray-600">
                      بواسطة {activity.vendor_name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 animate-fade-in">
            <div className="neumorphic rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              لا توجد نتائج
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? `لا توجد أنشطة تطابق "${searchQuery}"` : 'لا توجد أنشطة متاحة حالياً'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              className="neumorphic px-6 py-3 rounded-xl text-blue-600 font-medium hover:scale-105 transition-transform duration-200"
            >
              عرض جميع الأنشطة
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <button className="neumorphic-elevated rounded-full w-14 h-14 flex items-center justify-center text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-110 active:scale-95">
          <Zap className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
