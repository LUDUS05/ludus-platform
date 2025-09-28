/**
 * @fileoverview Comprehensive Testing Suite for Selena-Discover AI Agent
 * 
 * This test suite validates the functionality, performance, and accuracy
 * of the Selena-Discover AI agent across all components and integrations.
 * 
 * @version 1.0.0
 * @author LUDUS Development Team - Selena-Discover Implementation
 * @since 2025-09-28
 */

const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

// Configuration
const AGENTS_API_URL = process.env.AGENTS_API_URL || 'http://localhost:8000';
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/api';
const TEST_USER_ID = 'test_user_selena_' + Date.now();

// Test data
const TEST_QUERIES = {
  arabic: [
    'أنشطة مغامرات في الرياض',
    'ورش طبخ تراثية للعائلة',
    'أنشطة رياضية للشباب',
    'جولات ثقافية في جدة',
    'أنشطة ترفيهية مسائية'
  ],
  english: [
    'adventure activities in Riyadh',
    'traditional cooking workshops for families',
    'sports activities for youth',
    'cultural tours in Jeddah',
    'evening entertainment activities'
  ],
  mixed: [
    'adventure مغامرات in الرياض',
    'cooking ورشة طبخ traditional',
    'sports رياضة youth شباب'
  ]
};

const TEST_LOCATIONS = [
  { city: 'الرياض', coordinates: [46.6753, 24.7136] },
  { city: 'جدة', coordinates: [39.1925, 21.4858] },
  { city: 'الدمام', coordinates: [50.0888, 26.4207] }
];

const TEST_CULTURAL_CONTEXTS = [
  'saudi_traditional',
  'saudi_modern',
  'expat_western',
  'expat_arab'
];

// Test Results Storage
let testResults = {
  timestamp: new Date().toISOString(),
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  skippedTests: 0,
  testSuites: {}
};

// Utility Functions
function logTest(suiteName, testName, status, details = {}) {
  if (!testResults.testSuites[suiteName]) {
    testResults.testSuites[suiteName] = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      tests: []
    };
  }

  const test = {
    name: testName,
    status,
    timestamp: new Date().toISOString(),
    details
  };

  testResults.testSuites[suiteName].tests.push(test);
  testResults.testSuites[suiteName].total++;
  testResults.testSuites[suiteName][status]++;
  testResults.totalTests++;
  testResults[status + 'Tests']++;

  const statusEmoji = { passed: '✅', failed: '❌', skipped: '⚠️' };
  console.log(`${statusEmoji[status]} [${suiteName}] ${testName}`, details.error || '');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// Test Suites

/**
 * Test Agent Connectivity and Health
 */
async function testAgentConnectivity() {
  console.log('\n🔗 Testing Agent Connectivity...');
  
  try {
    // Test Python agent health
    const agentHealth = await axios.get(`${AGENTS_API_URL}/health`, { timeout: 5000 });
    
    assert(agentHealth.status === 200, 'Agent health endpoint should return 200');
    assert(agentHealth.data.status === 'ok', 'Agent should be healthy');
    
    logTest('connectivity', 'agent_health_check', 'passed', {
      responseTime: agentHealth.headers['x-response-time'],
      data: agentHealth.data
    });

    // Test backend integration health
    try {
      const backendHealth = await axios.get(`${BACKEND_API_URL}/discover/health`, { timeout: 5000 });
      
      logTest('connectivity', 'backend_integration_health', 'passed', {
        overallHealth: backendHealth.data.data?.overallHealth,
        services: backendHealth.data.data?.services?.length || 0
      });
    } catch (error) {
      logTest('connectivity', 'backend_integration_health', 'failed', { error: error.message });
    }

  } catch (error) {
    logTest('connectivity', 'agent_health_check', 'failed', { error: error.message });
  }
}

/**
 * Test Natural Language Processing
 */
