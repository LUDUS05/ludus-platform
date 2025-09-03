import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { adminService } from '../../services/adminService';
import { Card } from '../ui/Card';
import Alert from '../ui/Alert';
import NotificationCenter from './NotificationCenter';
import { Shield, Users, Building, FileText, BarChart3 } from 'lucide-react';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is authenticated and has admin role
    if (!isAuthenticated) {
      setError('Please log in to access admin dashboard');
      setLoading(false);
      return;
    }

    if (!user || user.role !== 'admin') {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }

    fetchDashboardStats();
    loadDashboardOverview();
  }, [user, isAuthenticated]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug: Log the request details
      console.log('Fetching dashboard stats...', {
        user: user?.id || user?._id,
        role: user?.role,
        isAuthenticated,
        apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5001/api'
      });
      
      const response = await api.get('/admin/dashboard/stats');
      console.log('Dashboard stats response:', response.data);
      setStats(response.data.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load dashboard statistics';
      setError(errorMessage);
      console.error('Failed to fetch dashboard stats:', JSON.stringify({
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        user: user?.id || user?._id,
        role: user?.role
      }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardOverview = async () => {
    try {
      // Debug: Log the request details
      console.log('Loading dashboard overview...', {
        user: user?.id || user?._id,
        role: user?.role,
        isAuthenticated
      });
      
      const response = await adminService.getDashboardOverview();
      console.log('Dashboard overview response:', response.data);
      setDashboardData(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load dashboard overview';
      console.error('Failed to load dashboard overview:', errorMessage);
      console.error('Full error object:', error);
      console.error('Error details:', JSON.stringify({
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        user: user?.id || user?._id,
        role: user?.role
      }, null, 2));
      setError(errorMessage);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.overview?.totalUsers || 0,
      icon: '👥',
      color: 'ludus-orange',
      link: '/admin/users'
    },
    {
      title: 'Total Vendors',
      value: stats?.overview?.totalVendors || 0,
      icon: '🏢',
      color: 'success',
      link: '/admin/vendors'
    },
    {
      title: 'Total Activities',
      value: stats?.overview?.totalActivities || 0,
      icon: '🎯',
      color: 'info',
      link: '/admin/activities'
    },
    {
      title: 'Total Bookings',
      value: stats?.overview?.totalBookings || 0,
      icon: '📅',
      color: 'warning',
      link: '/admin/bookings'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.overview?.totalRevenue || 0),
      icon: '💰',
      color: 'indigo',
      link: '/admin/payments'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      'ludus-orange': 'bg-ludus-orange/10 text-ludus-orange',
      'success': 'bg-success/10 text-success',
      'info': 'bg-info/10 text-info',
      'warning': 'bg-warning/10 text-warning'
    };
    return colors[color] || colors['ludus-orange'];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ludus-orange"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="error">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Dashboard Error</h3>
              <p className="text-red-700 mb-2">{error}</p>
              {user && (
                <div className="text-sm text-gray-600 mb-2">
                  <strong>User Role:</strong> {user.role || 'Unknown'}
                  <br />
                  <strong>User ID:</strong> {user.id || user._id || 'Unknown'}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchDashboardStats}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </Alert>
        
        {/* Debug Information */}
        <Card className="p-4 bg-gray-50">
          <h4 className="font-semibold text-gray-700 mb-2">Debug Information</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div><strong>Authentication Status:</strong> {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}</div>
            <div><strong>User Object:</strong> {user ? '✅ Present' : '❌ Missing'}</div>
            <div><strong>User Role:</strong> {user?.role || 'None'}</div>
            <div><strong>API Base URL:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}</div>
            <div><strong>Environment:</strong> {process.env.NODE_ENV}</div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message & Live Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-gradient-to-r from-ludus-orange to-ludus-orange-dark rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <h2 className="text-display-md font-bold">Welcome back, {user?.firstName}!</h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                  <Shield className="w-4 h-4 mr-2" />
                  {dashboardData?.userRole || 'Admin'}
                </span>
              </div>
              <p className="text-body-md text-white/90">
                {dashboardData?.userRole === 'SA' && 'Full platform administration and team management.'}
                {dashboardData?.userRole === 'PLATFORM_MANAGER' && 'Manage platform content and announcements.'}
                {dashboardData?.userRole === 'MODERATOR' && 'Ensure community health and review content.'}
                {dashboardData?.userRole === 'ADMIN_PARTNERSHIPS' && 'Oversee all partnership operations.'}
                {dashboardData?.userRole === 'PSM' && 'Manage assigned partner relationships.'}
                {dashboardData?.userRole === 'PSA' && 'Support partner success operations.'}
                {!dashboardData?.userRole && 'Manage vendors, activities, and bookings for the Saudi activity platform.'}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-body-sm text-white/90">Live Updates</span>
              </div>
              <p className="text-body-xs text-white/75">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <Card className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-body-lg font-bold text-charcoal mb-1">
              +24%
            </h3>
            <p className="text-body-sm text-charcoal-light mb-2">
              Growth this month
            </p>
            <div className="w-full bg-warm rounded-full h-2">
              <div className="bg-success h-2 rounded-full" style={{ width: '74%' }}></div>
            </div>
          </div>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className={`p-6 rounded-lg border-2 transition-all hover:shadow-lg hover:scale-105 ${getColorClasses(card.color)}`}
          >
            <div className="flex items-center">
              <div className="text-3xl mr-4">{card.icon}</div>
              <div>
                <p className="text-sm font-medium opacity-75">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
              <Link
                to="/admin/bookings"
                className="text-sm text-ludus-orange hover:text-ludus-orange-dark"
              >
                View all →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {stats?.recentBookings?.length > 0 ? (
              <div className="space-y-4">
                {stats.recentBookings.slice(0, 5).map((booking) => (
                  <div key={booking._id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {booking.activity?.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.user?.firstName} {booking.user?.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(booking.pricing?.totalPrice || 0)}
                      </p>
                      <p className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent bookings</p>
            )}
          </div>
        </div>

        {/* Quick Actions - Role Based */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {/* Super Admin Actions */}
              {dashboardData?.userRole === 'SA' && (
                <Link
                  to="/admin/team"
                  className="flex items-center p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Shield className="w-5 h-5 mr-3 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Team Management</p>
                    <p className="text-xs text-gray-500">Manage admin roles and permissions</p>
                  </div>
                </Link>
              )}
              
              {/* Platform Manager Actions */}
              {['SA', 'PLATFORM_MANAGER'].includes(dashboardData?.userRole) && (
                <Link
                  to="/admin/content"
                  className="flex items-center p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <FileText className="w-5 h-5 mr-3 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Content Management</p>
                    <p className="text-xs text-gray-500">Manage platform content and pages</p>
                  </div>
                </Link>
              )}

              {/* Moderator Actions */}
              {['SA', 'MODERATOR'].includes(dashboardData?.userRole) && (
                <Link
                  to="/admin/moderation"
                  className="flex items-center p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Users className="w-5 h-5 mr-3 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">User Moderation</p>
                    <p className="text-xs text-gray-500">Review flagged content and users</p>
                  </div>
                </Link>
              )}

              {/* Partnership Management Actions */}
              {['SA', 'ADMIN_PARTNERSHIPS', 'PSM', 'PSA'].includes(dashboardData?.userRole) && (
                <>
                  <Link
                    to="/admin/vendors/new"
                    className="flex items-center p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <Building className="w-5 h-5 mr-3 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Add New Partner</p>
                      <p className="text-xs text-gray-500">Register a new business partner</p>
                    </div>
                  </Link>
                  <Link
                    to="/admin/activities/new"
                    className="flex items-center p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-xl mr-3">🎯</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Create Activity</p>
                      <p className="text-xs text-gray-500">Add a new activity offering</p>
                    </div>
                  </Link>
                </>
              )}

              {/* Analytics Access */}
              {adminService.canAccessResource(dashboardData?.userRole, 'analytics') && (
                <Link
                  to="/admin/analytics"
                  className="flex items-center p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <BarChart3 className="w-5 h-5 mr-3 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Analytics</p>
                    <p className="text-xs text-gray-500">View platform performance metrics</p>
                  </div>
                </Link>
              )}

              {/* Bookings - Available to most roles */}
              {['SA', 'ADMIN_PARTNERSHIPS', 'PSM', 'PSA'].includes(dashboardData?.userRole) && (
                <Link
                  to="/admin/bookings"
                  className="flex items-center p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xl mr-3">📅</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Manage Bookings</p>
                    <p className="text-xs text-gray-500">Review and update booking status</p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings by Status */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Bookings by Status</h3>
          </div>
          <div className="p-6">
            {stats?.stats?.bookingsByStatus?.length > 0 ? (
              <div className="space-y-3">
                {stats.stats.bookingsByStatus.map((item) => (
                  <div key={item._id} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {item._id}
                    </span>
                    <span className="text-sm text-gray-900 font-semibold">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No booking data available</p>
            )}
          </div>
        </div>

        {/* Activities by Category */}
        <Card>
          <div className="px-6 py-4 border-b border-warm">
            <h3 className="text-body-lg font-semibold text-charcoal">Activities by Category</h3>
          </div>
          <div className="p-6">
            {stats?.stats?.activitiesByCategory?.length > 0 ? (
              <div className="space-y-4">
                {stats.stats.activitiesByCategory.map((item) => {
                  const getCategoryIcon = (category) => {
                    const icons = {
                      fitness: '💪',
                      arts: '🎨',
                      food: '🍽️',
                      outdoor: '🏞️',
                      unique: '✨',
                      wellness: '🧘'
                    };
                    return icons[category] || '🎯';
                  };
                  
                  const total = stats.stats.activitiesByCategory.reduce((sum, i) => sum + i.count, 0);
                  const percentage = ((item.count / total) * 100).toFixed(1);
                  
                  return (
                    <div key={item._id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-ludus-orange/10 rounded-lg flex items-center justify-center">
                          <span className="text-sm">{getCategoryIcon(item._id)}</span>
                        </div>
                        <span className="text-body-sm font-medium text-charcoal capitalize">
                          {item._id}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-body-xs text-charcoal-light">
                          {percentage}%
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-ludus-orange/10 text-ludus-orange">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-charcoal-light text-center py-8">No activity data available</p>
            )}
          </div>
        </Card>
      </div>

      {/* Revenue Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Trend */}
        <Card className="lg:col-span-2">
          <div className="px-6 py-4 border-b border-warm">
            <h3 className="text-body-lg font-semibold text-charcoal">Monthly Revenue Trend</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* Mock revenue data - replace with real data */}
              {[
                { month: 'Jan', revenue: 15000, growth: '+12%' },
                { month: 'Feb', revenue: 18000, growth: '+20%' },
                { month: 'Mar', revenue: 22000, growth: '+22%' },
                { month: 'Apr', revenue: 19000, growth: '+8%' },
                { month: 'May', revenue: 25000, growth: '+32%' },
                { month: 'Jun', revenue: 28000, growth: '+12%' }
              ].map((item, index) => {
                const maxRevenue = 28000;
                const widthPercentage = (item.revenue / maxRevenue) * 100;
                const isPositive = item.growth.startsWith('+');
                
                return (
                  <div key={item.month} className="flex items-center space-x-4">
                    <div className="w-12 text-body-sm font-medium text-charcoal">
                      {item.month}
                    </div>
                    <div className="flex-1">
                      <div className="relative h-8 bg-warm rounded-lg overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-ludus-orange to-ludus-orange-dark rounded-lg transition-all duration-500"
                          style={{ width: `${widthPercentage}%` }}
                        />
                        <div className="absolute inset-0 flex items-center px-3">
                          <span className="text-body-xs font-semibold text-white">
                            {formatCurrency(item.revenue)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`text-body-xs font-semibold px-2 py-1 rounded-full ${
                      isPositive 
                        ? 'bg-success/10 text-success' 
                        : 'bg-error/10 text-error'
                    }`}>
                      {item.growth}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Top Performing Activities */}
        <Card>
          <div className="px-6 py-4 border-b border-warm">
            <h3 className="text-body-lg font-semibold text-charcoal">Top Activities</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* Mock top activities - replace with real data */}
              {[
                { name: 'Rock Climbing Adventure', bookings: 45, revenue: 6750 },
                { name: 'Cooking Workshop', bookings: 38, revenue: 5700 },
                { name: 'Desert Safari', bookings: 32, revenue: 8000 },
                { name: 'Art Class', bookings: 28, revenue: 2800 },
                { name: 'Yoga Session', bookings: 25, revenue: 2500 }
              ].map((activity, index) => (
                <div key={activity.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      index === 0 ? 'bg-warning' : 
                      index === 1 ? 'bg-ludus-orange' : 
                      'bg-charcoal-light'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-body-sm font-medium text-charcoal line-clamp-1">
                        {activity.name}
                      </p>
                      <p className="text-body-xs text-charcoal-light">
                        {activity.bookings} bookings
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-body-sm font-semibold text-ludus-orange">
                      {formatCurrency(activity.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <NotificationCenter />
      </div>

      {/* Admin Permissions Summary */}
      {dashboardData?.permissions && (
        <Card>
          <div className="px-6 py-4 border-b border-warm">
            <h3 className="text-body-lg font-semibold text-charcoal">Your Permissions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.permissions.map((permission, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-shrink-0 w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-body-sm text-charcoal capitalize">
                    {permission.actions.includes('manage') ? 'Manage' : permission.actions.join(', ')} {permission.resource}
                  </span>
                </div>
              ))}
            </div>
            {dashboardData.userRole === 'PSM' || dashboardData.userRole === 'PSA' ? (
              <div className="mt-4 p-4 bg-info/10 rounded-lg">
                <p className="text-body-sm text-info">
                  <strong>Assigned Partners:</strong> You have access to {dashboardData.assignedPartners || 0} partner accounts.
                </p>
              </div>
            ) : null}
          </div>
        </Card>
      )}

      {/* System Status */}
      <Card>
        <div className="px-6 py-4 border-b border-warm">
          <h3 className="text-body-lg font-semibold text-charcoal">System Health</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'API Status', status: 'Operational', color: 'success' },
              { label: 'Database', status: 'Healthy', color: 'success' },
              { label: 'Payment Gateway', status: 'Connected', color: 'success' },
              { label: 'Storage', status: '95% Available', color: 'warning' }
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                  item.color === 'success' ? 'bg-success/10' :
                  item.color === 'warning' ? 'bg-warning/10' :
                  'bg-error/10'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${
                    item.color === 'success' ? 'bg-success' :
                    item.color === 'warning' ? 'bg-warning' :
                    'bg-error'
                  }`} />
                </div>
                <p className="text-body-sm font-medium text-charcoal">
                  {item.label}
                </p>
                <p className={`text-body-xs font-semibold ${
                  item.color === 'success' ? 'text-success' :
                  item.color === 'warning' ? 'text-warning' :
                  'text-error'
                }`}>
                  {item.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;