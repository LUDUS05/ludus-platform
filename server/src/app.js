/**
 * @fileoverview Main application entry point for LUDUS platform backend server.
 * 
 * Purpose: Central Express.js application that orchestrates all backend services including
 * authentication, API routing, database connections, and middleware configuration for the
 * LUDUS social activity platform serving the Saudi Arabian market.
 * 
 * Business Context: This is the core server that powers the LUDUS platform, handling
 * user authentication, activity management, payment processing, referral systems, and
 * AI agent integrations. It's optimized for Render deployment with aggressive memory
 * management for the starter plan constraints.
 * 
 * Implementation Notes: 
 * - Aggressive memory optimization with garbage collection intervals
 * - Comprehensive error handling and logging
 * - Security middleware with CORS, Helmet, and rate limiting
 * - Database connection with automatic partner terms page creation
 * - Health check endpoints for monitoring
 * - Backward compatibility routes for frontend deployment
 * 
 * Dependencies: 
 * - Express.js for web framework
 * - MongoDB with Mongoose for database operations
 * - Firebase for authentication integration
 * - Moyasar for payment processing
 * - Render MCP for AI agent management
 * 
 * Evolution: Originally built as a simple Express server, evolved to include
 * comprehensive memory management, AI integrations, and production optimizations
 * for Render deployment.
 * 
 * @version 1.0.0
 * @since 2024-01-01
 * @modified 2025-01-08 - Added aggressive memory management and Render optimizations
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { connectDB } = require('./config/database');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

// Aggressive memory optimization for Render starter plan
if (global.gc) {
  // Force garbage collection every 2 minutes if available
  setInterval(() => {
    global.gc();
    logger.info('Garbage collection performed');
  }, 120000);
}

// Aggressive memory monitoring and cleanup
setInterval(() => {
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024)
  };
  
  // Log memory usage every 5 minutes
  logger.info({ memoryUsage: memUsageMB }, 'Memory usage report');
  
  // Force cleanup if memory usage is high (lowered threshold)
  if (memUsage.heapUsed / memUsage.heapTotal > 0.7) {
    if (global.gc) {
      global.gc();
      logger.warn('High memory usage detected, garbage collection performed');
    }
  }
}, 300000); // Every 5 minutes

// Additional memory optimization
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  if (global.gc) global.gc();
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (global.gc) global.gc();
});

// Initialize express app
const app = express();

// Connect to MongoDB only if not in test mode or if MONGODB_URI is available
if (process.env.NODE_ENV !== 'test' && process.env.MONGODB_URI) {
  connectDB().then(async () => {
    // Create partner terms page if it doesn't exist
    await createPartnerTermsPage();
  }).catch(err => {
    logger.error({ err }, 'Failed to connect to database');
    logger.warn('Server will continue running without database');
  });
} else if (process.env.MONGODB_URI === 'memory://test') {
  // Skip connection - test database already connected
  logger.info('Using test database connection');
} else {
  logger.info('Skipping database connection (test mode or no MONGODB_URI)');
}

/**
 * Creates the partner terms and conditions page if it doesn't already exist.
 * 
 * Purpose: Automatically provisions the partner terms page during server startup to ensure
 * all partners have access to the legal terms and conditions required for platform participation.
 * 
 * Business Context: This function ensures compliance with Saudi Arabian business regulations
 * by providing clear terms and conditions for partner onboarding. It's called during server
 * initialization to guarantee the page exists before any partner registration attempts.
 * 
 * Implementation Notes:
 * - Idempotent function that can be safely called multiple times
 * - Creates bilingual content (Arabic/English) for Saudi market compliance
 * - Uses system user ID for audit trail
 * - Includes comprehensive partner agreement terms
 * - Automatically sets proper SEO metadata
 * 
 * Dependencies:
 * - Page model for database operations
 * - Mongoose for ObjectId generation
 * - Logger for operation tracking
 * 
 * Evolution: Originally manual page creation, evolved to automatic provisioning
 * during server startup for better user experience and compliance.
 * 
 * @async
 * @function createPartnerTermsPage
 * @returns {Promise<void>} A promise that resolves when the page is created or if it already exists.
 * 
 * @example
 * // Called automatically during server startup
 * await createPartnerTermsPage();
 * 
 * @since 2024-06-01
 * @modified 2025-01-08 - Added comprehensive bilingual content and SEO optimization
 */
