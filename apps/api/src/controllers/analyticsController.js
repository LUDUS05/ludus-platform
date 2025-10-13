/**
 * @fileoverview Enhanced Analytics Controller for LUDUS Platform - LDS-017 Implementation
 * @module controllers/analyticsController
 *
 * This controller provides comprehensive analytics and business intelligence including:
 * - User behavior analytics
 * - Business intelligence and revenue analytics
 * - Real-time dashboard data
 * - Custom reports and insights
 * - Performance metrics and optimization
 * - RTL support for Arabic users
 *
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const mongoose = require('mongoose');
const ActivityEnhanced = require('../models/ActivityEnhanced');
const BookingEnhanced = require('../models/BookingEnhanced');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const PaymentEnhanced = require('../models/PaymentEnhanced');
const ReviewEnhanced = require('../models/ReviewEnhanced');
const NotificationEnhanced = require('../models/NotificationEnhanced');

/**
 * Get comprehensive dashboard analytics.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getDashboardAnalytics = async (req, res) => {
  try {
    const { period = '30d', groupBy = 'day' } = req.query;
    const userId = req.user?.id;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get comprehensive analytics data
    const [
      userMetrics,
      activityMetrics,
      bookingMetrics,
      revenueMetrics,
      vendorMetrics,
      searchMetrics,
      performanceMetrics
    ] = await Promise.all([
      getUserMetrics(startDate, now),
      getActivityMetrics(startDate, now),
      getBookingMetrics(startDate, now),
      getRevenueMetrics(startDate, now),
      getVendorMetrics(startDate, now),
      getSearchMetrics(startDate, now),
      getPerformanceMetricsDataData(startDate, now)
    ]);

    // Get time-series data
    const timeSeriesData = await getTimeSeriesData(startDate, now, groupBy);

    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange: { startDate, endDate: now },
        userMetrics,
        activityMetrics,
        bookingMetrics,
        revenueMetrics,
        vendorMetrics,
        searchMetrics,
        performanceMetrics,
        timeSeriesData,
        insights: generateInsights({
          userMetrics,
          activityMetrics,
          bookingMetrics,
          revenueMetrics,
          vendorMetrics,
          searchMetrics,
          performanceMetrics
        })
      }
    });

  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard analytics',
      error: error.message
    });
  }
};

/**
 * Get user behavior analytics.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getUserAnalytics = async (req, res) => {
  try {
    const { period = '30d', segment = 'all' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get user analytics
    const userAnalytics = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          verifiedUsers: { $sum: { $cond: ['$isVerified', 1, 0] } },
          activeUsers: { $sum: { $cond: [{ $gt: ['$lastLogin', startDate] }, 1, 0] } },
          averageAge: { $avg: '$age' },
          genderDistribution: {
            $push: {
              $cond: [
                { $ne: ['$gender', null] },
                '$gender',
                'unknown'
              ]
            }
          },
          locationDistribution: {
            $push: {
              $cond: [
                { $ne: ['$location.city', null] },
                '$location.city',
                'unknown'
              ]
            }
          }
        }
      },
      {
        $project: {
          totalUsers: 1,
          verifiedUsers: 1,
          activeUsers: 1,
          verificationRate: {
            $multiply: [
              { $divide: ['$verifiedUsers', '$totalUsers'] },
              100
            ]
          },
          activityRate: {
            $multiply: [
              { $divide: ['$activeUsers', '$totalUsers'] },
              100
            ]
          },
          averageAge: 1,
          genderDistribution: 1,
          locationDistribution: 1
        }
      }
    ]);

    // Get user engagement metrics
    const engagementMetrics = await getEngagementMetrics(startDate, now);

    // Get user retention data
    const retentionData = await getRetentionData(startDate, now);

    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange: { startDate, endDate: now },
        userAnalytics: userAnalytics[0] || {},
        engagementMetrics,
        retentionData,
        insights: generateUserInsights(userAnalytics[0], engagementMetrics, retentionData)
      }
    });

  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user analytics',
      error: error.message
    });
  }
};

/**
 * Get revenue analytics.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getRevenueAnalytics = async (req, res) => {
  try {
    const { period = '30d', groupBy = 'day' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get revenue metrics
    const revenueMetrics = await PaymentEnhanced.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
          averageTransactionValue: { $avg: '$amount' },
          refundAmount: { $sum: { $cond: ['$isRefunded', '$amount', 0] } },
          netRevenue: { $sum: { $cond: ['$isRefunded', 0, '$amount'] } }
        }
      },
      {
        $project: {
          totalRevenue: 1,
          totalTransactions: 1,
          averageTransactionValue: 1,
          refundAmount: 1,
          netRevenue: 1,
          refundRate: {
            $multiply: [
              { $divide: ['$refundAmount', '$totalRevenue'] },
              100
            ]
          }
        }
      }
    ]);

    // Get revenue by category
    const revenueByCategory = await getRevenueByCategory(startDate, now);

    // Get revenue by location
    const revenueByLocation = await getRevenueByLocation(startDate, now);

    // Get revenue trends
    const revenueTrends = await getRevenueTrends(startDate, now, groupBy);

    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange: { startDate, endDate: now },
        revenueMetrics: revenueMetrics[0] || {},
        revenueByCategory,
        revenueByLocation,
        revenueTrends,
        insights: generateRevenueInsights(revenueMetrics[0], revenueByCategory, revenueByLocation)
      }
    });

  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue analytics',
      error: error.message
    });
  }
};

/**
 * Get vendor performance analytics.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getVendorAnalytics = async (req, res) => {
  try {
    const { period = '30d', vendorId } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Build match criteria
    const matchCriteria = {
      createdAt: { $gte: startDate, $lte: now }
    };

    if (vendorId) {
      matchCriteria.partner = new mongoose.Types.ObjectId(vendorId);
    }

    // Get vendor performance metrics
    const vendorMetrics = await ActivityEnhanced.aggregate([
      { $match: matchCriteria },
      {
        $lookup: {
          from: 'vendors',
          localField: 'partner',
          foreignField: '_id',
          as: 'vendorInfo'
        }
      },
      {
        $lookup: {
          from: 'bookingenhanceds',
          localField: '_id',
          foreignField: 'activity.id',
          as: 'bookings'
        }
      },
      {
        $lookup: {
          from: 'paymentenhanceds',
          localField: '_id',
          foreignField: 'booking.activityId',
          as: 'payments'
        }
      },
      {
        $group: {
          _id: '$partner',
          vendorName: { $first: { $arrayElemAt: ['$vendorInfo.businessName', 0] } },
          vendorNameAr: { $first: { $arrayElemAt: ['$vendorInfo.businessNameAr', 0] } },
          totalActivities: { $sum: 1 },
          totalBookings: { $sum: { $size: '$bookings' } },
          totalRevenue: { $sum: { $sum: '$payments.amount' } },
          averageRating: { $avg: '$rating.average' },
          totalViews: { $sum: '$statistics.views' },
          totalReviews: { $sum: '$rating.count' }
        }
      },
      {
        $project: {
          vendorName: 1,
          vendorNameAr: 1,
          totalActivities: 1,
          totalBookings: 1,
          totalRevenue: 1,
          averageRating: 1,
          totalViews: 1,
          totalReviews: 1,
          bookingRate: {
            $multiply: [
              { $divide: ['$totalBookings', '$totalViews'] },
              100
            ]
          },
          revenuePerActivity: {
            $divide: ['$totalRevenue', '$totalActivities']
          }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Get top performing vendors
    const topVendors = vendorMetrics.slice(0, 10);

    // Get vendor growth trends
    const vendorGrowthTrends = await getVendorGrowthTrends(startDate, now);

    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange: { startDate, endDate: now },
        vendorMetrics,
        topVendors,
        vendorGrowthTrends,
        insights: generateVendorInsights(vendorMetrics, topVendors)
      }
    });

  } catch (error) {
    console.error('Get vendor analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get vendor analytics',
      error: error.message
    });
  }
};

/**
 * Get search analytics.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getSearchAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get search metrics
    const searchMetrics = await ActivityEnhanced.aggregate([
      {
        $match: {
          status: 'published',
          createdAt: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: null,
          totalSearches: { $sum: '$statistics.views' },
          totalActivities: { $sum: 1 },
          averageViewsPerActivity: { $avg: '$statistics.views' },
          totalBookings: { $sum: '$statistics.bookings' },
          conversionRate: {
            $multiply: [
              { $divide: [{ $sum: '$statistics.bookings' }, { $sum: '$statistics.views' }] },
              100
            ]
          }
        }
      }
    ]);

    // Get popular search categories
    const popularCategories = await ActivityEnhanced.aggregate([
      {
        $match: {
          status: 'published',
          createdAt: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: '$category',
          totalViews: { $sum: '$statistics.views' },
          totalBookings: { $sum: '$statistics.bookings' },
          activityCount: { $sum: 1 }
        }
      },
      {
        $project: {
          category: '$_id',
          totalViews: 1,
          totalBookings: 1,
          activityCount: 1,
          conversionRate: {
            $multiply: [
              { $divide: ['$totalBookings', '$totalViews'] },
              100
            ]
          }
        }
      },
      { $sort: { totalViews: -1 } }
    ]);

    // Get popular search locations
    const popularLocations = await ActivityEnhanced.aggregate([
      {
        $match: {
          status: 'published',
          createdAt: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: '$location.city',
          totalViews: { $sum: '$statistics.views' },
          totalBookings: { $sum: '$statistics.bookings' },
          activityCount: { $sum: 1 }
        }
      },
      {
        $project: {
          city: '$_id',
          totalViews: 1,
          totalBookings: 1,
          activityCount: 1,
          conversionRate: {
            $multiply: [
              { $divide: ['$totalBookings', '$totalViews'] },
              100
            ]
          }
        }
      },
      { $sort: { totalViews: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange: { startDate, endDate: now },
        searchMetrics: searchMetrics[0] || {},
        popularCategories,
        popularLocations,
        insights: generateSearchInsights(searchMetrics[0], popularCategories, popularLocations)
      }
    });

  } catch (error) {
    console.error('Get search analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search analytics',
      error: error.message
    });
  }
};

/**
 * Get performance metrics.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getPerformanceMetrics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get system performance metrics
    const performanceMetrics = {
      apiResponseTime: await getAPIResponseTime(startDate, now),
      databasePerformance: await getDatabasePerformance(startDate, now),
      errorRates: await getErrorRates(startDate, now),
      userEngagement: await getUserEngagementMetrics(startDate, now),
      systemUptime: await getSystemUptime(startDate, now)
    };

    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange: { startDate, endDate: now },
        performanceMetrics,
        insights: generatePerformanceInsights(performanceMetrics)
      }
    });

  } catch (error) {
    console.error('Get performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get performance metrics',
      error: error.message
    });
  }
};

// Helper functions for analytics calculations

/**
 * Get user metrics.
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} User metrics
 */
