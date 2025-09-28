/**
 * @fileoverview Selena-Discover Main Page Component
 * 
 * Main discovery page that integrates search, results, recommendations,
 * and cultural insights powered by the Selena-Discover AI agent.
 * 
 * @version 1.0.0
 * @author LUDUS Development Team - Selena-Discover Implementation
 * @since 2025-09-28
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslationWithFallback } from '../../hooks/useTranslationWithFallback';
import { useAuth } from '../../context/AuthContext';
import SelenaDiscoverSearch from './SelenaDiscoverSearch';
import DiscoverResults from './DiscoverResults';
import DiscoverRecommendations from './DiscoverRecommendations';
import DiscoverCulturalInsights from './DiscoverCulturalInsights';
import { discoverService } from '../../services/discoverService';
import { Sparkles, TrendingUp, MapPin, Clock } from 'lucide-react';

const SelenaDiscoverPage = () => {
  const { t } = useTranslationWithFallback();
  const { user } = useAuth();
  
  // Main state
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [trendingActivities, setTrendingActivities] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [agentHealth, setAgentHealth] = useState(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
    checkAgentHealth();
    
    // Listen for custom search events
    const handleDiscoverSearch = (event) => {
      setActiveTab('search');
      // Trigger search with the provided query
      window.dispatchEvent(new CustomEvent('trigger-discover-search', {
        detail: { query: event.detail.query }
      }));
    };

    window.addEventListener('discover-search', handleDiscoverSearch);
    return () => window.removeEventListener('discover-search', handleDiscoverSearch);
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            coordinates: [position.coords.longitude, position.coords.latitude],
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.warn('Geolocation failed:', error);
          // Set default to Riyadh
          setUserLocation({
            coordinates: [46.6753, 24.7136],
            city: 'الرياض'
          });
        }
      );
    }
  }, []);

  const loadInitialData = async () => {
    try {
      // Load trending activities
      const trending = await discoverService.getTrendingActivities({
        timeframe: 'week',
        culturalContext: 'saudi_modern',
        language: t('lang')
      });
      
      setTrendingActivities(trending.data?.trendingActivities || []);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const checkAgentHealth = async () => {
    try {
      const health = await discoverService.getAgentHealth();
      setAgentHealth(health.data);
    } catch (error) {
      console.warn('Agent health check failed:', error);
      setAgentHealth({ overallHealth: 'unknown' });
    }
  };

  const handleSearchResults = useCallback((results) => {
    setSearchResults(results);
    if (results && !results.error) {
      setActiveTab('results');
    }
  }, []);

  const handleActivityClick = (activity) => {
    // Navigate to activity detail page
    window.location.href = `/activities/${activity._id || activity.id}`;
  };

  const handleBookingClick = (activity) => {
    // Navigate to booking page
    window.location.href = `/book/${activity._id || activity.id}`;
  };

  const tabs = [
    { 
      id: 'search', 
      label: t('discover_search', 'البحث الذكي'), 
      icon: Sparkles,
      description: t('ai_powered_search', 'بحث مدعوم بالذكاء الاصطناعي')
    },
    { 
      id: 'results', 
      label: t('search_results', 'النتائج'), 
      icon: MapPin,
      description: t('search_results_desc', 'نتائج البحث مع التحليل الثقافي')
    },
    { 
      id: 'trending', 
      label: t('trending', 'الرائج'), 
      icon: TrendingUp,
      description: t('trending_activities', 'الأنشطة الرائجة والشائعة')
    },
    { 
      id: 'recommendations', 
      label: t('for_you', 'لك'), 
      icon: Clock,
      description: t('personalized_recommendations', 'توصيات شخصية مناسبة لك')
    }
  ];

  return (
    <div className="selena-discover-page min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Sparkles className="h-8 w-8 mr-3 text-blue-500" />
                {t('selena_discover', 'سيلينا - الاستكشاف الذكي')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('discover_subtitle', 'اكتشف الأنشطة المثالية لك بقوة الذكاء الاصطناعي والسياق الثقافي')}
              </p>
            </div>
            
            {/* Agent Status Indicator */}
            {agentHealth && (
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  agentHealth.overallHealth === 'healthy' 
                    ? 'bg-green-500' 
                    : agentHealth.overallHealth === 'degraded'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('ai_status', 'حالة الذكاء الاصطناعي')}: {
                    agentHealth.overallHealth === 'healthy' 
                      ? t('online', 'متصل')
                      : agentHealth.overallHealth === 'degraded'
                      ? t('limited', 'محدود')
                      : t('offline', 'غير متصل')
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 rtl:space-x-reverse">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  title={tab.description}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.label}
                  
                  {/* Results count badge */}
                  {tab.id === 'results' && searchResults?.totalCount > 0 && (
                    <span className="ml-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full text-xs">
                      {searchResults.totalCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="search-tab">
            <SelenaDiscoverSearch
              onResults={handleSearchResults}
              onLoading={setIsLoading}
              className="mb-8"
            />
            
            {/* Welcome Message for New Users */}
            {!searchResults && !isLoading && (
              <div className="welcome-section">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🌟</div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {t('welcome_to_selena', 'مرحباً بك في سيلينا')}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
                    {t('selena_description', 'وكيل الاستكشاف الذكي الذي يساعدك في العثور على الأنشطة المثالية باستخدام الذكاء الاصطناعي والفهم الثقافي العميق')}
                  </p>

                  {/* Quick Start Options */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className="quick-option p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="text-blue-500 text-3xl mb-3">🎯</div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {t('smart_search', 'البحث الذكي')}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('smart_search_desc', 'ابحث بلغتك الطبيعية واحصل على نتائج دقيقة')}
                      </p>
                    </div>

                    <div className="quick-option p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="text-purple-500 text-3xl mb-3">🎭</div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {t('cultural_context', 'السياق الثقافي')}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('cultural_context_desc', 'اقتراحات تناسب ثقافتك وتفضيلاتك')}
                      </p>
                    </div>

                    <div className="quick-option p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="text-green-500 text-3xl mb-3">📍</div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {t('location_aware', 'الموقع الذكي')}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('location_aware_desc', 'أنشطة قريبة منك مع تحليل المسافة المثلى')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="results-tab">
            {searchResults ? (
              <DiscoverResults
                searchData={searchResults}
                onActivityClick={handleActivityClick}
                onBookingClick={handleBookingClick}
              />
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400">
                  {t('no_search_performed', 'لم يتم إجراء بحث بعد')}
                </div>
                <button
                  onClick={() => setActiveTab('search')}
                  className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {t('start_searching', 'ابدأ البحث')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Trending Tab */}
        {activeTab === 'trending' && (
          <div className="trending-tab">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('trending_activities', 'الأنشطة الرائجة')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('trending_description', 'اكتشف الأنشطة الأكثر شعبية والرائجة حالياً')}
              </p>
            </div>

            {trendingActivities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingActivities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="trending-card bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                    onClick={() => handleActivityClick(activity)}
                  >
                    {/* Trending Badge */}
                    <div className="relative">
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        #{index + 1} {t('trending', 'رائج')}
                      </div>
                      
                      {/* Activity Image */}
                      <div className="h-48 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-4xl">
                        {activity.category === 'fitness' && '💪'}
                        {activity.category === 'arts' && '🎨'}
                        {activity.category === 'food' && '🍽️'}
                        {activity.category === 'outdoor' && '🌲'}
                        {activity.category === 'unique' && '✨'}
                        {activity.category === 'wellness' && '🧘'}
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {activity.title}
                      </h3>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <span>{activity.location?.city}</span>
                        <span>{formatPrice(activity.pricing)}</span>
                      </div>

                      {activity.trendingMetrics && (
                        <div className="trending-metrics grid grid-cols-2 gap-2 text-xs">
                          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {Math.round(activity.trendingMetrics.popularityScore * 100)}%
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">
                              {t('popularity', 'شعبية')}
                            </div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {activity.trendingMetrics.recentBookings || 0}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">
                              {t('recent_bookings', 'حجوزات حديثة')}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400">
                  {t('loading_trending', 'تحميل الأنشطة الرائجة...')}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="recommendations-tab">
            {user ? (
              <DiscoverRecommendations
                userId={user.id}
                userLocation={userLocation}
                onActivityClick={handleActivityClick}
                onBookingClick={handleBookingClick}
              />
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔐</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t('login_for_recommendations', 'سجل الدخول للحصول على توصيات شخصية')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t('login_benefits', 'احصل على توصيات مخصصة تناسب ذوقك وتفضيلاتك الثقافية')}
                </p>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {t('login_now', 'تسجيل الدخول')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cultural Insights Sidebar (if available) */}
      {searchResults?.culturalInsights && (
        <DiscoverCulturalInsights 
          insights={searchResults.culturalInsights}
          userLocation={userLocation}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 w-80 hidden xl:block"
        />
      )}

      {/* Navigation Tabs Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 md:hidden">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SelenaDiscoverPage;