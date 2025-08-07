const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB only if not in test mode or if MONGODB_URI is available
if (process.env.NODE_ENV !== 'test' && process.env.MONGODB_URI) {
  connectDB().catch(err => {
    console.error('Failed to connect to database:', err.message);
    console.log('Server will continue running without database');
  });
} else if (process.env.MONGODB_URI === 'memory://test') {
  // Skip connection - test database already connected
  console.log('Using test database connection');
} else {
  console.log('Skipping database connection (test mode or no MONGODB_URI)');
}

// Security middleware
app.use(helmet());
// Simple CORS - allow all Vercel deployments and specific domains
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://app.letsludus.com', 
    'https://ludus-platform.vercel.app',
    'https://ludus-platform-git-new-main-ludus05s-projects.vercel.app',
    /https:\/\/.*\.vercel\.app$/
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

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: 'updated'
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/pages', require('./routes/pages'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin', require('./routes/adminEnhanced'));
app.use('/api', require('./routes/translations'));
app.use('/api/uploads', require('./routes/uploads'));


// Global error handler
app.use(require('./middleware/errorHandler'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server only if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  });
}

module.exports = app;