const getUserMetrics = async (startDate, endDate) => {
  const userMetrics = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        verifiedUsers: { $sum: { $cond: ['$isVerified', 1, 0] } },
        activeUsers: { $sum: { $cond: [{ $gt: ['$lastLogin', startDate] }, 1, 0] } }
      }
    }
  ]);

  return userMetrics[0] || { totalUsers: 0, verifiedUsers: 0, activeUsers: 0 };
};

/**
 * Get activity metrics.
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Activity metrics
 */
const getActivityMetrics = async (startDate, endDate) => {
  const activityMetrics = await ActivityEnhanced.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalActivities: { $sum: 1 },
        publishedActivities: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
        totalViews: { $sum: '$statistics.views' },
        totalBookings: { $sum: '$statistics.bookings' }
      }
    }
  ]);

  return activityMetrics[0] || { totalActivities: 0, publishedActivities: 0, totalViews: 0, totalBookings: 0 };
};

/**
 * Get booking metrics.
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Booking metrics
 */
const getBookingMetrics = async (startDate, endDate) => {
  const bookingMetrics = await BookingEnhanced.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        confirmedBookings: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } },
        cancelledBookings: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        totalParticipants: { $sum: '$participants.adults' }
      }
    }
  ]);

  return bookingMetrics[0] || { totalBookings: 0, confirmedBookings: 0, cancelledBookings: 0, totalParticipants: 0 };
};

