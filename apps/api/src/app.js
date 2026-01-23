/**
 * @fileoverview Main application entry point for LUDUS platform backend.
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

// Memory optimization for Render starter plan
if (global.gc) {
  setInterval(() => {
    global.gc();
    logger.info('Periodic garbage collection performed');
  }, 120000);
}

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

// 1. BASIC HEALTH CHECK (IMMEDIATE)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', startup: 'in_progress' });
});

// 2. START SERVER IMMEDIATELY FOR RENDER PORT BINDING
const PORT = process.env.PORT || 5000;
let server;
if (require.main === module || process.env.RENDER === 'true' || process.env.NODE_ENV === 'production') {
  console.log(`[BOOT] 🚀 Immediate port binding for Render on port ${PORT}...`);
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BOOT] ✅ Server listening on port ${PORT}`);
  });

  server.on('error', (err) => {
    console.error('❌ [BOOT] Server error:', err);
  });

  // Keep-alive timeout extension for Render
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
}

// 3. DATABASE CONNECTION (ASYNC)
if (process.env.NODE_ENV !== 'test' && process.env.MONGODB_URI) {
  console.log('[BOOT] 🔋 Initializing database connection...');
  connectDB().then(async () => {
    console.log('[BOOT] ✅ Database connected');
    await createPartnerTermsPage();
  }).catch(err => {
    logger.error({ err }, 'Database connection failed');
  });
}

// 4. SECURITY & UTILITY MIDDLEWARE
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://app.letsludus.com',
    'https://ludus-platform.onrender.com',
    /https:\/\/.*\.onrender\.com$/
  ],
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
});
app.use('/api', limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(require('cookie-parser')());
app.use('/uploads', express.static('uploads'));

// 5. CENTRALIZED API ROUTING
console.log('[BOOT] 🛣️  Registering API routes...');
const apiRouter = express.Router();

apiRouter.use('/auth', require('./routes/auth'));
apiRouter.use('/users', require('./routes/users'));
apiRouter.use('/activities', require('./routes/activities'));
apiRouter.use('/vendors', require('./routes/vendors'));
apiRouter.use('/bookings', require('./routes/bookings'));
apiRouter.use('/payments', require('./routes/payments'));
apiRouter.use('/wallet', require('./routes/wallet'));
apiRouter.use('/ratings', require('./routes/ratings'));
apiRouter.use('/rating-system', require('./routes/enhancedRating'));
apiRouter.use('/admin', require('./routes/admin'));
apiRouter.use('/pages', require('./routes/pages'));
apiRouter.use('/', require('./routes/translations')); // Directly mounts /admin/translations etc
apiRouter.use('/uploads', require('./routes/uploads'));
apiRouter.use('/site-settings', require('./routes/siteSettings'));
apiRouter.use('/contact', require('./routes/contact'));
apiRouter.use('/referrals', require('./routes/referrals'));
apiRouter.use('/invitations', require('./routes/invitations'));
apiRouter.use('/notifications', require('./routes/notifications'));
apiRouter.use('/analytics', require('./routes/analytics'));
apiRouter.use('/reports', require('./routes/reports'));
apiRouter.use('/monitoring', require('./routes/monitoring'));
apiRouter.use('/qr', require('./routes/qr'));
apiRouter.use('/onboarding', require('./routes/onboarding'));
apiRouter.use('/social', require('./routes/social'));
apiRouter.use('/setup', require('./routes/setup'));
apiRouter.use('/render-mcp', require('./routes/renderMCP'));
apiRouter.use('/jwt', require('./routes/jwtManagement'));

const formsRoutes = require('./routes/forms');
apiRouter.use('/forms', formsRoutes.publicRouter);
apiRouter.use('/admin/forms', formsRoutes.adminRouter);

apiRouter.get('/health', (req, res) => res.json({ status: 'healthy' }));
apiRouter.get('/detailed-health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mount Centralized Router
app.use('/api', apiRouter);

// 6. LEGACY SUPPORT (STRICT)
app.use('/auth', require('./routes/auth'));
app.use('/activities', require('./routes/activities'));

console.log('[BOOT] ✨ All routes registered');

// 7. ERROR HANDLING
app.use(require('./middleware/errorHandler'));

/**
 * Helper to create partner terms page
 */
async function createPartnerTermsPage() {
  try {
    const Page = require('./models/Page');
    const mongoose = require('mongoose');
    const existingPage = await Page.findOne({ slug: 'partner-terms-and-conditions' });
    if (existingPage) return;

    const partnerTermsPage = new Page({
      title: { en: 'Partner Terms and Conditions', ar: 'شروط وأحكام الشركاء' },
      slug: 'partner-terms-and-conditions',
      content: [{
        id: 'p1', type: 'paragraph', order: 0,
        content: { en: 'Terms for LUDUS partners.', ar: 'شروط شركاء لودوس' }
      }],
      status: 'published',
      isSystem: true,
      createdBy: new mongoose.Types.ObjectId()
    });
    await partnerTermsPage.save();
    console.log('[BOOT] Partner terms page created');
  } catch (error) {
    logger.error({ error }, 'Failed to create partner terms page');
  }
}

// manual endpoint for page creation
app.post('/api/create-partner-terms', async (req, res) => {
  try {
    await createPartnerTermsPage();
    res.json({ success: true, message: 'Partner terms page created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed' });
  }
});

module.exports = app;
