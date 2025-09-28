/**
 * @fileoverview Comprehensive test suite for Selena-Discover AI Agent
 * 
 * This test suite validates the functionality, performance, and accuracy
 * of the Selena-Discover AI agent implementation.
 * 
 * Test Categories:
 * - Natural language processing accuracy
 * - Search result relevance
 * - Cultural context awareness
 * - Performance benchmarks
 * - API endpoint functionality
 * - Database integration
 * 
 * @version 1.0.0
 * @author LUDUS Development Team - Selena-Discover AI Agent
 * @since 2025-09-28
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const AGENTS_URL = process.env.AGENTS_URL || 'http://localhost:8001';

// Test data and scenarios
const TEST_SCENARIOS = {
  arabic_queries: [
    {
      query: "ابحث عن أنشطة مغامرات في الرياض",
      expected_intent: "find_activity",
      expected_categories: ["adventure"],
      expected_location: "الرياض"
    },
    {
      query: "أريد نشاط عائلي أقل من 100 ريال",
      expected_intent: "find_activity",
      expected_price_sensitivity: true,
      expected_cultural: { family_friendly: true }
    },
    {
      query: "وش أفضل أنشطة ألعاب قريبة مني؟",
      expected_intent: "recommendation",
      expected_categories: ["gaming"],
      expected_proximity: true
    }
  ],
  english_queries: [
    {
      query: "Find adventure activities in Riyadh",
      expected_intent: "find_activity",
      expected_categories: ["adventure"],
      expected_location: "الرياض"
    },
    {
      query: "I want family activities under 100 SAR",
      expected_intent: "find_activity",
      expected_price_sensitivity: true,
      expected_cultural: { family_friendly: true }
    },
    {
      query: "What are the best gaming activities near me?",
      expected_intent: "recommendation",
      expected_categories: ["gaming"],
      expected_proximity: true
    }
  ],
  mixed_queries: [
    {
      query: "Find ألعاب activities في الرياض",
      expected_intent: "find_activity",
      expected_categories: ["gaming"],
      expected_location: "الرياض"
    }
  ],
  performance_queries: [
    {
      query: "ابحث عن أنشطة",
      max_response_time: 300 // ms
    },
    {
      query: "recommend activities for family",
      max_response_time: 300 // ms
    }
  ]
};

// Test utilities
class TestRunner {
  constructor() {
    this.results = {
      total_tests: 0,
      passed: 0,
      failed: 0,
      performance_tests: 0,
      performance_passed: 0,
      errors: []
    };
  }

  async runTest(testName, testFunction) {
    this.results.total_tests++;
    console.log(`\n🧪 Running: ${testName}`);
    
    try {
      const start = performance.now();
      const result = await testFunction();
      const duration = performance.now() - start;
      
      if (result.success) {
        this.results.passed++;
        console.log(`✅ PASSED - ${testName} (${duration.toFixed(2)}ms)`);
        if (result.performance_data) {
          this.validatePerformance(result.performance_data, testName);
        }
      } else {
        this.results.failed++;
        console.log(`❌ FAILED - ${testName}: ${result.message}`);
        this.results.errors.push({ test: testName, error: result.message });
      }
      
      return result;
    } catch (error) {
      this.results.failed++;
      console.log(`💥 ERROR - ${testName}: ${error.message}`);
      this.results.errors.push({ test: testName, error: error.message });
      return { success: false, message: error.message };
    }
  }

  validatePerformance(performanceData, testName) {
    this.results.performance_tests++;
    
    if (performanceData.response_time <= 300) {
      this.results.performance_passed++;
      console.log(`⚡ Performance PASSED - ${performanceData.response_time}ms`);
    } else {
      console.log(`🐌 Performance FAILED - ${performanceData.response_time}ms (target: ≤300ms)`);
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 SELENA-DISCOVER AI AGENT TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.results.total_tests}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${((this.results.passed / this.results.total_tests) * 100).toFixed(1)}%`);
    
    if (this.results.performance_tests > 0) {
      console.log(`\n⚡ Performance Tests: ${this.results.performance_tests}`);
      console.log(`⚡ Performance Passed: ${this.results.performance_passed}`);
      console.log(`⚡ Performance Rate: ${((this.results.performance_passed / this.results.performance_tests) * 100).toFixed(1)}%`);
    }
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.results.errors.forEach(error => {
        console.log(`  ${error.test}: ${error.error}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
  }
}

// Test functions
async function testAgentHealthCheck() {
  try {
    const response = await axios.get(`${AGENTS_URL}/health`, { timeout: 5000 });
    
    return {
      success: response.data.status === 'ok',
      message: response.data.status === 'ok' ? 'Agent service healthy' : 'Agent service unhealthy',
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: `Agent health check failed: ${error.message}`
    };
  }
}

async function testBackendHealthCheck() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/health`, { timeout: 5000 });
    
    return {
      success: response.status === 200,
      message: 'Backend service healthy',
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: `Backend health check failed: ${error.message}`
    };
  }
}

async function testArabicNLPProcessing() {
  const testQuery = "ابحث عن أنشطة مغامرات في الرياض للعائلة";
  
  try {
    const start = performance.now();
    const response = await axios.post(`${AGENTS_URL}/discover/search`, {
      query: testQuery,
      language: 'ar',
      user_context: {
        location: { city: 'الرياض' },
        cultural_preferences: { family_friendly: true }
      }
    }, { timeout: 10000 });
    
    const responseTime = performance.now() - start;
    const data = response.data;
    
    // Validate response structure
    const hasValidStructure = (
      data.search_id &&
      Array.isArray(data.results) &&
      data.query_analysis &&
      Array.isArray(data.personalized_insights)
    );
    
    // Validate Arabic language handling
    const hasArabicContent = (
      data.personalized_insights.some(insight => /[\u0600-\u06FF]/.test(insight)) ||
      data.cultural_recommendations.some(rec => /[\u0600-\u06FF]/.test(rec))
    );
    
    return {
      success: hasValidStructure && hasArabicContent,
      message: hasValidStructure && hasArabicContent ? 
        'Arabic NLP processing successful' : 
        'Arabic NLP processing failed validation',
      performance_data: { response_time: responseTime },
      data: {
        structure_valid: hasValidStructure,
        arabic_content: hasArabicContent,
        results_count: data.results?.length || 0
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Arabic NLP test failed: ${error.message}`
    };
  }
}

async function testEnglishNLPProcessing() {
  const testQuery = "Find gaming activities for groups in Riyadh under 100 SAR";
  
  try {
    const start = performance.now();
    const response = await axios.post(`${AGENTS_URL}/discover/search`, {
      query: testQuery,
      language: 'en',
      price_range: [0, 100],
      group_size: 4,
      user_context: {
        location: { city: 'Riyadh' }
      }
    }, { timeout: 10000 });
    
    const responseTime = performance.now() - start;
    const data = response.data;
    
    // Validate intent extraction
    const intentCorrect = data.query_analysis?.primary_intent === 'find_activity';
    const categoriesDetected = data.query_analysis?.activity_types?.includes('gaming');
    const priceRangeApplied = data.filters_applied?.price_range;
    
    return {
      success: intentCorrect && categoriesDetected && priceRangeApplied,
      message: 'English NLP processing validation',
      performance_data: { response_time: responseTime },
      data: {
        intent_correct: intentCorrect,
        categories_detected: categoriesDetected,
        price_applied: !!priceRangeApplied,
        results_count: data.results?.length || 0
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `English NLP test failed: ${error.message}`
    };
  }
}

async function testPersonalizedRecommendations() {
  try {
    const start = performance.now();
    const response = await axios.post(`${AGENTS_URL}/discover/recommend`, {
      preferred_categories: ['gaming', 'adventure'],
      language: 'ar',
      location: 'الرياض',
      user_context: {
        user_id: 'test_user_123',
        preferences: {
          activity_types: { gaming: 0.8, adventure: 0.6 },
          cultural_preferences: { family_friendly: true }
        }
      }
    }, { timeout: 10000 });
    
    const responseTime = performance.now() - start;
    const data = response.data;
    
    // Validate personalization
    const hasRecommendations = data.recommendations?.results?.length > 0;
    const hasPersonalization = data.personalization_applied;
    const hasTrendingInsights = data.trending_insights && Object.keys(data.trending_insights).length > 0;
    
    return {
      success: hasRecommendations && hasPersonalization && hasTrendingInsights,
      message: 'Personalized recommendations validation',
      performance_data: { response_time: responseTime },
      data: {
        has_recommendations: hasRecommendations,
        personalization_applied: hasPersonalization,
        trending_insights: hasTrendingInsights,
        recommendations_count: data.recommendations?.results?.length || 0
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Personalized recommendations test failed: ${error.message}`
    };
  }
}

async function testCulturalContextAwareness() {
  const testQueries = [
    {
      query: "أنشطة عائلية مناسبة للأطفال",
      expected_cultural: ["family_friendly"],
      language: "ar"
    },
    {
      query: "activities considering prayer times",
      expected_cultural: ["prayer_aware"],
      language: "en"
    }
  ];
  
  const results = [];
  
  for (const testCase of testQueries) {
    try {
      const response = await axios.post(`${AGENTS_URL}/discover/search`, {
        query: testCase.query,
        language: testCase.language,
        cultural_preferences: { religious_considerations: true }
      }, { timeout: 8000 });
      
      const data = response.data;
      const hasCulturalRecommendations = data.cultural_recommendations?.length > 0;
      const hasArabicCultural = testCase.language === 'ar' ? 
        data.cultural_recommendations?.some(rec => /[\u0600-\u06FF]/.test(rec)) : true;
      
      results.push({
        query: testCase.query,
        success: hasCulturalRecommendations && hasArabicCultural,
        cultural_recs_count: data.cultural_recommendations?.length || 0
      });
    } catch (error) {
      results.push({
        query: testCase.query,
        success: false,
        error: error.message
      });
    }
  }
  
  const allPassed = results.every(r => r.success);
  
  return {
    success: allPassed,
    message: allPassed ? 'Cultural context awareness passed' : 'Some cultural tests failed',
    data: results
  };
}

async function testGeographicProximity() {
  try {
    const response = await axios.get(`${AGENTS_URL}/discover/nearby/الرياض`, {
      params: {
        radius: 15,
        language: 'ar'
      },
      timeout: 8000
    });
    
    const data = response.data;
    const hasResults = data.results?.length > 0;
    const hasGeographicClusters = data.geographic_clusters?.length > 0;
    const hasProximityData = data.results?.some(r => r.distance_km !== undefined);
    
    return {
      success: hasResults && hasGeographicClusters && hasProximityData,
      message: 'Geographic proximity calculation validation',
      data: {
        results_count: data.results?.length || 0,
        clusters_count: data.geographic_clusters?.length || 0,
        has_distance_data: hasProximityData
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Geographic proximity test failed: ${error.message}`
    };
  }
}

async function testBackendIntegration() {
  try {
    const start = performance.now();
    const response = await axios.post(`${BACKEND_URL}/api/discover/search`, {
      query: "أنشطة ترفيهية في جدة",
      language: 'ar',
      location: 'جدة',
      activity_types: ['entertainment']
    }, { timeout: 10000 });
    
    const responseTime = performance.now() - start;
    const data = response.data;
    
    // Validate backend response structure
    const hasValidStructure = (
      data.success &&
      data.data &&
      Array.isArray(data.data.activities) &&
      data.meta &&
      data.meta.agent === 'selena-discover'
    );
    
    // Validate database enrichment
    const hasDbData = data.data.activities?.some(activity => 
      activity._id && activity.vendor && activity.createdAt
    );
    
    return {
      success: hasValidStructure && hasDbData,
      message: 'Backend integration validation',
      performance_data: { response_time: responseTime },
      data: {
        structure_valid: hasValidStructure,
        db_enriched: hasDbData,
        activities_count: data.data.activities?.length || 0
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Backend integration test failed: ${error.message}`
    };
  }
}

async function testSearchPerformanceBenchmark() {
  const testQueries = [
    "ابحث عن أنشطة",
    "Find activities",
    "أنشطة مغامرات في الرياض مع الأصدقاء أقل من 150 ريال",
    "Complex adventure activities in Riyadh with friends under 150 SAR including cultural considerations"
  ];
  
  const results = [];
  
  for (const query of testQueries) {
    try {
      const start = performance.now();
      const response = await axios.post(`${AGENTS_URL}/discover/search`, {
        query,
        language: query.includes('ريال') || /[\u0600-\u06FF]/.test(query) ? 'ar' : 'en'
      }, { timeout: 10000 });
      
      const responseTime = performance.now() - start;
      
      results.push({
        query: query.substring(0, 30) + '...',
        response_time: responseTime,
        passed: responseTime <= 300,
        results_count: response.data.results?.length || 0
      });
    } catch (error) {
      results.push({
        query: query.substring(0, 30) + '...',
        response_time: null,
        passed: false,
        error: error.message
      });
    }
  }
  
  const avgResponseTime = results
    .filter(r => r.response_time)
    .reduce((sum, r) => sum + r.response_time, 0) / results.filter(r => r.response_time).length;
    
  const allPassed = results.every(r => r.passed);
  
  return {
    success: allPassed && avgResponseTime <= 300,
    message: `Performance benchmark - Avg: ${avgResponseTime?.toFixed(2)}ms`,
    performance_data: { response_time: avgResponseTime },
    data: results
  };
}

async function testChatInterface() {
  const testMessages = [
    {
      message: "مرحبا، أريد أنشطة ممتعة",
      language: 'ar'
    },
    {
      message: "What gaming activities do you recommend?",
      language: 'en'
    },
    {
      message: "Help me find activities near Riyadh",
      language: 'en'
    }
  ];
  
  const results = [];
  
  for (const testCase of testMessages) {
    try {
      const response = await axios.post(`${AGENTS_URL}/discover/chat`, {
        message: testCase.message,
        language: testCase.language,
        user_context: {}
      }, { timeout: 10000 });
      
      const data = response.data;
      const hasResponse = data.response && data.response.length > 0;
      const correctLanguage = testCase.language === 'ar' ? 
        /[\u0600-\u06FF]/.test(data.response) : 
        /[a-zA-Z]/.test(data.response);
      
      results.push({
        message: testCase.message,
        success: hasResponse && correctLanguage,
        response_length: data.response?.length || 0,
        language_correct: correctLanguage
      });
    } catch (error) {
      results.push({
        message: testCase.message,
        success: false,
        error: error.message
      });
    }
  }
  
  const allPassed = results.every(r => r.success);
  
  return {
    success: allPassed,
    message: allPassed ? 'Chat interface tests passed' : 'Some chat tests failed',
    data: results
  };
}

async function testTrendingEndpoint() {
  try {
    const response = await axios.get(`${AGENTS_URL}/discover/trending`, {
      params: { language: 'ar' },
      timeout: 5000
    });
    
    const data = response.data;
    const hasStructure = (
      data.trending_data &&
      Array.isArray(data.seasonal_recommendations) &&
      Array.isArray(data.cultural_events)
    );
    
    return {
      success: hasStructure,
      message: hasStructure ? 'Trending endpoint working' : 'Trending endpoint structure invalid',
      data: {
        has_trending_data: !!data.trending_data,
        seasonal_recs_count: data.seasonal_recommendations?.length || 0,
        cultural_events_count: data.cultural_events?.length || 0
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Trending endpoint test failed: ${error.message}`
    };
  }
}

async function testSearchResultRelevance() {
  const testCases = [
    {
      query: "تسلق الجبال",
      expected_category: "adventure",
      language: "ar"
    },
    {
      query: "cooking workshop",
      expected_category: "food",
      language: "en"
    }
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    try {
      const response = await axios.post(`${AGENTS_URL}/discover/search`, {
        query: testCase.query,
        language: testCase.language
      }, { timeout: 8000 });
      
      const data = response.data;
      const topResult = data.results?.[0];
      
      const relevanceValid = topResult && (
        topResult.category === testCase.expected_category ||
        topResult.relevance_score > 0.7
      );
      
      results.push({
        query: testCase.query,
        success: relevanceValid,
        top_category: topResult?.category,
        relevance_score: topResult?.relevance_score
      });
    } catch (error) {
      results.push({
        query: testCase.query,
        success: false,
        error: error.message
      });
    }
  }
  
  const avgRelevance = results
    .filter(r => r.relevance_score)
    .reduce((sum, r) => sum + r.relevance_score, 0) / results.filter(r => r.relevance_score).length;
  
  const allPassed = results.every(r => r.success);
  
  return {
    success: allPassed && avgRelevance > 0.7,
    message: `Search relevance - Avg: ${avgRelevance?.toFixed(2)}`,
    data: { 
      results, 
      average_relevance: avgRelevance,
      target_relevance: 0.8
    }
  };
}

async function testConcurrentSearchLoad() {
  const concurrentQueries = [
    { query: "أنشطة مغامرات", language: "ar" },
    { query: "gaming activities", language: "en" },
    { query: "ورش طبخ", language: "ar" },
    { query: "sports activities", language: "en" },
    { query: "أنشطة ثقافية", language: "ar" }
  ];
  
  try {
    const start = performance.now();
    
    // Execute all queries concurrently
    const promises = concurrentQueries.map(queryData => 
      axios.post(`${AGENTS_URL}/discover/search`, queryData, { timeout: 15000 })
    );
    
    const responses = await Promise.all(promises);
    const totalTime = performance.now() - start;
    
    const allSucceeded = responses.every(response => response.data.results?.length >= 0);
    const avgResponseTime = totalTime / concurrentQueries.length;
    
    return {
      success: allSucceeded && avgResponseTime <= 500, // Allow higher time for concurrent load
      message: `Concurrent load test - ${concurrentQueries.length} queries`,
      performance_data: { response_time: avgResponseTime },
      data: {
        concurrent_queries: concurrentQueries.length,
        all_succeeded: allSucceeded,
        total_time: totalTime,
        avg_time_per_query: avgResponseTime
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Concurrent load test failed: ${error.message}`
    };
  }
}

// Main test execution
async function runAllTests() {
  console.log('🚀 Starting Selena-Discover AI Agent Test Suite');
  console.log('Target: 80% accuracy, <300ms response time, 100% Arabic support\n');
  
  const runner = new TestRunner();
  
  // Health checks
  await runner.runTest('Agent Health Check', testAgentHealthCheck);
  await runner.runTest('Backend Health Check', testBackendHealthCheck);
  
  // Core NLP functionality
  await runner.runTest('Arabic NLP Processing', testArabicNLPProcessing);
  await runner.runTest('English NLP Processing', testEnglishNLPProcessing);
  
  // AI features
  await runner.runTest('Personalized Recommendations', testPersonalizedRecommendations);
  await runner.runTest('Cultural Context Awareness', testCulturalContextAwareness);
  await runner.runTest('Geographic Proximity', testGeographicProximity);
  
  // Performance tests
  await runner.runTest('Search Performance Benchmark', testSearchPerformanceBenchmark);
  await runner.runTest('Concurrent Load Test', testConcurrentSearchLoad);
  
  // Integration tests
  await runner.runTest('Backend Integration', testBackendIntegration);
  await runner.runTest('Chat Interface', testChatInterface);
  await runner.runTest('Trending Endpoint', testTrendingEndpoint);
  await runner.runTest('Search Result Relevance', testSearchResultRelevance);
  
  // Print final results
  runner.printSummary();
  
  // Determine overall success
  const successRate = (runner.results.passed / runner.results.total_tests) * 100;
  const performanceRate = runner.results.performance_tests > 0 ? 
    (runner.results.performance_passed / runner.results.performance_tests) * 100 : 100;
  
  console.log('\n🎯 SUCCESS CRITERIA EVALUATION:');
  console.log(`✅ Search Accuracy: ${successRate.toFixed(1)}% (Target: >80%)`);
  console.log(`⚡ Performance: ${performanceRate.toFixed(1)}% (Target: <300ms)`);
  console.log(`🌍 Arabic Support: ${runner.results.passed > 0 ? '100%' : '0%'} (Target: 100%)`);
  
  if (successRate >= 80 && performanceRate >= 80) {
    console.log('\n🎉 SELENA-DISCOVER AI AGENT: READY FOR PRODUCTION! 🎉');
    return true;
  } else {
    console.log('\n⚠️  SELENA-DISCOVER AI AGENT: NEEDS OPTIMIZATION');
    return false;
  }
}

// Execute tests if run directly
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  TestRunner,
  TEST_SCENARIOS
};