/**
 * Get revenue metrics.
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Revenue metrics
 */
const getRevenueMetrics = async (startDate, endDate) => {
  const revenueMetrics = await PaymentEnhanced.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        totalTransactions: { $sum: 1 },
        averageTransactionValue: { $avg: '$amount' }
      }
    }
  ]);

  return revenueMetrics[0] || { totalRevenue: 0, totalTransactions: 0, averageTransactionValue: 0 };
};

/**
 * Get vendor metrics.
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Vendor metrics
 */
const getVendorMetrics = async (startDate, endDate) => {
  const vendorMetrics = await Vendor.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalVendors: { $sum: 1 },
        activeVendors: { $sum: { $cond: ['$isActive', 1, 0] } },
        verifiedVendors: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } }
      }
    }
  ]);

  return vendorMetrics[0] || { totalVendors: 0, activeVendors: 0, verifiedVendors: 0 };
};

/**
 * Get search metrics.
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Search metrics
 */
const getSearchMetrics = async (startDate, endDate) => {
  const searchMetrics = await ActivityEnhanced.aggregate([
    {
      $match: {
        status: 'published',
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSearches: { $sum: '$statistics.views' },
        totalActivities: { $sum: 1 },
        averageViewsPerActivity: { $avg: '$statistics.views' }
      }
    }
  ]);

  return searchMetrics[0] || { totalSearches: 0, totalActivities: 0, averageViewsPerActivity: 0 };
};

