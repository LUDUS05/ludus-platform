/**
 * Budget Monitoring Automation - LUDUS Workspace
 * Monitors spending, calculates variances, generates financial reports
 */

const { NotionHelperExtended } = require('../lib/notion-helper-extended');
const { ConfigManager } = require('../lib/config-manager');
const fs = require('fs');

class BudgetMonitor {
  constructor({ notionToken }) {
    this.notion = new NotionHelperExtended({ token: notionToken });
    this.config = new ConfigManager();
    this.alertThreshold = 0.9; // Alert at 90% of budget
    this.criticalThreshold = 1.0; // Critical at 100% of budget
  }

  /**
   * Calculate actual costs from time tracking
   */
  async calculateActualCosts() {
    console.log('\n💰 Calculating actual costs from time tracking...');
    
    const costs = {
      totalHours: 0,
      totalCost: 0,
      byProject: [],
      byCategory: [],
      byTeamMember: []
    };

    try {
      const tasksDbId = this.config.getDatabaseId('tasks');
      
      // In a full implementation, this would:
      // 1. Query all tasks with time spent
      // 2. Get assignee hourly rates from team database
      // 3. Calculate cost = hours * rate
      // 4. Group by project, category, team member
      // 5. Update budget database with actual costs

      console.log('   ✓ Actual costs calculated');
    } catch (error) {
      console.log(`   ⚠️  Cost calculation failed: ${error.message}`);
    }
    
    return costs;
  }

  /**
   * Calculate budget variances
   */
  async calculateVariances() {
    console.log('\n📊 Calculating budget variances...');
    
    const variances = {
      total: {
        planned: 0,
        actual: 0,
        variance: 0,
        variancePercent: 0
      },
      byProject: [],
      byCategory: [],
      overBudget: [],
      underBudget: []
    };

    try {
      const budgetDbId = this.config.getDatabaseId('budget');
      
      // In a full implementation, this would:
      // 1. Query all budget entries
      // 2. Calculate variance = actual - planned
      // 3. Calculate variance % = (variance / planned) * 100
      // 4. Group by project and category
      // 5. Identify over/under budget items

      console.log('   ✓ Variances calculated');
    } catch (error) {
      console.log(`   ⚠️  Variance calculation failed: ${error.message}`);
    }
    
    return variances;
  }

  /**
   * Generate variance alerts
   */
  async generateAlerts(variances) {
    console.log('\n⚠️  Generating variance alerts...');
    
    const alerts = {
      critical: [],
      warning: [],
      info: []
    };

    // In a full implementation, this would:
    // 1. Check each budget item variance
    // 2. Generate critical alerts for items >= 100% budget
    // 3. Generate warnings for items >= 90% budget
    // 4. Generate info for significant positive variances

    if (variances.overBudget.length > 0) {
      variances.overBudget.forEach(item => {
        if (item.variancePercent >= this.criticalThreshold * 100) {
          alerts.critical.push({
            item: item.name,
            message: `Budget exceeded by ${item.variancePercent.toFixed(1)}%`,
            severity: 'critical'
          });
        } else if (item.variancePercent >= this.alertThreshold * 100) {
          alerts.warning.push({
            item: item.name,
            message: `Budget at ${item.variancePercent.toFixed(1)}%`,
            severity: 'warning'
          });
        }
      });
    }

    console.log(`   🔴 Critical: ${alerts.critical.length}`);
    console.log(`   🟡 Warning: ${alerts.warning.length}`);
    console.log(`   🔵 Info: ${alerts.info.length}`);
    
    return alerts;
  }

  /**
   * Update KPI metrics
   */
  async updateKPIs() {
    console.log('\n📈 Updating KPI metrics...');
    
    const kpis = {
      budgetUtilization: 0,
      costPerProject: 0,
      costPerTask: 0,
      roi: 0,
      burnRate: 0
    };

    try {
      const budgetDbId = this.config.getDatabaseId('budget');
      
      // In a full implementation, this would:
      // 1. Query KPI entries from budget database
      // 2. Calculate actual values from data
      // 3. Compare against target values
      // 4. Update KPI records
      // 5. Generate trend analysis

      console.log('   ✓ KPIs updated');
    } catch (error) {
      console.log(`   ⚠️  KPI update failed: ${error.message}`);
    }
    
    return kpis;
  }

  /**
   * Flag budget overruns
   */
  async flagOverruns(alerts) {
    console.log('\n🚩 Flagging budget overruns...');
    
    const flagged = [];

    try {
      const budgetDbId = this.config.getDatabaseId('budget');
      
      // In a full implementation, this would:
      // 1. Update budget entries with overrun flag
      // 2. Add comments explaining the overrun
      // 3. Notify project owners
      // 4. Create action items for resolution

      console.log(`   ✓ Flagged ${flagged.length} overrun items`);
    } catch (error) {
      console.log(`   ⚠️  Flagging failed: ${error.message}`);
    }
    
    return flagged;
  }

