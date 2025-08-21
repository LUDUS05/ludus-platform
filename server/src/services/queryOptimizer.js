const mongoose = require('mongoose');
const { performanceMonitor } = require('../middleware/performance');

class QueryOptimizer {
  constructor() {
    this.queryStats = new Map();
    this.slowQueryThreshold = 100; // 100ms threshold for slow queries
    this.maxQueryStats = 1000; // Keep last 1000 query stats
    
    this.setupQueryMonitoring();
  }

  // Setup mongoose query monitoring
  setupQueryMonitoring() {
    // Monitor all queries
    mongoose.set('debug', process.env.NODE_ENV === 'development');
    
    // Intercept all queries to measure performance
    this.interceptQueries();
    
    // Set up query timeout warnings
    this.setupQueryTimeouts();
  }

  // Intercept mongoose queries to measure performance
  interceptQueries() {
    const originalExec = mongoose.Query.prototype.exec;
    const originalFind = mongoose.Query.prototype.find;
    const originalFindOne = mongoose.Query.prototype.findOne;
    const originalAggregate = mongoose.Model.aggregate;

    // Intercept exec() method
    mongoose.Query.prototype.exec = async function(...args) {
      const startTime = Date.now();
      const queryString = this.getQuery();
      const collection = this.mongooseCollection?.name || 'unknown';
      const operation = this.op || 'unknown';
      
      try {
        const result = await originalExec.apply(this, args);
        const executionTime = Date.now() - startTime;
        
        // Record query performance
        QueryOptimizer.instance.recordQuery({
          collection,
          operation,
          query: queryString,
          executionTime,
          success: true,
          timestamp: new Date().toISOString()
        });

        // Add performance data to request if available
        if (this._req) {
          this._req.dbQueryTime = executionTime;
          this._req.dbQueries = (this._req.dbQueries || 0) + 1;
        }

        return result;
      } catch (error) {
        const executionTime = Date.now() - startTime;
        
        // Record failed query
        QueryOptimizer.instance.recordQuery({
          collection,
          operation,
          query: queryString,
          executionTime,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });

        throw error;
      }
    };

    // Intercept find() method
    mongoose.Query.prototype.find = function(...args) {
      this._req = global.currentRequest; // Store current request context
      return originalFind.apply(this, args);
    };

    // Intercept findOne() method
    mongoose.Query.prototype.findOne = function(...args) {
      this._req = global.currentRequest; // Store current request context
      return originalFindOne.apply(this, args);
    };

    // Intercept aggregate() method
    mongoose.Model.aggregate = function(...args) {
      const startTime = Date.now();
      const pipeline = args[0] || [];
      const collection = this.collection.name;
      
      const originalExec = mongoose.Aggregate.prototype.exec;
      mongoose.Aggregate.prototype.exec = async function(...execArgs) {
        try {
          const result = await originalExec.apply(this, execArgs);
          const executionTime = Date.now() - startTime;
          
          // Record aggregation performance
          QueryOptimizer.instance.recordQuery({
            collection,
            operation: 'aggregate',
            query: JSON.stringify(pipeline),
            executionTime,
            success: true,
            timestamp: new Date().toISOString()
          });

          return result;
        } catch (error) {
          const executionTime = Date.now() - startTime;
          
          // Record failed aggregation
          QueryOptimizer.instance.recordQuery({
            collection,
            operation: 'aggregate',
            query: JSON.stringify(pipeline),
            executionTime,
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
          });

          throw error;
        }
      };
      
      return mongoose.Aggregate.prototype.exec.apply(this, args);
    };
  }

  // Setup query timeouts
  setupQueryTimeouts() {
    // Set default query timeout
    mongoose.set('maxTimeMS', 30000); // 30 seconds
    
    // Monitor for long-running queries
    setInterval(() => {
      this.checkForLongRunningQueries();
    }, 10000); // Check every 10 seconds
  }

