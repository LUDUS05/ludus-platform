const Referral = require('../models/Referral');
const ReferralCode = require('../models/ReferralCode');
const ReferralConversion = require('../models/ReferralConversion');
const Invitation = require('../models/Invitation');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Notification = require('../models/Notification');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// @desc    Generate comprehensive referral report
// @route   POST /api/reports/generate
// @access  Private (Admin)
const generateReferralReport = async (req, res) => {
  try {
    const {
      reportType = 'comprehensive',
      period = '30d',
      referrerId,
      format = 'json',
      includeCharts = true
    } = req.body;

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

    const query = { createdAt: { $gte: startDate, $lte: endDate } };
    if (referrerId) query.referrerId = referrerId;

    let reportData = {};

    switch (reportType) {
      case 'comprehensive':
        reportData = await generateComprehensiveReport(query, period, includeCharts);
        break;
      case 'funnel':
        reportData = await generateFunnelReport(query, period, includeCharts);
        break;
      case 'geographic':
        reportData = await generateGeographicReport(query, period, includeCharts);
        break;
      case 'roi':
        reportData = await generateROIReport(query, period, includeCharts);
        break;
      case 'performance':
        reportData = await generatePerformanceReport(query, period, includeCharts);
        break;
      default:
        reportData = await generateComprehensiveReport(query, period, includeCharts);
    }

    // Add report metadata
    reportData.metadata = {
      reportType,
      period,
      dateRange: { startDate, endDate },
      generatedAt: new Date(),
      generatedBy: req.user.userId,
      filters: { referrerId }
    };

    if (format === 'excel') {
      const excelBuffer = await generateExcelReport(reportData, reportType);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=referral-report-${reportType}-${period}.xlsx`);
      res.send(excelBuffer);
    } else if (format === 'pdf') {
      const pdfBuffer = await generatePDFReport(reportData, reportType);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=referral-report-${reportType}-${period}.pdf`);
      res.send(pdfBuffer);
    } else {
      res.status(200).json({
        success: true,
        data: reportData
      });
    }
  } catch (error) {
    console.error('Error generating referral report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate referral report',
      error: error.message
    });
  }
};

// @desc    Export referral data in various formats
// @route   POST /api/reports/export
// @access  Private (Admin)
const exportReferralData = async (req, res) => {
  try {
    const {
      dataType = 'referrals',
      format = 'csv',
      period = '30d',
      referrerId,
      filters = {}
    } = req.body;

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

    const query = { createdAt: { $gte: startDate, $lte: endDate }, ...filters };
    if (referrerId) query.referrerId = referrerId;

    let data = [];
    let filename = '';

    switch (dataType) {
      case 'referrals':
        data = await exportReferralsData(query);
        filename = 'referrals';
        break;
      case 'conversions':
        data = await exportConversionsData(query);
        filename = 'conversions';
        break;
      case 'invitations':
        data = await exportInvitationsData(query);
        filename = 'invitations';
        break;
      case 'users':
        data = await exportUsersData(query);
        filename = 'users';
        break;
      case 'wallet':
        data = await exportWalletData(query);
        filename = 'wallet';
        break;
      default:
        data = await exportReferralsData(query);
        filename = 'referrals';
    }

    if (format === 'excel') {
      const excelBuffer = await generateExcelExport(data, filename);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}-${period}.xlsx`);
      res.send(excelBuffer);
    } else if (format === 'csv') {
      const csvContent = generateCSVExport(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}-${period}.csv`);
      res.send(csvContent);
    } else {
      res.status(200).json({
        success: true,
        data: {
          totalRecords: data.length,
          period,
          dateRange: { startDate, endDate },
          records: data
        }
      });
    }
  } catch (error) {
    console.error('Error exporting referral data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export referral data',
      error: error.message
    });
  }
};

// @desc    Get report templates
// @route   GET /api/reports/templates
// @access  Private (Admin)
const getReportTemplates = async (req, res) => {
  try {
    const templates = [
      {
        id: 'comprehensive',
        name: 'Comprehensive Referral Report',
        description: 'Complete overview of referral system performance',
        sections: ['overview', 'funnel', 'geographic', 'roi', 'performance'],
        periodOptions: ['7d', '30d', '90d', '1y'],
        formatOptions: ['json', 'excel', 'pdf']
      },
      {
        id: 'funnel',
        name: 'Conversion Funnel Report',
        description: 'Detailed analysis of user conversion through the referral funnel',
        sections: ['funnel-stages', 'dropoff-analysis', 'conversion-velocity'],
        periodOptions: ['7d', '30d', '90d', '1y'],
        formatOptions: ['json', 'excel', 'pdf']
      },
      {
        id: 'geographic',
        name: 'Geographic Performance Report',
        description: 'Regional analysis of referral performance and user distribution',
        sections: ['country-analysis', 'city-breakdown', 'heatmap-data'],
        periodOptions: ['7d', '30d', '90d', '1y'],
        formatOptions: ['json', 'excel', 'pdf']
      },
      {
        id: 'roi',
        name: 'ROI & Performance Report',
        description: 'Return on investment analysis and cost-benefit metrics',
        sections: ['roi-metrics', 'cost-analysis', 'revenue-attribution'],
        periodOptions: ['7d', '30d', '90d', '1y'],
        formatOptions: ['json', 'excel', 'pdf']
      },
      {
        id: 'performance',
        name: 'Performance Metrics Report',
        description: 'Key performance indicators and trend analysis',
        sections: ['kpis', 'trends', 'benchmarks', 'recommendations'],
        periodOptions: ['7d', '30d', '90d', '1y'],
        formatOptions: ['json', 'excel', 'pdf']
      }
    ];

    res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error getting report templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get report templates',
      error: error.message
    });
  }
};

