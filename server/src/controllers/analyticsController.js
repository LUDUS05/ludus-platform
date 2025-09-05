/**
 * @fileoverview Controller for handling advanced analytics, particularly for the referral system.
 * @module controllers/analyticsController
 */

const Referral = require('../models/Referral');
const ReferralCode = require('../models/ReferralCode');
const ReferralConversion = require('../models/ReferralConversion');
const Invitation = require('../models/Invitation');
const User = require('../models/User');
const Wallet = require('../models/Wallet');

/**
 * Get comprehensive referral analytics.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getReferralAnalytics = async (req, res) => {
  try {
    const { period = '30d', referrerId, groupBy = 'day' } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    const query = referrerId ? { referrerId } : {};
    query.createdAt = { $gte: startDate, $lte: endDate };

    // Get time series data
    const timeSeriesData = await getTimeSeriesData(query, groupBy);
    
    // Get funnel analytics
    const funnelAnalytics = await ReferralConversion.getFunnelAnalytics(referrerId, period);
    
    // Get conversion rates
    const conversionRates = await ReferralConversion.getConversionRates(referrerId, period);
    
    // Get geographic analytics
    const geographicAnalytics = await ReferralConversion.getGeographicAnalytics(referrerId, period);
    
    // Get source performance
    const sourcePerformance = await ReferralConversion.getSourcePerformance(referrerId, period);
    
    // Get overall statistics
    const overallStats = await getOverallStats(query);
    
    // Get ROI calculations
    const roiData = await calculateROI(query);

    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange: { startDate, endDate },
        timeSeries: timeSeriesData,
        funnel: funnelAnalytics,
        conversionRates,
        geographic: geographicAnalytics,
        sourcePerformance,
        overall: overallStats,
        roi: roiData
      }
    });
  } catch (error) {
    console.error('Error getting referral analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral analytics',
      error: error.message
    });
  }
};

/**
 * Get referral funnel analysis.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getReferralFunnel = async (req, res) => {
  try {
    const { period = '30d', referrerId, source, platform } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    const query = { createdAt: { $gte: startDate, $lte: endDate } };
    if (referrerId) query.referrerId = referrerId;
    if (source) query['conversionData.source'] = source;
    if (platform) query['conversionData.platform'] = platform;

    // Get funnel stages with counts
    const funnelStages = await ReferralConversion.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$funnelStage',
          count: { $sum: 1 },
          avgTimeToConversion: { $avg: '$performance.timeToConversion' },
          avgEngagementScore: { $avg: '$performance.engagementScore' },
          dropoffRate: { $avg: '$performance.dropoffRate' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Calculate funnel progression
    const funnelProgression = calculateFunnelProgression(funnelStages);
    
    // Get dropoff analysis
    const dropoffAnalysis = await analyzeDropoffs(query);
    
    // Get conversion velocity
    const conversionVelocity = await calculateConversionVelocity(query);

    res.status(200).json({
      success: true,
      data: {
        period,
        funnelStages,
        progression: funnelProgression,
        dropoffAnalysis,
        conversionVelocity
      }
    });
  } catch (error) {
    console.error('Error getting referral funnel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral funnel',
      error: error.message
    });
  }
};

/**
 * Get geographic referral analytics.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getGeographicAnalytics = async (req, res) => {
  try {
    const { period = '30d', referrerId, country, city } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    const query = { createdAt: { $gte: startDate, $lte: endDate } };
    if (referrerId) query.referrerId = referrerId;
    if (country) query['conversionData.location.country'] = country;
    if (city) query['conversionData.location.city'] = city;

    // Get country-level analytics
    const countryAnalytics = await ReferralConversion.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$conversionData.location.country',
          totalConversions: { $sum: 1 },
          avgEngagementScore: { $avg: '$performance.engagementScore' },
          totalRevenueImpact: { $sum: '$businessMetrics.revenueImpact' },
          conversionStages: { $addToSet: '$funnelStage' },
          sources: { $addToSet: '$conversionData.source' },
          platforms: { $addToSet: '$conversionData.platform' }
        }
      },
      {
        $addFields: {
          avgConversionStages: { $size: '$conversionStages' },
          sourceDiversity: { $size: '$sources' },
          platformDiversity: { $size: '$platforms' }
        }
      },
      { $sort: { totalConversions: -1 } }
    ]);

    // Get city-level analytics for top countries
    const cityAnalytics = await ReferralConversion.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            country: '$conversionData.location.country',
            city: '$conversionData.location.city'
          },
          totalConversions: { $sum: 1 },
          avgEngagementScore: { $avg: '$performance.engagementScore' }
        }
      },
      { $sort: { totalConversions: -1 } }
    ]);

    // Get geographic heatmap data
    const heatmapData = await ReferralConversion.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            country: '$conversionData.location.country',
            city: '$conversionData.location.city',
            lat: '$conversionData.location.coordinates.latitude',
            lng: '$conversionData.location.coordinates.longitude'
          },
          weight: { $sum: 1 }
        }
      },
      {
        $match: {
          'lat': { $exists: true, $ne: null },
          'lng': { $exists: true, $ne: null }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        countryAnalytics,
        cityAnalytics,
        heatmapData
      }
    });
  } catch (error) {
    console.error('Error getting geographic analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get geographic analytics',
      error: error.message
    });
  }
};

/**
 * Get referral source performance analytics.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getSourcePerformance = async (req, res) => {
  try {
    const { period = '30d', referrerId, source } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    const query = { createdAt: { $gte: startDate, $lte: endDate } };
    if (referrerId) query.referrerId = referrerId;
    if (source) query['conversionData.source'] = source;

    // Get source performance breakdown
    const sourceBreakdown = await ReferralConversion.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            source: '$conversionData.source',
            platform: '$conversionData.platform',
            device: '$conversionData.device.type'
          },
          totalConversions: { $sum: 1 },
          avgEngagementScore: { $avg: '$performance.engagementScore' },
          avgConversionRate: { $avg: '$performance.conversionRate' },
          totalRevenueImpact: { $sum: '$businessMetrics.revenueImpact' },
          avgTimeToConversion: { $avg: '$performance.timeToConversion' }
        }
      },
      { $sort: { totalConversions: -1 } }
    ]);

    // Get source trends over time
    const sourceTrends = await ReferralConversion.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            source: '$conversionData.source'
          },
          count: { $sum: 1 },
          avgEngagementScore: { $avg: '$performance.engagementScore' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Get source comparison metrics
    const sourceComparison = await ReferralConversion.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$conversionData.source',
          totalConversions: { $sum: 1 },
          avgEngagementScore: { $avg: '$performance.engagementScore' },
          avgConversionRate: { $avg: '$performance.conversionRate' },
          totalRevenueImpact: { $sum: '$businessMetrics.revenueImpact' },
          funnelDepth: { $avg: { $size: '$funnelStages' } }
        }
      },
      { $sort: { totalConversions: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        breakdown: sourceBreakdown,
        trends: sourceTrends,
        comparison: sourceComparison
      }
    });
  } catch (error) {
    console.error('Error getting source performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get source performance',
      error: error.message
    });
  }
};

/**
 * Get ROI and performance metrics for the referral program.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getROIAnalytics = async (req, res) => {
  try {
    const { period = '30d', referrerId } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    const query = { createdAt: { $gte: startDate, $lte: endDate } };
    if (referrerId) query.referrerId = referrerId;

    // Calculate ROI metrics
    const roiMetrics = await calculateROIMetrics(query);
    
    // Get cost analysis
    const costAnalysis = await calculateCostAnalysis(query);
    
    // Get revenue attribution
    const revenueAttribution = await calculateRevenueAttribution(query);
    
    // Get customer acquisition cost
    const customerAcquisitionCost = await calculateCustomerAcquisitionCost(query);

    res.status(200).json({
      success: true,
      data: {
        period,
        roi: roiMetrics,
        cost: costAnalysis,
        revenue: revenueAttribution,
        cac: customerAcquisitionCost
      }
    });
  } catch (error) {
    console.error('Error getting ROI analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ROI analytics',
      error: error.message
    });
  }
};

/**
 * Helper function to get time series data for referral conversions.
 * @param {object} query - The MongoDB query object.
 * @param {string} groupBy - The time unit to group by (day, week, month).
 * @returns {Promise<Array>} A promise that resolves to an array of time series data.
 */