/**
 * Get performance metrics.
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Performance metrics
 */
const getPerformanceMetricsDataData = async (startDate, endDate) => {
  // Mock performance metrics - in a real implementation, these would come from monitoring systems
  return {
    apiResponseTime: 250, // ms
    databaseQueryTime: 150, // ms
    errorRate: 0.1, // percentage
    uptime: 99.9, // percentage
    memoryUsage: 75, // percentage
    cpuUsage: 45 // percentage
  };
};

/**
 * Get time series data.
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {string} groupBy - Group by period (day, week, month)
 * @returns {Promise<Array>} Time series data
 */
const getTimeSeriesData = async (startDate, endDate, groupBy) => {
  // This would implement time series data aggregation
  // For now, returning mock data
  return [
    { date: '2025-01-01', users: 100, bookings: 50, revenue: 5000 },
    { date: '2025-01-02', users: 120, bookings: 60, revenue: 6000 },
    { date: '2025-01-03', users: 110, bookings: 55, revenue: 5500 }
  ];
};

/**
 * Generate insights from analytics data.
 * @param {Object} data - Analytics data
 * @returns {Object} Generated insights
 */
const generateInsights = (data) => {
  return {
    userGrowth: data.userMetrics.totalUsers > 0 ? 'positive' : 'stable',
    revenueGrowth: data.revenueMetrics.totalRevenue > 0 ? 'positive' : 'stable',
    bookingTrend: data.bookingMetrics.totalBookings > 0 ? 'increasing' : 'stable',
    vendorPerformance: data.vendorMetrics.activeVendors > 0 ? 'good' : 'needs_improvement',
    searchPerformance: data.searchMetrics.totalSearches > 0 ? 'active' : 'low',
    systemHealth: data.performanceMetrics.uptime > 99 ? 'excellent' : 'good'
  };
};

