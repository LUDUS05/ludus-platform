/**
 * @fileoverview Enhanced Search Controller for LUDUS Platform - LDS-016 Implementation
 * @module controllers/searchController
 * 
 * This controller provides comprehensive search and discovery functionality including:
 * - Advanced search with multiple filters
 * - Full-text search across activities
 * - Geospatial search with location filtering
 * - Search analytics and reporting
 * - Search suggestions and auto-complete
 * - RTL support for Arabic users
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const mongoose = require('mongoose');
const ActivityEnhanced = require('../models/ActivityEnhanced');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const ReviewEnhanced = require('../models/ReviewEnhanced');

/**
 * Search activities with advanced filters.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const searchActivities = async (req, res) => {
  try {
    const {
      query = '',
      category = '',
      location = '',
      priceMin = 0,
      priceMax = 10000,
      rating = 0,
      dateFrom = '',
      dateTo = '',
      sortBy = 'relevance',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
      radius = 50, // km
      latitude = '',
      longitude = '',
      tags = [],
      features = [],
      difficulty = '',
      duration = '',
      groupSize = '',
      language = 'ar'
    } = req.query;

    // Build search query
    const searchQuery = {};
    const sortOptions = {};

    // Text search
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { titleEn: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { descriptionEn: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
        { 'partner.businessName': { $regex: query, $options: 'i' } },
        { 'partner.businessNameAr': { $regex: query, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      searchQuery.category = category;
    }

    // Price range filter
    if (priceMin || priceMax) {
      searchQuery['pricing.adult'] = {};
      if (priceMin) searchQuery['pricing.adult'].$gte = parseInt(priceMin);
      if (priceMax) searchQuery['pricing.adult'].$lte = parseInt(priceMax);
    }

    // Rating filter
    if (rating) {
      searchQuery['rating.average'] = { $gte: parseFloat(rating) };
    }

    // Date range filter
    if (dateFrom || dateTo) {
      searchQuery['schedule.availableDates'] = {};
      if (dateFrom) {
        searchQuery['schedule.availableDates'].$gte = new Date(dateFrom);
      }
      if (dateTo) {
        searchQuery['schedule.availableDates'].$lte = new Date(dateTo);
      }
    }

    // Location filter
    if (location) {
      searchQuery.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.cityAr': { $regex: location, $options: 'i' } },
        { 'location.area': { $regex: location, $options: 'i' } },
        { 'location.areaAr': { $regex: location, $options: 'i' } },
        { 'location.address': { $regex: location, $options: 'i' } }
      ];
    }

    // Geospatial search
    if (latitude && longitude && radius) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const rad = parseFloat(radius) / 6371; // Convert km to radians

      searchQuery['location.coordinates'] = {
        $geoWithin: {
          $centerSphere: [[lng, lat], rad]
        }
      };
    }

    // Tags filter
    if (tags && tags.length > 0) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      searchQuery.tags = { $in: tagArray };
    }

    // Features filter
    if (features && features.length > 0) {
      const featureArray = Array.isArray(features) ? features : [features];
      searchQuery.features = { $in: featureArray };
    }

    // Difficulty filter
    if (difficulty) {
      searchQuery.difficulty = difficulty;
    }

    // Duration filter
    if (duration) {
      searchQuery.duration = duration;
    }

    // Group size filter
    if (groupSize) {
      searchQuery['requirements.groupSize'] = groupSize;
    }

    // Status filter (only published activities)
    searchQuery.status = 'published';

    // Sort options
    switch (sortBy) {
      case 'price':
        sortOptions['pricing.adult'] = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'rating':
        sortOptions['rating.average'] = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'date':
        sortOptions.createdAt = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'popularity':
        sortOptions['statistics.views'] = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'distance':
        if (latitude && longitude) {
          // For distance sorting, we'll need to calculate distances
          // This is handled in the aggregation pipeline
        }
        break;
      default:
        // Relevance sorting (default)
        if (query) {
          // Boost activities that match the query in title
          sortOptions.title = 1;
        }
        sortOptions['rating.average'] = -1;
        sortOptions.createdAt = -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute search with aggregation for advanced features
    const pipeline = [
      { $match: searchQuery },
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
          from: 'reviewenhanceds',
          localField: '_id',
          foreignField: 'activity.id',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          reviewCount: { $size: '$reviews' },
          averageRating: { $avg: '$reviews.rating.overall' },
          vendorName: { $arrayElemAt: ['$vendorInfo.businessName', 0] },
          vendorNameAr: { $arrayElemAt: ['$vendorInfo.businessNameAr', 0] }
        }
      },
      {
        $project: {
          title: 1,
          titleEn: 1,
          description: 1,
          descriptionEn: 1,
          category: 1,
          tags: 1,
          features: 1,
          difficulty: 1,
          duration: 1,
          pricing: 1,
          location: 1,
          images: 1,
          rating: 1,
          statistics: 1,
          schedule: 1,
          requirements: 1,
          vendorName: 1,
          vendorNameAr: 1,
          reviewCount: 1,
          averageRating: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ];

    // Add distance calculation if coordinates provided
    if (latitude && longitude && sortBy === 'distance') {
      pipeline.push({
        $addFields: {
          distance: {
            $multiply: [
              {
                $acos: {
                  $add: [
                    {
                      $multiply: [
                        { $sin: { $multiply: [{ $divide: ['$location.coordinates.1', 180] }, Math.PI] } },
                        { $sin: { $multiply: [{ $divide: [parseFloat(latitude), 180] }, Math.PI] } }
                      ]
                    },
                    {
                      $multiply: [
                        { $cos: { $multiply: [{ $divide: ['$location.coordinates.1', 180] }, Math.PI] } },
                        { $cos: { $multiply: [{ $divide: [parseFloat(latitude), 180] }, Math.PI] } },
                        { $cos: { $multiply: [{ $subtract: [{ $divide: ['$location.coordinates.0', 180] }, { $divide: [parseFloat(longitude), 180] }] }, Math.PI] } }
                      ]
                    }
                  ]
                }
              },
              6371 // Earth's radius in km
            ]
          }
        }
      });
    }

    // Add sorting
    if (sortBy === 'distance' && latitude && longitude) {
      pipeline.push({ $sort: { distance: sortOrder === 'asc' ? 1 : -1 } });
    } else {
      pipeline.push({ $sort: sortOptions });
    }

    // Add pagination
    pipeline.push(
      { $skip: skip },
      { $limit: parseInt(limit) }
    );

    const [activities, totalCount] = await Promise.all([
      ActivityEnhanced.aggregate(pipeline),
      ActivityEnhanced.countDocuments(searchQuery)
    ]);

    // Get search suggestions
    const suggestions = await getSearchSuggestionsData(query, language);

    res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit))
        },
        filters: {
          query,
          category,
          location,
          priceMin: parseInt(priceMin),
          priceMax: parseInt(priceMax),
          rating: parseFloat(rating),
          dateFrom,
          dateTo,
          radius: parseInt(radius),
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          tags,
          features,
          difficulty,
          duration,
          groupSize
        },
        suggestions,
        searchMetadata: {
          totalResults: totalCount,
          searchTime: Date.now(),
          language
        }
      }
    });

  } catch (error) {
    console.error('Search activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search activities',
      error: error.message
    });
  }
};

/**
 * Get search suggestions based on query.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getSearchSuggestions = async (req, res) => {
  try {
    const { query = '', language = 'ar', limit = 10 } = req.query;

    if (!query || query.length < 2) {
      return res.status(200).json({
        success: true,
        data: {
          suggestions: [],
          popularSearches: await getPopularSearches(language)
        }
      });
    }

    const suggestions = await getSearchSuggestionsData(query, language, parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        suggestions,
        popularSearches: await getPopularSearches(language)
      }
    });

  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search suggestions',
      error: error.message
    });
  }
};

/**
 * Get search analytics and insights.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getSearchAnalytics = async (req, res) => {
  try {
    const { period = '30d', groupBy = 'category' } = req.query;
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

    // Get search statistics
    const searchStats = await ActivityEnhanced.aggregate([
      {
        $match: {
          status: 'published',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy === 'category' ? '$category' : groupBy === 'location' ? '$location.city' : '$difficulty',
          totalActivities: { $sum: 1 },
          averageRating: { $avg: '$rating.average' },
          averagePrice: { $avg: '$pricing.adult' },
          totalViews: { $sum: '$statistics.views' },
          totalBookings: { $sum: '$statistics.bookings' }
        }
      },
      {
        $sort: { totalActivities: -1 }
      }
    ]);

    // Get popular search terms (mock data - would be from search logs)
    const popularSearches = await getPopularSearches('ar');

    // Get trending activities
    const trendingActivities = await ActivityEnhanced.find({
      status: 'published',
      createdAt: { $gte: startDate }
    })
      .sort({ 'statistics.views': -1, 'rating.average': -1 })
      .limit(10)
      .select('title titleEn category rating statistics images')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange: { startDate, endDate: now },
        searchStatistics: searchStats,
        popularSearches,
        trendingActivities,
        insights: {
          totalActivities: searchStats.reduce((sum, stat) => sum + stat.totalActivities, 0),
          averageRating: searchStats.reduce((sum, stat) => sum + stat.averageRating, 0) / searchStats.length,
          averagePrice: searchStats.reduce((sum, stat) => sum + stat.averagePrice, 0) / searchStats.length,
          totalViews: searchStats.reduce((sum, stat) => sum + stat.totalViews, 0),
          totalBookings: searchStats.reduce((sum, stat) => sum + stat.totalBookings, 0)
        }
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
 * Save search query for analytics.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const saveSearchQuery = async (req, res) => {
  try {
    const { query, filters = {}, resultsCount = 0 } = req.body;
    const userId = req.user?.id;

    // In a real implementation, you would save this to a search logs collection
    // For now, we'll just return success
    console.log('Search query logged:', {
      query,
      filters,
      resultsCount,
      userId,
      timestamp: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Search query saved successfully'
    });

  } catch (error) {
    console.error('Save search query error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save search query',
      error: error.message
    });
  }
};

/**
 * Get search suggestions helper function.
 * @param {string} query - The search query
 * @param {string} language - The language (ar/en)
 * @param {number} limit - Maximum number of suggestions
 * @returns {Promise<Array>} Array of suggestions
 */
const getSearchSuggestionsData = async (query, language = 'ar', limit = 10) => {
  try {
    const suggestions = [];

    // Get activity title suggestions
    const activitySuggestions = await ActivityEnhanced.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { titleEn: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ],
      status: 'published'
    })
      .select('title titleEn tags category')
      .limit(limit)
      .lean();

    activitySuggestions.forEach(activity => {
      suggestions.push({
        type: 'activity',
        text: language === 'ar' ? activity.title : activity.titleEn,
        category: activity.category,
        tags: activity.tags
      });
    });

    // Get location suggestions
    const locationSuggestions = await ActivityEnhanced.distinct('location.city', {
      'location.city': { $regex: query, $options: 'i' },
      status: 'published'
    });

    locationSuggestions.forEach(city => {
      suggestions.push({
        type: 'location',
        text: city,
        category: 'location'
      });
    });

    // Get vendor suggestions
    const vendorSuggestions = await Vendor.find({
      $or: [
        { businessName: { $regex: query, $options: 'i' } },
        { businessNameAr: { $regex: query, $options: 'i' } }
      ],
      isActive: true
    })
      .select('businessName businessNameAr')
      .limit(5)
      .lean();

    vendorSuggestions.forEach(vendor => {
      suggestions.push({
        type: 'vendor',
        text: language === 'ar' ? vendor.businessNameAr : vendor.businessName,
        category: 'vendor'
      });
    });

    return suggestions.slice(0, limit);

  } catch (error) {
    console.error('Get search suggestions helper error:', error);
    return [];
  }
};

