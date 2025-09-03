import api from './api';

class AnalyticsService {
  constructor() {
    this.baseURL = '/api/analytics';
    this.reportsURL = '/api/reports';
  }

  // ===== ANALYTICS ENDPOINTS =====

  // Get comprehensive referral analytics
  async getReferralAnalytics(period = '30d', filters = {}) {
    try {
      const response = await api.get(`${this.baseURL}/referrals`, {
        params: { period, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching referral analytics:', error);
      throw error;
    }
  }

  // Get referral funnel analysis
  async getReferralFunnel(period = '30d', referrerId = null) {
    try {
      const response = await api.get(`${this.baseURL}/funnel`, {
        params: { period, referrerId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching referral funnel:', error);
      throw error;
    }
  }

  // Get geographic analytics
  async getGeographicAnalytics(period = '30d', referrerId = null) {
    try {
      const response = await api.get(`${this.baseURL}/geographic`, {
        params: { period, referrerId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching geographic analytics:', error);
      throw error;
    }
  }

  // Get source performance analytics
  async getSourcePerformance(period = '30d', referrerId = null) {
    try {
      const response = await api.get(`${this.baseURL}/sources`, {
        params: { period, referrerId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching source performance:', error);
      throw error;
    }
  }

  // Get ROI analytics
  async getROIAnalytics(period = '30d', referrerId = null) {
    try {
      const response = await api.get(`${this.baseURL}/roi`, {
        params: { period, referrerId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching ROI analytics:', error);
      throw error;
    }
  }

  // ===== REPORTING ENDPOINTS =====

  // Get available report templates
  async getReportTemplates() {
    try {
      const response = await api.get(`${this.reportsURL}/templates`);
      return response.data;
    } catch (error) {
      console.error('Error fetching report templates:', error);
      throw error;
    }
  }

  // Generate referral report
  async generateReferralReport(reportConfig) {
    try {
      const response = await api.post(`${this.reportsURL}/generate`, reportConfig);
      return response.data;
    } catch (error) {
      console.error('Error generating referral report:', error);
      throw error;
    }
  }

  // Export referral data
  async exportReferralData(exportConfig) {
    try {
      const response = await api.post(`${this.reportsURL}/export`, exportConfig, {
        responseType: exportConfig.format === 'json' ? 'json' : 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting referral data:', error);
      throw error;
    }
  }

  // ===== HELPER METHODS =====

  // Format analytics data for charts
  formatChartData(data, chartType) {
    switch (chartType) {
      case 'line':
        return this.formatLineChartData(data);
      case 'bar':
        return this.formatBarChartData(data);
      case 'pie':
        return this.formatPieChartData(data);
      case 'doughnut':
        return this.formatDoughnutChartData(data);
      case 'funnel':
        return this.formatFunnelChartData(data);
      case 'heatmap':
        return this.formatHeatmapChartData(data);
      default:
        return data;
    }
  }

  // Format data for line charts
  formatLineChartData(data) {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => ({
      x: item.date || item.label || item.name,
      y: item.value || item.count || item.amount
    }));
  }

  // Format data for bar charts
  formatBarChartData(data) {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => ({
      label: item.name || item.label || item.category,
      value: item.value || item.count || item.amount,
      color: item.color || this.getRandomColor()
    }));
  }

  // Format data for pie/doughnut charts
  formatPieChartData(data) {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => ({
      label: item.name || item.label || item.category,
      value: item.value || item.count || item.amount,
      color: item.color || this.getRandomColor()
    }));
  }

  // Format data for funnel charts
  formatFunnelChartData(data) {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map((item, index) => ({
      stage: item.stage || item.name || `Stage ${index + 1}`,
      value: item.value || item.count || item.amount,
      conversionRate: item.conversionRate || 0,
      dropoffRate: item.dropoffRate || 0
    }));
  }

  // Format data for heatmap charts
  formatHeatmapChartData(data) {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => ({
      x: item.x || item.category || item.name,
      y: item.y || item.value || item.count,
      value: item.value || item.count || item.amount
    }));
  }

  // Generate random colors for charts
  getRandomColor() {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Calculate percentage change between two values
  calculatePercentageChange(oldValue, newValue) {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
  }

  // Format currency values
  formatCurrency(amount, currency = 'SAR') {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // Format percentage values
  formatPercentage(value, decimals = 2) {
    return `${value.toFixed(decimals)}%`;
  }

  // Format large numbers with abbreviations
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  // Get trend indicator (up, down, stable)
  getTrendIndicator(currentValue, previousValue) {
    const change = this.calculatePercentageChange(previousValue, currentValue);
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
  }

  // Calculate moving average
  calculateMovingAverage(data, window = 7) {
    if (!data || data.length < window) return data;
    
    const result = [];
    for (let i = window - 1; i < data.length; i++) {
      const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / window);
    }
    return result;
  }

  // Group data by time period
  groupByTimePeriod(data, period = 'day') {
    if (!data || !Array.isArray(data)) return {};
    
    const grouped = {};
    data.forEach(item => {
      const date = new Date(item.date || item.createdAt);
      let key;
      
      switch (period) {
        case 'hour':
          key = date.toISOString().slice(0, 13);
          break;
        case 'day':
          key = date.toISOString().slice(0, 10);
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().slice(0, 10);
          break;
        case 'month':
          key = date.toISOString().slice(0, 7);
          break;
        default:
          key = date.toISOString().slice(0, 10);
      }
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });
    
    return grouped;
  }

  // Calculate summary statistics
  calculateSummaryStats(data, field) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { min: 0, max: 0, avg: 0, total: 0, count: 0 };
    }
    
    const values = data.map(item => item[field] || 0).filter(val => !isNaN(val));
    const total = values.reduce((sum, val) => sum + val, 0);
    const avg = total / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return { min, max, avg, total, count: values.length };
  }

  // Filter data by date range
  filterByDateRange(data, startDate, endDate) {
    if (!data || !Array.isArray(data)) return [];
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return data.filter(item => {
      const itemDate = new Date(item.date || item.createdAt);
      return itemDate >= start && itemDate <= end;
    });
  }

  // Sort data by field
  sortData(data, field, direction = 'asc') {
    if (!data || !Array.isArray(data)) return [];
    
    return [...data].sort((a, b) => {
      const aVal = a[field] || 0;
      const bVal = b[field] || 0;
      
      if (direction === 'asc') {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });
  }

  // Paginate data
  paginateData(data, page = 1, limit = 10) {
    if (!data || !Array.isArray(data)) return { data: [], pagination: {} };
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = data.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: data.length,
        totalPages: Math.ceil(data.length / limit),
        hasNext: endIndex < data.length,
        hasPrev: page > 1
      }
    };
  }

  // Export data to different formats
  async exportData(data, format = 'csv', filename = 'export') {
    switch (format) {
      case 'csv':
        return this.exportToCSV(data, filename);
      case 'json':
        return this.exportToJSON(data, filename);
      case 'excel':
        return this.exportToExcel(data, filename);
      default:
        return this.exportToCSV(data, filename);
    }
  }

  // Export to CSV
  exportToCSV(data, filename) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('No data to export');
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'object') {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          return `"${String(value || '').replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  }

  // Export to JSON
  exportToJSON(data, filename) {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.json`;
    link.click();
  }

  // Export to Excel (basic implementation)
  exportToExcel(data, filename) {
    // This would require a library like SheetJS or similar
    // For now, we'll fall back to CSV
    console.warn('Excel export not implemented, falling back to CSV');
    this.exportToCSV(data, filename);
  }
}

export default new AnalyticsService();
