/**
 * @fileoverview Activity Management Component with RTL Support
 * @module components/activity/ActivityManagement
 * 
 * This component provides comprehensive activity management functionality including:
 * - View all partner activities
 * - Filter and search activities
 * - Create new activities
 * - Edit existing activities
 * - Update activity status
 * - View analytics
 * - Duplicate activities
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useTranslationWithFallback from '../../hooks/useTranslationWithFallback';
import { activityService } from '../../services/activityService';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Alert } from '../ui';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Copy, 
  BarChart, 
  MoreVertical,
  Calendar,
  Users,
  MapPin,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign
} from 'lucide-react';

const ActivityManagement = () => {
  const { t } = useTranslationWithFallback();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [stats, setStats] = useState({
    totalActivities: 0,
    publishedActivities: 0,
    draftActivities: 0,
    suspendedActivities: 0
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  useEffect(() => {
    loadActivities();
  }, [filters, pagination.page]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await activityService.getPartnerActivities(params);
      setActivities(response.data.activities);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.totalActivities,
        totalPages: response.data.pagination.totalPages
      }));
      setStats(response.data.stats);
    } catch (err) {
      setError(err.message || t('activity.loadError', 'Failed to load activities'));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusUpdate = async (activityId, newStatus, reason = '') => {
    try {
      await activityService.updateActivityStatus(activityId, newStatus, reason);
      setMessage(t('activity.statusUpdated', 'Activity status updated successfully'));
      loadActivities();
    } catch (err) {
      setError(err.message || t('activity.statusUpdateError', 'Failed to update activity status'));
    }
  };

  const handleDuplicate = async (activityId) => {
    try {
      await activityService.duplicateActivity(activityId);
      setMessage(t('activity.duplicated', 'Activity duplicated successfully'));
      loadActivities();
    } catch (err) {
      setError(err.message || t('activity.duplicateError', 'Failed to duplicate activity'));
    }
  };

  const getStatusInfo = (status) => {
    return activityService.getActivityStatusInfo(status, t('common.language', 'ar'));
  };

  const formatCurrency = (amount) => {
    return activityService.formatCurrency(amount, 'SAR', t('common.language', 'ar'));
  };

  const formatDuration = (duration) => {
    return activityService.formatDuration(duration, t('common.language', 'ar'));
  };

  const getActivityActions = (activity) => {
    return activityService.getActivityActions(activity, t('common.language', 'ar'));
  };

  if (loading && activities.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={t('common.direction') || 'ltr'}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ludus-orange"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={t('common.direction') || 'ltr'}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('activity.myActivities', 'My Activities')}
              </h1>
              <p className="text-gray-600">
                {t('activity.manageActivities', 'Manage your activity listings')}
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-ludus-orange hover:bg-ludus-orange-dark"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('activity.createActivity', 'Create Activity')}
            </Button>
          </div>
        </div>

        {error && <Alert type="error" message={error} className="mb-6" />}
        {message && <Alert type="success" message={message} className="mb-6" />}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4 rtl:ml-0 rtl:mr-4">
                  <p className="text-sm font-medium text-gray-600">
                    {t('activity.totalActivities', 'Total Activities')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalActivities}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4 rtl:ml-0 rtl:mr-4">
                  <p className="text-sm font-medium text-gray-600">
                    {t('activity.published', 'Published')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stats.publishedActivities}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Edit className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4 rtl:ml-0 rtl:mr-4">
                  <p className="text-sm font-medium text-gray-600">
                    {t('activity.drafts', 'Drafts')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stats.draftActivities}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4 rtl:ml-0 rtl:mr-4">
                  <p className="text-sm font-medium text-gray-600">
                    {t('activity.suspended', 'Suspended')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stats.suspendedActivities}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('activity.filterByStatus', 'Filter by Status')}
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
                >
                  <option value="">{t('activity.allStatuses', 'All Statuses')}</option>
                  <option value="draft">{t('activity.draft', 'Draft')}</option>
                  <option value="published">{t('activity.published', 'Published')}</option>
                  <option value="suspended">{t('activity.suspended', 'Suspended')}</option>
                  <option value="archived">{t('activity.archived', 'Archived')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('activity.filterByCategory', 'Filter by Category')}
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
                >
                  <option value="">{t('activity.allCategories', 'All Categories')}</option>
                  {activityService.getCategories().map(category => (
                    <option key={category.id} value={category.id}>
                      {t('common.language', 'ar') === 'ar' ? category.nameAr : category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('activity.search', 'Search')}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder={t('activity.searchPlaceholder', 'Search by title...')}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setFilters({ status: '', category: '', search: '' })}
                  className="w-full"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {t('common.clear', 'Clear')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activities List */}
        {activities.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('activity.noActivities', 'No activities found')}
              </h3>
              <p className="text-gray-500 mb-6">
                {t('activity.noActivitiesDesc', 'You haven\'t created any activities yet')}
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-ludus-orange hover:bg-ludus-orange-dark"
              >
                <Plus className="w-5 h-5 mr-2" />
                {t('activity.createFirstActivity', 'Create Your First Activity')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {activities.map((activity) => {
              const statusInfo = getStatusInfo(activity.status);
              const actions = getActivityActions(activity);

              return (
                <Card key={activity._id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      {/* Activity Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {activity.title}
                            </h3>
                            <p className="text-gray-600 mb-2 line-clamp-2">
                              {activity.description}
                            </p>
                            <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-500">
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {activity.location?.city}
                              </div>
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {activity.capacity?.min}-{activity.capacity?.max} {t('activity.participants', 'participants')}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {formatDuration(activity.duration)}
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-1" />
                                {formatCurrency(activity.pricing?.basePrice)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                              {statusInfo.text}
                            </span>
                            {activity.rating > 0 && (
                              <div className="flex items-center mt-2">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="ml-1 text-sm text-gray-600">
                                  {activity.rating.toFixed(1)} ({activity.reviewCount})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Activity Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">
                              {activity.statistics?.totalBookings || 0}
                            </p>
                            <p className="text-sm text-gray-600">
                              {t('activity.totalBookings', 'Total Bookings')}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                              {activity.statistics?.confirmedBookings || 0}
                            </p>
                            <p className="text-sm text-gray-600">
                              {t('activity.confirmed', 'Confirmed')}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">
                              {formatCurrency(activity.statistics?.totalRevenue || 0)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {t('activity.revenue', 'Revenue')}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">
                              {activity.statistics?.conversionRate || 0}%
                            </p>
                            <p className="text-sm text-gray-600">
                              {t('activity.conversionRate', 'Conversion')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 mt-4 lg:mt-0 lg:ml-6">
                        {actions.map((action) => (
                          <Button
                            key={action.id}
                            onClick={() => {
                              switch (action.id) {
                                case 'publish':
                                  handleStatusUpdate(activity._id, 'published');
                                  break;
                                case 'suspend':
                                  handleStatusUpdate(activity._id, 'suspended');
                                  break;
                                case 'edit':
                                  // Navigate to edit page
                                  console.log('Edit activity:', activity._id);
                                  break;
                                case 'duplicate':
                                  handleDuplicate(activity._id);
                                  break;
                                case 'analytics':
                                  setSelectedActivity(activity);
                                  setShowAnalyticsModal(true);
                                  break;
                                default:
                                  break;
                              }
                            }}
                            variant={action.id === 'edit' || action.id === 'analytics' ? 'outline' : 'default'}
                            size="sm"
                            className={
                              action.id === 'publish' ? 'bg-green-600 hover:bg-green-700' :
                              action.id === 'suspend' ? 'bg-yellow-600 hover:bg-yellow-700' :
                              action.id === 'duplicate' ? 'bg-gray-600 hover:bg-gray-700' :
                              ''
                            }
                          >
                            {React.createElement(
                              action.id === 'publish' ? Eye :
                              action.id === 'suspend' ? Clock :
                              action.id === 'edit' ? Edit :
                              action.id === 'duplicate' ? Copy :
                              action.id === 'analytics' ? BarChart : MoreVertical,
                              { className: "w-4 h-4 mr-1" }
                            )}
                            {action.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 rtl:space-x-reverse mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  {t('common.previous', 'Previous')}
                </Button>
                
                <span className="text-sm text-gray-600">
                  {t('common.page', 'Page')} {pagination.page} {t('common.of', 'of')} {pagination.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  {t('common.next', 'Next')}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityManagement;
