/**
 * @fileoverview Main application entry point for LUDUS platform backend.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { connectDB } = require('./config/database');

dotenv.config();

const app = express();

// 1. PORT BINDING
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[BOOT] ✅ Server listening on port ${PORT}`);
});

// 2. BASIC HEALTH
app.get('/health', (req, res) => res.json({ status: 'healthy', boot: 'complete' }));

// 3. MIDDLEWARE
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

// 4. API ROUTER
const api = express.Router();

// Define debug route FIRST inside api router
api.get('/debug', (req, res) => {
  res.json({
    online: true,
    time: new Date().toISOString(),
    mapped: api.stack.map(s => s.route ? s.route.path : s.name)
  });
});

// Mount routes
try {
  api.use('/auth', require('./routes/auth'));
  api.use('/activities', require('./routes/activities'));
  api.use('/users', require('./routes/users'));
  console.log('[BOOT] 🛣️ API Routes Mounted');
} catch (e) {
  console.error('[BOOT] ❌ Error mounting routes:', e.message);
}

app.use('/api', api);

// 5. DB
if (process.env.MONGODB_URI) {
  connectDB().then(() => console.log('[BOOT] 🔋 DB OK')).catch(e => console.error('[BOOT] ❌ DB ERR', e.message));
}

// 6. CUSTOM 404 (IMPORTANT)
app.use((req, res) => {
  console.log(`[404] No match for ${req.url}`);
  res.status(404).json({
    error: 'Not Found',
    path: req.url,
    message: 'This message confirms you reached the Express app but no route matched.'
  });
});

// 7. ERROR
app.use((err, req, res, next) => {
  console.error('[ERR]', err);
  res.status(500).json({ error: 'Internal Error', msg: err.message });
});

module.exports = app;
