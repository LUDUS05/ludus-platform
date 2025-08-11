import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { User, Activity, Vendor, Booking } from '../models';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Apply authentication and admin role requirement to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// Validation schemas
const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(['user', 'vendor', 'admin']).optional(),
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional()
});

const updateActivitySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  isActive: z.boolean().optional(),
  moderationNotes: z.string().optional()
});

const updateVendorSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  isActive: z.boolean().optional(),
  verificationNotes: z.string().optional()
});

// Dashboard Overview - Get key metrics
router.get('/dashboard/overview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers,
      totalActivities,
      totalVendors,
      totalBookings,
      pendingVendors,
      pendingActivities,
      recentUsers,
      recentBookings
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Activity.countDocuments(),
      Vendor.countDocuments(),
      Booking.countDocuments(),
      Vendor.countDocuments({ status: 'pending' }),
      Activity.countDocuments({ status: 'pending' }),
      User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).select('firstName lastName email createdAt'),
      Booking.find().sort({ createdAt: -1 }).limit(5).populate('activityId', 'title').populate('userId', 'firstName lastName')
    ]);

    // Calculate revenue (assuming totalAmount is stored in bookings)
    const revenueData = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          avgBookingValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    const revenue = revenueData[0] || { totalRevenue: 0, avgBookingValue: 0 };

    res.json({
      overview: {
        totalUsers,
        totalActivities,
        totalVendors,
        totalBookings,
        pendingVendors,
        pendingActivities,
        totalRevenue: revenue.totalRevenue,
        avgBookingValue: revenue.avgBookingValue
      },
      recentUsers,
      recentBookings
    });
  } catch (error) {
    next(error);
  }
});

// User Management
router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, role, search, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (role) filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter)
    ]);

    res.json({
      users,
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

router.get('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.put('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateUserSchema.parse(req.body);
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    Object.assign(user, data);
    await user.save();
    
    res.json({
      message: 'User updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Soft delete
    user.isActive = false;
    await user.save();
    
    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    next(error);
  }
});

// Activity Moderation
router.get('/activities', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (status) filter.status = status;
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .populate('vendorId', 'businessName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Activity.countDocuments(filter)
    ]);

    res.json({
      activities,
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

router.put('/activities/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateActivitySchema.parse(req.body);
    
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    Object.assign(activity, data);
    await activity.save();
    
    res.json({
      message: 'Activity updated successfully',
      activity
    });
  } catch (error) {
    next(error);
  }
});

// Vendor Management
router.get('/vendors', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (status) filter.status = status;
    if (search) {
      filter.businessName = { $regex: search, $options: 'i' };
    }

    const [vendors, total] = await Promise.all([
      Vendor.find(filter)
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Vendor.countDocuments(filter)
    ]);

    res.json({
      vendors,
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

router.put('/vendors/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateVendorSchema.parse(req.body);
    
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    Object.assign(vendor, data);
    await vendor.save();
    
    res.json({
      message: 'Vendor updated successfully',
      vendor
    });
  } catch (error) {
    next(error);
  }
});

// Analytics and Reporting
router.get('/analytics/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateFilter: any = {};
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case '90d':
        dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
        break;
      case '1y':
        dateFilter = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
        break;
    }

    const [newUsers, userGrowth, roleDistribution] = await Promise.all([
      User.countDocuments({ createdAt: dateFilter }),
      User.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      newUsers,
      userGrowth,
      roleDistribution
    });
  } catch (error) {
    next(error);
  }
});

router.get('/analytics/bookings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateFilter: any = {};
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case '90d':
        dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
        break;
      case '1y':
        dateFilter = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
        break;
    }

    const [totalBookings, revenue, statusDistribution, dailyBookings] = await Promise.all([
      Booking.countDocuments({ createdAt: dateFilter }),
      Booking.aggregate([
        { $match: { createdAt: dateFilter } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Booking.aggregate([
        { $match: { createdAt: dateFilter } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Booking.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      totalBookings,
      revenue: revenue[0]?.total || 0,
      statusDistribution,
      dailyBookings
    });
  } catch (error) {
    next(error);
  }
});

export default router;