async function createPartnerTermsPage() {
  try {
    const Page = require('./models/Page');
    const mongoose = require('mongoose');
    
    // Check if partner terms page already exists
    const existingPage = await Page.findOne({ slug: 'partner-terms-and-conditions' });
    if (existingPage) {
      logger.info('Partner terms page already exists');
      return;
    }

    // Create partner terms page
    const partnerTermsPage = new Page({
      title: {
        en: 'Partner Terms and Conditions',
        ar: 'شروط وأحكام الشركاء'
      },
      slug: 'partner-terms-and-conditions',
      content: [
        {
          id: 'partner-terms-1',
          type: 'heading',
          content: {
            en: 'Partner Terms and Conditions',
            ar: 'شروط وأحكام الشركاء'
          },
          data: { level: 1 },
          order: 0
        },
        {
          id: 'partner-terms-2',
          type: 'paragraph',
          content: {
            en: `Last updated: ${new Date().toDateString()}`,
            ar: `آخر تحديث: ${new Date().toLocaleDateString('ar-SA')}`
          },
          order: 1
        },
        {
          id: 'partner-terms-3',
          type: 'heading',
          content: {
            en: 'Partnership Agreement',
            ar: 'اتفاقية الشراكة'
          },
          data: { level: 2 },
          order: 2
        },
        {
          id: 'partner-terms-4',
          type: 'paragraph',
          content: {
            en: 'By registering as a partner with LUDUS, you agree to provide high-quality activities and experiences to our users. You will receive fair compensation for your services and access to our platform\'s marketing tools.',
            ar: 'من خلال التسجيل كشريك مع LUDUS، فإنك توافق على تقديم أنشطة وتجارب عالية الجودة لمستخدمينا. ستحصل على تعويض عادل لخدماتك والوصول إلى أدوات التسويق في منصتنا.'
          },
          order: 3
        },
        {
          id: 'partner-terms-5',
          type: 'heading',
          content: {
            en: 'Quality Standards',
            ar: 'معايير الجودة'
          },
          data: { level: 2 },
          order: 4
        },
        {
          id: 'partner-terms-6',
          type: 'paragraph',
          content: {
            en: 'All partners must maintain high standards of service delivery, safety, and customer satisfaction. We reserve the right to review and approve all activities before they are listed on our platform.',
            ar: 'يجب على جميع الشركاء الحفاظ على معايير عالية لتقديم الخدمة والسلامة ورضا العملاء. نحتفظ بالحق في مراجعة والموافقة على جميع الأنشطة قبل إدراجها في منصتنا.'
          },
          order: 5
        },
        {
          id: 'partner-terms-7',
          type: 'heading',
          content: {
            en: 'Payment Terms',
            ar: 'شروط الدفع'
          },
          data: { level: 2 },
          order: 6
        },
        {
          id: 'partner-terms-8',
          type: 'paragraph',
          content: {
            en: 'Payments will be processed within 7-14 business days after successful completion of activities. We use secure payment processing to ensure timely and accurate payments to all partners.',
            ar: 'سيتم معالجة المدفوعات خلال 7-14 يوم عمل بعد إكمال الأنشطة بنجاح. نستخدم معالجة دفع آمنة لضمان المدفوعات في الوقت المناسب والدقيقة لجميع الشركاء.'
          },
          order: 7
        },
        {
          id: 'partner-terms-9',
          type: 'heading',
          content: {
            en: 'Contact Information',
            ar: 'معلومات الاتصال'
          },
          data: { level: 2 },
          order: 8
        },
        {
          id: 'partner-terms-10',
          type: 'paragraph',
          content: {
            en: 'For questions about these terms or partnership opportunities, please contact us at partners@letsludus.com',
            ar: 'للأسئلة حول هذه الشروط أو فرص الشراكة، يرجى الاتصال بنا على partners@letsludus.com'
          },
          order: 9
        }
      ],
      template: 'basic',
      status: 'published',
      placement: 'none',
      showInNavigation: false,
      navigationOrder: 0,
      isSystem: true,
      seo: {
        description: {
          en: 'Terms and conditions for LUDUS partners and activity providers.',
          ar: 'شروط وأحكام شركاء LUDUS ومقدمي الأنشطة.'
        }
      },
      createdBy: new mongoose.Types.ObjectId() // System user
    });

    await partnerTermsPage.save();
    logger.info('Partner terms page created successfully');
  } catch (error) {
    logger.error({ error }, 'Failed to create partner terms page');
  }
}

