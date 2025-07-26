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
  connectDB();
} else if (process.env.MONGODB_URI === 'memory://test') {
  // Skip connection - test database already connected
  console.log('Using test database connection');
} else {
  console.log('Skipping database connection (test mode or no MONGODB_URI)');
}

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
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

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'LUDUS API is running' });
});

// Global error handler
app.use(require('./middleware/errorHandler'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;