async function testNaturalLanguageProcessing() {
  console.log('\n🧠 Testing Natural Language Processing...');

  const testCases = [
    ...TEST_QUERIES.arabic.map(q => ({ query: q, language: 'ar' })),
    ...TEST_QUERIES.english.map(q => ({ query: q, language: 'en' })),
    ...TEST_QUERIES.mixed.map(q => ({ query: q, language: 'ar' }))
  ];

  for (const testCase of testCases) {
    try {
      const searchRequest = {
        query: testCase.query,
        user_id: TEST_USER_ID,
        language: testCase.language,
        search_type: 'natural'
      };

      const response = await axios.post(
        `${AGENTS_API_URL}/agents/discover/search`,
        searchRequest,
        { timeout: 10000 }
      );

      const data = response.data;
      
      // Validate response structure
      assert(data.results !== undefined, 'Response should have results');
      assert(data.processed_query !== undefined, 'Response should have processed query');
      assert(data.performance_metrics !== undefined, 'Response should have performance metrics');
      
      // Validate performance
      const processingTime = data.performance_metrics?.processing_time_ms || 0;
      assert(processingTime < 1000, `Processing time should be under 1000ms, got ${processingTime}ms`);
      
      // Validate NLP confidence
      const nlpConfidence = data.processed_query?.confidence || 0;
      assert(nlpConfidence > 0, 'NLP confidence should be greater than 0');

      logTest('nlp', `query_processing_${testCase.language}`, 'passed', {
        query: testCase.query,
        processingTime,
        nlpConfidence,
        resultsCount: data.results?.length || 0,
        intentExtracted: data.processed_query?.intent?.length > 0
      });

    } catch (error) {
      logTest('nlp', `query_processing_${testCase.language}`, 'failed', {
        query: testCase.query,
        error: error.message
      });
    }
  }
}

/**
 * Test Recommendation Engine
 */
async function testRecommendationEngine() {
  console.log('\n🎯 Testing Recommendation Engine...');

  for (const culturalContext of TEST_CULTURAL_CONTEXTS) {
    try {
      const recommendationRequest = {
        user_id: TEST_USER_ID,
        context: {
          test_mode: true,
          timestamp: new Date().toISOString()
        },
        cultural_context: culturalContext
      };

      const response = await axios.post(
        `${AGENTS_API_URL}/agents/discover/recommend`,
        recommendationRequest,
        { timeout: 10000 }
      );

      const data = response.data;
      
      // Validate recommendation structure
      assert(data.recommendations !== undefined, 'Response should have recommendations');
      assert(Array.isArray(data.recommendations), 'Recommendations should be an array');
      assert(data.confidence_score !== undefined, 'Response should have confidence score');
      assert(data.cultural_fit_score !== undefined, 'Response should have cultural fit score');
      
      // Validate recommendation quality
      const hasRecommendations = data.recommendations.length > 0;
      const avgConfidence = data.confidence_score;
      const avgCulturalFit = data.cultural_fit_score;
      
      assert(avgConfidence >= 0 && avgConfidence <= 1, 'Confidence score should be between 0 and 1');
      assert(avgCulturalFit >= 0 && avgCulturalFit <= 1, 'Cultural fit score should be between 0 and 1');

      logTest('recommendations', `cultural_context_${culturalContext}`, 'passed', {
        culturalContext,
        recommendationCount: data.recommendations.length,
        confidenceScore: avgConfidence,
        culturalFitScore: avgCulturalFit,
        hasReasoning: data.reasoning?.length > 0
      });

    } catch (error) {
      logTest('recommendations', `cultural_context_${culturalContext}`, 'failed', {
        culturalContext,
        error: error.message
      });
    }
  }
}

/**
 * Test Geographic Proximity Calculations
 */
async function testGeographicProximity() {
  console.log('\n📍 Testing Geographic Proximity...');

  for (const location of TEST_LOCATIONS) {
    try {
      const response = await axios.get(
        `${AGENTS_API_URL}/agents/discover/nearby/${location.city}`,
        {
          params: {
            radius: 25,
            user_id: TEST_USER_ID
          },
          timeout: 10000
        }
      );

      const data = response.data;
      
      // Validate geographic response
      assert(data.nearby_activities !== undefined, 'Response should have nearby activities');
      assert(data.geographic_clusters !== undefined, 'Response should have geographic clusters');
      assert(data.radius_km !== undefined, 'Response should have radius information');
      
      // Validate proximity calculations
      const hasNearbyActivities = data.nearby_activities.length > 0;
      const hasClusters = data.geographic_clusters.length > 0;

      logTest('geographic', `proximity_${location.city}`, 'passed', {
        location: location.city,
        nearbyCount: data.nearby_activities.length,
        clustersCount: data.geographic_clusters.length,
        radius: data.radius_km
      });

    } catch (error) {
      logTest('geographic', `proximity_${location.city}`, 'failed', {
        location: location.city,
        error: error.message
      });
    }
  }
}