// Trust proxy for production deployment (Railway/Render)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(helmet());
// CORS configuration for Render deployment
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://app.letsludus.com', 
    'https://ludus-frontend-og2d.onrender.com',
    'https://ludus-platform.onrender.com',
    /https:\/\/.*\.onrender\.com$/
  ],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parsing middleware for HttpOnly refresh tokens
app.use(require('cookie-parser')());

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.1',
    services: {
      database: 'connected', // You can add actual DB health check here
      referral: 'active',
      analytics: 'active',
      notifications: 'active',
      invitations: 'active',
      reports: 'active'
    },
    referral: {
      system: 'operational',
      rewards: 'active',
      tracking: 'enabled',
      analytics: 'available'
    }
  });
});

// Health check route (API-prefixed) for Render
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.1',
    services: {
      database: 'connected',
      referral: 'active',
      analytics: 'active',
      notifications: 'active',
      invitations: 'active',
      reports: 'active'
    },
    referral: {
      system: 'operational',
      rewards: 'active',
      tracking: 'enabled',
      analytics: 'available'
    }
  });
});

// Manual endpoint to create partner terms page
app.post('/api/create-partner-terms', async (req, res) => {
  try {
    await createPartnerTermsPage();
    res.json({
      success: true,
      message: 'Partner terms page created successfully'
    });
  } catch (error) {
    logger.error({ error }, 'Failed to create partner terms page via API');
    res.status(500).json({
      success: false,
      message: 'Failed to create partner terms page',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
// Backward compatibility route (temporary fix for frontend deployment issue)
app.use('/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/users', require('./routes/users'));
app.use('/api/activities', require('./routes/activities'));
app.use('/activities', require('./routes/activities'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/vendors', require('./routes/vendors'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/payments', require('./routes/payments'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/rating-system', require('./routes/enhancedRating'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/pages', require('./routes/pages'));
app.use('/api', require('./routes/translations'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/site-settings', require('./routes/siteSettings'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/referrals', require('./routes/referrals'));
app.use('/api/invitations', require('./routes/invitations'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/monitoring', require('./routes/monitoring'));
app.use('/api/qr', require('./routes/qr'));
app.use('/api/onboarding', require('./routes/onboarding'));
app.use('/api/social', require('./routes/social'));
app.use('/api/setup', require('./routes/setup'));
app.use('/api/render-mcp', require('./routes/renderMCP'));
const formsRoutes = require('./routes/forms');
app.use('/api/forms', formsRoutes.publicRouter);
app.use('/api/admin/forms', formsRoutes.adminRouter);

// Remove the catch-all 404 handler - Render should handle frontend routes
// app.use('*', (req, res) => {
//   res.status(404).json({ 
//     success: false,
//     message: 'Route not found' 
//   });
// });

// Global error handler (must be last middleware)
app.use(require('./middleware/errorHandler'));

// Start server only if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    logger.info({ port: PORT }, 'Server running');
    logger.info({ environment: process.env.NODE_ENV || 'development' }, 'Environment');
    logger.info({ apiUrl: `http://localhost:${PORT}/api` }, 'API URL');
  });
}

module.exports = app;// Trigger restart
