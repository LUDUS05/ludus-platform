import { Router } from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import vendorRoutes from './vendors.js';
import activityRoutes from './activities.js';
import bookingRoutes from './bookings.js';
import adminRoutes from './admin.js';
import analyticsRoutes from './analytics.js';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => res.json({ ok: true }));

// API version endpoint
router.get('/version', (_req, res) => {
  res.json({ version: '1.0.0', buildTime: new Date().toISOString() });
});

// LUDUS API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/vendors', vendorRoutes);
router.use('/activities', activityRoutes);
router.use('/bookings', bookingRoutes);
router.use('/admin', adminRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
