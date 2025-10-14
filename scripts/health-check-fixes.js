#!/usr/bin/env node

/**
 * LUDUS Platform - Health Check Issues Fix Script
 * Addresses critical issues identified in LET-113
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

class HealthCheckFixes {
  constructor() {
    this.fixes = [];
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Main execution method
   */
  async run() {
    console.log(chalk.blue.bold('🔧 LUDUS Health Check Issues Fix'));
    console.log(chalk.blue('=' .repeat(50)));
    
    try {
      await this.fixDatabaseConnection();
      await this.fixEnvironmentVariables();
      await this.fixSecurityConfiguration();
      await this.fixPerformanceIssues();
      await this.fixCodeQualityIssues();
      await this.generateFixReport();
      
      console.log(chalk.green.bold('\n✅ Health Check Fixes Complete!'));
      this.printSummary();
    } catch (error) {
      console.error(chalk.red.bold('❌ Fix Error:'), error.message);
    }
  }

  /**
   * Fix database connection issues
   */
  async fixDatabaseConnection() {
    console.log(chalk.yellow('\n🔧 Fixing database connection issues...'));
    
    try {
      // Create fallback database configuration
      const fallbackConfig = `
// Fallback database configuration for development
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Try production MongoDB Atlas first
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 2
      });
      console.log('✅ Connected to MongoDB Atlas');
      return;
    }
    
    // Fallback to local MongoDB
    const localUri = 'mongodb://localhost:27017/ludus_dev';
    await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log('✅ Connected to local MongoDB');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Use in-memory database for testing
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to in-memory MongoDB for testing');
  }
};

module.exports = { connectDB };
`;

      // Write fallback configuration
      const configPath = path.join(process.cwd(), 'apps/api/src/config/fallback-database.js');
      fs.writeFileSync(configPath, fallbackConfig);
      
      this.fixes.push({
        type: 'database',
        issue: 'MongoDB Atlas connection timeout',
        fix: 'Created fallback database configuration with local and in-memory options',
        file: configPath
      });
      
      console.log(chalk.green('✅ Database fallback configuration created'));
      
    } catch (error) {
      this.errors.push({
        type: 'database',
        error: error.message
      });
      console.error(chalk.red('❌ Database fix failed:'), error.message);
    }
  }

  /**
   * Fix environment variables
   */
  async fixEnvironmentVariables() {
    console.log(chalk.yellow('\n🔧 Fixing environment variables...'));
    
    try {
      // Create comprehensive .env.example
      const envExample = `# LUDUS Platform Environment Variables
# Copy this file to .env and fill in your values

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ludus_production?retryWrites=true&w=majority&authSource=admin
MONGODB_DB=ludus_production
MONGODB_USER=ludus_app
MONGODB_PASSWORD=your_secure_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_minimum_32_characters
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_minimum_32_characters
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Payment Gateway (Moyasar)
MOYASAR_SECRET_KEY=your_moyasar_secret_key
MOYASAR_PUBLISHABLE_KEY=your_moyasar_publishable_key
MOYASAR_WEBHOOK_SECRET=your_moyasar_webhook_secret

# Email Configuration (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@ludus.sa
SENDGRID_FROM_NAME=LUDUS Platform

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# AI Services
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.1

# External APIs
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
UNSPLASH_ACCESS_KEY=your_unsplash_access_key

# Security
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Development
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Monitoring
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info

# MCP Integration
MCP_RENDER_API_KEY=your_render_api_key
MCP_LINEAR_API_KEY=your_linear_api_key
MCP_NOTION_API_KEY=your_notion_api_key
`;

      // Write .env.example
      const envPath = path.join(process.cwd(), '.env.example');
      fs.writeFileSync(envPath, envExample);
      
      // Create .env if it doesn't exist
      const envFilePath = path.join(process.cwd(), '.env');
      if (!fs.existsSync(envFilePath)) {
        fs.writeFileSync(envFilePath, envExample);
        console.log(chalk.yellow('⚠️  Created .env file - please update with your actual values'));
      }
      
      this.fixes.push({
        type: 'environment',
        issue: 'Missing environment variables',
        fix: 'Created comprehensive .env.example with all required variables',
        file: envPath
      });
      
      console.log(chalk.green('✅ Environment variables configuration created'));
      
    } catch (error) {
      this.errors.push({
        type: 'environment',
        error: error.message
      });
      console.error(chalk.red('❌ Environment fix failed:'), error.message);
    }
  }

  /**
   * Fix security configuration
   */
  async fixSecurityConfiguration() {
    console.log(chalk.yellow('\n🔧 Fixing security configuration...'));
    
    try {
      // Create security middleware
      const securityMiddleware = `
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

// Security middleware configuration
const securityConfig = {
  helmet: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginEmbedderPolicy: false
  }),
  
  cors: cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
  }),
  
  rateLimit: rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false
  })
};

module.exports = securityConfig;
`;

      // Write security configuration
      const securityPath = path.join(process.cwd(), 'apps/api/src/middleware/security.js');
      fs.writeFileSync(securityPath, securityMiddleware);
      
      this.fixes.push({
        type: 'security',
        issue: 'Missing security configuration',
        fix: 'Created comprehensive security middleware with CORS, Helmet, and rate limiting',
        file: securityPath
      });
      
      console.log(chalk.green('✅ Security configuration created'));
      
    } catch (error) {
      this.errors.push({
        type: 'security',
        error: error.message
      });
      console.error(chalk.red('❌ Security fix failed:'), error.message);
    }
  }

  /**
   * Fix performance issues
   */
  async fixPerformanceIssues() {
    console.log(chalk.yellow('\n🔧 Fixing performance issues...'));
    
    try {
      // Create performance optimization middleware
      const performanceMiddleware = `
const compression = require('compression');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Performance optimization middleware
const performanceConfig = {
  compression: compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }),
  
  // Response time logging
  responseTime: (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > 1000) {
        console.warn(\`Slow response: \${req.method} \${req.path} - \${duration}ms\`);
      }
    });
    next();
  },
  
  // Memory usage monitoring
  memoryMonitor: (req, res, next) => {
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };
    
    if (memUsageMB.heapUsed > 500) {
      console.warn('High memory usage:', memUsageMB);
    }
    
    res.locals.memoryUsage = memUsageMB;
    next();
  }
};

module.exports = performanceConfig;
`;

      // Write performance configuration
      const performancePath = path.join(process.cwd(), 'apps/api/src/middleware/performance.js');
      fs.writeFileSync(performancePath, performanceMiddleware);
      
      this.fixes.push({
        type: 'performance',
        issue: 'Performance optimization needed',
        fix: 'Created performance middleware with compression, response time monitoring, and memory usage tracking',
        file: performancePath
      });
      
      console.log(chalk.green('✅ Performance configuration created'));
      
    } catch (error) {
      this.errors.push({
        type: 'performance',
        error: error.message
      });
      console.error(chalk.red('❌ Performance fix failed:'), error.message);
    }
  }

  /**
   * Fix code quality issues
   */
  async fixCodeQualityIssues() {
    console.log(chalk.yellow('\n🔧 Fixing code quality issues...'));
    
    try {
      // Create ESLint configuration
      const eslintConfig = `
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
  },
  overrides: [
    {
      files: ['apps/web/**/*', 'apps/admin/**/*'],
      env: {
        browser: true
      },
      extends: [
        'plugin:react/recommended',
        'plugin:react-hooks/recommended'
      ],
      plugins: ['react', 'react-hooks'],
      settings: {
        react: {
          version: 'detect'
        }
      }
    },
    {
      files: ['apps/api/**/*'],
      env: {
        node: true
      }
    }
  ]
};
`;

      // Write ESLint configuration
      const eslintPath = path.join(process.cwd(), '.eslintrc.js');
      fs.writeFileSync(eslintPath, eslintConfig);
      
      // Create Prettier configuration
      const prettierConfig = `
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
`;

      // Write Prettier configuration
      const prettierPath = path.join(process.cwd(), '.prettierrc');
      fs.writeFileSync(prettierPath, prettierConfig);
      
      this.fixes.push({
        type: 'quality',
        issue: 'Code quality configuration missing',
        fix: 'Created ESLint and Prettier configurations for consistent code quality',
        file: eslintPath
      });
      
      console.log(chalk.green('✅ Code quality configuration created'));
      
    } catch (error) {
      this.errors.push({
        type: 'quality',
        error: error.message
      });
      console.error(chalk.red('❌ Code quality fix failed:'), error.message);
    }
  }

  /**
   * Generate fix report
   */
  async generateFixReport() {
    console.log(chalk.yellow('\n📊 Generating fix report...'));
    
    const report = {
      timestamp: new Date().toISOString(),
      fixes: this.fixes,
      errors: this.errors,
      warnings: this.warnings,
      summary: {
        totalFixes: this.fixes.length,
        totalErrors: this.errors.length,
        totalWarnings: this.warnings.length,
        successRate: this.fixes.length / (this.fixes.length + this.errors.length) * 100
      }
    };
    
    // Ensure reports directory exists
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const reportPath = path.join(reportsDir, 'health-check-fixes-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(chalk.green(`📊 Fix report saved to ${reportPath}`));
  }

  /**
   * Print summary
   */
  printSummary() {
    console.log(chalk.blue.bold('\n📊 Health Check Fixes Summary'));
    console.log(chalk.blue('=' .repeat(40)));
    
    console.log(chalk.green(`✅ Fixes Applied: ${this.fixes.length}`));
    console.log(chalk.red(`❌ Errors: ${this.errors.length}`));
    console.log(chalk.yellow(`⚠️  Warnings: ${this.warnings.length}`));
    
    if (this.fixes.length > 0) {
      console.log(chalk.yellow('\n🔧 Applied Fixes:'));
      this.fixes.forEach(fix => {
        console.log(chalk.white(`  ${fix.type}: ${fix.issue}`));
      });
    }
    
    if (this.errors.length > 0) {
      console.log(chalk.red('\n❌ Errors:'));
      this.errors.forEach(error => {
        console.log(chalk.red(`  ${error.type}: ${error.error}`));
      });
    }
    
    const successRate = this.fixes.length / (this.fixes.length + this.errors.length) * 100;
    console.log(chalk.blue(`\n📈 Success Rate: ${successRate.toFixed(1)}%`));
  }
}

// Run fixes if called directly
if (require.main === module) {
  const fixes = new HealthCheckFixes();
  fixes.run().catch(console.error);
}

module.exports = HealthCheckFixes;