  // Record query performance
  recordQuery(queryInfo) {
    const key = `${queryInfo.collection}:${queryInfo.operation}`;
    
    if (!this.queryStats.has(key)) {
      this.queryStats.set(key, {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        minTime: Infinity,
        maxTime: 0,
        slowQueries: 0,
        errors: 0,
        lastExecuted: null
      });
    }
    
    const stats = this.queryStats.get(key);
    stats.count++;
    stats.totalTime += queryInfo.executionTime;
    stats.avgTime = Math.round(stats.totalTime / stats.count);
    stats.minTime = Math.min(stats.minTime, queryInfo.executionTime);
    stats.maxTime = Math.max(stats.maxTime, queryInfo.executionTime);
    stats.lastExecuted = queryInfo.timestamp;
    
    if (queryInfo.executionTime > this.slowQueryThreshold) {
      stats.slowQueries++;
      
      // Log slow queries
      if (queryInfo.executionTime > 1000) { // Very slow queries
        console.warn('🐌 Very slow query detected:', {
          collection: queryInfo.collection,
          operation: queryInfo.operation,
          executionTime: `${queryInfo.executionTime}ms`,
          query: queryInfo.query.substring(0, 200) + '...'
        });
      }
    }
    
    if (!queryInfo.success) {
      stats.errors++;
    }
    
    // Limit stored stats
    if (this.queryStats.size > this.maxQueryStats) {
      const firstKey = this.queryStats.keys().next().value;
      this.queryStats.delete(firstKey);
    }
  }

  // Check for long-running queries
  checkForLongRunningQueries() {
    // This would require more sophisticated monitoring in production
    // For now, we'll just log a summary
    if (this.queryStats.size > 0) {
      const totalQueries = Array.from(this.queryStats.values())
        .reduce((sum, stats) => sum + stats.count, 0);
      
      const slowQueries = Array.from(this.queryStats.values())
        .reduce((sum, stats) => sum + stats.slowQueries, 0);
      
      if (slowQueries > 0) {
        console.log(`📊 Query Performance: ${totalQueries} total queries, ${slowQueries} slow queries`);
      }
    }
  }

  // Get query performance statistics
  getQueryStats() {
    const stats = {};
    
    for (const [key, value] of this.queryStats.entries()) {
      stats[key] = {
        ...value,
        slowQueryPercentage: Math.round((value.slowQueries / value.count) * 100),
        errorPercentage: Math.round((value.errors / value.count) * 100)
      };
    }
    
    return stats;
  }

  // Get slow query analysis
  getSlowQueryAnalysis() {
    const slowQueries = [];
    
    for (const [key, stats] of this.queryStats.entries()) {
      if (stats.slowQueries > 0) {
        slowQueries.push({
          query: key,
          ...stats,
          slowQueryPercentage: Math.round((stats.slowQueries / stats.count) * 100)
        });
      }
    }
    
    return slowQueries.sort((a, b) => b.slowQueries - a.slowQueries);
  }

  // Get performance recommendations
  getPerformanceRecommendations() {
    const recommendations = [];
    
    for (const [key, stats] of this.queryStats.entries()) {
      if (stats.avgTime > 500) { // Queries taking more than 500ms on average
        recommendations.push({
          query: key,
          issue: 'High average execution time',
          recommendation: 'Consider adding database indexes or optimizing query structure',
          avgTime: stats.avgTime,
          count: stats.count
        });
      }
      
      if (stats.slowQueries > stats.count * 0.1) { // More than 10% slow queries
        recommendations.push({
          query: key,
          issue: 'High percentage of slow queries',
          recommendation: 'Investigate query patterns and add appropriate indexes',
          slowQueryPercentage: Math.round((stats.slowQueries / stats.count) * 100),
          count: stats.count
        });
      }
      
      if (stats.errors > stats.count * 0.05) { // More than 5% errors
        recommendations.push({
          query: key,
          issue: 'High error rate',
          recommendation: 'Review query logic and error handling',
          errorPercentage: Math.round((stats.errors / stats.count) * 100),
          count: stats.count
        });
      }
    }
    
    return recommendations;
  }

