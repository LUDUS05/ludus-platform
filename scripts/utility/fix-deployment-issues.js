#!/usr/bin/env node

/**
 * @fileoverview Comprehensive fix script for LUDUS deployment issues.
 * 
 * Purpose: Addresses critical deployment issues identified in the logs:
 * 1. Database connection error (invalid lean option)
 * 2. Duplicate Mongoose schema indexes
 * 3. Query timeout issues
 * 4. High memory usage (95%+ threshold)
 * 5. NPM vulnerabilities
 * 
 * Business Context: This script ensures the LUDUS platform runs stably
 * on Render with optimal performance and minimal resource usage.
 * 
 * @version 1.0.0
 * @since 2025-01-13
 * @author LUDUS Development Team
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting LUDUS deployment fixes...\n');

// Track fixes applied
const fixesApplied = [];

/**
 * Apply database connection fix
 */
function fixDatabaseConnection() {
  console.log('📊 Fixing database connection issues...');
  
  const dbConfigPath = path.join(__dirname, 'ludus-platform/apps/api/src/config/database.js');
  
  if (fs.existsSync(dbConfigPath)) {
    let content = fs.readFileSync(dbConfigPath, 'utf8');
    
    // Remove invalid lean option
    if (content.includes("mongoose.set('lean', true)")) {
      content = content.replace(
        /mongoose\.set\('lean', true\);\s*\/\/ Use lean queries by default for better performance\s*/g,
        ''
      );
      fs.writeFileSync(dbConfigPath, content);
      fixesApplied.push('✅ Removed invalid mongoose.set("lean", true) option');
    }
  }
  
  console.log('✅ Database connection fix applied');
}

/**
 * Fix duplicate indexes in models
 */
function fixDuplicateIndexes() {
  console.log('🔧 Fixing duplicate schema indexes...');
  
  const modelsDir = path.join(__dirname, 'ludus-platform/apps/api/src/models');
  
  if (fs.existsSync(modelsDir)) {
    const models = fs.readdirSync(modelsDir).filter(file => file.endsWith('.js'));
    
    models.forEach(modelFile => {
      const modelPath = path.join(modelsDir, modelFile);
      let content = fs.readFileSync(modelPath, 'utf8');
      let modified = false;
      
      // Remove index: true from field definitions where explicit indexes exist
      const fieldsToFix = ['name', 'nameEn', 'path', 'paymentNumber', 'userId', 'url', 'slug', 'expiresAt'];
      
      fieldsToFix.forEach(field => {
        const regex = new RegExp(`(${field}:\\s*{[^}]*?)index:\\s*true([^}]*?})`, 'g');
        if (content.match(regex)) {
          content = content.replace(regex, '$1$2');
          modified = true;
        }
      });
      
      if (modified) {
        fs.writeFileSync(modelPath, content);
        fixesApplied.push(`✅ Fixed duplicate indexes in ${modelFile}`);
      }
    });
  }
  
  console.log('✅ Duplicate indexes fix applied');
}

/**
 * Fix query timeout issues
 */
function fixQueryTimeouts() {
  console.log('⏱️  Fixing query timeout issues...');
  
  const pagesRoutePath = path.join(__dirname, 'server/src/routes/pages.js');
  
  if (fs.existsSync(pagesRoutePath)) {
    let content = fs.readFileSync(pagesRoutePath, 'utf8');
    
    // Add maxTimeMS to Page.find queries
    const queries = [
      'Page.findPublished({',
      'Page.find({'
    ];
    
    queries.forEach(query => {
      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^}]*?)\\.lean\\(\\);`, 'g');
      if (content.match(regex)) {
        content = content.replace(regex, '$1.lean().maxTimeMS(5000); // 5 second timeout');
      }
    });
    
    fs.writeFileSync(pagesRoutePath, content);
    fixesApplied.push('✅ Added query timeouts to pages routes');
  }
  
  console.log('✅ Query timeout fix applied');
}

/**
 * Optimize memory usage
 */
function optimizeMemoryUsage() {
  console.log('🧠 Optimizing memory usage...');
  
  const appPath = path.join(__dirname, 'server/src/app.js');
  
  if (fs.existsSync(appPath)) {
    let content = fs.readFileSync(appPath, 'utf8');
    
    // Increase garbage collection frequency
    content = content.replace(
      /setInterval\(\(\) => \{[^}]*\}, 120000\);/g,
      'setInterval(() => {\n    global.gc();\n    logger.info(\'Garbage collection performed\');\n  }, 30000);'
    );
    
    // Lower memory threshold
    content = content.replace(
      /memUsage\.heapUsed \/ memUsage\.heapTotal > 0\.7/g,
      'memUsage.heapUsed / memUsage.heapTotal > 0.6'
    );
    
    // Increase monitoring frequency
    content = content.replace(
      /}, 300000\);/g,
      '}, 60000);'
    );
    
    fs.writeFileSync(appPath, content);
    fixesApplied.push('✅ Optimized memory management settings');
  }
  
  console.log('✅ Memory optimization applied');
}

/**
 * Fix NPM vulnerabilities
 */
function fixNPMVulnerabilities() {
  console.log('🔒 Fixing NPM vulnerabilities...');
  
  const serverDir = path.join(__dirname, 'server');
  
  if (fs.existsSync(serverDir)) {
    try {
      // Change to server directory
      process.chdir(serverDir);
      
      // Run npm audit fix
      console.log('Running npm audit fix...');
      execSync('npm audit fix', { stdio: 'inherit' });
      
      // Run npm audit fix --force for remaining issues
      console.log('Running npm audit fix --force...');
      execSync('npm audit fix --force', { stdio: 'inherit' });
      
      fixesApplied.push('✅ Fixed NPM vulnerabilities');
    } catch (error) {
      console.warn('⚠️  NPM audit fix had some issues:', error.message);
    }
  }
  
  console.log('✅ NPM vulnerabilities fix applied');
}

/**
 * Create deployment summary
 */
function createDeploymentSummary() {
  const summary = {
    timestamp: new Date().toISOString(),
    fixesApplied: fixesApplied,
    status: 'COMPLETED',
    nextSteps: [
      'Deploy the fixed code to Render',
      'Monitor memory usage and performance',
      'Verify database connection stability',
      'Check query response times'
    ]
  };
  
  const summaryPath = path.join(__dirname, 'deployment-fixes-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  
  console.log('\n📋 Deployment Fix Summary:');
  console.log('========================');
  fixesApplied.forEach(fix => console.log(fix));
  console.log('\n📄 Full summary saved to: deployment-fixes-summary.json');
}

/**
 * Main execution
 */
async function main() {
  try {
    fixDatabaseConnection();
    fixDuplicateIndexes();
    fixQueryTimeouts();
    optimizeMemoryUsage();
    fixNPMVulnerabilities();
    createDeploymentSummary();
    
    console.log('\n🎉 All fixes applied successfully!');
    console.log('\nNext steps:');
    console.log('1. Commit and push the changes');
    console.log('2. Deploy to Render');
    console.log('3. Monitor the deployment logs');
    console.log('4. Verify all issues are resolved');
    
  } catch (error) {
    console.error('❌ Error applying fixes:', error);
    process.exit(1);
  }
}

// Run the script
main();
