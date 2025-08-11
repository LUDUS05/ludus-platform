import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Booking, Activity, User, Vendor } from '../models';
import { authenticateToken, requireUser } from '../middleware/auth';

const router = Router();

// Apply authentication to all booking routes
router.use(authenticateToken);
router.use(requireUser);

// Validation schemas
const createBookingSchema = z.object({
  activityId: z.string().min(1, 'Activity ID is required'),
  participants: z.object({
    adults: z.number().min(1, 'At least one adult is required'),
    children: z.number().min(0).optional(),
    seniors: z.number().min(0).optional(),
    total: z.number().min(1, 'Total participants must be at least 1')
  }),
  date: z.string().datetime('Invalid date format'),
  timeSlot: z.string().optional(),
  specialRequests: z.string().optional(),
  specialRequirements: z.string().optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  accessibilityNeeds: z.array(z.string()).optional()
});

const updateBookingSchema = createBookingSchema.partial();

// Create new booking
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createBookingSchema.parse(req.body);
    
    // Verify activity exists and is active
    const activity = await Activity.findById(data.activityId);
    if (!activity || !activity.availability.isActive || activity.status !== 'active') {
      return res.status(404).json({ error: 'Activity not found or inactive' });
    }
    
    // Check availability
    const existingBookings = await Booking.find({
      'activity.activityId': data.activityId,
      bookingDate: new Date(data.date),
      status: { $nin: ['cancelled', 'refunded'] }
    });
    
    const totalBooked = existingBookings.reduce((sum, booking) => sum + booking.participants.total, 0);
    if (totalBooked + data.participants.total > activity.capacity.maxParticipants) {
      return res.status(400).json({ error: 'Insufficient capacity for this date and time' });
    }
    
    // Get user details for the booking
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create booking
    const booking = new Booking({
      ...data,
      user: {
        userId: req.user?.userId,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone || ''
      },
      status: 'pending',
      createdAt: new Date()
    });
    
    await booking.save();
    
    // Populate activity and vendor details
    await booking.populate([
      { path: 'activity.activityId', select: 'title vendor vendorId pricing' },
      { path: 'activity.activityId', populate: { path: 'vendor', select: 'businessName contactInfo' } }
    ]);
    
    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    next(error);
  }
});

// Get user's bookings
router.get('/my-bookings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query: any = { 'user.userId': req.user?.userId };
    if (status) query.status = status;
    
    const bookings = await Booking.find(query)
      .populate('activity.activityId', 'title vendor vendorId pricing images')
      .populate('activity.activityId', { populate: { path: 'vendor', select: 'businessName' } })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });
    
    const total = await Booking.countDocuments(query);
    
    res.json({
      bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get booking by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('activity.activityId', 'title vendor vendorId pricing images availability')
      .populate('activity.activityId', { populate: { path: 'vendor', select: 'businessName contactInfo location' } });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if user has permission to view this booking
    if (req.user?.role !== 'admin' && booking.user.userId?.toString() !== req.user?.userId) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    res.json({ booking });
  } catch (error) {
    next(error);
  }
});

// Update booking
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateBookingSchema.parse(req.body);
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if user has permission to update this booking
    if (req.user?.role !== 'admin' && booking.user.userId?.toString() !== req.user?.userId) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Only allow updates if booking is not confirmed or completed
    if (['confirmed', 'completed'].includes(booking.status)) {
      return res.status(400).json({ error: 'Cannot update confirmed or completed bookings' });
    }
    
    Object.assign(booking, data);
    await booking.save();
    
    res.json({
      message: 'Booking updated successfully',
      booking
    });
  } catch (error) {
    next(error);
  }
});

// Cancel booking
router.patch('/:id/cancel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if user has permission to cancel this booking
    if (req.user?.role !== 'admin' && booking.user.userId?.toString() !== req.user?.userId) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Only allow cancellation if booking is not completed
    if (booking.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel completed bookings' });
    }
    
    booking.status = 'cancelled';
    // Add cancellation to the cancellation object
    booking.cancellation = {
      requestedAt: new Date(),
      requestedBy: 'user',
      reason: 'User requested cancellation',
      refundAmount: 0,
      refundStatus: 'pending'
    };
    await booking.save();
    
    res.json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    next(error);
  }
});

// Confirm booking (admin/vendor only)
router.patch('/:id/confirm', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if user has permission to confirm this booking
    const activity = await Activity.findById(booking.activity.activityId);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    const vendor = await Vendor.findById(activity.vendor);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    if (req.user?.role !== 'admin' && vendor.owner?.userId?.toString() !== req.user?.userId) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    booking.status = 'confirmed';
    booking.confirmedAt = new Date();
    await booking.save();
    
    res.json({
      message: 'Booking confirmed successfully',
      booking
    });
  } catch (error) {
    next(error);
  }
});

// Complete booking (admin/vendor only)
router.patch('/:id/complete', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if user has permission to complete this booking
    const activity = await Activity.findById(booking.activity.activityId);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    const vendor = await Vendor.findById(activity.vendor);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    if (req.user?.role !== 'admin' && vendor.owner?.userId?.toString() !== req.user?.userId) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    booking.status = 'completed';
    booking.completedAt = new Date();
    await booking.save();
    
    res.json({
      message: 'Booking completed successfully',
      booking
    });
  } catch (error) {
    next(error);
  }
});

// Get booking statistics for user
router.get('/stats/overview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    
    const stats = await Booking.aggregate([
      { $match: { 'user.userId': userId } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: '$pricing.total' },
          pendingBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);
    
    const result = stats[0] || {
      totalBookings: 0,
      totalSpent: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0
    };
    
    res.json({ stats: result });
  } catch (error) {
    next(error);
  }
});

export default router;
