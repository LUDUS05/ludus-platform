const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { 
  startIntegrationTestRun, 
  executeIntegrationScenario, 
  completeIntegrationTestRun, 
  getIntegrationTestResults, 
  getIntegrationScenarios 
} = require('../services/integrationTestService');

// Get all available integration test scenarios
router.get('/scenarios', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const scenarios = getIntegrationScenarios();
    
    res.json({
      success: true,
      data: {
        total: Object.keys(scenarios).length,
        scenarios: scenarios
      }
    });
    
  } catch (error) {
    console.error('Error getting integration scenarios:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve integration scenarios'
    });
  }
});

// Start a new integration test run
router.post('/start', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { testRunId } = req.body;
    const testRun = await startIntegrationTestRun(testRunId);
    
    res.json({
      success: true,
      message: 'Integration test run started successfully',
      data: testRun
    });
    
  } catch (error) {
    console.error('Error starting integration test run:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start integration test run'
    });
  }
});

// Execute a specific integration test scenario
router.post('/execute/:scenario', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { scenario } = req.params;
    const { testData } = req.body;
    
    const result = await executeIntegrationScenario(scenario, testData || {});
    
    res.json({
      success: true,
      message: `Integration scenario '${scenario}' executed successfully`,
      data: result
    });
    
  } catch (error) {
    console.error('Error executing integration scenario:', error);
    res.status(500).json({
      success: false,
      error: `Failed to execute integration scenario: ${error.message}`
    });
  }
});

// Execute multiple integration test scenarios
router.post('/execute-batch', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { scenarios, testData } = req.body;
    
    if (!scenarios || !Array.isArray(scenarios)) {
      return res.status(400).json({
        success: false,
        error: 'Scenarios array is required'
      });
    }
    
    const results = {};
    const startTime = Date.now();
    
    console.log(`🚀 Executing batch integration tests: ${scenarios.length} scenarios`);
    
    for (const scenario of scenarios) {
      try {
        const result = await executeIntegrationScenario(scenario, testData || {});
        results[scenario] = result;
        
        console.log(`✅ Completed integration scenario: ${scenario} - ${result.status}`);
        
      } catch (error) {
        console.error(`❌ Failed integration scenario: ${scenario}`, error);
        results[scenario] = {
          scenarioKey: scenario,
          status: 'failed',
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    }
    
    const totalTime = Date.now() - startTime;
    
    res.json({
      success: true,
      message: `Batch integration testing completed: ${scenarios.length} scenarios`,
      data: {
        totalScenarios: scenarios.length,
        completedScenarios: Object.keys(results).length,
        totalExecutionTime: totalTime,
        results: results
      }
    });
    
  } catch (error) {
    console.error('Error executing batch integration tests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute batch integration tests'
    });
  }
});

// Execute all integration test scenarios
router.post('/execute-all', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { testData } = req.body;
    const scenarios = getIntegrationScenarios();
    const scenarioKeys = Object.keys(scenarios);
    
    console.log(`🚀 Executing all integration scenarios: ${scenarioKeys.length} total`);
    
    const results = {};
    const startTime = Date.now();
    
    for (const scenarioKey of scenarioKeys) {
      try {
        const result = await executeIntegrationScenario(scenarioKey, testData || {});
        results[scenarioKey] = result;
        
        console.log(`✅ Completed integration scenario: ${scenarioKey} - ${result.status}`);
        
      } catch (error) {
        console.error(`❌ Failed integration scenario: ${scenarioKey}`, error);
        results[scenarioKey] = {
          scenarioKey: scenarioKey,
          status: 'failed',
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    }
    
    const totalTime = Date.now() - startTime;
    
    res.json({
      success: true,
      message: `All integration scenarios executed: ${scenarioKeys.length} scenarios`,
      data: {
        totalScenarios: scenarioKeys.length,
        completedScenarios: Object.keys(results).length,
        totalExecutionTime: totalTime,
        results: results
      }
    });
    
  } catch (error) {
    console.error('Error executing all integration scenarios:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute all integration scenarios'
    });
  }
});