// Helper functions for report generation
async function generateComprehensiveReport(query, period, includeCharts) {
  const [
    overview,
    funnel,
    geographic,
    roi,
    performance
  ] = await Promise.all([
    generateOverviewSection(query, period),
    generateFunnelSection(query, period),
    generateGeographicSection(query, period),
    generateROISection(query, period),
    generatePerformanceSection(query, period)
  ]);

  return {
    overview,
    funnel,
    geographic,
    roi,
    performance,
    summary: generateExecutiveSummary(overview, roi, performance)
  };
}

async function generateOverviewSection(query, period) {
  const [totalReferrals, totalConversions, totalRevenue, activeReferrers] = await Promise.all([
    Referral.countDocuments(query),
    ReferralConversion.countDocuments(query),
    ReferralConversion.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$businessMetrics.revenueImpact' } } }
    ]),
    ReferralCode.countDocuments({ ...query, isActive: true })
  ]);

  return {
    totalReferrals,
    totalConversions,
    totalRevenue: totalRevenue[0]?.total || 0,
    activeReferrers,
    conversionRate: totalReferrals > 0 ? (totalConversions / totalReferrals) * 100 : 0,
    averageRevenuePerReferral: totalReferrals > 0 ? (totalRevenue[0]?.total || 0) / totalReferrals : 0
  };
}

async function generateFunnelSection(query, period) {
  const funnelData = await ReferralConversion.getFunnelAnalytics(query.referrerId, period);
  const dropoffAnalysis = await analyzeDropoffs(query);
  
  return {
    funnelStages: funnelData,
    dropoffAnalysis,
    conversionVelocity: await calculateConversionVelocity(query),
    funnelEfficiency: calculateFunnelEfficiency(funnelData)
  };
}

async function generateGeographicSection(query, period) {
  const countryAnalytics = await ReferralConversion.getGeographicAnalytics(query.referrerId, period);
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

  return {
    countryAnalytics,
    cityAnalytics,
    topCountries: countryAnalytics.slice(0, 10),
    geographicDistribution: calculateGeographicDistribution(countryAnalytics)
  };
}

async function generateROISection(query, period) {
  const roiData = await calculateROI(query);
  const costAnalysis = await calculateCostAnalysis(query);
  const revenueAttribution = await calculateRevenueAttribution(query);

  return {
    ...roiData,
    costAnalysis,
    revenueAttribution,
    recommendations: generateROIRecommendations(roiData, costAnalysis)
  };
}

async function generatePerformanceSection(query, period) {
  const timeSeriesData = await getTimeSeriesData(query, 'day');
  const sourcePerformance = await ReferralConversion.getSourcePerformance(query.referrerId, period);
  const trends = analyzeTrends(timeSeriesData);

  return {
    timeSeries: timeSeriesData,
    sourcePerformance,
    trends,
    benchmarks: await getPerformanceBenchmarks(period),
    recommendations: generatePerformanceRecommendations(trends, sourcePerformance)
  };
}

// Helper functions for data export
async function exportReferralsData(query) {
  return await Referral.find(query)
    .populate('referrerId', 'firstName lastName email')
    .populate('referredUserId', 'firstName lastName email')
    .lean();
}

async function exportConversionsData(query) {
  return await ReferralConversion.find(query)
    .populate('referrerId', 'firstName lastName email')
    .populate('referredUserId', 'firstName lastName email')
    .lean();
}

async function exportInvitationsData(query) {
  return await Invitation.find(query)
    .populate('referrerId', 'firstName lastName email')
    .populate('activityId', 'title category')
    .lean();
}

async function exportUsersData(query) {
  return await User.find(query)
    .select('firstName lastName email referralCode referralStats createdAt')
    .lean();
}

async function exportWalletData(query) {
  return await Wallet.find(query)
    .populate('userId', 'firstName lastName email')
    .lean();
}