async function getTimeSeriesData(query, groupBy) {
  const dateFormat = groupBy === 'day' ? '%Y-%m-%d' : 
                    groupBy === 'week' ? '%Y-%U' : 
                    groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d';

  return await ReferralConversion.aggregate([
    { $match: query },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: dateFormat, date: '$createdAt' } }
        },
        totalConversions: { $sum: 1 },
        avgEngagementScore: { $avg: '$performance.engagementScore' },
        totalRevenueImpact: { $sum: '$businessMetrics.revenueImpact' }
      }
    },
    { $sort: { '_id.date': 1 } }
  ]);
}

/**
 * Helper function to get overall statistics for referrals.
 * @param {object} query - The MongoDB query object.
 * @returns {Promise<object>} A promise that resolves to an object with overall stats.
 */
async function getOverallStats(query) {
  const [totalReferrals, totalConversions, totalRevenue] = await Promise.all([
    Referral.countDocuments(query),
    ReferralConversion.countDocuments(query),
    ReferralConversion.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$businessMetrics.revenueImpact' } } }
    ])
  ]);

  return {
    totalReferrals,
    totalConversions,
    totalRevenue: totalRevenue[0]?.total || 0,
    conversionRate: totalReferrals > 0 ? (totalConversions / totalReferrals) * 100 : 0
  };
}

