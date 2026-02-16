/**
 * @fileoverview Finalized production entry point for LUDUS API.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { connectDB } = require('./config/database');
const logger = require('./utils/logger');

dotenv.config();

const app = express();

/**
 * 1. PORT BINDING (IMMEDIATE)
 * Critical for Render to avoid 'Port scan timeout'
 */
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[BOOT] 🚀 LUDUS API listening on port ${PORT}`);
});

// Extension for high-traffic or slow connections on Render
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

/**
 * 2. CORE MIDDLEWARE
 */
app.use(helmet());
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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});
app.use('/api', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(require('cookie-parser')());
app.use('/uploads', express.static('uploads'));

/**
 * 3. LOGGING (Optimized for Prod)
 */
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.url}`);
    next();
  });
}

/**
 * 4. API ROUTING
 */
const api = express.Router();

// Health Checks
api.get('/health', (req, res) => res.json({ status: 'healthy', timestamp: new Date().toISOString() }));
app.get('/health', (req, res) => res.json({ status: 'healthy', env: process.env.NODE_ENV }));

// Feature Routes
api.use('/auth', require('./routes/auth'));
api.use('/users', require('./routes/users'));
api.use('/activities', require('./routes/activities'));
api.use('/vendors', require('./routes/vendors'));
api.use('/bookings', require('./routes/bookings'));
api.use('/payments', require('./routes/payments'));
api.use('/wallet', require('./routes/wallet'));
api.use('/ratings', require('./routes/ratings'));
api.use('/rating-system', require('./routes/enhancedRating'));
api.use('/admin', require('./routes/admin'));
api.use('/pages', require('./routes/pages'));
api.use('/uploads', require('./routes/uploads'));
api.use('/site-settings', require('./routes/siteSettings'));
api.use('/contact', require('./routes/contact'));
api.use('/referrals', require('./routes/referrals'));
api.use('/invitations', require('./routes/invitations'));
api.use('/notifications', require('./routes/notifications'));
api.use('/analytics', require('./routes/analytics'));
api.use('/reports', require('./routes/reports'));
api.use('/monitoring', require('./routes/monitoring'));
api.use('/qr', require('./routes/qr'));
api.use('/onboarding', require('./routes/onboarding'));
api.use('/social', require('./routes/social'));
api.use('/setup', require('./routes/setup'));
api.use('/render-mcp', require('./routes/renderMCP'));
api.use('/jwt', require('./routes/jwtManagement'));
api.use('/', require('./routes/translations'));

const formsRoutes = require('./routes/forms');
api.use('/forms', formsRoutes.publicRouter);
api.use('/admin/forms', formsRoutes.adminRouter);

// Mount API Router
app.use('/api', api);

/**
 * 5. BACKWARD COMPATIBILITY
 * Mounting critical routes at root for legacy frontend requests
 */
app.use('/auth', require('./routes/auth'));
app.use('/activities', require('./routes/activities'));

/**
 * 6. DATABASE & ONBOARDING
 */
if (process.env.MONGODB_URI) {
  connectDB().then(async () => {
    console.log('[BOOT] 🔋 Database Connected');
    await createPartnerTermsPage();
  }).catch(err => logger.error({ err }, 'Failed to connect to database'));
}

/**
 * 7. GLOBAL ERROR & 404
 */
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.url} not found` });
});

app.use(require('./middleware/errorHandler'));

/**
 * Helper: Managed Partner Terms
 */
async function createPartnerTermsPage() {
  try {
    const Page = require('./models/Page');
    const mongoose = require('mongoose');
    const exists = await Page.findOne({ slug: 'partner-terms-and-conditions' });
    if (!exists) {
      await new Page({
        title: { en: 'Partner Terms', ar: 'شروط وأحكام الشركاء' },
        slug: 'partner-terms-and-conditions',
        content: [{ id: 'p1', type: 'paragraph', order: 0, content: { en: 'LUDUS Terms', ar: 'شروط لودوس' } }],
        status: 'published',
        isSystem: true,
        createdBy: new mongoose.Types.ObjectId()
      }).save();
      console.log('[BOOT] Partner Terms created');
    }
  } catch (e) {
    console.error('Partner terms skip:', e.message);
  }
}

module.exports = app;