// Complete the current integration test run
router.post('/complete', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const testRun = await completeIntegrationTestRun();
    
    res.json({
      success: true,
      message: 'Integration test run completed successfully',
      data: testRun
    });
    
  } catch (error) {
    console.error('Error completing integration test run:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete integration test run'
    });
  }
});

// Get current integration test run results
router.get('/results', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const results = getIntegrationTestResults();
    
    if (!results) {
      return res.status(404).json({
        success: false,
        error: 'No active integration test run found'
      });
    }
    
    res.json({
      success: true,
      data: results
    });
    
  } catch (error) {
    console.error('Error getting integration test results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve integration test results'
    });
  }
});

// Get integration test run summary
router.get('/summary', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const results = getIntegrationTestResults();
    
    if (!results) {
      return res.status(404).json({
        success: false,
        error: 'No active integration test run found'
      });
    }
    
    const summary = {
      testRunId: results.id,
      status: results.status,
      startTime: results.startTime,
      endTime: results.endTime,
      duration: results.duration,
      summary: results.summary,
      recommendations: results.recommendations || []
    };
    
    res.json({
      success: true,
      data: summary
    });
    
  } catch (error) {
    console.error('Error getting integration test summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve integration test summary'
    });
  }
});

// Get integration test run status
router.get('/status', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const results = getIntegrationTestResults();
    
    if (!results) {
      return res.json({
        success: true,
        data: {
          status: 'no_test_run',
          message: 'No active integration test run'
        }
      });
    }
    
    const status = {
      testRunId: results.id,
      status: results.status,
      startTime: results.startTime,
      endTime: results.endTime,
      duration: results.duration,
      progress: {
        total: results.summary.total,
        passed: results.summary.passed,
        failed: results.summary.failed,
        skipped: results.summary.skipped,
        completionPercentage: results.summary.total > 0 
          ? Math.round((results.summary.passed / results.summary.total) * 100)
          : 0
      }
    };
    
    res.json({
      success: true,
      data: status
    });
    
  } catch (error) {
    console.error('Error getting integration test status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve integration test status'
    });
  }
});

// Get integration test run recommendations
router.get('/recommendations', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const results = getIntegrationTestResults();
    
    if (!results) {
      return res.status(404).json({
        success: false,
        error: 'No integration test run found'
      });
    }
    
    const recommendations = results.recommendations || [];
    
    // Group recommendations by category and priority
    const groupedRecommendations = {
      critical: recommendations.filter(r => r.priority === 'critical'),
      high: recommendations.filter(r => r.priority === 'high'),
      medium: recommendations.filter(r => r.priority === 'medium'),
      low: recommendations.filter(r => r.priority === 'low')
    };
    
    res.json({
      success: true,
      data: {
        total: recommendations.length,
        grouped: groupedRecommendations,
        all: recommendations
      }
    });
    
  } catch (error) {
    console.error('Error getting integration recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve integration recommendations'
    });
  }
});

// Get integration test run detailed analysis
router.get('/analysis', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const results = getIntegrationTestResults();
    
    if (!results) {
      return res.status(404).json({
        success: false,
        error: 'No integration test run found'
      });
    }
    
    const analysis = {
      testRunId: results.id,
      timestamp: new Date().toISOString(),
      summary: results.summary,
      detailedResults: {},
      insights: [],
      trends: {}
    };
    
    // Generate detailed analysis for each scenario
    Object.entries(results.results).forEach(([key, result]) => {
      analysis.detailedResults[key] = {
        scenarioName: result.scenarioName,
        status: result.status,
        duration: result.duration,
        testResults: result.tests.map(test => ({
          test: test.test,
          status: test.status,
          duration: test.duration,
          errors: test.errors,
          warnings: test.warnings
        })),
        integration: result.integration,
        performance: result.performance,
        reliability: result.reliability
      };
    });
    
    // Generate insights
    const failedScenarios = Object.values(results.results).filter(r => r.status === 'failed');
    const integrationIssues = Object.values(results.results).filter(r => r.status === 'integration_issues');
    const performanceIssues = Object.values(results.results).filter(r => r.status === 'performance_issues');
    const reliabilityIssues = Object.values(results.results).filter(r => r.status === 'reliability_issues');
    
    if (failedScenarios.length > 0) {
      analysis.insights.push({
        type: 'critical',
        message: `${failedScenarios.length} scenarios failed and need immediate attention`,
        scenarios: failedScenarios.map(r => r.scenarioName)
      });
    }
    
    if (integrationIssues.length > 0) {
      analysis.insights.push({
        type: 'critical',
        message: `${integrationIssues.length} scenarios have integration issues`,
        scenarios: integrationIssues.map(r => r.scenarioName)
      });
    }
    
    if (performanceIssues.length > 0) {
      analysis.insights.push({
        type: 'warning',
        message: `${performanceIssues.length} scenarios have performance issues`,
        scenarios: performanceIssues.map(r => r.scenarioName)
      });
    }
    
    if (reliabilityIssues.length > 0) {
      analysis.insights.push({
        type: 'critical',
        message: `${reliabilityIssues.length} scenarios have reliability issues`,
        scenarios: reliabilityIssues.map(r => r.scenarioName)
      });
    }
    
    // Calculate trends
    const totalTests = Object.values(results.results).reduce((sum, r) => 
      sum + r.tests.reduce((testSum, test) => testSum + 1, 0), 0
    );
    const successfulTests = Object.values(results.results).reduce((sum, r) => 
      sum + r.tests.filter(test => test.status === 'passed').length, 0
    );
    
    analysis.trends = {
      overallSuccessRate: totalTests > 0 ? (successfulTests / totalTests) * 100 : 0,
      averageScenarioDuration: Object.values(results.results).reduce((sum, r) => sum + r.duration, 0) / Object.keys(results.results).length,
      criticalIssues: analysis.insights.filter(i => i.type === 'critical').length,
      warnings: analysis.insights.filter(i => i.type === 'warning').length
    };
    
    res.json({
      success: true,
      data: analysis
    });
    
  } catch (error) {
    console.error('Error getting integration analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve integration analysis'
    });
  }
});

// Get integration test run performance metrics
router.get('/performance', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const results = getIntegrationTestResults();
    
    if (!results) {
      return res.status(404).json({
        success: false,
        error: 'No integration test run found'
      });
    }
    
    const performanceMetrics = {
      testRunId: results.id,
      overall: results.summary.performance || {},
      byScenario: {}
    };
    
    // Calculate performance metrics for each scenario
    Object.entries(results.results).forEach(([key, result]) => {
      performanceMetrics.byScenario[key] = {
        scenarioName: result.scenarioName,
        integration: result.integration || {},
        performance: result.performance || {},
        reliability: result.reliability || {}
      };
    });
    
    res.json({
      success: true,
      data: performanceMetrics
    });
    
  } catch (error) {
    console.error('Error getting integration performance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve integration performance metrics'
    });
  }
});

// Get integration test run reliability metrics
router.get('/reliability', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const results = getIntegrationTestResults();
    
    if (!results) {
      return res.status(404).json({
        success: false,
        error: 'No integration test run found'
      });
    }
    
    const reliabilityMetrics = {
      testRunId: results.id,
      overall: results.summary.reliability || {},
      byScenario: {}
    };
    
    // Calculate reliability metrics for each scenario
    Object.entries(results.results).forEach(([key, result]) => {
      reliabilityMetrics.byScenario[key] = {
        scenarioName: result.scenarioName,
        reliability: result.reliability || {},
        testResults: result.tests.map(test => ({
          test: test.test,
          status: test.status,
          errors: test.errors,
          warnings: test.warnings
        }))
      };
    });
    
    res.json({
      success: true,
      data: reliabilityMetrics
    });
    
  } catch (error) {
    console.error('Error getting integration reliability metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve integration reliability metrics'
    });
  }
});

// Health check for integration test service
router.get('/health', async (req, res) => {
  try {
    const scenarios = getIntegrationScenarios();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Integration Test Service',
      capabilities: {
        totalScenarios: Object.keys(scenarios).length,
        testRunActive: getIntegrationTestResults() !== null
      }
    };
    
    res.json({
      success: true,
      data: health
    });
    
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Integration test service health check failed',
      data: { status: 'unhealthy' }
    });
  }
});

module.exports = router;