/**
 * @fileoverview Selena-Onboard Analytics Dashboard for Admin Panel
 * 
 * Purpose: Provides comprehensive analytics and monitoring for the Selena-Onboard
 * AI agent performance, including completion rates, user satisfaction, language
 * distribution, and step-by-step drop-off analysis.
 * 
 * Business Context: Enables administrators to monitor the effectiveness of the
 * AI onboarding system, identify improvement opportunities, and track KPIs for
 * the LUDUS platform's onboarding experience.
 * 
 * @version 1.0.0
 * @since 2025-09-28
 * @author LUDUS Development Team - Selena-Onboard Analytics
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  MessageCircle,
  Globe,
  CheckCircle,
  AlertTriangle,
  Bot,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import selenaService from '../../services/selenaService';

const SelenaAnalyticsDashboard = () => {
  const { t, i18n } = useTranslation();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await selenaService.getAnalytics(timeframe);
      
      if (result.success) {
        setAnalytics(result.analytics);
      } else {
        throw new Error(result.error || 'Failed to load analytics');
      }
    } catch (error) {
      console.error('Error loading Selena analytics:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const timeframeOptions = [
    { value: '7d', label: i18n.language === 'ar' ? '7 أيام' : '7 Days' },
    { value: '30d', label: i18n.language === 'ar' ? '30 يوماً' : '30 Days' },
    { value: '90d', label: i18n.language === 'ar' ? '90 يوماً' : '90 Days' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-gray-600">
          {i18n.language === 'ar' ? 'جاري تحميل التحليلات...' : 'Loading analytics...'}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {i18n.language === 'ar' ? 'خطأ في تحميل التحليلات' : 'Analytics Loading Error'}
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={loadAnalytics} variant="outline">
          {i18n.language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {i18n.language === 'ar' ? 'لوحة تحكم سيلينا' : 'Selena Analytics Dashboard'}
            </h1>
            <p className="text-gray-600">
              {i18n.language === 'ar' 
                ? 'مراقبة أداء وكيلة الإعداد والترحيب'
                : 'Monitor onboarding agent performance'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {timeframeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <Button 
            onClick={refreshAnalytics} 
            disabled={refreshing}
            className="bg-purple-500 hover:bg-purple-600"
          >
            {refreshing ? (
              <LoadingSpinner size="sm" />
            ) : (
              i18n.language === 'ar' ? 'تحديث' : 'Refresh'
            )}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Users className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {i18n.language === 'ar' ? 'إجمالي الجلسات' : 'Total Sessions'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {analytics?.overall?.totalSessions?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-gray-500">
                {i18n.language === 'ar' 
                  ? `خلال آخر ${timeframe === '7d' ? '7 أيام' : timeframe === '30d' ? '30 يوماً' : '90 يوماً'}`
                  : `Last ${timeframe === '7d' ? '7 days' : timeframe === '30d' ? '30 days' : '90 days'}`
                }
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 text-green-500" />
                {i18n.language === 'ar' ? 'معدل الإكمال' : 'Completion Rate'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {analytics?.performance?.completionRate || '0%'}
              </div>
              <p className="text-xs text-gray-500">
                {analytics?.overall?.completedSessions || 0} / {analytics?.overall?.totalSessions || 0}
                {' '}
                {i18n.language === 'ar' ? 'مكتمل' : 'completed'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Clock className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 text-blue-500" />
                {i18n.language === 'ar' ? 'متوسط وقت الإكمال' : 'Avg. Completion Time'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {analytics?.performance?.averageTime || 'N/A'}
              </div>
              <p className="text-xs text-gray-500">
                {i18n.language === 'ar' ? 'دقائق في المتوسط' : 'minutes average'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <MessageCircle className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 text-purple-500" />
                {i18n.language === 'ar' ? 'متوسط التفاعلات' : 'Avg. Interactions'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(analytics?.overall?.averageInteractions || 0)}
              </div>
              <p className="text-xs text-gray-500">
                {i18n.language === 'ar' ? 'رسائل لكل جلسة' : 'messages per session'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Language Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
              {i18n.language === 'ar' ? 'توزيع اللغات' : 'Language Distribution'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analytics?.language && Object.entries(analytics.language).map(([lang, count]) => (
                <div key={lang} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className={`w-4 h-4 rounded-full ${
                      lang === 'ar' ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                    <span className="font-medium">
                      {lang === 'ar' ? 'العربية' : 'English'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{count.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">
                      {((count / (analytics?.overall?.totalSessions || 1)) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Step Drop-off Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
              {i18n.language === 'ar' ? 'تحليل التسرب بين الخطوات' : 'Step Drop-off Analysis'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.steps?.map((step, index) => {
                const stepNames = {
                  welcome: i18n.language === 'ar' ? 'الترحيب' : 'Welcome',
                  registration: i18n.language === 'ar' ? 'التسجيل' : 'Registration',
                  profile_setup: i18n.language === 'ar' ? 'إعداد الملف الشخصي' : 'Profile Setup',
                  feature_tour: i18n.language === 'ar' ? 'جولة المنصة' : 'Feature Tour',
                  cultural_guidance: i18n.language === 'ar' ? 'التوجيه الثقافي' : 'Cultural Guidance',
                  completion: i18n.language === 'ar' ? 'الإكمال' : 'Completion'
                };

                const dropoffRate = step.dropoffRate || 0;
                const completionRate = 100 - dropoffRate;

                return (
                  <div key={step._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        completionRate >= 90 ? 'bg-green-100 text-green-600' :
                        completionRate >= 70 ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{stepNames[step._id] || step._id}</div>
                        <div className="text-sm text-gray-500">
                          {step.count} {i18n.language === 'ar' ? 'جلسة' : 'sessions'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-bold ${
                        completionRate >= 90 ? 'text-green-600' :
                        completionRate >= 70 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {completionRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {i18n.language === 'ar' ? 'معدل الإكمال' : 'completion rate'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
              {i18n.language === 'ar' ? 'رؤى الأداء' : 'Performance Insights'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Completion Rate Insights */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">
                  {i18n.language === 'ar' ? 'تحليل معدل الإكمال' : 'Completion Rate Analysis'}
                </h4>
                
                {analytics?.performance?.completionRate && (
                  <div className="space-y-2">
                    {parseFloat(analytics.performance.completionRate) >= 85 ? (
                      <div className="flex items-center space-x-2 rtl:space-x-reverse text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">
                          {i18n.language === 'ar' 
                            ? 'معدل إكمال ممتاز - يتجاوز الهدف (85%)'
                            : 'Excellent completion rate - exceeds target (85%)'
                          }
                        </span>
                      </div>
                    ) : parseFloat(analytics.performance.completionRate) >= 70 ? (
                      <div className="flex items-center space-x-2 rtl:space-x-reverse text-yellow-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">
                          {i18n.language === 'ar' 
                            ? 'معدل إكمال جيد - يمكن التحسين'
                            : 'Good completion rate - room for improvement'
                          }
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 rtl:space-x-reverse text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">
                          {i18n.language === 'ar' 
                            ? 'معدل إكمال منخفض - يحتاج تحسين فوري'
                            : 'Low completion rate - needs immediate improvement'
                          }
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Time Insights */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">
                  {i18n.language === 'ar' ? 'تحليل الوقت' : 'Time Analysis'}
                </h4>
                
                {analytics?.performance?.averageTime && (
                  <div className="space-y-2">
                    {analytics.performance.averageTime.includes('minutes') && 
                     parseInt(analytics.performance.averageTime) <= 10 ? (
                      <div className="flex items-center space-x-2 rtl:space-x-reverse text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">
                          {i18n.language === 'ar' 
                            ? 'وقت إكمال ممتاز - أقل من 10 دقائق'
                            : 'Excellent completion time - under 10 minutes'
                          }
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 rtl:space-x-reverse text-yellow-600">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">
                          {i18n.language === 'ar' 
                            ? 'يمكن تحسين وقت الإكمال'
                            : 'Completion time can be improved'
                          }
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Success Metrics Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>
              {i18n.language === 'ar' ? 'ملخص مؤشرات النجاح' : 'Success Metrics Summary'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {analytics?.performance?.completionRate || '0%'}
                </div>
                <div className="text-sm text-gray-600">
                  {i18n.language === 'ar' ? 'معدل الإكمال' : 'Completion Rate'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {i18n.language === 'ar' ? 'الهدف: أكثر من 85%' : 'Target: >85%'}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {analytics?.performance?.averageTime || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">
                  {i18n.language === 'ar' ? 'متوسط الوقت' : 'Average Time'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {i18n.language === 'ar' ? 'الهدف: أقل من 10 دقائق' : 'Target: <10 minutes'}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {((analytics?.language?.ar || 0) / (analytics?.overall?.totalSessions || 1) * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">
                  {i18n.language === 'ar' ? 'استخدام العربية' : 'Arabic Usage'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {i18n.language === 'ar' ? 'الهدف: أكثر من 70%' : 'Target: >70%'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Period Information */}
      <div className="text-center text-sm text-gray-500">
        {i18n.language === 'ar' ? 'البيانات من' : 'Data from'} {analytics?.period?.startDate && 
          new Date(analytics.period.startDate).toLocaleDateString(
            i18n.language === 'ar' ? 'ar-SA' : 'en-US'
          )
        } {i18n.language === 'ar' ? 'إلى' : 'to'} {analytics?.period?.endDate && 
          new Date(analytics.period.endDate).toLocaleDateString(
            i18n.language === 'ar' ? 'ar-SA' : 'en-US'
          )
        }
      </div>
    </div>
  );
};

export default SelenaAnalyticsDashboard;