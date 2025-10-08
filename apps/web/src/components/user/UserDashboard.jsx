/**
 * @fileoverview User Dashboard Component with RTL Support
 * @module components/user/UserDashboard
 * 
 * This component provides a comprehensive user dashboard including:
 * - Quick stats and overview
 * - Recent activity
 * - Upcoming bookings
 * - Favorite activities
 * - Recommendations
 * - Quick actions
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTranslationWithFallback } from '../../hooks/useTranslationWithFallback';
import { userService } from '../../services/userService';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Alert } from '../ui';
import { 
  Calendar, 
  TrendingUp, 
  Heart, 
  Star, 
  Clock, 
  MapPin, 
  Users, 
  Plus,
  ArrowRight,
  Activity,
  Award,
  Target
} from 'lucide-react';

const UserDashboard = () => {
  const { t } = useTranslationWithFallback();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await userService.getDashboardData();
      setDashboardData(response.data);
    } catch (err) {
      setError(t('dashboard.loadError', 'Failed to load dashboard data'));
      console.error('Load dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={t('common.direction') || 'ltr'}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ludus-orange"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={t('common.direction') || 'ltr'}>
        <Alert type="error" message={error} />
      </div>
    );
  }

  const { stats, recentActivities, upcomingBookings, favoriteActivities, recommendations } = dashboardData || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={t('common.direction') || 'ltr'}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('dashboard.welcome', 'Welcome back')}, {userService.formatUserDisplayName(dashboardData?.user)}!
          </h1>
          <p className="text-gray-600">
            {t('dashboard.subtitle', 'Here\'s what\'s happening with your activities')}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.totalBookings', 'Total Bookings')}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalBookings || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.completedBookings', 'Completed')}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.completedBookings || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.favoriteActivities', 'Favorites')}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.favoriteActivities || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <span className="text-orange-600 font-bold text-lg">SAR</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.totalSpent', 'Total Spent')}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalSpent || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Bookings */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      {t('dashboard.upcomingBookings', 'Upcoming Bookings')}
                    </CardTitle>
                    <CardDescription>{t('dashboard.upcomingBookingsDesc', 'Your next activities')}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    {t('dashboard.viewAll', 'View All')}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {upcomingBookings && upcomingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingBookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center space-x-4 rtl:space-x-reverse p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-ludus-orange rounded-lg flex items-center justify-center">
                            <Activity className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{booking.title}</h3>
                          <p className="text-sm text-gray-500">{booking.vendor}</p>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse mt-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {new Date(booking.bookingDate).toLocaleDateString()} • {booking.timeSlot?.startTime}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">{t('dashboard.noUpcomingBookings', 'No upcoming bookings')}</p>
                    <Button className="bg-ludus-orange hover:bg-ludus-orange-dark">
                      <Plus className="w-4 h-4 mr-2" />
                      {t('dashboard.bookActivity', 'Book an Activity')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Activity className="w-5 h-5 mr-2" />
                      {t('dashboard.recentActivity', 'Recent Activity')}
                    </CardTitle>
                    <CardDescription>{t('dashboard.recentActivityDesc', 'Your latest activity history')}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    {t('dashboard.viewAll', 'View All')}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentActivities && recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-4 rtl:space-x-reverse p-3 border border-gray-200 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            activity.status === 'completed' ? 'bg-green-100' :
                            activity.status === 'cancelled' ? 'bg-red-100' :
                            'bg-yellow-100'
                          }`}>
                            {activity.status === 'completed' ? (
                              <Award className="w-4 h-4 text-green-600" />
                            ) : activity.status === 'cancelled' ? (
                              <X className="w-4 h-4 text-red-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-yellow-600" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{activity.title}</h3>
                          <p className="text-sm text-gray-500">{activity.vendor}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(activity.bookingDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                            activity.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">{t('dashboard.noRecentActivity', 'No recent activity')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.quickActions', 'Quick Actions')}</CardTitle>
                <CardDescription>{t('dashboard.quickActionsDesc', 'Common tasks')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('dashboard.bookActivity', 'Book an Activity')}
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Heart className="w-4 h-4 mr-2" />
                    {t('dashboard.viewFavorites', 'View Favorites')}
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    {t('dashboard.viewBookings', 'View Bookings')}
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    {t('dashboard.findFriends', 'Find Friends')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Favorite Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  {t('dashboard.favoriteActivities', 'Favorite Activities')}
                </CardTitle>
                <CardDescription>{t('dashboard.favoriteActivitiesDesc', 'Activities you love')}</CardDescription>
              </CardHeader>
              <CardContent>
                {favoriteActivities && favoriteActivities.length > 0 ? (
                  <div className="space-y-3">
                    {favoriteActivities.slice(0, 3).map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Activity className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{activity.title}</h3>
                          <p className="text-xs text-gray-500">{activity.category}</p>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full">
                      {t('dashboard.viewAllFavorites', 'View All Favorites')}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Heart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">{t('dashboard.noFavorites', 'No favorite activities yet')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  {t('dashboard.recommendations', 'Recommendations')}
                </CardTitle>
                <CardDescription>{t('dashboard.recommendationsDesc', 'Based on your interests')}</CardDescription>
              </CardHeader>
              <CardContent>
                {recommendations && recommendations.length > 0 ? (
                  <div className="space-y-3">
                    {recommendations.slice(0, 3).map((activity) => (
                      <div key={activity.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{activity.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{activity.vendor}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-600">{activity.category}</span>
                          <span className="text-xs font-medium text-ludus-orange">{activity.price} SAR</span>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full">
                      {t('dashboard.viewAllRecommendations', 'View All Recommendations')}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">{t('dashboard.noRecommendations', 'No recommendations yet')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Achievement Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  {t('dashboard.achievements', 'Achievements')}
                </CardTitle>
                <CardDescription>{t('dashboard.achievementsDesc', 'Your badges and milestones')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <Award className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
                    <p className="text-xs font-medium text-yellow-800">First Booking</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Star className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs font-medium text-blue-800">Explorer</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Heart className="w-6 h-6 text-green-600 mx-auto mb-1" />
                    <p className="text-xs font-medium text-green-800">Social Butterfly</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-xs font-medium text-purple-800">Regular</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
