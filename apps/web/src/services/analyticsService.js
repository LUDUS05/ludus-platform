/**
 * @fileoverview Analytics Service for LUDUS Platform - LDS-017 Implementation
 * @module services/analyticsService
 * 
 * This service provides comprehensive analytics and business intelligence functionality including:
 * - Dashboard analytics with comprehensive metrics
 * - User behavior analytics
 * - Revenue analytics and financial insights
 * - Vendor performance analytics
 * - Search analytics and discovery insights
 * - Performance metrics and system health
 * - RTL support for Arabic users
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

import api from './api';

class LUDUSAnalyticsService {
  constructor() {
    this.baseURL = '/api/analytics';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get comprehensive dashboard analytics.
   * @param {Object} params - Analytics parameters
   * @returns {Promise<Object>} Dashboard analytics data
   */
  async getDashboardAnalytics(params = {}) {
    try {
      const cacheKey = `dashboard_${JSON.stringify(params)}`;
      const cachedData = this.getCachedData(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      const response = await api.get(`${this.baseURL}/dashboard`, { params });
      const data = response.data;
      
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get user behavior analytics.
   * @param {Object} params - Analytics parameters
   * @returns {Promise<Object>} User analytics data
   */
  async getUserAnalytics(params = {}) {
    try {
      const cacheKey = `users_${JSON.stringify(params)}`;
      const cachedData = this.getCachedData(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      const response = await api.get(`${this.baseURL}/users`, { params });
      const data = response.data;
      
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get revenue analytics and financial insights.
   * @param {Object} params - Analytics parameters
   * @returns {Promise<Object>} Revenue analytics data
   */
  async getRevenueAnalytics(params = {}) {
    try {
      const cacheKey = `revenue_${JSON.stringify(params)}`;
      const cachedData = this.getCachedData(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      const response = await api.get(`${this.baseURL}/revenue`, { params });
      const data = response.data;
      
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get vendor performance analytics.
   * @param {Object} params - Analytics parameters
   * @returns {Promise<Object>} Vendor analytics data
   */
  async getVendorAnalytics(params = {}) {
    try {
      const cacheKey = `vendors_${JSON.stringify(params)}`;
      const cachedData = this.getCachedData(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      const response = await api.get(`${this.baseURL}/vendors`, { params });
      const data = response.data;
      
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching vendor analytics:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get search analytics and discovery insights.
   * @param {Object} params - Analytics parameters
   * @returns {Promise<Object>} Search analytics data
   */
  async getSearchAnalytics(params = {}) {
    try {
      const cacheKey = `search_${JSON.stringify(params)}`;
      const cachedData = this.getCachedData(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      const response = await api.get(`${this.baseURL}/search`, { params });
      const data = response.data;
      
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching search analytics:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get performance metrics and system health.
   * @param {Object} params - Analytics parameters
   * @returns {Promise<Object>} Performance metrics data
   */
  async getPerformanceMetrics(params = {}) {
    try {
      const cacheKey = `performance_${JSON.stringify(params)}`;
      const cachedData = this.getCachedData(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      const response = await api.get(`${this.baseURL}/performance`, { params });
      const data = response.data;
      
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get cached data.
   * @param {string} key - Cache key
   * @returns {Object|null} Cached data or null
   */
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set cached data.
   * @param {string} key - Cache key
   * @param {Object} data - Data to cache
   */
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear analytics cache.
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Format analytics data for charts.
   * @param {Object} analyticsData - Raw analytics data
   * @param {string} chartType - Type of chart (line, bar, pie, etc.)
   * @returns {Object} Formatted chart data
   */
  formatChartData(analyticsData, chartType = 'line') {
    switch (chartType) {
      case 'line':
        return this.formatLineChartData(analyticsData);
      case 'bar':
        return this.formatBarChartData(analyticsData);
      case 'pie':
        return this.formatPieChartData(analyticsData);
      case 'doughnut':
        return this.formatDoughnutChartData(analyticsData);
      case 'area':
        return this.formatAreaChartData(analyticsData);
      default:
        return this.formatLineChartData(analyticsData);
    }
  }

  /**
   * Format data for line charts.
   * @param {Object} data - Analytics data
   * @returns {Object} Line chart data
   */
  formatLineChartData(data) {
    if (!data.timeSeriesData) {
      return { labels: [], datasets: [] };
    }

    const labels = data.timeSeriesData.map(item => item.date);
    const datasets = [
      {
        label: 'Users',
        data: data.timeSeriesData.map(item => item.users),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Bookings',
        data: data.timeSeriesData.map(item => item.bookings),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      },
      {
        label: 'Revenue',
        data: data.timeSeriesData.map(item => item.revenue),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4
      }
    ];

    return { labels, datasets };
  }

  /**
   * Format data for bar charts.
   * @param {Object} data - Analytics data
   * @returns {Object} Bar chart data
   */
  formatBarChartData(data) {
    if (!data.revenueByCategory) {
      return { labels: [], datasets: [] };
    }

    const labels = data.revenueByCategory.map(item => item.category);
    const datasets = [
      {
        label: 'Revenue',
        data: data.revenueByCategory.map(item => item.revenue),
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#06b6d4',
          '#84cc16',
          '#f97316'
        ]
      }
    ];

    return { labels, datasets };
  }

  /**
   * Format data for pie charts.
   * @param {Object} data - Analytics data
   * @returns {Object} Pie chart data
   */
  formatPieChartData(data) {
    if (!data.popularCategories) {
      return { labels: [], datasets: [] };
    }

    const labels = data.popularCategories.map(item => item.category);
    const datasets = [
      {
        data: data.popularCategories.map(item => item.totalViews),
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#06b6d4',
          '#84cc16',
          '#f97316'
        ]
      }
    ];

    return { labels, datasets };
  }

  /**
   * Format data for doughnut charts.
   * @param {Object} data - Analytics data
   * @returns {Object} Doughnut chart data
   */
  formatDoughnutChartData(data) {
    if (!data.popularLocations) {
      return { labels: [], datasets: [] };
    }

    const labels = data.popularLocations.map(item => item.city);
    const datasets = [
      {
        data: data.popularLocations.map(item => item.totalBookings),
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#06b6d4',
          '#84cc16',
          '#f97316'
        ]
      }
    ];

    return { labels, datasets };
  }

  /**
   * Format data for area charts.
   * @param {Object} data - Analytics data
   * @returns {Object} Area chart data
   */
  formatAreaChartData(data) {
    if (!data.timeSeriesData) {
      return { labels: [], datasets: [] };
    }

    const labels = data.timeSeriesData.map(item => item.date);
    const datasets = [
      {
        label: 'Revenue',
        data: data.timeSeriesData.map(item => item.revenue),
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3b82f6',
        fill: true,
        tension: 0.4
      }
    ];

    return { labels, datasets };
  }

  /**
   * Generate analytics insights.
   * @param {Object} data - Analytics data
   * @returns {Object} Generated insights
   */
  generateInsights(data) {
    const insights = {
      userGrowth: this.calculateGrowthRate(data.userMetrics?.totalUsers, data.previousPeriod?.userMetrics?.totalUsers),
      revenueGrowth: this.calculateGrowthRate(data.revenueMetrics?.totalRevenue, data.previousPeriod?.revenueMetrics?.totalRevenue),
      bookingTrend: this.calculateTrend(data.bookingMetrics?.totalBookings, data.previousPeriod?.bookingMetrics?.totalBookings),
      vendorPerformance: this.assessVendorPerformance(data.vendorMetrics),
      searchActivity: this.assessSearchActivity(data.searchMetrics),
      systemHealth: this.assessSystemHealth(data.performanceMetrics)
    };

    return insights;
  }

  /**
   * Calculate growth rate.
   * @param {number} current - Current value
   * @param {number} previous - Previous value
   * @returns {string} Growth rate assessment
   */
  calculateGrowthRate(current, previous) {
    if (!current || !previous) return 'stable';
    
    const growthRate = ((current - previous) / previous) * 100;
    
    if (growthRate > 20) return 'high_growth';
    if (growthRate > 5) return 'positive';
    if (growthRate > -5) return 'stable';
    if (growthRate > -20) return 'declining';
    return 'significant_decline';
  }

  /**
   * Calculate trend.
   * @param {number} current - Current value
   * @param {number} previous - Previous value
   * @returns {string} Trend assessment
   */
  calculateTrend(current, previous) {
    if (!current || !previous) return 'stable';
    
    const change = current - previous;
    
    if (change > 0) return 'increasing';
    if (change < 0) return 'decreasing';
    return 'stable';
  }

  /**
   * Assess vendor performance.
   * @param {Object} vendorMetrics - Vendor metrics
   * @returns {string} Performance assessment
   */
  assessVendorPerformance(vendorMetrics) {
    if (!vendorMetrics) return 'unknown';
    
    const activeVendors = vendorMetrics.activeVendors || 0;
    const totalVendors = vendorMetrics.totalVendors || 0;
    
    if (totalVendors === 0) return 'no_data';
    
    const activityRate = (activeVendors / totalVendors) * 100;
    
    if (activityRate > 80) return 'excellent';
    if (activityRate > 60) return 'good';
    if (activityRate > 40) return 'fair';
    return 'needs_improvement';
  }

  /**
   * Assess search activity.
   * @param {Object} searchMetrics - Search metrics
   * @returns {string} Activity assessment
   */
  assessSearchActivity(searchMetrics) {
    if (!searchMetrics) return 'unknown';
    
    const totalSearches = searchMetrics.totalSearches || 0;
    const conversionRate = searchMetrics.conversionRate || 0;
    
    if (totalSearches > 1000 && conversionRate > 0.1) return 'high';
    if (totalSearches > 500 && conversionRate > 0.05) return 'medium';
    if (totalSearches > 100) return 'low';
    return 'very_low';
  }

  /**
   * Assess system health.
   * @param {Object} performanceMetrics - Performance metrics
   * @returns {string} Health assessment
   */
  assessSystemHealth(performanceMetrics) {
    if (!performanceMetrics) return 'unknown';
    
    const uptime = performanceMetrics.uptime || 0;
    const errorRate = performanceMetrics.errorRate || 0;
    const responseTime = performanceMetrics.apiResponseTime || 0;
    
    if (uptime > 99.5 && errorRate < 0.1 && responseTime < 500) return 'excellent';
    if (uptime > 99 && errorRate < 0.5 && responseTime < 1000) return 'good';
    if (uptime > 95 && errorRate < 1 && responseTime < 2000) return 'fair';
    return 'needs_attention';
  }

  /**
   * Export analytics data.
   * @param {Object} data - Analytics data
   * @param {string} format - Export format (csv, json, pdf)
   * @returns {Promise<Blob>} Exported data
   */
  async exportAnalyticsData(data, format = 'csv') {
    try {
    switch (format) {
      case 'csv':
          return this.exportToCSV(data);
      case 'json':
          return this.exportToJSON(data);
        case 'pdf':
          return this.exportToPDF(data);
      default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Export data to CSV format.
   * @param {Object} data - Analytics data
   * @returns {Blob} CSV data
   */
  exportToCSV(data) {
    const csvData = this.convertToCSV(data);
    return new Blob([csvData], { type: 'text/csv' });
  }

  /**
   * Export data to JSON format.
   * @param {Object} data - Analytics data
   * @returns {Blob} JSON data
   */
  exportToJSON(data) {
    const jsonData = JSON.stringify(data, null, 2);
    return new Blob([jsonData], { type: 'application/json' });
  }

  /**
   * Export data to PDF format.
   * @param {Object} data - Analytics data
   * @returns {Promise<Blob>} PDF data
   */
  async exportToPDF(data) {
    // This would integrate with a PDF generation library
    // For now, return a placeholder
    const pdfData = `PDF Export for Analytics Data: ${JSON.stringify(data)}`;
    return new Blob([pdfData], { type: 'application/pdf' });
  }

  /**
   * Convert data to CSV format.
   * @param {Object} data - Analytics data
   * @returns {string} CSV string
   */
  convertToCSV(data) {
    // This would implement proper CSV conversion
    // For now, return a simple representation
    return `Metric,Value\nTotal Users,${data.userMetrics?.totalUsers || 0}\nTotal Revenue,${data.revenueMetrics?.totalRevenue || 0}`;
  }

  /**
   * Handle API errors.
   * @param {Error} error - The error object
   * @returns {Error} The processed error
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const message = data?.message || 'An error occurred';
      
      return new Error(`${status}: ${message}`);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error: Please check your connection');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export const analyticsService = new LUDUSAnalyticsService();
export default analyticsService;