/**
 * Helper function to calculate ROI for the referral program.
 * @param {object} query - The MongoDB query object.
 * @returns {Promise<object>} A promise that resolves to an object with ROI data.
 */
async function calculateROI(query) {
  // Calculate total investment (referral rewards paid)
  const totalInvestment = await Wallet.aggregate([
    { $match: query },
    {
      $unwind: '$transactions'
    },
    {
      $match: {
        'transactions.type': 'referral_reward'
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$transactions.amount' }
      }
    }
  ]);

  // Calculate total return (revenue from referred users)
  const totalReturn = await ReferralConversion.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        total: { $sum: '$businessMetrics.revenueImpact' }
      }
    }
  ]);

  const investment = totalInvestment[0]?.total || 0;
  const return_ = totalReturn[0]?.total || 0;
  const roi = investment > 0 ? ((return_ - investment) / investment) * 100 : 0;

  return {
    totalInvestment,
    totalReturn: return_,
    roi,
    netProfit: return_ - investment
  };
}

/**
 * Helper function to calculate the progression through the referral funnel.
 * @param {Array} funnelStages - An array of funnel stages with counts.
 * @returns {Array} An array representing the funnel progression.
 */
function calculateFunnelProgression(funnelStages) {
  const progression = [];
  let previousCount = 0;
  
  funnelStages.forEach(stage => {
    const currentCount = stage.count;
    const conversionRate = previousCount > 0 ? (currentCount / previousCount) * 100 : 100;
    
    progression.push({
      stage: stage._id,
      count: currentCount,
      conversionRate,
      dropoffRate: 100 - conversionRate
    });
    
    previousCount = currentCount;
  });
  
  return progression;
}

/**
 * Helper function to analyze dropoffs at each stage of the referral funnel.
 * @param {object} query - The MongoDB query object.
 * @returns {Promise<Array>} A promise that resolves to an array of dropoff analysis data.
 */
async function analyzeDropoffs(query) {
  return await ReferralConversion.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$funnelStage',
        totalUsers: { $sum: 1 },
        droppedUsers: {
          $sum: {
            $cond: [{ $eq: ['$status', 'abandoned'] }, 1, 0]
          }
        }
      }
    },
    {
      $addFields: {
        dropoffRate: {
          $multiply: [
            { $divide: ['$droppedUsers', '$totalUsers'] },
            100
          ]
        }
      }
    },
    { $sort: { dropoffRate: -1 } }
  ]);
}

/**
 * Helper function to calculate the conversion velocity at each stage of the referral funnel.
 * @param {object} query - The MongoDB query object.
 * @returns {Promise<Array>} A promise that resolves to an array of conversion velocity data.
 */
async function calculateConversionVelocity(query) {
  return await ReferralConversion.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$funnelStage',
        avgTimeToConversion: { $avg: '$performance.timeToConversion' },
        medianTimeToConversion: { $avg: '$performance.timeToConversion' },
        conversionVelocity: { $avg: { $divide: [1, '$performance.timeToConversion'] } }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
}

/**
 * Helper function to calculate ROI metrics.
 * @param {object} query - The MongoDB query object.
 * @returns {Promise<object>} A promise that resolves to an object with ROI metrics.
 * @todo Implement the actual logic for this function.
 */
async function calculateROIMetrics(query) {
  // Implementation for ROI metrics calculation
  return {
    totalROI: 0,
    averageROI: 0,
    roiBySource: [],
    roiByPeriod: []
  };
}

/**
 * Helper function to perform cost analysis.
 * @param {object} query - The MongoDB query object.
 * @returns {Promise<object>} A promise that resolves to an object with cost analysis data.
 * @todo Implement the actual logic for this function.
 */
async function calculateCostAnalysis(query) {
  // Implementation for cost analysis
  return {
    totalCost: 0,
    costPerReferral: 0,
    costBySource: [],
    costTrends: []
  };
}

/**
 * Helper function to calculate revenue attribution.
 * @param {object} query - The MongoDB query object.
 * @returns {Promise<object>} A promise that resolves to an object with revenue attribution data.
 * @todo Implement the actual logic for this function.
 */
async function calculateRevenueAttribution(query) {
  // Implementation for revenue attribution
  return {
    totalRevenue: 0,
    revenueBySource: [],
    revenueByPeriod: [],
    attributionModel: 'last-touch'
  };
}

/**
 * Helper function to calculate customer acquisition cost (CAC).
 * @param {object} query - The MongoDB query object.
 * @returns {Promise<object>} A promise that resolves to an object with CAC data.
 * @todo Implement the actual logic for this function.
 */
async function calculateCustomerAcquisitionCost(query) {
  // Implementation for customer acquisition cost
  return {
    totalCAC: 0,
    averageCAC: 0,
    cacBySource: [],
    cacTrends: []
  };
}

module.exports = {
  getReferralAnalytics,
  getReferralFunnel,
  getGeographicAnalytics,
  getSourcePerformance,
  getROIAnalytics
};
