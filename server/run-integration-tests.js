#!/usr/bin/env node

/**
 * LUDUS Platform - Integration Testing Runner
 * 
 * This script executes comprehensive integration testing for the LUDUS platform
 * covering all system components, user journeys, and cross-feature functionality.
 * 
 * Usage:
 *   node run-integration-tests.js [options]
 * 
 * Options:
 *   --scenarios <scenario1,scenario2>  Run specific scenarios only
 *   --format <json|csv|html>           Export format for results
 *   --output <filename>                Output filename for results
 *   --verbose                          Enable verbose logging
 *   --help                             Show help information
 */

const { 
  startIntegrationTestRun, 
  executeIntegrationScenario, 
  completeIntegrationTestRun, 
  getIntegrationScenarios 
} = require('./src/services/integrationTestService');

const fs = require('fs');
const path = require('path');

// Command line argument parsing
const args = process.argv.slice(2);
const options = {
  scenarios: null,
  format: 'json',
  output: null,
  verbose: false,
  help: false
};

// Parse command line arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  switch (arg) {
    case '--scenarios':
      options.scenarios = args[++i]?.split(',') || [];
      break;
    case '--format':
      options.format = args[++i] || 'json';
      break;
    case '--output':
      options.output = args[++i] || null;
      break;
    case '--verbose':
      options.verbose = true;
      break;
    case '--help':
      options.help = true;
      break;
    default:
      if (arg.startsWith('--')) {
        console.error(`Unknown option: ${arg}`);
        process.exit(1);
      }
  }
}

// Show help if requested
if (options.help) {
  console.log(`
LUDUS Platform - Integration Testing Runner

Usage: node run-integration-tests.js [options]

Options:
  --scenarios <scenario1,scenario2>  Run specific scenarios only
  --format <json|csv|html>           Export format for results
  --output <filename>                 Output filename for results
  --verbose                           Enable verbose logging
  --help                              Show this help information

Examples:
  node run-integration-tests.js                                    # Run all scenarios
  node run-integration-tests.js --scenarios systemIntegration,userJourneyIntegration  # Run specific scenarios
  node run-integration-tests.js --format html --output integration-report.html  # Export as HTML
  node run-integration-tests.js --verbose                           # Enable verbose logging

Available Scenarios:
  - systemIntegration: Core system integration testing
  - userJourneyIntegration: Complete user workflow testing
  - databaseIntegration: Database operations and consistency
  - apiIntegration: API endpoint and middleware testing
  - paymentIntegration: Payment system integration
  - contentIntegration: Content management integration
  - authIntegration: Authentication and authorization
  - performanceIntegration: Performance monitoring integration
  - mobileIntegration: Mobile functionality testing
  - i18nIntegration: Internationalization testing
  - errorHandlingIntegration: Error handling and recovery
`);
  process.exit(0);
}

// Integration Test Runner Class
class IntegrationTestRunner {
  constructor(options) {
    this.options = options;
    this.testRun = null;
    this.results = {};
    this.startTime = null;
    this.endTime = null;
    this.scenarios = getIntegrationScenarios();
  }

  // Log messages with timestamp
  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
    
