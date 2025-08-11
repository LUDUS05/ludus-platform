import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Activity, Vendor } from '../models';
import { authenticateToken, requireVendor, requireAdmin } from '../middleware/auth';
import { IActivity } from '../models/Activity';

const router = Router();

// Validation schemas
const createActivitySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum([
    'outdoor-adventure',
    'indoor-activities',
    'water-sports',
    'team-sports',
    'cultural-experiences',
    'food-tours',
    'wellness-spa',
    'entertainment',
    'educational',
    'fitness'
  ]),
  subcategory: z.string().optional(),
  vendorId: z.string().min(1, 'Vendor ID is required'),
  location: z.object({
    coordinates: z.array(z.number()).length(2),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
    country: z.string().default('United States')
  }),
  pricing: z.object({
    basePrice: z.number().min(0, 'Base price must be non-negative'),
    currency: z.string().default('USD'),
    perPerson: z.boolean().default(true),
    groupDiscounts: z.array(z.object({
      minPeople: z.number().min(2),
      discountPercentage: z.number().min(0).max(100)
    })).optional(),
    additionalFees: z.array(z.object({
      name: z.string(),
      amount: z.number().min(0),
      description: z.string().optional()
    })).optional()
  }),
  availability: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
    recurring: z.boolean().default(false),
    recurringPattern: z.object({
      daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
      interval: z.number().min(1).optional()
    }).optional(),
    maxCapacity: z.number().min(1),
    minCapacity: z.number().min(1).default(1),
    timeSlots: z.array(z.object({
      startTime: z.string(),
      endTime: z.string(),
      maxBookings: z.number().min(1)
    })).optional()
  }),
  requirements: z.object({
    minAge: z.number().min(0).optional(),
    maxAge: z.number().min(0).optional(),
    skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'all-levels']).default('all-levels'),
    equipment: z.array(z.string()).optional(),
    physicalRequirements: z.array(z.string()).optional(),
    certifications: z.array(z.string()).optional()
  }).optional(),
  images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required'),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().default(true)
});

const updateActivitySchema = createActivitySchema.partial();

// Get all activities (public) with filtering and search
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      city, 
      priceMin, 
      priceMax, 
      date, 
      search,
      skillLevel,
      minAge,
      maxAge,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query: any = { isActive: true };
    
    // Apply filters
    if (category) query.category = category;
    if (city) query['location.city'] = new RegExp(city as string, 'i');
    if (priceMin || priceMax) {
      query.pricing = {};
      if (priceMin) query.pricing.basePrice = { $gte: Number(priceMin) };
      if (priceMax) query.pricing.basePrice = { ...query.pricing.basePrice, $lte: Number(priceMax) };
    }
    if (date) {
      const targetDate = new Date(date as string);
      query['availability.startDate'] = { $lte: targetDate };
      query['availability.endDate'] = { $gte: targetDate };
    }
    if (skillLevel) query['requirements.skillLevel'] = skillLevel;
    if (minAge) query['requirements.minAge'] = { $lte: Number(minAge) };
    if (maxAge) query['requirements.maxAge'] = { $gte: Number(maxAge) };
    
    // Apply search
    if (search) {
      query.$or = [
        { title: new RegExp(search as string, 'i') },
        { description: new RegExp(search as string, 'i') },
        { tags: new RegExp(search as string, 'i') }
      ];
    }
    
    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    
    const activities = await Activity.find(query)
      .populate('vendorId', 'businessName location rating isVerified')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort(sort);
    
    const total = await Activity.countDocuments(query);
    
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

// Get activity by ID (public)
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('vendor.vendorId', 'businessName location rating isVerified contactInfo') as IActivity | null;
    
    if (!activity || !activity.availability.isActive) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    res.json({ activity });
  } catch (error) {
    next(error);
  }
});

// Create new activity (vendor or admin)
router.post('/', authenticateToken, requireVendor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createActivitySchema.parse(req.body);
    
    // Verify vendor exists and user has permission
    const vendor = await Vendor.findById(data.vendorId);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    if (req.user?.role !== 'admin' && vendor.owner.userId?.toString() !== req.user?.userId) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const activity = new Activity(data);
    await activity.save();
    
    res.status(201).json({
      message: 'Activity created successfully',
      activity
    });
  } catch (error) {
    next(error);
  }
});

// Update activity (vendor or admin)
router.put('/:id', authenticateToken, requireVendor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateActivitySchema.parse(req.body);
    
    const activity = await Activity.findById(req.params.id) as IActivity | null;
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    // Check permissions
    const vendor = await Vendor.findById(activity.vendor.vendorId);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    if (req.user?.role !== 'admin' && vendor.owner.userId?.toString() !== req.user?.userId) {
      return res.status(403).json({ error: 'Insufficient permissions' });
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

// Deactivate activity (vendor or admin)
router.patch('/:id/deactivate', authenticateToken, requireVendor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activity = await Activity.findById(req.params.id) as IActivity | null;
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    // Check permissions
    const vendor = await Vendor.findById(activity.vendor.vendorId);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    if (req.user?.role !== 'admin' && vendor.owner.userId?.toString() !== req.user?.userId) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    activity.availability.isActive = false;
    await activity.save();
    
    res.json({
      message: 'Activity deactivated successfully',
      activity
    });
  } catch (error) {
    next(error);
  }
});

// Get activities by category
router.get('/category/:category', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 12, city, priceMin, priceMax } = req.query;
    
    const query: any = { 
      category: req.params.category,
      isActive: true 
    };
    
    if (city) query['location.city'] = new RegExp(city as string, 'i');
    if (priceMin || priceMax) {
      query.pricing = {};
      if (priceMin) query.pricing.basePrice = { $gte: Number(priceMin) };
      if (priceMax) query.pricing.basePrice = { ...query.pricing.basePrice, $lte: Number(priceMax) };
    }
    
    const activities = await Activity.find(query)
      .populate('vendorId', 'businessName location rating isVerified')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });
    
    const total = await Activity.countDocuments(query);
    
    res.json({
      activities,
      category: req.params.category,
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

// Get featured activities
router.get('/featured/featured', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activities = await Activity.find({ 
      isActive: true,
      isFeatured: true 
    })
    .populate('vendorId', 'businessName location rating isVerified')
    .limit(6)
    .sort({ rating: -1, createdAt: -1 });
    
    res.json({ activities });
  } catch (error) {
    next(error);
  }
});

export default router;
