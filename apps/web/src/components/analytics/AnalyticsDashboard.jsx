/**
 * @fileoverview Advanced Analytics Dashboard for LUDUS Platform - LDS-017 Implementation
 * @module components/analytics/AnalyticsDashboard
 * 
 * This component provides comprehensive analytics and business intelligence including:
 * - Executive dashboard with key metrics
 * - User behavior analytics
 * - Revenue analytics and financial insights
 * - Vendor performance analytics
 * - Search analytics and discovery insights
 * - Performance metrics and system health
 * - RTL support for Arabic users
 * - Real-time data visualization
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Search,
  Clock,
  AlertCircle,
  CheckCircle,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  Eye,
  EyeOff,
  Settings,
  HelpCircle
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { notificationService } from '../../services/notificationService';
import './AnalyticsDashboard.css';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const AnalyticsDashboard = () => {
  const { t, i18n } = useTranslation();
  
  // State management
  const [dashboardData, setDashboardData] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);
  const [vendorAnalytics, setVendorAnalytics] = useState(null);
  const [searchAnalytics, setSearchAnalytics] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState({
    period: '30d',
    groupBy: 'day',
    segment: 'all',
    category: '',
    location: ''
  });
  
  const isRTL = i18n.language === 'ar';
  const language = i18n.language;

  // Initialize dashboard
  useEffect(() => {
    initializeDashboard();
    setupAnimations();
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshData();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Initialize dashboard
  const initializeDashboard = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadDashboardData(),
        loadUserAnalytics(),
        loadRevenueAnalytics(),
        loadVendorAnalytics(),
        loadSearchAnalytics(),
        loadPerformanceMetrics()
      ]);
    } catch (error) {
      console.error('Dashboard initialization error:', error);
      setError(error.message);
      notificationService.show('error', t('analytics.errors.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      const data = await analyticsService.getDashboardAnalytics(filters);
      setDashboardData(data.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      throw error;
    }
  };

  // Load user analytics
  const loadUserAnalytics = async () => {
    try {
      const data = await analyticsService.getUserAnalytics(filters);
      setUserAnalytics(data.data);
    } catch (error) {
      console.error('Error loading user analytics:', error);
      throw error;
    }
  };

  // Load revenue analytics
  const loadRevenueAnalytics = async () => {
    try {
      const data = await analyticsService.getRevenueAnalytics(filters);
      setRevenueAnalytics(data.data);
    } catch (error) {
      console.error('Error loading revenue analytics:', error);
      throw error;
    }
  };

  // Load vendor analytics
  const loadVendorAnalytics = async () => {
    try {
      const data = await analyticsService.getVendorAnalytics(filters);
      setVendorAnalytics(data.data);
    } catch (error) {
      console.error('Error loading vendor analytics:', error);
      throw error;
    }
  };

  // Load search analytics
  const loadSearchAnalytics = async () => {
    try {
      const data = await analyticsService.getSearchAnalytics(filters);
      setSearchAnalytics(data.data);
    } catch (error) {
      console.error('Error loading search analytics:', error);
      throw error;
    }
  };

  // Load performance metrics
  const loadPerformanceMetrics = async () => {
    try {
      const data = await analyticsService.getPerformanceMetrics(filters);
      setPerformanceMetrics(data.data);
    } catch (error) {
      console.error('Error loading performance metrics:', error);
      throw error;
    }
  };

  // Refresh all data
  const refreshData = async () => {
    try {
      analyticsService.clearCache();
      await initializeDashboard();
      notificationService.show('success', t('analytics.messages.dataRefreshed'));
    } catch (error) {
      console.error('Error refreshing data:', error);
      notificationService.show('error', t('analytics.errors.refreshFailed'));
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = async () => {
    setIsLoading(true);
    try {
      await initializeDashboard();
      notificationService.show('success', t('analytics.messages.filtersApplied'));
    } catch (error) {
      console.error('Error applying filters:', error);
      notificationService.show('error', t('analytics.errors.filterFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Export data
  const exportData = async (format = 'csv') => {
    try {
      const data = {
        dashboard: dashboardData,
        users: userAnalytics,
        revenue: revenueAnalytics,
        vendors: vendorAnalytics,
        search: searchAnalytics,
        performance: performanceMetrics
      };
      
      const blob = await analyticsService.exportAnalyticsData(data, format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      notificationService.show('success', t('analytics.messages.dataExported'));
    } catch (error) {
      console.error('Error exporting data:', error);
      notificationService.show('error', t('analytics.errors.exportFailed'));
    }
  };

  // Setup GSAP animations
  const setupAnimations = () => {
    // Dashboard cards animation
    gsap.fromTo('.analytics-card', 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)' }
    );
    
    // Charts animation
    gsap.fromTo('.chart-container', 
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.3 }
    );
    
    // Setup scroll animations
    ScrollTrigger.batch('.analytics-section', {
      onEnter: (elements) => {
        gsap.fromTo(elements, 
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
        );
      },
      once: true
    });
  };

  // Render metric card
  const renderMetricCard = (title, value, change, icon, color = 'blue') => {
    const isPositive = change > 0;
    const isNegative = change < 0;
    
    return (
      <div className={`analytics-card metric-card metric-card--${color}`}>
        <div className="metric-card-header">
          <div className="metric-card-icon">
            {icon}
          </div>
          <div className="metric-card-title">
            {title}
          </div>
        </div>
        
        <div className="metric-card-value">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        
        {change !== undefined && (
          <div className={`metric-card-change ${isPositive ? 'positive' : isNegative ? 'negative' : 'neutral'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : 
             isNegative ? <TrendingDown className="w-4 h-4" /> : 
             <Activity className="w-4 h-4" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    );
  };

  // Render overview tab
  const renderOverviewTab = () => {
    if (!dashboardData) return null;
    
    const { userMetrics, revenueMetrics, bookingMetrics, vendorMetrics, searchMetrics, performanceMetrics } = dashboardData;
    
    return (
      <div className="analytics-overview">
        {/* Key Metrics */}
        <div className="metrics-grid">
          {renderMetricCard(
            t('analytics.metrics.totalUsers'),
            userMetrics?.totalUsers || 0,
            userMetrics?.growthRate || 0,
            <Users className="w-6 h-6" />,
            'blue'
          )}
          
          {renderMetricCard(
            t('analytics.metrics.totalRevenue'),
            `SAR ${(revenueMetrics?.totalRevenue || 0).toLocaleString()}`,
            revenueMetrics?.growthRate || 0,
            <DollarSign className="w-6 h-6" />,
            'green'
          )}
          
          {renderMetricCard(
            t('analytics.metrics.totalBookings'),
            bookingMetrics?.totalBookings || 0,
            bookingMetrics?.growthRate || 0,
            <Calendar className="w-6 h-6" />,
            'purple'
          )}
          
          {renderMetricCard(
            t('analytics.metrics.activeVendors'),
            vendorMetrics?.activeVendors || 0,
            vendorMetrics?.growthRate || 0,
            <BarChart3 className="w-6 h-6" />,
            'orange'
          )}
        </div>
        
        {/* Performance Indicators */}
        <div className="performance-indicators">
          <div className="performance-card">
            <div className="performance-header">
              <Search className="w-5 h-5" />
              <span>{t('analytics.performance.searchActivity')}</span>
            </div>
            <div className="performance-value">
              {searchMetrics?.totalSearches || 0}
            </div>
            <div className="performance-status">
              {searchMetrics?.conversionRate > 0.1 ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              )}
              <span>{searchMetrics?.conversionRate > 0.1 ? t('analytics.status.good') : t('analytics.status.needsImprovement')}</span>
            </div>
          </div>
          
          <div className="performance-card">
            <div className="performance-header">
              <Clock className="w-5 h-5" />
              <span>{t('analytics.performance.responseTime')}</span>
            </div>
            <div className="performance-value">
              {performanceMetrics?.apiResponseTime || 0}ms
            </div>
            <div className="performance-status">
              {performanceMetrics?.apiResponseTime < 500 ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              )}
              <span>{performanceMetrics?.apiResponseTime < 500 ? t('analytics.status.fast') : t('analytics.status.slow')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render users tab
  const renderUsersTab = () => {
    if (!userAnalytics) return null;
    
    return (
      <div className="analytics-section">
        <div className="section-header">
          <h3>{t('analytics.sections.userBehavior')}</h3>
        </div>
        
        <div className="users-grid">
          <div className="users-card">
            <div className="card-header">
              <Users className="w-5 h-5" />
              <span>{t('analytics.users.totalUsers')}</span>
            </div>
            <div className="card-value">
              {userAnalytics.userAnalytics?.totalUsers || 0}
            </div>
            <div className="card-subtitle">
              {t('analytics.users.verificationRate')}: {userAnalytics.userAnalytics?.verificationRate?.toFixed(1)}%
            </div>
          </div>
          
          <div className="users-card">
            <div className="card-header">
              <Activity className="w-5 h-5" />
              <span>{t('analytics.users.activeUsers')}</span>
            </div>
            <div className="card-value">
              {userAnalytics.userAnalytics?.activeUsers || 0}
            </div>
            <div className="card-subtitle">
              {t('analytics.users.activityRate')}: {userAnalytics.userAnalytics?.activityRate?.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render revenue tab
  const renderRevenueTab = () => {
    if (!revenueAnalytics) return null;
    
    return (
      <div className="analytics-section">
        <div className="section-header">
          <h3>{t('analytics.sections.revenue')}</h3>
        </div>
        
        <div className="revenue-grid">
          <div className="revenue-card">
            <div className="card-header">
              <DollarSign className="w-5 h-5" />
              <span>{t('analytics.revenue.totalRevenue')}</span>
            </div>
            <div className="card-value">
              SAR {revenueAnalytics.revenueMetrics?.totalRevenue?.toLocaleString() || 0}
            </div>
            <div className="card-subtitle">
              {t('analytics.revenue.averageTransaction')}: SAR {revenueAnalytics.revenueMetrics?.averageTransactionValue?.toFixed(2) || 0}
            </div>
          </div>
          
          <div className="revenue-card">
            <div className="card-header">
              <TrendingUp className="w-5 h-5" />
              <span>{t('analytics.revenue.totalTransactions')}</span>
            </div>
            <div className="card-value">
              {revenueAnalytics.revenueMetrics?.totalTransactions || 0}
            </div>
            <div className="card-subtitle">
              {t('analytics.revenue.refundRate')}: {revenueAnalytics.revenueMetrics?.refundRate?.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render vendors tab
  const renderVendorsTab = () => {
    if (!vendorAnalytics) return null;
    
    return (
      <div className="analytics-section">
        <div className="section-header">
          <h3>{t('analytics.sections.vendorPerformance')}</h3>
        </div>
        
        <div className="vendors-grid">
          <div className="vendors-card">
            <div className="card-header">
              <BarChart3 className="w-5 h-5" />
              <span>{t('analytics.vendors.totalVendors')}</span>
            </div>
            <div className="card-value">
              {vendorAnalytics.vendorMetrics?.length || 0}
            </div>
            <div className="card-subtitle">
              {t('analytics.vendors.activeVendors')}: {vendorAnalytics.vendorMetrics?.filter(v => v.totalRevenue > 0).length || 0}
            </div>
          </div>
          
          {vendorAnalytics.topVendors?.slice(0, 3).map((vendor, index) => (
            <div key={vendor._id} className="vendor-performance-card">
              <div className="vendor-rank">#{index + 1}</div>
              <div className="vendor-name">
                {language === 'ar' ? vendor.vendorNameAr : vendor.vendorName}
              </div>
              <div className="vendor-metrics">
                <div className="vendor-revenue">
                  SAR {vendor.totalRevenue?.toLocaleString() || 0}
                </div>
                <div className="vendor-bookings">
                  {vendor.totalBookings || 0} {t('analytics.vendors.bookings')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render search tab
  const renderSearchTab = () => {
    if (!searchAnalytics) return null;
    
    return (
      <div className="analytics-section">
        <div className="section-header">
          <h3>{t('analytics.sections.searchAnalytics')}</h3>
        </div>
        
        <div className="search-grid">
          <div className="search-card">
            <div className="card-header">
              <Search className="w-5 h-5" />
              <span>{t('analytics.search.totalSearches')}</span>
            </div>
            <div className="card-value">
              {searchAnalytics.searchMetrics?.totalSearches || 0}
            </div>
            <div className="card-subtitle">
              {t('analytics.search.conversionRate')}: {searchAnalytics.searchMetrics?.conversionRate?.toFixed(2)}%
            </div>
          </div>
          
          <div className="search-categories">
            <h4>{t('analytics.search.popularCategories')}</h4>
            {searchAnalytics.popularCategories?.slice(0, 5).map((category, index) => (
              <div key={category._id} className="category-item">
                <div className="category-rank">#{index + 1}</div>
                <div className="category-name">{category.category}</div>
                <div className="category-views">{category.totalViews || 0}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render performance tab
  const renderPerformanceTab = () => {
    if (!performanceMetrics) return null;
    
    return (
      <div className="analytics-section">
        <div className="section-header">
          <h3>{t('analytics.sections.systemPerformance')}</h3>
        </div>
        
        <div className="performance-grid">
          <div className="performance-card">
            <div className="card-header">
              <Clock className="w-5 h-5" />
              <span>{t('analytics.performance.responseTime')}</span>
            </div>
            <div className="card-value">
              {performanceMetrics.performanceMetrics?.apiResponseTime || 0}ms
            </div>
            <div className="card-subtitle">
              {t('analytics.performance.databaseQueryTime')}: {performanceMetrics.performanceMetrics?.databaseQueryTime || 0}ms
            </div>
          </div>
          
          <div className="performance-card">
            <div className="card-header">
              <Activity className="w-5 h-5" />
              <span>{t('analytics.performance.uptime')}</span>
            </div>
            <div className="card-value">
              {performanceMetrics.performanceMetrics?.uptime || 0}%
            </div>
            <div className="card-subtitle">
              {t('analytics.performance.errorRate')}: {performanceMetrics.performanceMetrics?.errorRate || 0}%
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render loading state
  const renderLoadingState = () => (
    <div className="analytics-loading">
      <div className="loading-spinner">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
      <p>{t('analytics.loading')}</p>
    </div>
  );

  // Render error state
  const renderErrorState = () => (
    <div className="analytics-error">
      <AlertCircle className="w-8 h-8" />
      <p>{error}</p>
      <button
        className="retry-button"
        onClick={initializeDashboard}
      >
        {t('analytics.retry')}
      </button>
    </div>
  );

  return (
    <div className={`analytics-dashboard ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="analytics-header">
        <div className="header-content">
          <div className="header-title">
            <BarChart3 className="w-6 h-6" />
            <h1>{t('analytics.title')}</h1>
          </div>
          
          <div className="header-actions">
            <button
              className={`refresh-button ${autoRefresh ? 'active' : ''}`}
              onClick={() => setAutoRefresh(!autoRefresh)}
              title={t('analytics.autoRefresh')}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            
            <button
              className="refresh-button"
              onClick={refreshData}
              title={t('analytics.refresh')}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            
            <button
              className="filter-button"
              onClick={() => setShowFilters(!showFilters)}
              title={t('analytics.filters')}
            >
              <Filter className="w-4 h-4" />
            </button>
            
            <button
              className="export-button"
              onClick={() => exportData('csv')}
              title={t('analytics.export')}
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>{t('analytics.filters.period')}</label>
              <select
                value={filters.period}
                onChange={(e) => handleFilterChange('period', e.target.value)}
              >
                <option value="7d">{t('analytics.periods.last7Days')}</option>
                <option value="30d">{t('analytics.periods.last30Days')}</option>
                <option value="90d">{t('analytics.periods.last90Days')}</option>
                <option value="1y">{t('analytics.periods.lastYear')}</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>{t('analytics.filters.groupBy')}</label>
              <select
                value={filters.groupBy}
                onChange={(e) => handleFilterChange('groupBy', e.target.value)}
              >
                <option value="day">{t('analytics.groupBy.day')}</option>
                <option value="week">{t('analytics.groupBy.week')}</option>
                <option value="month">{t('analytics.groupBy.month')}</option>
                <option value="year">{t('analytics.groupBy.year')}</option>
              </select>
            </div>
            
            <button
              className="apply-filters-button"
              onClick={applyFilters}
            >
              {t('analytics.applyFilters')}
            </button>
          </div>
        )}
      </div>
      
      {/* Navigation Tabs */}
      <div className="analytics-tabs">
        <button
          className={`tab-button ${selectedTab === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedTab('overview')}
        >
          <BarChart3 className="w-4 h-4" />
          {t('analytics.tabs.overview')}
        </button>
        
        <button
          className={`tab-button ${selectedTab === 'users' ? 'active' : ''}`}
          onClick={() => setSelectedTab('users')}
        >
          <Users className="w-4 h-4" />
          {t('analytics.tabs.users')}
        </button>
        
        <button
          className={`tab-button ${selectedTab === 'revenue' ? 'active' : ''}`}
          onClick={() => setSelectedTab('revenue')}
        >
          <DollarSign className="w-4 h-4" />
          {t('analytics.tabs.revenue')}
        </button>
        
        <button
          className={`tab-button ${selectedTab === 'vendors' ? 'active' : ''}`}
          onClick={() => setSelectedTab('vendors')}
        >
          <BarChart3 className="w-4 h-4" />
          {t('analytics.tabs.vendors')}
        </button>
        
        <button
          className={`tab-button ${selectedTab === 'search' ? 'active' : ''}`}
          onClick={() => setSelectedTab('search')}
        >
          <Search className="w-4 h-4" />
          {t('analytics.tabs.search')}
        </button>
        
        <button
          className={`tab-button ${selectedTab === 'performance' ? 'active' : ''}`}
          onClick={() => setSelectedTab('performance')}
        >
          <Activity className="w-4 h-4" />
          {t('analytics.tabs.performance')}
        </button>
      </div>
      
      {/* Content */}
      <div className="analytics-content">
        {isLoading ? renderLoadingState() : 
         error ? renderErrorState() : 
         selectedTab === 'overview' ? renderOverviewTab() :
         selectedTab === 'users' ? renderUsersTab() :
         selectedTab === 'revenue' ? renderRevenueTab() :
         selectedTab === 'vendors' ? renderVendorsTab() :
         selectedTab === 'search' ? renderSearchTab() :
         selectedTab === 'performance' ? renderPerformanceTab() :
         null}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