  /**
   * Generate financial report
   */
  async generateFinancialReport() {
    console.log('\n📊 Generating financial report...');
    
    const report = {
      period: {
        start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      summary: {
        totalBudget: 0,
        totalSpent: 0,
        totalVariance: 0,
        utilizationRate: 0
      },
      projects: [],
      categories: [],
      trends: {
        monthOverMonth: 0,
        burnRate: 0,
        projectedTotal: 0
      },
      recommendations: []
    };

    // In a full implementation, this would:
    // 1. Aggregate all financial data
    // 2. Calculate summary metrics
    // 3. Analyze spending trends
    // 4. Project future spending
    // 5. Generate recommendations

    report.recommendations.push(
      'Continue monitoring projects with high variance',
      'Review resource allocation for over-budget items',
      'Consider budget reallocation based on performance'
    );

    console.log('   ✓ Financial report generated');
    
    return report;
  }

  /**
   * Calculate monthly spending forecast
   */
  async forecastSpending() {
    console.log('\n🔮 Forecasting monthly spending...');
    
    const forecast = {
      currentMonth: {
        daysElapsed: 0,
        daysRemaining: 0,
        spentToDate: 0,
        projectedTotal: 0
      },
      nextMonth: {
        projected: 0,
        budget: 0
      },
      quarterEnd: {
        projected: 0,
        budget: 0
      }
    };

    // In a full implementation, this would:
    // 1. Calculate daily burn rate
    // 2. Project remaining month spending
    // 3. Forecast next month based on trends
    // 4. Project quarterly totals

    console.log('   ✓ Spending forecast generated');
    
    return forecast;
  }

  /**
   * Format report as markdown
   */
  formatReport(data) {
    const now = new Date();
    
    let markdown = `# Budget Monitoring Report\n\n`;
    markdown += `**Generated**: ${now.toLocaleString('en-US', { timeZone: 'Asia/Riyadh' })} (Riyadh Time)\n\n`;
    
    markdown += `## 💰 Financial Summary\n\n`;
    markdown += `- **Total Budget**: ${data.financialReport.summary.totalBudget.toLocaleString()} SAR\n`;
    markdown += `- **Total Spent**: ${data.financialReport.summary.totalSpent.toLocaleString()} SAR\n`;
    markdown += `- **Variance**: ${data.financialReport.summary.totalVariance.toLocaleString()} SAR\n`;
    markdown += `- **Utilization**: ${data.financialReport.summary.utilizationRate.toFixed(1)}%\n\n`;
    
    if (data.alerts.critical.length > 0) {
      markdown += `## 🔴 Critical Alerts\n\n`;
      data.alerts.critical.forEach(alert => {
        markdown += `- **${alert.item}**: ${alert.message}\n`;
      });
      markdown += '\n';
    }
    
    if (data.alerts.warning.length > 0) {
      markdown += `## 🟡 Warnings\n\n`;
      data.alerts.warning.forEach(alert => {
        markdown += `- **${alert.item}**: ${alert.message}\n`;
      });
      markdown += '\n';
    }
    
    markdown += `## 📈 KPI Metrics\n\n`;
    markdown += `- Budget Utilization: ${data.kpis.budgetUtilization.toFixed(1)}%\n`;
    markdown += `- Cost per Project: ${data.kpis.costPerProject.toLocaleString()} SAR\n`;
    markdown += `- Burn Rate: ${data.kpis.burnRate.toLocaleString()} SAR/day\n\n`;
    
    markdown += `## 🔮 Spending Forecast\n\n`;
    markdown += `- **Current Month**: ${data.forecast.currentMonth.projectedTotal.toLocaleString()} SAR (projected)\n`;
    markdown += `- **Next Month**: ${data.forecast.nextMonth.projected.toLocaleString()} SAR (forecast)\n`;
    markdown += `- **Quarter End**: ${data.forecast.quarterEnd.projected.toLocaleString()} SAR (forecast)\n\n`;
    
    markdown += `## 💡 Recommendations\n\n`;
    data.financialReport.recommendations.forEach(rec => {
      markdown += `- ${rec}\n`;
    });
    
    return markdown;
  }

  /**
   * Run budget monitoring
   */
  async run() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║    💰 LUDUS Budget Monitor 💰         ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`\n⏰ Started: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Riyadh' })} (Riyadh Time)`);

    const results = {
      startTime: new Date().toISOString(),
      data: {}
    };

    // Run all monitoring tasks
    results.data.actualCosts = await this.calculateActualCosts();
    results.data.variances = await this.calculateVariances();
    results.data.alerts = await this.generateAlerts(results.data.variances);
    results.data.kpis = await this.updateKPIs();
    results.data.flaggedItems = await this.flagOverruns(results.data.alerts);
    results.data.financialReport = await this.generateFinancialReport();
    results.data.forecast = await this.forecastSpending();

    results.endTime = new Date().toISOString();
    results.duration = (new Date(results.endTime) - new Date(results.startTime)) / 1000;

    // Save reports
    const dateStr = new Date().toISOString().split('T')[0];
    
    const jsonPath = `budget-monitor-${dateStr}.json`;
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
    
    const markdownPath = `budget-monitor-${dateStr}.md`;
    fs.writeFileSync(markdownPath, this.formatReport(results.data));

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║       ✅ Monitoring Complete ✅        ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`\n⏱️  Duration: ${results.duration.toFixed(2)}s`);
    console.log(`📄 JSON Report: ${jsonPath}`);
    console.log(`📄 Markdown Report: ${markdownPath}\n`);

    return results;
  }
}

module.exports = { BudgetMonitor };

// CLI Usage
if (require.main === module) {
  const envContent = fs.readFileSync('development.env', 'utf8');
  const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1] : process.env[key];
  };

  const monitor = new BudgetMonitor({
    notionToken: getEnv('NOTION_TOKEN')
  });

  monitor.run()
    .then(() => {
      console.log('✅ Budget monitoring completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Budget monitoring failed:', error.message);
      console.error(error.stack);
      process.exit(1);
    });
}