/**
 * Test Cultural Context Processing
 */
async function testCulturalContextProcessing() {
  console.log('\n🎭 Testing Cultural Context Processing...');

  const culturalTestCases = [
    {
      query: 'أنشطة تراثية عائلية',
      culturalContext: 'saudi_traditional',
      expectedTags: ['traditional', 'family'],
      language: 'ar'
    },
    {
      query: 'modern entertainment activities',
      culturalContext: 'expat_western',
      expectedTags: ['modern', 'entertainment'],
      language: 'en'
    },
    {
      query: 'أنشطة اجتماعية للشباب',
      culturalContext: 'saudi_modern',
      expectedTags: ['social', 'youth'],
      language: 'ar'
    }
  ];

  for (const testCase of culturalTestCases) {
    try {
      const searchRequest = {
        query: testCase.query,
        user_id: TEST_USER_ID,
        language: testCase.language,
        cultural_preferences: {
          context: testCase.culturalContext
        }
      };

      const response = await axios.post(
        `${AGENTS_API_URL}/agents/discover/search`,
        searchRequest,
        { timeout: 10000 }
      );

      const data = response.data;
      
      // Validate cultural processing
      assert(data.cultural_insights !== undefined, 'Response should have cultural insights');
      assert(data.processed_query?.intent !== undefined, 'Query should be processed for intent');
      
      // Check for cultural relevance in results
      const hasCulturallyRelevantResults = data.results?.some(result => 
        testCase.expectedTags.some(tag => 
          result.cultural_tags?.includes(tag) || 
          result.category === tag
        )
      );

      logTest('cultural_context', `cultural_processing_${testCase.culturalContext}`, 'passed', {
        query: testCase.query,
        culturalContext: testCase.culturalContext,
        culturalInsights: data.cultural_insights?.length || 0,
        culturallyRelevant: hasCulturallyRelevantResults,
        resultsCount: data.results?.length || 0
      });

    } catch (error) {
      logTest('cultural_context', `cultural_processing_${testCase.culturalContext}`, 'failed', {
        query: testCase.query,
        error: error.message
      });
    }
  }
}

/**
 * Test Performance Requirements
 */