// Excel export generation
async function generateExcelReport(reportData, reportType) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Referral Report');

  // Add headers and data based on report type
  switch (reportType) {
    case 'comprehensive':
      addComprehensiveReportToExcel(worksheet, reportData);
      break;
    case 'funnel':
      addFunnelReportToExcel(worksheet, reportData);
      break;
    case 'geographic':
      addGeographicReportToExcel(worksheet, reportData);
      break;
    case 'roi':
      addROIReportToExcel(worksheet, reportData);
      break;
    case 'performance':
      addPerformanceReportToExcel(worksheet, reportData);
      break;
  }

  return await workbook.xlsx.writeBuffer();
}

// PDF export generation
async function generatePDFReport(reportData, reportType) {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    // Add content based on report type
    switch (reportType) {
      case 'comprehensive':
        addComprehensiveReportToPDF(doc, reportData);
        break;
      case 'funnel':
        addFunnelReportToPDF(doc, reportData);
        break;
      case 'geographic':
        addGeographicReportToPDF(doc, reportData);
        break;
      case 'roi':
        addROIReportToPDF(doc, reportData);
        break;
      case 'performance':
        addPerformanceReportToPDF(doc, reportData);
        break;
    }

    doc.end();
  });
}

// CSV export generation
function generateCSVExport(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      if (typeof value === 'object') {
        return JSON.stringify(value).replace(/"/g, '""');
      }
      return `"${String(value || '').replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
}

// Additional helper functions (implementations would go here)
function generateExecutiveSummary(overview, roi, performance) {
  return {
    keyInsights: [
      `Total referrals: ${overview.totalReferrals}`,
      `Conversion rate: ${overview.conversionRate.toFixed(2)}%`,
      `Total revenue: ${overview.totalRevenue}`,
      `ROI: ${roi.roi.toFixed(2)}%`
    ],
    recommendations: [
      'Focus on improving conversion rates in the middle funnel stages',
      'Optimize referral sources with highest engagement scores',
      'Consider increasing rewards for high-performing referrers'
    ]
  };
}

function calculateFunnelEfficiency(funnelData) {
  // Implementation for funnel efficiency calculation
  return {
    efficiency: 0,
    bottlenecks: [],
    optimizationOpportunities: []
  };
}

function calculateGeographicDistribution(countryAnalytics) {
  // Implementation for geographic distribution calculation
  return {
    distribution: [],
    hotspots: [],
    expansionOpportunities: []
  };
}

function analyzeTrends(timeSeriesData) {
  // Implementation for trend analysis
  return {
    trends: [],
    seasonality: [],
    forecasts: []
  };
}

// Excel helper functions (implementations would go here)
function addComprehensiveReportToExcel(worksheet, reportData) {
  // Implementation for adding comprehensive report to Excel
}

function addFunnelReportToExcel(worksheet, reportData) {
  // Implementation for adding funnel report to Excel
}

function addGeographicReportToExcel(worksheet, reportData) {
  // Implementation for adding geographic report to Excel
}

function addROIReportToExcel(worksheet, reportData) {
  // Implementation for adding ROI report to Excel
}

function addPerformanceReportToExcel(worksheet, reportData) {
  // Implementation for adding performance report to Excel
}

// PDF helper functions (implementations would go here)
function addComprehensiveReportToPDF(doc, reportData) {
  // Implementation for adding comprehensive report to PDF
}

function addFunnelReportToPDF(doc, reportData) {
  // Implementation for adding funnel report to PDF
}

function addGeographicReportToPDF(doc, reportData) {
  // Implementation for adding geographic report to PDF
}

function addROIReportToPDF(doc, reportData) {
  // Implementation for adding ROI report to PDF
}

function addPerformanceReportToPDF(doc, reportData) {
  // Implementation for adding performance report to PDF
}

// Additional helper functions (implementations would go here)
async function analyzeDropoffs(query) {
  // Implementation for dropoff analysis
  return [];
}

async function calculateConversionVelocity(query) {
  // Implementation for conversion velocity calculation
  return [];
}

async function calculateCostAnalysis(query) {
  // Implementation for cost analysis
  return {};
}

async function calculateRevenueAttribution(query) {
  // Implementation for revenue attribution
  return {};
}

async function getPerformanceBenchmarks(period) {
  // Implementation for performance benchmarks
  return {};
}

function generateROIRecommendations(roiData, costAnalysis) {
  // Implementation for ROI recommendations
  return [];
}

function generatePerformanceRecommendations(trends, sourcePerformance) {
  // Implementation for performance recommendations
  return [];
}

async function getTimeSeriesData(query, groupBy) {
  // Implementation for time series data
  return [];
}

module.exports = {
  generateReferralReport,
  exportReferralData,
  getReportTemplates
};