  // Optimize specific queries
  async optimizeQueries() {
    const recommendations = this.getPerformanceRecommendations();
    const optimizations = [];
    
    for (const rec of recommendations) {
      if (rec.query.includes('find') && rec.avgTime > 500) {
        // Suggest index optimization
        const collection = rec.query.split(':')[0];
        optimizations.push({
          type: 'index',
          collection,
          description: `Add compound indexes for frequently queried fields in ${collection}`,
          priority: 'high'
        });
      }
      
      if (rec.query.includes('aggregate') && rec.avgTime > 1000) {
        // Suggest aggregation optimization
        optimizations.push({
          type: 'aggregation',
          collection: rec.query.split(':')[0],
          description: 'Consider pre-aggregating data or using materialized views',
          priority: 'medium'
        });
      }
    }
    
    return optimizations;
  }

  // Create database indexes for better performance
  async createPerformanceIndexes() {
    try {
      const db = mongoose.connection.db;
      
      // Activities collection indexes
      await db.collection('activities').createIndex(
        { "location.coordinates": "2dsphere" },
        { background: true }
      );
      
      await db.collection('activities').createIndex(
        { category: 1, isActive: 1, featured: 1 },
        { background: true }
      );
      
      await db.collection('activities').createIndex(
        { title: "text", description: "text", tags: "text" },
        { background: true, weights: { title: 10, description: 5, tags: 3 } }
      );
      
      // Users collection indexes
      await db.collection('users').createIndex(
        { email: 1 },
        { unique: true, background: true }
      );
      
      await db.collection('users').createIndex(
        { "location.coordinates": "2dsphere" },
        { background: true }
      );
      
      // Bookings collection indexes
      await db.collection('bookings').createIndex(
        { user: 1, bookingDate: -1 },
        { background: true }
      );
      
      await db.collection('bookings').createIndex(
        { activity: 1, status: 1, bookingDate: 1 },
        { background: true }
      );
      
      // Vendors collection indexes
      await db.collection('vendors').createIndex(
        { category: 1, isActive: 1 },
        { background: true }
      );
      
      await db.collection('vendors').createIndex(
        { "location.coordinates": "2dsphere" },
        { background: true }
      );
      
      console.log('✅ Performance indexes created successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Error creating performance indexes:', error.message);
      return false;
    }
  }

  // Get database performance summary
  async getDatabasePerformanceSummary() {
    try {
      const db = mongoose.connection.db;
      const stats = await db.stats();
      
      return {
        collections: stats.collections,
        indexes: stats.indexes,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexSize: stats.indexSize,
        queryStats: this.getQueryStats(),
        slowQueries: this.getSlowQueryAnalysis(),
        recommendations: this.getPerformanceRecommendations()
      };
      
    } catch (error) {
      console.error('❌ Error getting database performance summary:', error.message);
      return null;
    }
  }

  // Reset query statistics
  resetQueryStats() {
    this.queryStats.clear();
    console.log('✅ Query statistics reset');
  }

  // Cleanup
  destroy() {
    this.queryStats.clear();
    console.log('✅ Query optimizer destroyed');
  }
}

// Create singleton instance
QueryOptimizer.instance = new QueryOptimizer();

// Export the instance and class
module.exports = {
  QueryOptimizer,
  queryOptimizer: QueryOptimizer.instance,
  
  // Convenience functions
  getQueryStats: () => QueryOptimizer.instance.getQueryStats(),
  getSlowQueryAnalysis: () => QueryOptimizer.instance.getSlowQueryAnalysis(),
  getPerformanceRecommendations: () => QueryOptimizer.instance.getPerformanceRecommendations(),
  createPerformanceIndexes: () => QueryOptimizer.instance.createPerformanceIndexes(),
  getDatabasePerformanceSummary: () => QueryOptimizer.instance.getDatabasePerformanceSummary()
};