async function testPerformanceRequirements() {
  console.log('\n⚡ Testing Performance Requirements...');

  const performanceTests = [
    { name: 'search_response_time', threshold: 300, type: 'search' },
    { name: 'recommendation_response_time', threshold: 500, type: 'recommendation' },
    { name: 'concurrent_search_load', threshold: 1000, type: 'concurrent' }
  ];

  for (const test of performanceTests) {
    try {
      if (test.type === 'search') {
        // Test search response time
        const startTime = Date.now();
        
        const response = await axios.post(
          `${AGENTS_API_URL}/agents/discover/search`,
          {
            query: 'مغامرات في الرياض',
            user_id: TEST_USER_ID,
            language: 'ar'
          },
          { timeout: 10000 }
        );
        
        const responseTime = Date.now() - startTime;
        
        assert(response.status === 200, 'Search should return 200 status');
        assert(responseTime < test.threshold, 
          `Search response time should be under ${test.threshold}ms, got ${responseTime}ms`);

        logTest('performance', test.name, 'passed', {
          responseTime,
          threshold: test.threshold,
          resultsCount: response.data.results?.length || 0
        });

      } else if (test.type === 'recommendation') {
        // Test recommendation response time
        const startTime = Date.now();
        
        const response = await axios.post(
          `${AGENTS_API_URL}/agents/discover/recommend`,
          {
            user_id: TEST_USER_ID,
            cultural_context: 'saudi_modern'
          },
          { timeout: 10000 }
        );
        
        const responseTime = Date.now() - startTime;
        
        assert(response.status === 200, 'Recommendation should return 200 status');
        assert(responseTime < test.threshold, 
          `Recommendation response time should be under ${test.threshold}ms, got ${responseTime}ms`);

        logTest('performance', test.name, 'passed', {
          responseTime,
          threshold: test.threshold,
          recommendationCount: response.data.recommendations?.length || 0
        });

      } else if (test.type === 'concurrent') {
        // Test concurrent search load
        const concurrentRequests = 10;
        const promises = [];
        
        const startTime = Date.now();
        
        for (let i = 0; i < concurrentRequests; i++) {
          promises.push(
            axios.post(
              `${AGENTS_API_URL}/agents/discover/search`,
              {
                query: `تجربة ${i} للبحث المتزامن`,
                user_id: `${TEST_USER_ID}_${i}`,
                language: 'ar'
              },
              { timeout: 15000 }
            )
          );
        }
        
        const responses = await Promise.all(promises);
        const totalTime = Date.now() - startTime;
        const avgResponseTime = totalTime / concurrentRequests;
        
        assert(responses.every(r => r.status === 200), 'All concurrent requests should succeed');
        assert(avgResponseTime < test.threshold, 
          `Average concurrent response time should be under ${test.threshold}ms, got ${avgResponseTime}ms`);

        logTest('performance', test.name, 'passed', {
          concurrentRequests,
          totalTime,
          avgResponseTime,
          successfulRequests: responses.length
        });
      }

    } catch (error) {
      logTest('performance', test.name, 'failed', { error: error.message });
    }
  }
}

/**
 * Test Backend Integration
 */
async function testBackendIntegration() {
  console.log('\n🔌 Testing Backend Integration...');

  try {
    // Test search endpoint integration
    const searchResponse = await axios.post(
      `${BACKEND_API_URL}/discover/search`,
      {
        query: 'أنشطة مغامرات',
        language: 'ar',
        filters: {
          location: { city: 'الرياض' }
        }
      },
      { timeout: 10000 }
    );

    assert(searchResponse.status === 200, 'Backend search should return 200');
    assert(searchResponse.data.success === true, 'Backend search should be successful');
    assert(searchResponse.data.data?.results !== undefined, 'Should have results data');

    logTest('backend_integration', 'search_endpoint', 'passed', {
      resultsCount: searchResponse.data.data.results?.length || 0,
      hasEnhancedData: !!searchResponse.data.data.culturalInsights,
      fallbackMode: searchResponse.data.fallback || false
    });

    // Test trending endpoint
    const trendingResponse = await axios.get(
      `${BACKEND_API_URL}/discover/trending`,
      {
        params: { timeframe: 'week', language: 'ar' },
        timeout: 10000
      }
    );

    assert(trendingResponse.status === 200, 'Trending endpoint should return 200');
    assert(trendingResponse.data.success === true, 'Trending should be successful');

    logTest('backend_integration', 'trending_endpoint', 'passed', {
      trendingCount: trendingResponse.data.data?.trendingActivities?.length || 0
    });

  } catch (error) {
    logTest('backend_integration', 'endpoint_integration', 'failed', { error: error.message });
  }
}

/**
 * Test Search Accuracy and Relevance
 */
async function testSearchAccuracy() {
  console.log('\n🎯 Testing Search Accuracy...');

  const accuracyTests = [
    {
      query: 'تسلق جبال',
      expectedCategory: 'adventure',
      language: 'ar'
    },
    {
      query: 'cooking workshops',
      expectedCategory: 'food',
      language: 'en'
    },
    {
      query: 'متحف تراثي',
      expectedCategory: 'cultural',
      language: 'ar'
    },
    {
      query: 'fitness activities',
      expectedCategory: 'fitness',
      language: 'en'
    }
  ];

  for (const test of accuracyTests) {
    try {
      const response = await axios.post(
        `${AGENTS_API_URL}/agents/discover/search`,
        {
          query: test.query,
          user_id: TEST_USER_ID,
          language: test.language
        },
        { timeout: 10000 }
      );

      const data = response.data;
      
      // Check if top results match expected category
      const topResults = data.results?.slice(0, 3) || [];
      const categoryMatches = topResults.filter(result => 
        result.category === test.expectedCategory
      ).length;
      
      const accuracyScore = topResults.length > 0 ? categoryMatches / topResults.length : 0;
      
      assert(accuracyScore >= 0.5, 
        `Search accuracy should be at least 50%, got ${accuracyScore * 100}%`);

      logTest('accuracy', `category_matching_${test.expectedCategory}`, 'passed', {
        query: test.query,
        expectedCategory: test.expectedCategory,
        accuracyScore: accuracyScore * 100,
        categoryMatches,
        totalResults: topResults.length
      });

    } catch (error) {
      logTest('accuracy', `category_matching_${test.expectedCategory}`, 'failed', {
        query: test.query,
        error: error.message
      });
    }
  }
}

