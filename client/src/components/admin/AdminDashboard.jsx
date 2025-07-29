import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
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
      'ludus-orange': 'bg-ludus-orange/10 text-ludus-orange dark:bg-dark-ludus-orange/10 dark:text-dark-ludus-orange',
      'success': 'bg-success/10 text-success dark:bg-dark-success/10 dark:text-dark-success',
      'info': 'bg-info/10 text-info dark:bg-dark-info/10 dark:text-dark-info',
      'warning': 'bg-warning/10 text-warning dark:bg-dark-warning/10 dark:text-dark-warning'
    };
    return colors[color] || colors['ludus-orange'];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error">
        <div className="flex flex-col gap-2">
          <p>{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-ludus-orange to-ludus-orange-dark dark:from-dark-ludus-orange dark:to-dark-ludus-orange-dark rounded-xl p-6 text-white">
        <h2 className="text-display-md font-bold mb-2">Welcome to LUDUS Admin</h2>
        <p className="text-body-md text-white/90">
          Manage vendors, activities, and bookings for the Saudi activity platform.
        </p>
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
              <Link
                to="/admin/bookings"
                className="text-sm text-blue-600 hover:text-blue-500"
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

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <Link
                to="/admin/vendors/new"
                className="flex items-center p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <span className="text-xl mr-3">🏢</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">Add New Vendor</p>
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
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Activities by Category</h3>
          </div>
          <div className="p-6">
            {stats?.stats?.activitiesByCategory?.length > 0 ? (
              <div className="space-y-3">
                {stats.stats.activitiesByCategory.map((item) => (
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
              <p className="text-gray-500 text-center py-8">No activity data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;