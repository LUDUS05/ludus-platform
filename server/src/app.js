const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { connectDB } = require('./config/database');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB only if not in test mode or if MONGODB_URI is available
if (process.env.NODE_ENV !== 'test' && process.env.MONGODB_URI) {
  connectDB().catch(err => {
    logger.error({ err }, 'Failed to connect to database');
    logger.warn('Server will continue running without database');
  });
} else if (process.env.MONGODB_URI === 'memory://test') {
  // Skip connection - test database already connected
  logger.info('Using test database connection');
} else {
  logger.info('Skipping database connection (test mode or no MONGODB_URI)');
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
