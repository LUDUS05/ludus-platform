/**
 * Query Optimization Utilities
 * 
 * Provides utilities to optimize database queries and reduce slow query times
 * 
 * @since 2025-10-13
 */

const mongoose = require('mongoose');

/**
 * Optimizes findOne queries with proper indexing hints
 * @param {Object} Model - Mongoose model
 * @param {Object} query - Query object
 * @param {Object} options - Query options
 * @returns {Promise} - Optimized query result
 */
const optimizedFindOne = async (Model, query, options = {}) => {
  const startTime = Date.now();
  
  try {
    // Add query optimization options
    const optimizedOptions = {
      lean: true, // Return plain JavaScript objects instead of Mongoose documents
      maxTimeMS: 5000, // 5 second timeout
      ...options
    };
    
    const result = await Model.findOne(query, null, optimizedOptions);
    const duration = Date.now() - startTime;
    
    if (duration > 1000) {
      console.warn(`🐌 Slow query detected: ${Model.modelName}.findOne (${duration}ms)`, query);
    }
    
    return result;
  } catch (error) {
    console.error(`❌ Query error in ${Model.modelName}.findOne:`, error);
    throw error;
  }
};

/**
 * Optimizes find queries with proper indexing hints
 * @param {Object} Model - Mongoose model
 * @param {Object} query - Query object
 * @param {Object} options - Query options
 * @returns {Promise} - Optimized query result
 */
const optimizedFind = async (Model, query, options = {}) => {
  const startTime = Date.now();
  
  try {
    // Add query optimization options
    const optimizedOptions = {
      lean: true, // Return plain JavaScript objects instead of Mongoose documents
      maxTimeMS: 10000, // 10 second timeout
      limit: 100, // Default limit to prevent large result sets
      ...options
    };
    
    const result = await Model.find(query, null, optimizedOptions);
    const duration = Date.now() - startTime;
    
    if (duration > 2000) {
      console.warn(`🐌 Slow query detected: ${Model.modelName}.find (${duration}ms)`, query);
    }
    
    return result;
  } catch (error) {
    console.error(`❌ Query error in ${Model.modelName}.find:`, error);
    throw error;
  }
};

/**
 * Optimizes updateOne queries with proper indexing hints
 * @param {Object} Model - Mongoose model
 * @param {Object} filter - Filter object
 * @param {Object} update - Update object
 * @param {Object} options - Query options
 * @returns {Promise} - Optimized query result
 */
const optimizedUpdateOne = async (Model, filter, update, options = {}) => {
  const startTime = Date.now();
  
  try {
    // Add query optimization options
    const optimizedOptions = {
      maxTimeMS: 5000, // 5 second timeout
      ...options
    };
    
    const result = await Model.updateOne(filter, update, optimizedOptions);
    const duration = Date.now() - startTime;
    
    if (duration > 1000) {
      console.warn(`🐌 Slow query detected: ${Model.modelName}.updateOne (${duration}ms)`, filter);
    }
    
    return result;
  } catch (error) {
    console.error(`❌ Query error in ${Model.modelName}.updateOne:`, error);
    throw error;
  }
};

/**
 * Creates optimized indexes for a model
 * @param {Object} Model - Mongoose model
 * @param {Array} indexes - Array of index definitions
 * @returns {Promise} - Index creation result
 */
const createOptimizedIndexes = async (Model, indexes) => {
  try {
    const results = [];
    
    for (const index of indexes) {
      const result = await Model.collection.createIndex(index.keys, {
        background: true,
        ...index.options
      });
      results.push(result);
    }
    
    console.log(`✅ Created ${results.length} optimized indexes for ${Model.modelName}`);
    return results;
  } catch (error) {
    console.error(`❌ Error creating indexes for ${Model.modelName}:`, error);
    throw error;
  }
};

/**
 * Analyzes query performance and suggests optimizations
 * @param {Object} Model - Mongoose model
 * @param {Object} query - Query object
 * @returns {Object} - Analysis result
 */
const analyzeQuery = async (Model, query) => {
  try {
    const explainResult = await Model.find(query).explain('executionStats');
    
    const analysis = {
      executionTime: explainResult.executionStats.executionTimeMillis,
      totalDocsExamined: explainResult.executionStats.totalDocsExamined,
      totalDocsReturned: explainResult.executionStats.totalDocsReturned,
      indexUsed: explainResult.executionStats.executionStages?.indexName || 'No index used',
      needsOptimization: explainResult.executionStats.totalDocsExamined > explainResult.executionStats.totalDocsReturned * 2
    };
    
    if (analysis.needsOptimization) {
      console.warn(`⚠️  Query needs optimization: ${Model.modelName}`, {
        executionTime: analysis.executionTime,
        docsExamined: analysis.totalDocsExamined,
        docsReturned: analysis.totalDocsReturned,
        indexUsed: analysis.indexUsed
      });
    }
    
    return analysis;
  } catch (error) {
    console.error(`❌ Error analyzing query for ${Model.modelName}:`, error);
    throw error;
  }
};

module.exports = {
  optimizedFindOne,
  optimizedFind,
  optimizedUpdateOne,
  createOptimizedIndexes,
  analyzeQuery
};
