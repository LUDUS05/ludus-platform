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

dotenv.config();

const app = express();

// 1. IMMEDIATE PORT BINDING
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[BOOT] ✅ Server listening on port ${PORT}`);
});

// 2. BASIC HEALTH CHECK
app.get('/health', (req, res) => res.json({ status: 'healthy', startup: 'in_progress' }));

// 3. MIDDLEWARE
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(require('cookie-parser')());

// 4. LOGGING MIDDLEWARE
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

// 5. API ROUTES
const api = express.Router();

function mount(path, routeFile) {
  try {
    const route = require(routeFile);
    api.use(path, route);
    console.log(`[BOOT] 🛣️ Registered: /api${path}`);
  } catch (err) {
    console.error(`[BOOT] ❌ Failed to register: /api${path}`, err.message);
  }
}

mount('/auth', './routes/auth');
mount('/users', './routes/users');
mount('/activities', './routes/activities');
mount('/vendors', './routes/vendors');
mount('/bookings', './routes/bookings');
mount('/payments', './routes/payments');
mount('/wallet', './routes/wallet');
mount('/ratings', './routes/ratings');
mount('/rating-system', './routes/enhancedRating');
mount('/admin', './routes/admin');
mount('/pages', './routes/pages');
mount('/uploads', './routes/uploads');
mount('/site-settings', './routes/siteSettings');
mount('/contact', './routes/contact');
mount('/referrals', './routes/referrals');
mount('/invitations', './routes/invitations');
mount('/notifications', './routes/notifications');
mount('/analytics', './routes/analytics');
mount('/reports', './routes/reports');
mount('/monitoring', './routes/monitoring');
mount('/qr', './routes/qr');
mount('/onboarding', './routes/onboarding');
mount('/social', './routes/social');
mount('/setup', './routes/setup');
mount('/render-mcp', './routes/renderMCP');
mount('/jwt', './routes/jwtManagement');

// Special mount for translations to avoid nesting if needed
try {
  api.use('/', require('./routes/translations'));
  console.log('[BOOT] 🛣️ Registered: Translations');
} catch (err) {
  console.error('[BOOT] ❌ Failed translations', err.message);
}

const formsRoutes = require('./routes/forms');
api.use('/forms', formsRoutes.publicRouter);
api.use('/admin/forms', formsRoutes.adminRouter);
console.log('[BOOT] 🛣️ Registered: Forms');

api.get('/debug', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    routes: api.stack.map(s => s.regexp.toString())
  });
});

app.use('/api', api);

// 6. LEGACY ROUTES
app.use('/auth', require('./routes/auth'));
app.use('/activities', require('./routes/activities'));

// 7. DB CONNECTION
if (process.env.MONGODB_URI) {
  connectDB().then(() => console.log('[BOOT] 🔋 DB Connected')).catch(err => console.error('[BOOT] ❌ DB Fail', err.message));
}

// 8. ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('[ERR]', err);
  res.status(500).json({ success: false, message: err.message });
});

module.exports = app;