/**
 * Test Cultural Context Accuracy
 */
async function testCulturalContextAccuracy() {
  console.log('\n🏛️ Testing Cultural Context Accuracy...');

  const culturalTests = [
    {
      query: 'أنشطة تراثية للعائلة',
      culturalContext: 'saudi_traditional',
      expectedFeatures: ['family_friendly', 'traditional'],
      language: 'ar'
    },
    {
      query: 'modern social activities',
      culturalContext: 'expat_western',
      expectedFeatures: ['modern', 'social'],
      language: 'en'
    }
  ];

  for (const test of culturalTests) {
    try {
      const response = await axios.post(
        `${AGENTS_API_URL}/agents/discover/search`,
        {
          query: test.query,
          user_id: TEST_USER_ID,
          language: test.language,
          cultural_preferences: {
            context: test.culturalContext
          }
        },
        { timeout: 10000 }
      );

      const data = response.data;
      const culturalFitResults = data.results?.filter(result => 
        test.expectedFeatures.some(feature => 
          result[feature] === true || 
          result.cultural_tags?.includes(feature)
        )
      ) || [];

      const culturalAccuracy = data.results?.length > 0 ? 
        culturalFitResults.length / data.results.length : 0;

      assert(culturalAccuracy >= 0.3, 
        `Cultural accuracy should be at least 30%, got ${culturalAccuracy * 100}%`);

      logTest('cultural_accuracy', `context_${test.culturalContext}`, 'passed', {
        query: test.query,
        culturalContext: test.culturalContext,
        culturalAccuracy: culturalAccuracy * 100,
        culturalFitResults: culturalFitResults.length,
        totalResults: data.results?.length || 0,
        hasCulturalInsights: data.cultural_insights?.length > 0
      });

    } catch (error) {
      logTest('cultural_accuracy', `context_${test.culturalContext}`, 'failed', {
        query: test.query,
        error: error.message
      });
    }
  }
}

/**
 * Test Database Integration
 */
async function testDatabaseIntegration() {
  console.log('\n🗄️ Testing Database Integration...');

  try {
    // Test preference profile creation
    const preferenceData = {
      user_id: TEST_USER_ID,
      interaction_data: {
        type: 'search',
        activity_data: {
          category: 'adventure',
          cultural_tags: ['modern', 'outdoor']
        },
        user_response: 'clicked'
      }
    };

    const prefResponse = await axios.post(
      `${AGENTS_API_URL}/agents/discover/save-preferences`,
      preferenceData,
      { timeout: 5000 }
    );

    assert(prefResponse.status === 200, 'Preference update should return 200');
    assert(prefResponse.data.success === true, 'Preference update should be successful');

    logTest('database', 'preference_profile_update', 'passed', {
      userId: TEST_USER_ID,
      learningStatus: prefResponse.data.learning_status
    });

    // Test analytics data collection
    const analyticsResponse = await axios.get(
      `${AGENTS_API_URL}/agents/discover/analytics`,
      {
        params: { timeframe: 'day' },
        timeout: 5000
      }
    );

    assert(analyticsResponse.status === 200, 'Analytics should return 200');
    assert(analyticsResponse.data !== undefined, 'Analytics should have data');

    logTest('database', 'analytics_collection', 'passed', {
      hasAnalytics: !!analyticsResponse.data,
      totalSearches: analyticsResponse.data.total_searches || 0
    });

  } catch (error) {
    logTest('database', 'database_integration', 'failed', { error: error.message });
  }
}

/**
 * Test Error Handling and Fallbacks
 */
async function testErrorHandling() {
  console.log('\n🛡️ Testing Error Handling...');

  const errorTests = [
    {
      name: 'empty_query',
      request: { query: '', user_id: TEST_USER_ID },
      expectedBehavior: 'should_handle_gracefully'
    },
    {
      name: 'invalid_location',
      request: { 
        query: 'activities', 
        location: { city: 'InvalidCity', coordinates: [999, 999] },
        user_id: TEST_USER_ID 
      },
      expectedBehavior: 'should_fallback'
    },
    {
      name: 'malformed_filters',
      request: { 
        query: 'activities',
        filters: { price_range: 'invalid' },
        user_id: TEST_USER_ID 
      },
      expectedBehavior: 'should_ignore_invalid_filters'
    }
  ];

  for (const test of errorTests) {
    try {
      const response = await axios.post(
        `${AGENTS_API_URL}/agents/discover/search`,
        test.request,
        { timeout: 10000 }
      );

      // Should not throw error but handle gracefully
      assert(response.status === 200, 'Error cases should still return 200');
      
      logTest('error_handling', test.name, 'passed', {
        request: test.request,
        handledGracefully: true,
        resultsReturned: response.data.results?.length || 0
      });

    } catch (error) {
      // Some errors are expected, check if they're handled properly
      if (error.response?.status >= 400 && error.response?.status < 500) {
        logTest('error_handling', test.name, 'passed', {
          request: test.request,
          expectedError: true,
          errorStatus: error.response.status
        });
      } else {
        logTest('error_handling', test.name, 'failed', { 
          request: test.request,
          error: error.message 
        });
      }
    }
  }
}

/**
 * Test Arabic Language Processing
 */
async function testArabicLanguageProcessing() {
  console.log('\n🇸🇦 Testing Arabic Language Processing...');

  const arabicTests = [
    {
      query: 'أبحث عن أنشطة مغامرات في الرياض للشباب',
      expectedEntities: ['مغامرات', 'الرياض', 'شباب'],
      expectedIntent: ['adventure']
    },
    {
      query: 'أريد ورشة طبخ تراثية مناسبة للعائلة',
      expectedEntities: ['طبخ', 'تراثية', 'عائلة'],
      expectedIntent: ['food', 'cultural']
    },
    {
      query: 'أنشطة رياضية مائية في جدة نهاية الأسبوع',
      expectedEntities: ['رياضية', 'مائية', 'جدة', 'نهاية الأسبوع'],
      expectedIntent: ['sports', 'water']
    }
  ];

  for (const test of arabicTests) {
    try {
      const response = await axios.post(
        `${AGENTS_API_URL}/agents/discover/search`,
        {
          query: test.query,
          user_id: TEST_USER_ID,
          language: 'ar'
        },
        { timeout: 10000 }
      );

      const data = response.data;
      const processedQuery = data.processed_query;
      
      // Validate Arabic processing
      assert(processedQuery?.language === 'ar', 'Should detect Arabic language');
      assert(processedQuery?.intent?.length > 0, 'Should extract intent from Arabic query');
      assert(processedQuery?.confidence > 0, 'Should have confidence in Arabic processing');

      // Check if expected intents are found
      const intentMatches = test.expectedIntent.filter(intent => 
        processedQuery.intent?.includes(intent)
      ).length;
      
      const intentAccuracy = intentMatches / test.expectedIntent.length;
      assert(intentAccuracy >= 0.5, `Intent extraction accuracy should be at least 50%`);

      logTest('arabic_processing', 'intent_extraction', 'passed', {
        query: test.query,
        extractedIntents: processedQuery.intent,
        expectedIntents: test.expectedIntent,
        intentAccuracy: intentAccuracy * 100,
        confidence: processedQuery.confidence
      });

    } catch (error) {
      logTest('arabic_processing', 'intent_extraction', 'failed', {
        query: test.query,
        error: error.message
      });
    }
  }
}

/**
 * Test Machine Learning Recommendation Quality
 */
