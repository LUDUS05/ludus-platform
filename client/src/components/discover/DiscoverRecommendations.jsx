/**
 * @fileoverview Discover Recommendations Component
 * 
 * Displays personalized recommendations from Selena-Discover AI agent
 * with cultural context and learning insights.
 * 
 * @version 1.0.0
 * @author LUDUS Development Team - Selena-Discover Implementation
 * @since 2025-09-28
 */

import React, { useState, useEffect } from 'react';
import { Star, MapPin, Clock, Users, Zap, Brain, Target, TrendingUp } from 'lucide-react';
import { useTranslationWithFallback } from '../../hooks/useTranslationWithFallback';
import { discoverService } from '../../services/discoverService';

const DiscoverRecommendations = ({ userId, userLocation, onActivityClick, onBookingClick }) => {
  const { t } = useTranslationWithFallback();
  
  const [recommendations, setRecommendations] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [culturalFitScore, setCulturalFitScore] = useState(0);
  const [learningInsights, setLearningInsights] = useState({});

  useEffect(() => {
    if (userId) {
      loadRecommendationsAndProfile();
    }
  }, [userId, userLocation]);

  const loadRecommendationsAndProfile = async () => {
    setIsLoading(true);
    try {
      // Load in parallel
      const [recommendationResponse, profileResponse] = await Promise.all([
        discoverService.getPersonalizedRecommendations({
          user_id: userId,
          context: {
            page: 'recommendations_tab',
            timestamp: new Date().toISOString()
          },
          location: userLocation,
          cultural_context: 'saudi_modern'
        }),
        discoverService.getUserPreferenceProfile()
      ]);

      setRecommendations(recommendationResponse.data?.recommendations || []);
      setConfidenceScore(recommendationResponse.data?.confidenceScore || 0);
      setCulturalFitScore(recommendationResponse.data?.culturalFitScore || 0);
      setLearningInsights(recommendationResponse.data?.learningInsights || {});
      setUserProfile(profileResponse.data?.profile);

    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecommendationClick = (recommendation, index) => {
    const activity = recommendation.activity;
    onActivityClick?.(activity);

    // Track recommendation click
    discoverService.trackInteraction({
      user_id: userId,
      interaction_type: 'recommendation_click',
      activity_id: activity._id || activity.id,
      position: index,
      context: {
        recommendation_score: recommendation.recommendation_score,
        cultural_fit: recommendation.cultural_fit,
        from_tab: 'recommendations'
      }
    });
  };

  const formatPrice = (pricing) => {
    if (!pricing) return '';
    const { basePrice, currency = 'SAR' } = pricing;
    return `${basePrice} ${currency}`;
  };

  const formatDuration = (duration) => {
    if (!duration) return '';
    const { hours = 0, minutes = 0 } = duration;
    
    if (hours && minutes) {
      return `${hours}${t('hours_short', 'س')} ${minutes}${t('minutes_short', 'د')}`;
    } else if (hours) {
      return `${hours} ${t(hours === 1 ? 'hour' : 'hours', hours === 1 ? 'ساعة' : 'ساعات')}`;
    }
    return `${minutes} ${t('minutes', 'دقائق')}`;
  };

  const getRecommendationReasonText = (reason) => {
    const reasonMap = {
      'highly_rated': t('highly_rated_reason', 'تقييم عالي'),
      'popular_choice': t('popular_choice_reason', 'اختيار شائع'),
      'cultural_match': t('cultural_match_reason', 'مناسب ثقافياً'),
      'nearby_location': t('nearby_location_reason', 'موقع قريب'),
      'similar_users': t('similar_users_reason', 'مستخدمون مشابهون'),
      'preference_match': t('preference_match_reason', 'يناسب تفضيلاتك')
    };

    return reasonMap[reason] || reason;
  };

  if (isLoading) {
    return (
      <div className="recommendations-loading flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-600 dark:text-gray-400">
            {t('generating_recommendations', 'سيلينا تُحضّر توصياتك الشخصية...')}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            {t('analyzing_preferences', 'تحليل تفضيلاتك والسياق الثقافي')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="discover-recommendations">
      {/* Recommendation Header with Insights */}
      <div className="recommendation-header mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Brain className="h-6 w-6 mr-3 text-purple-500" />
            {t('personalized_recommendations', 'توصياتك الشخصية')}
          </h2>
          
          {/* Confidence Indicators */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {Math.round(confidenceScore * 100)}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('confidence', 'الثقة')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {Math.round(culturalFitScore * 100)}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('cultural_fit', 'المطابقة الثقافية')}
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Insights */}
        {userProfile && (
          <div className="profile-insights p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  {t('profile_analysis', 'تحليل الملف الشخصي')}
                </span>
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                {t('completeness', 'الاكتمال')}: {userProfile.completeness}%
              </div>
            </div>
            
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {userProfile.totalInteractions}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {t('interactions', 'تفاعلات')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {userProfile.confidence}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {t('learning_confidence', 'ثقة التعلم')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {Math.round((userProfile.culturalProfile?.traditionalPreference || 0.5) * 100)}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {t('traditional_preference', 'تفضيل تراثي')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {Math.round((userProfile.culturalProfile?.modernPreference || 0.5) * 100)}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {t('modern_preference', 'تفضيل عصري')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations Grid */}
      {recommendations.length > 0 ? (
        <div className="recommendations-grid">
          {/* Top Recommendations */}
          <div className="top-recommendations mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-500" />
              {t('top_recommendations', 'أفضل التوصيات')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.slice(0, 4).map((recommendation, index) => (
                <div
                  key={index}
                  className="recommendation-card bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                  onClick={() => handleRecommendationClick(recommendation, index)}
                >
                  {/* Recommendation Score Badge */}
                  <div className="relative">
                    <div className="absolute top-3 right-3 z-10">
                      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                        <Zap className="h-3 w-3 mr-1" />
                        {Math.round(recommendation.recommendation_score * 100)}% {t('match', 'مطابقة')}
                      </div>
                    </div>

                    {/* Activity Image */}
                    <div className="h-40 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-3xl">
                      {recommendation.activity.category === 'fitness' && '💪'}
                      {recommendation.activity.category === 'arts' && '🎨'}
                      {recommendation.activity.category === 'food' && '🍽️'}
                      {recommendation.activity.category === 'outdoor' && '🌲'}
                      {recommendation.activity.category === 'unique' && '✨'}
                      {recommendation.activity.category === 'wellness' && '🧘'}
                    </div>
                  </div>

                  <div className="p-4">
                    {/* Title and Basic Info */}
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {recommendation.activity.title}
                    </h4>

                    {/* Recommendation Reason */}
                    <div className="recommendation-reason mb-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-xs font-medium text-green-800 dark:text-green-300 mb-1">
                        {t('why_recommended', 'لماذا مُوصى بهذا؟')}
                      </div>
                      <div className="text-xs text-green-700 dark:text-green-400">
                        {getRecommendationReasonText(recommendation.recommendation_reason)}
                      </div>
                    </div>

                    {/* Activity Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{recommendation.activity.location?.city}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{formatDuration(recommendation.activity.duration)}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          <span>
                            {recommendation.activity.capacity?.max || 10} {t('max_people', 'أقصى عدد')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatPrice(recommendation.activity.pricing)}
                        </span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                            {recommendation.activity.rating?.average?.toFixed(1) || '0.0'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cultural Fit Indicator */}
                    <div className="cultural-fit mb-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t('cultural_compatibility', 'التوافق الثقافي')}
                        </span>
                        <span className="font-medium text-purple-600 dark:text-purple-400">
                          {Math.round(recommendation.cultural_fit * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${recommendation.cultural_fit * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onBookingClick?.(recommendation.activity);
                        }}
                        className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 text-sm font-medium"
                      >
                        {t('book_recommended', 'احجز المُوصى')}
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Track feedback
                          discoverService.trackInteraction({
                            user_id: userId,
                            interaction_type: 'recommendation_like',
                            activity_id: recommendation.activity._id || recommendation.activity.id
                          });
                        }}
                        className="px-3 py-2 text-green-600 dark:text-green-400 border border-green-300 dark:border-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-sm"
                      >
                        👍
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Insights */}
          {Object.keys(learningInsights).length > 0 && (
            <div className="learning-insights mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Brain className="h-5 w-5 mr-2 text-indigo-500" />
                {t('learning_insights', 'رؤى التعلم')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Preference Confidence */}
                <div className="insight-card p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {t('preference_understanding', 'فهم التفضيلات')}
                  </div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    {Math.round((learningInsights.preference_confidence || 0) * 100)}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {t('how_well_we_know_you', 'مدى معرفتنا بتفضيلاتك')}
                  </div>
                </div>

                {/* Recommendation Diversity */}
                <div className="insight-card p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {t('recommendation_diversity', 'تنوع التوصيات')}
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {learningInsights.recommendation_diversity || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {t('different_categories', 'فئات مختلفة')}
                  </div>
                </div>

                {/* Cultural Alignment */}
                <div className="insight-card p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {t('cultural_alignment', 'التوافق الثقافي')}
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {Math.round((learningInsights.cultural_alignment || 0) * 100)}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {t('cultural_match_quality', 'جودة المطابقة الثقافية')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Improvement Suggestions */}
          {learningInsights.improvement_areas?.length > 0 && (
            <div className="improvement-suggestions mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('improve_recommendations', 'حسّن توصياتك')}
              </h3>
              
              <div className="space-y-3">
                {learningInsights.improvement_areas.map((area, index) => (
                  <div key={index} className="improvement-card p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start">
                      <div className="text-yellow-600 dark:text-yellow-400 mr-3 mt-1">💡</div>
                      <div>
                        <div className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                          {t(`improvement_${area}`, getImprovementMessage(area))}
                        </div>
                        <div className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                          {t(`improvement_${area}_action`, getImprovementAction(area))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="no-recommendations text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('building_your_profile', 'نبني ملفك الشخصي')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {t('no_recommendations_yet', 'سيلينا تتعلم تفضيلاتك. ابحث واستكشف المزيد للحصول على توصيات أفضل!')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('discover-search', { 
                detail: { query: '' } 
              }))}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {t('start_exploring', 'ابدأ الاستكشاف')}
            </button>
            
            <button
              onClick={() => window.location.href = '/activities/trending'}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              {t('view_trending', 'عرض الرائج')}
            </button>
          </div>
        </div>
      )}

      {/* Next Learning Opportunity */}
      {learningInsights.next_learning_opportunity && (
        <div className="learning-opportunity mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-start">
            <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-3 mt-1" />
            <div>
              <div className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-1">
                {t('next_step', 'الخطوة التالية')}
              </div>
              <div className="text-sm text-indigo-700 dark:text-indigo-400">
                {t(`learning_${learningInsights.next_learning_opportunity}`, 
                   getLearningOpportunityMessage(learningInsights.next_learning_opportunity))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
function getImprovementMessage(area) {
  const messages = {
    'expand_activity_database': 'We need more activities in your preferred categories',
    'collect_location_preferences': 'Tell us your preferred locations for better recommendations',
    'diversify_recommendations': 'Explore different activity types to get more diverse suggestions'
  };
  return messages[area] || area;
}

function getImprovementAction(area) {
  const actions = {
    'expand_activity_database': 'Check back soon for new activities',
    'collect_location_preferences': 'Update your location preferences in settings',
    'diversify_recommendations': 'Try searching for different types of activities'
  };
  return actions[area] || 'Continue using the platform for better recommendations';
}

function getLearningOpportunityMessage(opportunity) {
  const messages = {
    'user_registration': 'Register to get personalized recommendations',
    'build_preference_profile': 'Continue searching and booking to improve recommendations',
    'location_preferences': 'Set your location preferences for better suggestions',
    'cultural_preferences': 'Tell us about your cultural preferences',
    'refine_recommendations': 'Your profile is complete! We\'ll keep refining recommendations'
  };
  return messages[opportunity] || opportunity;
}

export default DiscoverRecommendations;