    if (this.options.verbose || type === 'error' || type === 'warning') {
      console.log(`${prefix} [${timestamp}] ${message}`);
    }
  }

  // Display banner
  displayBanner() {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                🔗 LUDUS Platform Integration Test Runner 🔗                ║
║                                                                              ║
║  Comprehensive System Integration Testing for Production Readiness          ║
║  Testing all components working together seamlessly                         ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);
  }

  // Display test configuration
  displayConfiguration() {
    console.log(`
📋 Test Configuration:
   Scenarios: ${this.options.scenarios ? this.options.scenarios.join(', ') : 'All scenarios'}
   Format: ${this.options.format.toUpperCase()}
   Output: ${this.options.output || 'Console only'}
   Verbose: ${this.options.verbose ? 'Yes' : 'No'}

📊 Available Scenarios: ${Object.keys(this.scenarios).length}
🔗 Integration Focus: System components, user journeys, cross-feature functionality
`);
  }

  // Start integration test run
  async startTestRun() {
    try {
      this.log('Starting integration test run...', 'info');
      this.testRun = await startIntegrationTestRun();
      this.startTime = new Date();
      
      this.log(`✅ Integration test run started: ${this.testRun.id}`, 'success');
      return this.testRun;
      
    } catch (error) {
      this.log(`Failed to start integration test run: ${error.message}`, 'error');
      throw error;
    }
  }

  // Execute integration scenarios
  async executeScenarios() {
    const scenariosToRun = this.options.scenarios || Object.keys(this.scenarios);
    
    this.log(`Executing ${scenariosToRun.length} integration scenarios...`, 'info');
    
    for (const scenarioKey of scenariosToRun) {
      if (!this.scenarios[scenarioKey]) {
        this.log(`⚠️  Unknown scenario: ${scenarioKey}`, 'warning');
        continue;
      }
      
      try {
        this.log(`🧪 Executing integration scenario: ${this.scenarios[scenarioKey].name}`, 'info');
        
        const result = await executeIntegrationScenario(scenarioKey);
        this.results[scenarioKey] = result;
        
        const status = result.status === 'passed' ? '✅ PASSED' : 
                      result.status === 'failed' ? '❌ FAILED' : 
                      result.status === 'integration_issues' ? '🔗 INTEGRATION ISSUES' :
                      result.status === 'performance_issues' ? '⚡ PERFORMANCE ISSUES' :
                      result.status === 'reliability_issues' ? '🛡️  RELIABILITY ISSUES' : '❓ UNKNOWN';
        
        this.log(`   ${status} - ${result.scenarioName} (${result.duration}ms)`, 
                 result.status === 'passed' ? 'success' : 'warning');
        
        // Display detailed results if verbose
        if (this.options.verbose) {
          this.displayScenarioDetails(result);
        }
        
      } catch (error) {
        this.log(`❌ Failed to execute integration scenario ${scenarioKey}: ${error.message}`, 'error');
        this.results[scenarioKey] = {
          scenarioKey,
          status: 'failed',
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    }
  }

  // Display detailed scenario results
  displayScenarioDetails(result) {
    console.log(`   ├─ Tests: ${result.tests.length}`);
    console.log(`   ├─ Integration Score: ${result.integration?.score || 0}%`);
    console.log(`   ├─ Performance Score: ${result.performance?.score || 0}%`);
    console.log(`   └─ Reliability Score: ${result.reliability?.score || 0}%`);
    
    if (result.errors && result.errors.length > 0) {
      console.log(`   └─ Errors: ${result.errors.length}`);
      result.errors.forEach(error => {
        console.log(`      • ${error.error || error}`);
      });
    }
    
    if (result.warnings && result.warnings.length > 0) {
      console.log(`   └─ Warnings: ${result.warnings.length}`);
      result.warnings.forEach(warning => {
        console.log(`      • ${warning}`);
      });
    }
    
    if (result.recommendations && result.recommendations.length > 0) {
      console.log(`   └─ Recommendations: ${result.recommendations.length}`);
      result.recommendations.forEach(rec => {
        console.log(`      • ${rec}`);
      });
    }
  }

  // Complete test run
  async completeTestRun() {
    try {
      this.log('Completing integration test run...', 'info');
      this.testRun = await completeIntegrationTestRun();
      this.endTime = new Date();
      
      this.log(`✅ Integration test run completed: ${this.testRun.id}`, 'success');
      return this.testRun;
      
    } catch (error) {
      this.log(`Failed to complete integration test run: ${error.message}`, 'error');
      throw error;
    }
  }

  // Generate test summary
  generateSummary() {
    const totalScenarios = Object.keys(this.results).length;
    const passedScenarios = Object.values(this.results).filter(r => r.status === 'passed').length;
    const failedScenarios = Object.values(this.results).filter(r => r.status === 'failed').length;
    const integrationIssues = Object.values(this.results).filter(r => r.status === 'integration_issues').length;
    const performanceIssues = Object.values(this.results).filter(r => r.status === 'performance_issues').length;
    const reliabilityIssues = Object.values(this.results).filter(r => r.status === 'reliability_issues').length;
    
    const successRate = totalScenarios > 0 ? (passedScenarios / totalScenarios) * 100 : 0;
    const totalDuration = this.endTime - this.startTime;
    
    return {
      summary: {
        total: totalScenarios,
        passed: passedScenarios,
        failed: failedScenarios,
        integrationIssues,
        performanceIssues,
        reliabilityIssues,
        successRate: Math.round(successRate * 100) / 100,
        totalDuration: Math.round(totalDuration)
      },
      results: this.results
    };
  }

  // Display test summary
  displaySummary(summary) {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                        🏁 Integration Test Results 🏁                       ║
╚══════════════════════════════════════════════════════════════════════════════╝

📊 Test Summary:
   Total Scenarios: ${summary.summary.total}
   ✅ Passed: ${summary.summary.passed}
   ❌ Failed: ${summary.summary.failed}
   🔗 Integration Issues: ${summary.summary.integrationIssues}
   ⚡ Performance Issues: ${summary.summary.performanceIssues}
   🛡️  Reliability Issues: ${summary.summary.reliabilityIssues}
   
   Success Rate: ${summary.summary.successRate}%
   Total Duration: ${summary.summary.totalDuration}ms

🎯 Results by Scenario:
`);

    Object.entries(summary.results).forEach(([key, result]) => {
      const status = result.status === 'passed' ? '✅ PASSED' : 
                    result.status === 'failed' ? '❌ FAILED' : 
                    result.status === 'integration_issues' ? '🔗 INTEGRATION' :
                    result.status === 'performance_issues' ? '⚡ PERFORMANCE' :
                    result.status === 'reliability_issues' ? '🛡️  RELIABILITY' : '❓ UNKNOWN';
      
      console.log(`   ${status} - ${result.scenarioName || key}`);
    });

    // Display recommendations if available
    if (this.testRun && this.testRun.recommendations) {
      console.log(`
🔍 Recommendations:
`);
      this.testRun.recommendations.forEach(rec => {
        const priority = rec.priority === 'critical' ? '🚨' : 
                        rec.priority === 'high' ? '⚠️' : 
                        rec.priority === 'medium' ? 'ℹ️' : '💡';
        
        console.log(`   ${priority} ${rec.category.toUpperCase()}: ${rec.description}`);
        if (rec.actions) {
          rec.actions.forEach(action => {
            console.log(`      • ${action}`);
          });
        }
      });
    }

    // Final assessment
    console.log(`
🎯 Final Assessment:
`);
    
    if (summary.summary.successRate >= 95) {
      console.log(`   🎉 EXCELLENT: Platform integration is production-ready with ${summary.summary.successRate}% success rate`);
    } else if (summary.summary.successRate >= 85) {
      console.log(`   ✅ GOOD: Platform integration is mostly production-ready with ${summary.summary.successRate}% success rate`);
    } else if (summary.summary.successRate >= 70) {
      console.log(`   ⚠️  ACCEPTABLE: Platform integration needs improvements before production (${summary.summary.successRate}% success rate)`);
    } else {
      console.log(`   ❌ NEEDS WORK: Platform integration is not ready for production (${summary.summary.successRate}% success rate)`);
    }

    if (summary.summary.integrationIssues > 0) {
      console.log(`   🔗 CRITICAL: ${summary.summary.integrationIssues} integration issues must be resolved before production`);
    }

    if (summary.summary.reliabilityIssues > 0) {
      console.log(`   🛡️  CRITICAL: ${summary.summary.reliabilityIssues} reliability issues must be resolved before production`);
    }

    if (summary.summary.failed > 0) {
      console.log(`   ❌ CRITICAL: ${summary.summary.failed} failed scenarios must be resolved before production`);
    }
  }

  // Export results to file
  exportResults(summary) {
    if (!this.options.output) {
      return;
    }

    try {
      let content;
      let extension;
      
      switch (this.options.format.toLowerCase()) {
        case 'json':
          content = JSON.stringify(summary, null, 2);
          extension = 'json';
          break;
        case 'csv':
          content = this.convertToCSV(summary);
          extension = 'csv';
          break;
        case 'html':
          content = this.convertToHTML(summary);
          extension = 'html';
          break;
        default:
          this.log(`Unsupported export format: ${this.options.format}`, 'warning');
          return;
      }

      const filename = this.options.output.endsWith(`.${extension}`) 
        ? this.options.output 
        : `${this.options.output}.${extension}`;
      
      fs.writeFileSync(filename, content);
      this.log(`✅ Results exported to: ${filename}`, 'success');
      
    } catch (error) {
      this.log(`Failed to export results: ${error.message}`, 'error');
    }
  }

  // Convert results to CSV format
  convertToCSV(summary) {
    const csv = [];
    
    // Header
    csv.push('Scenario,Status,Duration,Integration Score,Performance Score,Reliability Score');
    
    // Data rows
    Object.entries(summary.results).forEach(([key, result]) => {
      csv.push([
        result.scenarioName || key,
        result.status,
        result.duration || 0,
        result.integration?.score || 0,
        result.performance?.score || 0,
        result.reliability?.score || 0
      ].join(','));
    });
    
    return csv.join('\n');
  }

  // Convert results to HTML format
  convertToHTML(summary) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>LUDUS Platform Integration Test Results</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
            .summary { background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
            .metric { background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            .metric-value { font-size: 2em; font-weight: bold; margin: 10px 0; }
            .scenario { border: 1px solid #ddd; margin: 15px 0; padding: 20px; border-radius: 8px; }
            .passed { border-left: 5px solid #4caf50; background: #f8fff8; }
            .failed { border-left: 5px solid #f44336; background: #fff8f8; }
            .integration_issues { border-left: 5px solid #2196f3; background: #f0f8ff; }
            .performance_issues { border-left: 5px solid #ff9800; background: #fffbf0; }
            .reliability_issues { border-left: 5px solid #e91e63; background: #fff0f5; }
            .status { font-weight: bold; padding: 5px 10px; border-radius: 15px; color: white; }
            .status.passed { background: #4caf50; }
            .status.failed { background: #f44336; }
            .status.integration_issues { background: #2196f3; }
            .status.performance_issues { background: #ff9800; }
            .status.reliability_issues { background: #e91e63; }
            .recommendations { background: #fff3cd; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .recommendation { margin: 10px 0; padding: 10px; background: white; border-radius: 5px; }
            .priority-critical { border-left: 5px solid #dc3545; }
            .priority-high { border-left: 5px solid #fd7e14; }
            .priority-medium { border-left: 5px solid #ffc107; }
            .priority-low { border-left: 5px solid #28a745; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔗 LUDUS Platform Integration Test Results</h1>
              <p>Comprehensive System Integration Testing Report</p>
              <p>Generated: ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="summary">
              <h2>📊 Test Summary</h2>
              <div class="metrics">
                <div class="metric">
                  <div class="metric-value">${summary.summary.total}</div>
                  <div>Total Scenarios</div>
                </div>
                <div class="metric">
                  <div class="metric-value">${summary.summary.passed}</div>
                  <div>✅ Passed</div>
                </div>
                <div class="metric">
                  <div class="metric-value">${summary.summary.failed}</div>
                  <div>❌ Failed</div>
                </div>
                <div class="metric">
                  <div class="metric-value">${summary.summary.successRate}%</div>
                  <div>Success Rate</div>
                </div>
              </div>
            </div>
            
            <h2>🎯 Test Scenarios</h2>
            ${Object.entries(summary.results).map(([key, result]) => `
              <div class="scenario ${result.status}">
                <h3>${result.scenarioName || key}</h3>
                <p><span class="status ${result.status}">${result.status.toUpperCase()}</span></p>
                <p><strong>Duration:</strong> ${result.duration || 0}ms</p>
                <div class="metrics">
                  <div class="metric">
                    <strong>Integration:</strong> ${result.integration?.score || 0}%
                  </div>
                  <div class="metric">
                    <strong>Performance:</strong> ${result.performance?.score || 0}%
                  </div>
                  <div class="metric">
                    <strong>Reliability:</strong> ${result.reliability?.score || 0}%
                  </div>
                </div>
              </div>
            `).join('')}
            
            ${this.testRun && this.testRun.recommendations ? `
              <div class="recommendations">
                <h2>🔍 Recommendations</h2>
                ${this.testRun.recommendations.map(rec => `
                  <div class="recommendation priority-${rec.priority}">
                    <h4>${rec.category.toUpperCase()} (${rec.priority.toUpperCase()})</h4>
                    <p>${rec.description}</p>
                    ${rec.actions ? `
                      <ul>
                        ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                      </ul>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            <div class="summary">
              <h2>🎯 Final Assessment</h2>
              ${summary.summary.successRate >= 95 ? 
                '<p>🎉 <strong>EXCELLENT:</strong> Platform integration is production-ready!</p>' :
                summary.summary.successRate >= 85 ? 
                '<p>✅ <strong>GOOD:</strong> Platform integration is mostly production-ready</p>' :
                summary.summary.successRate >= 70 ? 
                '<p>⚠️ <strong>ACCEPTABLE:</strong> Platform integration needs improvements before production</p>' :
                '<p>❌ <strong>NEEDS WORK:</strong> Platform integration is not ready for production</p>'
              }
              ${summary.summary.integrationIssues > 0 ? 
                `<p>🔗 <strong>CRITICAL:</strong> ${summary.summary.integrationIssues} integration issues must be resolved</p>` : ''
              }
              ${summary.summary.reliabilityIssues > 0 ? 
                `<p>🛡️ <strong>CRITICAL:</strong> ${summary.summary.reliabilityIssues} reliability issues must be resolved</p>` : ''
              }
              ${summary.summary.failed > 0 ? 
                `<p>❌ <strong>CRITICAL:</strong> ${summary.summary.failed} failed scenarios must be resolved</p>` : ''
              }
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Run complete integration testing
  async run() {
    try {
      this.displayBanner();
      this.displayConfiguration();
      
      // Start test run
      await this.startTestRun();
      
      // Execute scenarios
      await this.executeScenarios();
      
      // Complete test run
      await this.completeTestRun();
      
      // Generate and display summary
      const summary = this.generateSummary();
      this.displaySummary(summary);
      
      // Export results if requested
      this.exportResults(summary);
      
      this.log('Integration testing completed successfully!', 'success');
      
      // Exit with appropriate code
      if (summary.summary.failed > 0 || summary.summary.integrationIssues > 0 || summary.summary.reliabilityIssues > 0) {
        process.exit(1); // Exit with error code if critical issues found
      } else {
        process.exit(0); // Exit successfully
      }
      
    } catch (error) {
      this.log(`Integration testing failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  try {
    const runner = new IntegrationTestRunner(options);
    await runner.run();
  } catch (error) {
    console.error('❌ Integration Test Runner failed:', error.message);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = IntegrationTestRunner;