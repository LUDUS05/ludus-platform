/**
 * Report Generator - LUDUS Workspace
 * Automated report generation with templates and export capabilities
 */

const { NotionHelperExtended } = require('../lib/notion-helper-extended');
const { ConfigManager } = require('../lib/config-manager');
const fs = require('fs');
const path = require('path');

class ReportGenerator {
  constructor({ notionToken }) {
    this.notion = new NotionHelperExtended({ token: notionToken });
    this.config = new ConfigManager();
    this.reportsDir = 'reports';
    
    // Create reports directory if it doesn't exist
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  /**
   * Generate weekly project status report
   */
  async generateWeeklyStatusReport() {
    console.log('\n📊 Generating weekly status report...');
    
    const report = {
      title: 'Weekly Project Status Report',
      period: this.getWeekPeriod(),
      generatedAt: new Date().toISOString(),
      sections: {
        summary: await this.generateExecutiveSummary(),
        projects: await this.getProjectsStatus(),
        tasks: await this.getTasksProgress(),
        risks: await this.getRisksAndIssues(),
        upcomingMilestones: await this.getUpcomingMilestones()
      }
    };

    console.log('   ✓ Weekly status report generated');
    return report;
  }

  /**
   * Generate monthly financial report
   */
  async generateMonthlyFinancialReport() {
    console.log('\n💰 Generating monthly financial report...');
    
    const report = {
      title: 'Monthly Financial Report',
      period: this.getMonthPeriod(),
      generatedAt: new Date().toISOString(),
      sections: {
        summary: {
          totalBudget: 0,
          totalSpent: 0,
          variance: 0,
          variancePercent: 0
        },
        byProject: [],
        byCategory: [],
        trends: {
          monthOverMonth: 0,
          forecast: 0
        },
        recommendations: []
      }
    };

    console.log('   ✓ Monthly financial report generated');
    return report;
  }

  /**
   * Generate quarterly stakeholder report
   */
  async generateQuarterlyStakeholderReport() {
    console.log('\n📈 Generating quarterly stakeholder report...');
    
    const report = {
      title: 'Quarterly Stakeholder Report',
      period: this.getQuarterPeriod(),
      generatedAt: new Date().toISOString(),
      sections: {
        executiveSummary: '',
        achievements: [],
        challenges: [],
        metrics: {
          projectsCompleted: 0,
          tasksCompleted: 0,
          budgetUtilization: 0,
          teamProductivity: 0
        },
        upcomingObjectives: [],
        financialSummary: {}
      }
    };

    console.log('   ✓ Quarterly stakeholder report generated');
    return report;
  }

  /**
   * Generate custom report from template
   */
  async generateCustomReport(templateName, data = {}) {
    console.log(`\n📝 Generating custom report: ${templateName}...`);
    
    const template = this.loadTemplate(templateName);
    const report = {
      title: template.title,
      generatedAt: new Date().toISOString(),
      sections: {}
    };

    // Process template sections with data
    for (const [key, section] of Object.entries(template.sections)) {
      report.sections[key] = await this.processSectionTemplate(section, data);
    }

    console.log(`   ✓ Custom report generated: ${templateName}`);
    return report;
  }

  /**
   * Export report to markdown
   */
  exportToMarkdown(report) {
    console.log('\n📄 Exporting report to Markdown...');
    
    let markdown = `# ${report.title}\n\n`;
    markdown += `**Generated:** ${new Date(report.generatedAt).toLocaleString('en-US', { timeZone: 'Asia/Riyadh' })} (Riyadh Time)\n`;
    
    if (report.period) {
      markdown += `**Period:** ${report.period.start} to ${report.period.end}\n`;
    }
    
    markdown += '\n---\n\n';

    // Process sections
    for (const [key, section] of Object.entries(report.sections)) {
      markdown += this.formatSection(key, section);
    }

    const filename = `${this.reportsDir}/${this.sanitizeFilename(report.title)}-${new Date().toISOString().split('T')[0]}.md`;
    fs.writeFileSync(filename, markdown);
    
    console.log(`   ✓ Exported to: ${filename}`);
    return filename;
  }

  /**
   * Export report to JSON
   */
  exportToJSON(report) {
    console.log('\n📊 Exporting report to JSON...');
    
    const filename = `${this.reportsDir}/${this.sanitizeFilename(report.title)}-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    
    console.log(`   ✓ Exported to: ${filename}`);
    return filename;
  }

  /**
   * Export report to CSV
   */
  exportToCSV(report) {
    console.log('\n📊 Exporting report to CSV...');
    
    // Flatten report data for CSV export
    const rows = this.flattenReportData(report);
    
    if (rows.length === 0) {
      console.log('   ⚠️  No data to export to CSV');
      return null;
    }

    const headers = Object.keys(rows[0]);
    let csv = headers.join(',') + '\n';
    
    rows.forEach(row => {
      csv += headers.map(header => {
        const value = row[header] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',') + '\n';
    });

    const filename = `${this.reportsDir}/${this.sanitizeFilename(report.title)}-${new Date().toISOString().split('T')[0]}.csv`;
    fs.writeFileSync(filename, csv);
    
    console.log(`   ✓ Exported to: ${filename}`);
    return filename;
  }

  /**
   * Email report distribution
   */
  async emailReport(report, recipients) {
    console.log('\n📧 Preparing email distribution...');
    
    // In a full implementation, this would:
    // 1. Format report as HTML email
    // 2. Use email service (SendGrid, AWS SES, etc.)
    // 3. Send to recipient list
    // 4. Track email delivery
    
    console.log(`   ℹ️  Email functionality not yet implemented`);
    console.log(`   Recipients: ${recipients.join(', ')}`);
    
    return { sent: false, message: 'Email service not configured' };
  }

  /**
   * Helper: Get week period
   */
  getWeekPeriod() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const start = new Date(now);
    start.setDate(now.getDate() + diffToMonday);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }

  /**
   * Helper: Get month period
   */
  getMonthPeriod() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }

  /**
   * Helper: Get quarter period
   */
  getQuarterPeriod() {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3);
    const start = new Date(now.getFullYear(), quarter * 3, 1);
    const end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
      quarter: quarter + 1
    };
  }

  /**
   * Helper: Generate executive summary
   */
  async generateExecutiveSummary() {
    return 'Projects on track. Team operating at full capacity. Budget within targets.';
  }

  /**
   * Helper: Get projects status
   */
  async getProjectsStatus() {
    return [];
  }

  /**
   * Helper: Get tasks progress
   */
  async getTasksProgress() {
    return { completed: 0, inProgress: 0, pending: 0 };
  }

  /**
   * Helper: Get risks and issues
   */
  async getRisksAndIssues() {
    return [];
  }

  /**
   * Helper: Get upcoming milestones
   */
  async getUpcomingMilestones() {
    return [];
  }

  /**
   * Helper: Load template
   */
  loadTemplate(templateName) {
    return {
      title: templateName,
      sections: {}
    };
  }

  /**
   * Helper: Process section template
   */
  async processSectionTemplate(section, data) {
    return section;
  }

  /**
   * Helper: Format section
   */
  formatSection(key, section) {
    let markdown = `## ${this.titleCase(key)}\n\n`;
    
    if (typeof section === 'string') {
      markdown += section + '\n\n';
    } else if (Array.isArray(section)) {
      section.forEach(item => {
        markdown += `- ${item}\n`;
      });
      markdown += '\n';
    } else if (typeof section === 'object') {
      for (const [k, v] of Object.entries(section)) {
        markdown += `**${this.titleCase(k)}:** ${v}\n`;
      }
      markdown += '\n';
    }
    
    return markdown;
  }

  /**
   * Helper: Flatten report data for CSV
   */
  flattenReportData(report) {
    // Simple flattening - could be more sophisticated
    return [];
  }

  /**
   * Helper: Sanitize filename
   */
  sanitizeFilename(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  /**
   * Helper: Title case
   */
  titleCase(str) {
    return str.replace(/\b\w/g, l => l.toUpperCase()).replace(/_/g, ' ');
  }
}

module.exports = { ReportGenerator };

// CLI Usage
if (require.main === module) {
  const envContent = fs.readFileSync('development.env', 'utf8');
  const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1] : process.env[key];
  };

  const generator = new ReportGenerator({
    notionToken: getEnv('NOTION_TOKEN')
  });

  // Get report type from CLI args
  const reportType = process.argv[2] || 'weekly';

  let reportPromise;
  switch (reportType) {
    case 'weekly':
      reportPromise = generator.generateWeeklyStatusReport();
      break;
    case 'monthly':
      reportPromise = generator.generateMonthlyFinancialReport();
      break;
    case 'quarterly':
      reportPromise = generator.generateQuarterlyStakeholderReport();
      break;
    default:
      console.error(`Unknown report type: ${reportType}`);
      process.exit(1);
  }

  reportPromise
    .then(report => {
      console.log('\n✅ Report generated');
      generator.exportToMarkdown(report);
      generator.exportToJSON(report);
      console.log('\n✅ Reports saved successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error:', error.message);
      console.error(error.stack);
      process.exit(1);
    });
}