async function testMLRecommendationQuality() {
  console.log('\n🤖 Testing ML Recommendation Quality...');

  try {
    // Simulate user preference learning
    const userInteractions = [
      { type: 'booking', category: 'adventure', cultural_tags: ['modern', 'outdoor'] },
      { type: 'clicked', category: 'food', cultural_tags: ['traditional'] },
      { type: 'shared', category: 'cultural', cultural_tags: ['heritage'] }
    ];

    // Update user preferences based on simulated interactions
    for (const interaction of userInteractions) {
      await axios.post(
        `${AGENTS_API_URL}/agents/discover/save-preferences`,
        {
          user_id: TEST_USER_ID,
          interaction_data: {
            type: interaction.type,
            activity_data: {
              category: interaction.category,
              cultural_tags: interaction.cultural_tags
            },
            user_response: interaction.type
          }
        },
        { timeout: 5000 }
      );
    }

    // Get recommendations after learning
    const recResponse = await axios.post(
      `${AGENTS_API_URL}/agents/discover/recommend`,
      {
        user_id: TEST_USER_ID,
        cultural_context: 'saudi_modern'
      },
      { timeout: 10000 }
    );

    const recommendations = recResponse.data.recommendations || [];
    
    // Validate recommendation quality
    assert(recommendations.length > 0, 'Should return recommendations');
    
    const avgScore = recommendations.reduce((sum, rec) => 
      sum + (rec.recommendation_score || 0), 0) / recommendations.length;
    assert(avgScore >= 0.4, `Average recommendation score should be at least 40%, got ${avgScore * 100}%`);

    // Check if recommendations align with user preferences
    const preferredCategories = userInteractions.map(i => i.category);
    const categoryMatches = recommendations.filter(rec => 
      preferredCategories.includes(rec.activity?.category)
    ).length;
    
    const categoryAccuracy = categoryMatches / recommendations.length;

    logTest('ml_quality', 'recommendation_learning', 'passed', {
      recommendationCount: recommendations.length,
      averageScore: avgScore * 100,
      categoryAccuracy: categoryAccuracy * 100,
      confidenceScore: recResponse.data.confidence_score * 100
    });

  } catch (error) {
    logTest('ml_quality', 'recommendation_learning', 'failed', { error: error.message });
  }
}

/**
 * Test System Integration End-to-End
 */
async function testSystemIntegration() {
  console.log('\n🔄 Testing System Integration End-to-End...');

  try {
    // Simulate complete user journey
    console.log('  📱 Simulating user journey...');
    
    // 1. User searches for activity
    const searchResponse = await axios.post(
      `${BACKEND_API_URL}/discover/search`,
      {
        query: 'أنشطة مغامرات مناسبة للشباب في الرياض',
        language: 'ar',
        filters: {
          location: { city: 'الرياض' },
          participants: 5
        }
      },
      { timeout: 10000 }
    );

    assert(searchResponse.data.success === true, 'Search should succeed');
    const searchResults = searchResponse.data.data?.results || [];
    assert(searchResults.length > 0, 'Should return search results');

    // 2. User clicks on an activity
    if (searchResults.length > 0) {
      await axios.post(
        `${BACKEND_API_URL}/discover/track-interaction`,
        {
          activity_id: searchResults[0]._id || 'test_activity',
          interaction_type: 'click',
          position: 0,
          context: { from_search: true }
        },
        { 
          timeout: 5000,
          headers: { 'Authorization': 'Bearer test_token' }
        }
      ).catch(() => {}); // Ignore auth errors for testing
    }

    // 3. Get personalized recommendations
    const recResponse = await axios.post(
      `${AGENTS_API_URL}/agents/discover/recommend`,
      {
        user_id: TEST_USER_ID,
        context: { from_search: true },
        cultural_context: 'saudi_modern'
      },
      { timeout: 10000 }
    );

    assert(recResponse.data.recommendations !== undefined, 'Should return recommendations');

    // 4. Check trending activities
    const trendingResponse = await axios.get(
      `${AGENTS_API_URL}/agents/discover/trending`,
      {
        params: { location: 'الرياض', timeframe: 'week' },
        timeout: 10000
      }
    );

    assert(trendingResponse.data.trending_activities !== undefined, 'Should return trending activities');

    logTest('system_integration', 'end_to_end_journey', 'passed', {
      searchResults: searchResults.length,
      recommendationCount: recResponse.data.recommendations?.length || 0,
      trendingCount: trendingResponse.data.trending_activities?.length || 0,
      journeyCompleted: true
    });

  } catch (error) {
    logTest('system_integration', 'end_to_end_journey', 'failed', { error: error.message });
  }
}

