/**
 * @fileoverview Discover Results Component
 * 
 * Displays search results from Selena-Discover AI agent with enhanced
 * presentation, cultural insights, and interactive features.
 * 
 * @version 1.0.0
 * @author LUDUS Development Team - Selena-Discover Implementation
 * @since 2025-09-28
 */

import React, { useState, useEffect } from 'react';
import { Star, MapPin, Clock, Users, Heart, Share2, Calendar, Zap } from 'lucide-react';
import { useTranslationWithFallback } from '../../hooks/useTranslationWithFallback';
import { useAuth } from '../../context/AuthContext';
import { discoverService } from '../../services/discoverService';

const DiscoverResults = ({ 
  searchData, 
  onActivityClick, 
  onBookingClick, 
  className = '' 
}) => {
  const { t } = useTranslationWithFallback();
  const { user } = useAuth();
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Load personalized recommendations on component mount
  useEffect(() => {
    if (user?.id && searchData?.results?.length > 0) {
      loadPersonalizedRecommendations();
    }
  }, [user?.id, searchData]);

  const loadPersonalizedRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const response = await discoverService.getPersonalizedRecommendations({
        user_id: user.id,
        context: {
          current_search: searchData.searchQuery,
          timestamp: new Date().toISOString()
        },
        cultural_context: 'saudi_modern'
      });
      
      setRecommendations(response.data?.recommendations || []);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleActivityClick = (activity, position) => {
    setSelectedActivity(activity);
    onActivityClick?.(activity);

    // Track click interaction
    if (user?.id) {
      discoverService.trackInteraction({
        user_id: user.id,
        interaction_type: 'click',
        activity_id: activity._id || activity.id,
        position,
        context: {
          search_query: searchData.searchQuery,
          discovery_score: activity._discoveryScore,
          timestamp: new Date().toISOString()
        }
      });
    }
  };

  const handleBookingClick = (activity) => {
    onBookingClick?.(activity);

    // Track booking intention
    if (user?.id) {
      discoverService.trackInteraction({
        user_id: user.id,
        interaction_type: 'booking_intent',
        activity_id: activity._id || activity.id,
        context: {
          from_discover: true,
          recommendation_score: activity._discoveryScore
        }
      });
    }
  };

  const handleShareActivity = async (activity) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: activity.title,
          text: activity.description,
          url: window.location.href
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(
          `${activity.title} - ${window.location.href}`
        );
        // Show toast notification
      }

      // Track share interaction
      if (user?.id) {
        discoverService.trackInteraction({
          user_id: user.id,
          interaction_type: 'share',
          activity_id: activity._id || activity.id,
          context: { method: navigator.share ? 'native' : 'clipboard' }
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const formatPrice = (pricing) => {
    if (!pricing) return '';
    const { basePrice, currency = 'SAR', priceType = 'per_person' } = pricing;
    
    const priceTypeText = {
      per_person: t('per_person', 'للشخص'),
      per_group: t('per_group', 'للمجموعة'),
      per_hour: t('per_hour', 'للساعة')
    };

    return `${basePrice} ${currency} ${priceTypeText[priceType] || ''}`;
  };

  const formatDuration = (duration) => {
    if (!duration) return '';
    const { hours = 0, minutes = 0 } = duration;
    
    if (hours && minutes) {
      return `${hours}${t('hours_short', 'س')} ${minutes}${t('minutes_short', 'د')}`;
    } else if (hours) {
      return `${hours} ${t(hours === 1 ? 'hour' : 'hours', hours === 1 ? 'ساعة' : 'ساعات')}`;
    } else if (minutes) {
      return `${minutes} ${t(minutes === 1 ? 'minute' : 'minutes', minutes === 1 ? 'دقيقة' : 'دقائق')}`;
    }
    return '';
  };

  const getCulturalBadges = (activity) => {
    const badges = [];
    
    if (activity.cultural_tags?.includes('traditional')) {
      badges.push({ text: t('traditional', 'تراثي'), color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400' });
    }
    
    if (activity.family_friendly) {
      badges.push({ text: t('family_friendly', 'مناسب للعائلة'), color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' });
    }
    
    if (activity.prayer_time_friendly) {
      badges.push({ text: t('prayer_friendly', 'يراعي أوقات الصلاة'), color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' });
    }
    
    if (activity.halal_certified) {
      badges.push({ text: t('halal_certified', 'معتمد حلال'), color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400' });
    }

    return badges;
  };

  if (!searchData || searchData.error) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 dark:text-gray-400">
          {searchData?.message || t('search_error', 'حدث خطأ في البحث')}
        </div>
      </div>
    );
  }

  if (searchData.results?.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 dark:text-gray-400 mb-4">
          {t('no_results', 'لم يتم العثور على نتائج')}
        </div>
        {searchData.searchSuggestions?.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('try_suggestions', 'جرب هذه الاقتراحات:')}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {searchData.searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => window.dispatchEvent(new CustomEvent('discover-search', { 
                    detail: { query: suggestion } 
                  }))}
                  className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`discover-results ${className}`}>
      {/* Cultural Insights Banner */}
      {searchData.culturalInsights?.length > 0 && (
        <div className="cultural-insights mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-start">
            <div className="text-purple-600 dark:text-purple-400 mr-3 mt-1">
              🧠
            </div>
            <div>
              <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-1">
                {t('cultural_insights', 'رؤى ثقافية')}
              </h4>
              <div className="text-sm text-purple-700 dark:text-purple-400">
                {searchData.culturalInsights.map((insight, index) => (
                  <div key={index} className="mb-1">• {insight}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Grid */}
      <div className="results-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {searchData.results.map((activity, index) => (
          <div
            key={activity._id || activity.id}
            className="activity-card bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
            onClick={() => handleActivityClick(activity, index)}
          >
            {/* Activity Image */}
            <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500">
              {activity.images?.[0]?.url ? (
                <img
                  src={activity.images[0].url}
                  alt={activity.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-4xl">
                  {activity.category === 'fitness' && '💪'}
                  {activity.category === 'arts' && '🎨'}
                  {activity.category === 'food' && '🍽️'}
                  {activity.category === 'outdoor' && '🌲'}
                  {activity.category === 'unique' && '✨'}
                  {activity.category === 'wellness' && '🧘'}
                </div>
              )}
              
              {/* Discovery Score Badge */}
              {activity._discoveryScore && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  <Zap className="inline h-3 w-3 mr-1" />
                  {Math.round(activity._discoveryScore * 100)}%
                </div>
              )}

              {/* Cultural Badges */}
              <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                {getCulturalBadges(activity).slice(0, 2).map((badge, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}
                  >
                    {badge.text}
                  </span>
                ))}
              </div>
            </div>

            {/* Activity Details */}
            <div className="p-4">
              {/* Title and Rating */}
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1">
                  {activity.title}
                </h3>
                <div className="flex items-center ml-2 flex-shrink-0">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                    {activity.rating?.average?.toFixed(1) || '0.0'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {activity.description}
              </p>

              {/* Activity Info */}
              <div className="space-y-2 mb-4">
                {/* Location */}
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">
                    {activity.location?.city || t('location_tbd', 'يحدد لاحقاً')}
                  </span>
                  {activity.aiInsights?.proximityScore && (
                    <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                      ({Math.round(activity.aiInsights.proximityScore * 100)}% {t('match', 'مطابقة')})
                    </span>
                  )}
                </div>

                {/* Duration and Capacity */}
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{formatDuration(activity.duration)}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>
                      {activity.capacity?.min || 1}-{activity.capacity?.max || 10} {t('people', 'أشخاص')}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatPrice(activity.pricing)}
                  </span>
                  {activity.realTimeData?.pricing?.dynamicAdjustment && (
                    <span className="text-xs text-orange-600 dark:text-orange-400">
                      {t('dynamic_pricing', 'سعر ديناميكي')}
                    </span>
                  )}
                </div>
              </div>

              {/* AI Insights */}
              {activity.aiInsights && (
                <div className="ai-insights mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                  <div className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
                    🤖 {t('ai_insights', 'رؤى الذكاء الاصطناعي')}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    {t('cultural_fit', 'المطابقة الثقافية')}: {Math.round((activity.aiInsights.culturalFit || 0.5) * 100)}%
                  </div>
                  {activity.aiInsights.recommendationReason && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {t('recommended_because', 'مُوصى بسبب')}: {t(activity.aiInsights.recommendationReason, activity.aiInsights.recommendationReason)}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookingClick(activity);
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-sm font-medium"
                >
                  {t('book_now', 'احجز الآن')}
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShareActivity(activity);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                  title={t('share', 'مشاركة')}
                >
                  <Share2 className="h-5 w-5" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle wishlist/favorite
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title={t('add_to_wishlist', 'إضافة للمفضلة')}
                >
                  <Heart className="h-5 w-5" />
                </button>
              </div>

              {/* Availability Indicator */}
              {activity.realTimeData?.availability && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`flex items-center ${
                      activity.realTimeData.availability.available 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        activity.realTimeData.availability.available ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      {activity.realTimeData.availability.available 
                        ? t('available_today', 'متاح اليوم')
                        : t('not_available_today', 'غير متاح اليوم')
                      }
                    </span>
                    {activity.realTimeData.availability.slotsToday > 0 && (
                      <span className="text-gray-500 dark:text-gray-400">
                        {activity.realTimeData.availability.slotsToday} {t('slots_available', 'فترة متاحة')}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Geographic Clusters */}
      {searchData.geographicClusters?.length > 0 && (
        <div className="geographic-clusters mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('nearby_clusters', 'المجموعات القريبة')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchData.geographicClusters.map((cluster, index) => (
              <div
                key={index}
                className="cluster-card p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {cluster.city}
                  </h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {cluster.distance_km} {t('km_away', 'كم')}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {cluster.activity_count} {t('activities', 'أنشطة')}
                </div>
                <div className="flex flex-wrap gap-1">
                  {cluster.popular_categories?.slice(0, 3).map((category, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                    >
                      {t(category, category)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <div className="personalized-recommendations">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-500" />
            {t('personalized_for_you', 'مخصص لك')}
          </h3>
          
          {loadingRecommendations ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">
                {t('loading_recommendations', 'تحميل التوصيات...')}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.slice(0, 4).map((rec, index) => (
                <div
                  key={index}
                  className="recommendation-card p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleActivityClick(rec.activity, index)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      {rec.activity.title}
                    </h4>
                    <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                      {Math.round(rec.recommendation_score * 100)}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {t('recommended_because', 'سبب التوصية')}: {t(rec.recommendation_reason, rec.recommendation_reason)}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{rec.activity.location?.city}</span>
                    <span>{formatPrice(rec.activity.pricing)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search Suggestions */}
      {searchData.searchSuggestions?.length > 0 && (
        <div className="search-suggestions mt-8">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
            {t('related_searches', 'عمليات بحث ذات صلة')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {searchData.searchSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => window.dispatchEvent(new CustomEvent('discover-search', { 
                  detail: { query: suggestion } 
                }))}
                className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Performance Metrics (Debug Mode) */}
      {process.env.NODE_ENV === 'development' && searchData.performanceMetrics && (
        <div className="performance-debug mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            🔧 Performance Debug
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-gray-500">Processing:</span>
              <span className="ml-1 font-mono">{searchData.performanceMetrics.processingTimeMs}ms</span>
            </div>
            <div>
              <span className="text-gray-500">NLP Confidence:</span>
              <span className="ml-1 font-mono">{Math.round((searchData.performanceMetrics.nlpConfidence || 0) * 100)}%</span>
            </div>
            <div>
              <span className="text-gray-500">Results:</span>
              <span className="ml-1 font-mono">{searchData.performanceMetrics.finalCount}</span>
            </div>
            <div>
              <span className="text-gray-500">Quality:</span>
              <span className="ml-1 font-mono">{Math.round((searchData.performanceMetrics.rankingQuality || 0) * 100)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoverResults;