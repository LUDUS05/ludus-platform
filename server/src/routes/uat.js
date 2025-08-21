const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { 
  startTestRun, 
  executeTestScenario, 
  completeTestRun, 
  getTestRunResults, 
  getTestScenarios, 
  getAcceptanceCriteria, 
  exportTestResults 
} = require('../services/uatService');

// Get all available UAT test scenarios
router.get('/scenarios', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const scenarios = getTestScenarios();
    
    res.json({
      success: true,
      data: {
        total: Object.keys(scenarios).length,
        scenarios: scenarios
      }
    });
    
  } catch (error) {
    console.error('Error getting UAT scenarios:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve UAT scenarios'
    });
  }
});

// Get acceptance criteria for UAT scenarios
router.get('/acceptance-criteria', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const criteria = getAcceptanceCriteria();
    
    res.json({
      success: true,
      data: {
        total: Object.keys(criteria).length,
        criteria: criteria
      }
    });
    
  } catch (error) {
    console.error('Error getting acceptance criteria:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve acceptance criteria'
    });
  }
});

// Start a new UAT test run
router.post('/start', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { testRunId } = req.body;
    const testRun = await startTestRun(testRunId);
    
    res.json({
      success: true,
      message: 'UAT test run started successfully',
      data: testRun
    });
    
  } catch (error) {
    console.error('Error starting UAT test run:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start UAT test run'
    });
  }
});

// Execute a specific UAT test scenario
router.post('/execute/:scenario', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { scenario } = req.params;
    const { testData } = req.body;
    
    const result = await executeTestScenario(scenario, testData || {});
    
    res.json({
      success: true,
      message: `UAT scenario '${scenario}' executed successfully`,
      data: result
    });
    
  } catch (error) {
    console.error('Error executing UAT scenario:', error);
    res.status(500).json({
      success: false,
      error: `Failed to execute UAT scenario: ${error.message}`
    });
  }
});

// Execute multiple UAT test scenarios
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
    
    console.log(`🚀 Executing batch UAT: ${scenarios.length} scenarios`);
    
    for (const scenario of scenarios) {
      try {
        const result = await executeTestScenario(scenario, testData || {});
        results[scenario] = result;
        
        console.log(`✅ Completed scenario: ${scenario} - ${result.status}`);
        
      } catch (error) {
        console.error(`❌ Failed scenario: ${scenario}`, error);
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
      message: `Batch UAT execution completed: ${scenarios.length} scenarios`,
      data: {
        totalScenarios: scenarios.length,
        completedScenarios: Object.keys(results).length,
        totalExecutionTime: totalTime,
        results: results
      }
    });
    
  } catch (error) {
    console.error('Error executing batch UAT:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute batch UAT'
    });
  }
});

// Execute all UAT test scenarios
router.post('/execute-all', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { testData } = req.body;
    const scenarios = getTestScenarios();
    const scenarioKeys = Object.keys(scenarios);
    
    console.log(`🚀 Executing all UAT scenarios: ${scenarioKeys.length} total`);
    
    const results = {};
    const startTime = Date.now();
    
    for (const scenarioKey of scenarioKeys) {
      try {
        const result = await executeTestScenario(scenarioKey, testData || {});
        results[scenarioKey] = result;
        
        console.log(`✅ Completed scenario: ${scenarioKey} - ${result.status}`);
        
      } catch (error) {
        console.error(`❌ Failed scenario: ${scenarioKey}`, error);
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
      message: `All UAT scenarios executed: ${scenarioKeys.length} scenarios`,
      data: {
        totalScenarios: scenarioKeys.length,
        completedScenarios: Object.keys(results).length,
        totalExecutionTime: totalTime,
        results: results
      }
    });
    
  } catch (error) {
    console.error('Error executing all UAT scenarios:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute all UAT scenarios'
    });
  }
});

// Complete the current UAT test run
router.post('/complete', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const testRun = await completeTestRun();
    
    res.json({
      success: true,
      message: 'UAT test run completed successfully',
      data: testRun
    });
    
  } catch (error) {
    console.error('Error completing UAT test run:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete UAT test run'
    });
  }
});

// Get current UAT test run results
router.get('/results', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const results = getTestRunResults();
    
    if (!results) {
      return res.status(404).json({
        success: false,
        error: 'No active UAT test run found'
      });
    }
    
    res.json({
      success: true,
      data: results
    });
    
  } catch (error) {
    console.error('Error getting UAT test results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve UAT test results'
    });
  }
});

// Get UAT test run summary
router.get('/summary', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const results = getTestRunResults();
    
    if (!results) {
      return res.status(404).json({
        success: false,
        error: 'No active UAT test run found'
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
    console.error('Error getting UAT test summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve UAT test summary'
    });
  }
});

// Export UAT test results
router.get('/export/:format', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { format } = req.params;
    const supportedFormats = ['json', 'csv', 'html'];
    
    if (!supportedFormats.includes(format.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Unsupported export format. Supported formats: ${supportedFormats.join(', ')}`
      });
    }
    
    const results = getTestRunResults();
    
    if (!results) {
      return res.status(404).json({
        success: false,
        error: 'No UAT test results to export'
      });
    }
    
    const exportedData = exportTestResults(format);
    
    // Set appropriate headers for download
    const filename = `uat_results_${results.id}_${new Date().toISOString().split('T')[0]}`;
    
    switch (format.toLowerCase()) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
        break;
      case 'csv':
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        break;
      case 'html':
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.html"`);
        break;
    }
    
    res.send(exportedData);
    
  } catch (error) {
    console.error('Error exporting UAT test results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export UAT test results'
    });
  }
});

// Get UAT test run status
router.get('/status', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const results = getTestRunResults();
    
    if (!results) {
      return res.json({
        success: true,
        data: {
          status: 'no_test_run',
          message: 'No active UAT test run'
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
    console.error('Error getting UAT test status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve UAT test status'
    });
  }
});

// Get UAT test run recommendations
router.get('/recommendations', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const results = getTestRunResults();
    
    if (!results) {
      return res.status(404).json({
        success: false,
        error: 'No UAT test run found'
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
    console.error('Error getting UAT recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve UAT recommendations'
    });
  }
});

// Get UAT test run performance metrics
router.get('/performance', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const results = getTestRunResults();
    
    if (!results) {
      return res.status(404).json({
        success: false,
        error: 'No UAT test run found'
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
        performance: result.performance || {},
        userExperience: result.userExperience || {},
        security: result.security || {},
        functionality: result.functionality || {}
      };
    });
    
    res.json({
      success: true,
      data: performanceMetrics
    });
    
  } catch (error) {
    console.error('Error getting UAT performance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve UAT performance metrics'
    });
  }
});

// Get UAT test run detailed analysis
router.get('/analysis', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const results = getTestRunResults();
    
    if (!results) {
      return res.status(404).json({
        success: false,
        error: 'No UAT test run found'
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
        stepResults: result.steps.map(step => ({
          step: step.step,
          status: step.status,
          duration: step.duration,
          errors: step.errors,
          warnings: step.warnings
        })),
        performance: result.performance,
        userExperience: result.userExperience,
        security: result.security,
        functionality: result.functionality
      };
    });
    
    // Generate insights
    const failedScenarios = Object.values(results.results).filter(r => r.status === 'failed');
    const performanceIssues = Object.values(results.results).filter(r => r.status === 'performance_issues');
    const securityIssues = Object.values(results.results).filter(r => r.status === 'security_issues');
    
    if (failedScenarios.length > 0) {
      analysis.insights.push({
        type: 'critical',
        message: `${failedScenarios.length} scenarios failed and need immediate attention`,
        scenarios: failedScenarios.map(r => r.scenarioName)
      });
    }
    
    if (performanceIssues.length > 0) {
      analysis.insights.push({
        type: 'warning',
        message: `${performanceIssues.length} scenarios have performance issues`,
        scenarios: performanceIssues.map(r => r.scenarioName)
      });
    }
    
    if (securityIssues.length > 0) {
      analysis.insights.push({
        type: 'critical',
        message: `${securityIssues.length} scenarios have security issues`,
        scenarios: securityIssues.map(r => r.scenarioName)
      });
    }
    
    // Calculate trends
    const totalSteps = Object.values(results.results).reduce((sum, r) => sum + r.steps.length, 0);
    const successfulSteps = Object.values(results.results).reduce((sum, r) => 
      sum + r.steps.filter(s => s.status === 'passed').length, 0
    );
    
    analysis.trends = {
      overallSuccessRate: totalSteps > 0 ? (successfulSteps / totalSteps) * 100 : 0,
      averageScenarioDuration: Object.values(results.results).reduce((sum, r) => sum + r.duration, 0) / Object.keys(results.results).length,
      criticalIssues: analysis.insights.filter(i => i.type === 'critical').length,
      warnings: analysis.insights.filter(i => i.type === 'warning').length
    };
    
    res.json({
      success: true,
      data: analysis
    });
    
  } catch (error) {
    console.error('Error getting UAT analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve UAT analysis'
    });
  }
});

// Health check for UAT service
router.get('/health', async (req, res) => {
  try {
    const scenarios = getTestScenarios();
    const criteria = getAcceptanceCriteria();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'UAT Service',
      capabilities: {
        totalScenarios: Object.keys(scenarios).length,
        totalCriteria: Object.keys(criteria).length,
        testRunActive: getTestRunResults() !== null
      }
    };
    
    res.json({
      success: true,
      data: health
    });
    
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'UAT service health check failed',
      data: { status: 'unhealthy' }
    });
  }
});

module.exports = router;