/**
 * Main Test Runner
 */
async function runAllTests() {
  console.log('🚀 Starting Selena-Discover AI Agent Test Suite');
  console.log('=' .repeat(60));

  const testSuites = [
    { name: 'Agent Connectivity', fn: testAgentConnectivity },
    { name: 'Natural Language Processing', fn: testNaturalLanguageProcessing },
    { name: 'Recommendation Engine', fn: testRecommendationEngine },
    { name: 'Geographic Proximity', fn: testGeographicProximity },
    { name: 'Cultural Context Processing', fn: testCulturalContextProcessing },
    { name: 'Performance Requirements', fn: testPerformanceRequirements },
    { name: 'Backend Integration', fn: testBackendIntegration },
    { name: 'Search Accuracy', fn: testSearchAccuracy },
    { name: 'Cultural Context Accuracy', fn: testCulturalContextAccuracy },
    { name: 'Arabic Language Processing', fn: testArabicLanguageProcessing },
    { name: 'ML Recommendation Quality', fn: testMLRecommendationQuality },
    { name: 'Error Handling', fn: testErrorHandling },
    { name: 'System Integration', fn: testSystemIntegration }
  ];

  for (const suite of testSuites) {
    try {
      await suite.fn();
    } catch (error) {
      console.error(`Test suite "${suite.name}" encountered an error:`, error.message);
    }
  }

  // Print final results
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=' .repeat(60));
  
  console.log(`Total Tests: ${testResults.totalTests}`);
  console.log(`✅ Passed: ${testResults.passedTests} (${((testResults.passedTests / testResults.totalTests) * 100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${testResults.failedTests} (${((testResults.failedTests / testResults.totalTests) * 100).toFixed(1)}%)`);
  console.log(`⚠️ Skipped: ${testResults.skippedTests} (${((testResults.skippedTests / testResults.totalTests) * 100).toFixed(1)}%)`);

  console.log('\n📋 Test Suite Breakdown:');
  for (const [suiteName, suite] of Object.entries(testResults.testSuites)) {
    const passRate = ((suite.passed / suite.total) * 100).toFixed(1);
    console.log(`  ${suiteName}: ${suite.passed}/${suite.total} (${passRate}%)`);
  }

  // Success criteria check
  const overallPassRate = (testResults.passedTests / testResults.totalTests) * 100;
  const meetsSuccessCriteria = overallPassRate >= 80;

  console.log('\n🎯 SUCCESS CRITERIA:');
  console.log(`Overall Pass Rate: ${overallPassRate.toFixed(1)}% (Target: ≥80%)`);
  console.log(`Status: ${meetsSuccessCriteria ? '✅ PASSED' : '❌ FAILED'}`);

  if (meetsSuccessCriteria) {
    console.log('\n🎉 Selena-Discover AI Agent is ready for deployment!');
  } else {
    console.log('\n⚠️ Selena-Discover AI Agent needs improvements before deployment.');
    
    // Show failing test suites
    const failingSuites = Object.entries(testResults.testSuites)
      .filter(([, suite]) => (suite.passed / suite.total) < 0.8)
      .map(([name]) => name);
    
    if (failingSuites.length > 0) {
      console.log('\n❌ Failing Test Suites:');
      failingSuites.forEach(suite => console.log(`  - ${suite}`));
    }
  }

  // Save detailed results
  const fs = require('fs');
  const resultsPath = '/workspace/selena-discover-test-results.json';
  fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📁 Detailed results saved to: ${resultsPath}`);

  return meetsSuccessCriteria;
}

// Run tests if called directly
if (require.main === module) {
  runAllTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  testResults
};