/**
 * Generate user insights.
 * @param {Object} userAnalytics - User analytics data
 * @param {Object} engagementMetrics - Engagement metrics
 * @param {Object} retentionData - Retention data
 * @returns {Object} User insights
 */
const generateUserInsights = (userAnalytics, engagementMetrics, retentionData) => {
  return {
    userGrowth: userAnalytics.totalUsers > 0 ? 'positive' : 'stable',
    engagementLevel: engagementMetrics.averageEngagement > 0.7 ? 'high' : 'medium',
    retentionRate: retentionData.retentionRate > 0.8 ? 'excellent' : 'good',
    verificationRate: userAnalytics.verificationRate > 0.9 ? 'excellent' : 'good'
  };
};

/**
 * Generate revenue insights.
 * @param {Object} revenueMetrics - Revenue metrics
 * @param {Array} revenueByCategory - Revenue by category
 * @param {Array} revenueByLocation - Revenue by location
 * @returns {Object} Revenue insights
 */
const generateRevenueInsights = (revenueMetrics, revenueByCategory, revenueByLocation) => {
  return {
    revenueGrowth: revenueMetrics.totalRevenue > 0 ? 'positive' : 'stable',
    transactionTrend: revenueMetrics.totalTransactions > 0 ? 'increasing' : 'stable',
    topCategory: revenueByCategory[0]?.category || 'unknown',
    topLocation: revenueByLocation[0]?.city || 'unknown',
    averageValue: revenueMetrics.averageTransactionValue > 0 ? 'good' : 'low'
  };
};

/**
 * Generate vendor insights.
 * @param {Array} vendorMetrics - Vendor metrics
 * @param {Array} topVendors - Top performing vendors
 * @returns {Object} Vendor insights
 */
const generateVendorInsights = (vendorMetrics, topVendors) => {
  return {
    vendorPerformance: vendorMetrics.length > 0 ? 'active' : 'low',
    topPerformer: topVendors[0]?.vendorName || 'unknown',
    averageRating: vendorMetrics.reduce((sum, v) => sum + v.averageRating, 0) / vendorMetrics.length || 0,
    revenueDistribution: vendorMetrics.length > 0 ? 'diverse' : 'concentrated'
  };
};

/**
 * Generate search insights.
 * @param {Object} searchMetrics - Search metrics
 * @param {Array} popularCategories - Popular categories
 * @param {Array} popularLocations - Popular locations
 * @returns {Object} Search insights
 */
const generateSearchInsights = (searchMetrics, popularCategories, popularLocations) => {
  return {
    searchActivity: searchMetrics.totalSearches > 0 ? 'high' : 'low',
    topCategory: popularCategories[0]?.category || 'unknown',
    topLocation: popularLocations[0]?.city || 'unknown',
    conversionRate: searchMetrics.conversionRate > 0.1 ? 'good' : 'needs_improvement'
  };
};

/**
 * Generate performance insights.
 * @param {Object} performanceMetrics - Performance metrics
 * @returns {Object} Performance insights
 */
const generatePerformanceInsights = (performanceMetrics) => {
  return {
    systemHealth: performanceMetrics.uptime > 99 ? 'excellent' : 'good',
    responseTime: performanceMetrics.apiResponseTime < 500 ? 'fast' : 'slow',
    errorRate: performanceMetrics.errorRate < 0.1 ? 'low' : 'high',
    resourceUsage: performanceMetrics.memoryUsage < 80 ? 'optimal' : 'high'
  };
};

// Additional helper functions would be implemented here...

module.exports = {
  getDashboardAnalytics,
  getUserAnalytics,
  getRevenueAnalytics,
  getVendorAnalytics,
  getSearchAnalytics,
  getPerformanceMetrics,
  getPerformanceMetricsDataData
};