/**
 * Get popular searches helper function.
 * @param {string} language - The language (ar/en)
 * @returns {Promise<Array>} Array of popular searches
 */
const getPopularSearches = async (language = 'ar') => {
  // Mock popular searches - in a real implementation, this would come from search logs
  const popularSearches = {
    ar: [
      'رياضة', 'موسيقى', 'فن', 'طعام', 'هواء طلق',
      'لياقة بدنية', 'ورش عمل', 'ثقافة', 'سهرات', 'رحلات'
    ],
    en: [
      'sports', 'music', 'art', 'food', 'outdoor',
      'fitness', 'workshops', 'culture', 'nightlife', 'trips'
    ]
  };

  return popularSearches[language] || popularSearches.ar;
};

/**
 * Get search filters and options.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getSearchFilters = async (req, res) => {
  try {
    const { language = 'ar' } = req.query;

    // Get available categories
    const categories = await ActivityEnhanced.distinct('category', { status: 'published' });

    // Get available locations
    const locations = await ActivityEnhanced.distinct('location.city', { status: 'published' });

    // Get available tags
    const tags = await ActivityEnhanced.distinct('tags', { status: 'published' });

    // Get available features
    const features = await ActivityEnhanced.distinct('features', { status: 'published' });

    // Get difficulty levels
    const difficulties = await ActivityEnhanced.distinct('difficulty', { status: 'published' });

    // Get duration options
    const durations = await ActivityEnhanced.distinct('duration', { status: 'published' });

    // Get price ranges
    const priceStats = await ActivityEnhanced.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$pricing.adult' },
          maxPrice: { $max: '$pricing.adult' },
          avgPrice: { $avg: '$pricing.adult' }
        }
      }
    ]);

    const priceRanges = priceStats[0] ? {
      min: Math.floor(priceStats[0].minPrice),
      max: Math.ceil(priceStats[0].maxPrice),
      average: Math.round(priceStats[0].avgPrice)
    } : { min: 0, max: 1000, average: 100 };

    res.status(200).json({
      success: true,
      data: {
        categories,
        locations,
        tags,
        features,
        difficulties,
        durations,
        priceRanges,
        language
      }
    });

  } catch (error) {
    console.error('Get search filters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search filters',
      error: error.message
    });
  }
};

module.exports = {
  searchActivities,
  getSearchSuggestions,
  getSearchAnalytics,
  saveSearchQuery,
  getSearchFilters
};

