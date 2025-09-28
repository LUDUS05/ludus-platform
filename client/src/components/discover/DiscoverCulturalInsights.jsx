/**
 * @fileoverview Discover Cultural Insights Component
 * 
 * Displays cultural insights and context awareness from Selena-Discover AI agent
 * to help users understand cultural relevance of activities.
 * 
 * @version 1.0.0
 * @author LUDUS Development Team - Selena-Discover Implementation
 * @since 2025-09-28
 */

import React, { useState, useEffect } from 'react';
import { Brain, Lightbulb, Compass, Users, Calendar, Info } from 'lucide-react';
import { useTranslationWithFallback } from '../../hooks/useTranslationWithFallback';
import { discoverService } from '../../services/discoverService';

const DiscoverCulturalInsights = ({ insights = [], userLocation, className = '' }) => {
  const { t } = useTranslationWithFallback();
  
  const [culturalTrends, setCulturalTrends] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [localInsights, setLocalInsights] = useState([]);

  useEffect(() => {
    loadCulturalTrends();
    generateLocalInsights();
  }, [userLocation]);

  const loadCulturalTrends = async () => {
    try {
      const trends = await discoverService.getCulturalTrends({
        timeframe: 7
      });
      setCulturalTrends(trends.data?.culturalTrends || []);
    } catch (error) {
      console.error('Failed to load cultural trends:', error);
    }
  };

  const generateLocalInsights = () => {
    if (!userLocation) return;

    const insights = [];
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay();

    // Time-based insights
    if (currentHour >= 12 && currentHour <= 14) {
      insights.push({
        type: 'prayer_time',
        icon: '🕌',
        title: t('prayer_time_consideration', 'اعتبار وقت الصلاة'),
        description: t('dhuhr_prayer_time', 'وقت صلاة الظهر - الأنشطة قد تتوقف مؤقتاً'),
        priority: 'high'
      });
    }

    // Weekend insights
    if (currentDay === 5 || currentDay === 6) { // Friday or Saturday
      insights.push({
        type: 'weekend',
        icon: '🎉',
        title: t('weekend_activities', 'أنشطة نهاية الأسبوع'),
        description: t('weekend_popularity', 'الأنشطة العائلية والاجتماعية أكثر شعبية'),
        priority: 'medium'
      });
    }

    // Seasonal insights
    const month = new Date().getMonth();
    if (month >= 5 && month <= 8) { // Summer months
      insights.push({
        type: 'seasonal',
        icon: '☀️',
        title: t('summer_considerations', 'اعتبارات الصيف'),
        description: t('hot_weather_activities', 'الأنشطة الداخلية والمائية أكثر راحة'),
        priority: 'medium'
      });
    }

    setLocalInsights(insights);
  };

  const formatCulturalTrend = (trend) => {
    const culturalContextNames = {
      'saudi_traditional': t('saudi_traditional', 'سعودي تقليدي'),
      'saudi_modern': t('saudi_modern', 'سعودي عصري'),
      'expat_western': t('expat_western', 'مغترب غربي'),
      'expat_arab': t('expat_arab', 'مغترب عربي')
    };

    return {
      name: culturalContextNames[trend._id] || trend._id,
      searchCount: trend.searchCount,
      successRate: Math.round(trend.averageSuccess * 100)
    };
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800';
    }
  };

  if (!insights.length && !localInsights.length && !culturalTrends.length) {
    return null;
  }

  return (
    <div className={`cultural-insights ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="header p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="h-6 w-6 mr-2" />
              <div>
                <h3 className="font-semibold">
                  {t('cultural_insights', 'الرؤى الثقافية')}
                </h3>
                <p className="text-xs opacity-90">
                  {t('ai_cultural_analysis', 'تحليل ثقافي بالذكاء الاصطناعي')}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white hover:text-purple-200 transition-colors"
            >
              {isExpanded ? '−' : '+'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="content">
          {/* Main Insights */}
          {insights.length > 0 && (
            <div className="main-insights p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                {t('search_insights', 'رؤى البحث')}
              </h4>
              
              <div className="space-y-2">
                {insights.slice(0, isExpanded ? insights.length : 2).map((insight, index) => (
                  <div
                    key={index}
                    className="insight-item p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                  >
                    <div className="text-sm text-purple-800 dark:text-purple-300">
                      {insight}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Local Context Insights */}
          {localInsights.length > 0 && (
            <div className="local-insights p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Compass className="h-4 w-4 mr-2 text-blue-500" />
                {t('local_context', 'السياق المحلي')}
              </h4>
              
              <div className="space-y-2">
                {localInsights.map((insight, index) => (
                  <div
                    key={index}
                    className={`local-insight p-3 rounded-lg border ${getPriorityColor(insight.priority)}`}
                  >
                    <div className="flex items-start">
                      <span className="text-lg mr-2">{insight.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {insight.title}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {insight.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cultural Trends (if expanded) */}
          {isExpanded && culturalTrends.length > 0 && (
            <div className="cultural-trends p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2 text-green-500" />
                {t('cultural_trends', 'الاتجاهات الثقافية')}
              </h4>
              
              <div className="space-y-3">
                {culturalTrends.map((trend, index) => {
                  const formattedTrend = formatCulturalTrend(trend);
                  return (
                    <div
                      key={index}
                      className="trend-item p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-800 dark:text-green-300">
                          {formattedTrend.name}
                        </span>
                        <span className="text-xs text-green-600 dark:text-green-400">
                          {formattedTrend.searchCount} {t('searches', 'بحث')}
                        </span>
                      </div>
                      
                      <div className="text-xs text-green-700 dark:text-green-400">
                        {t('success_rate', 'معدل النجاح')}: {formattedTrend.successRate}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cultural Tips */}
          {isExpanded && (
            <div className="cultural-tips p-4 bg-gray-50 dark:bg-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Info className="h-4 w-4 mr-2 text-blue-500" />
                {t('cultural_tips', 'نصائح ثقافية')}
              </h4>
              
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <div>• {t('prayer_times_tip', 'تراعي معظم الأنشطة أوقات الصلاة')}</div>
                <div>• {t('family_activities_tip', 'الأنشطة العائلية شائعة في نهايات الأسبوع')}</div>
                <div>• {t('gender_policies_tip', 'تتنوع سياسات النوع الاجتماعي حسب النشاط')}</div>
                <div>• {t('cultural_events_tip', 'الفعاليات الثقافية تزداد خلال المواسم التراثية')}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscoverCulturalInsights;