import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import vendorRoutes from './vendors';
import activityRoutes from './activities';
import bookingRoutes from './bookings';
import adminRoutes from './admin';

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

export default router;
