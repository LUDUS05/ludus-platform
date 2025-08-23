import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Vendor, User } from '../models';
import { authenticateToken, requireVendor, requireAdmin } from '../middleware/auth';

const router = Router();

// Validation schemas
const createVendorSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  businessType: z.enum(['individual', 'company', 'nonprofit']),
  contactInfo: z.object({
    phone: z.string().min(1, 'Phone is required'),
    website: z.string().url('Invalid website URL').optional(),
    email: z.string().email('Invalid email format')
  }),
  location: z.object({
    coordinates: z.array(z.number()).length(2),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
    country: z.string().default('United States')
  }),
  specialties: z.array(z.string()).min(1, 'At least one specialty is required'),
  certifications: z.array(z.string()).optional(),
  insurance: z.boolean().default(false),
  yearsInBusiness: z.number().min(0).optional(),
  socialMedia: z.object({
    facebook: z.string().url('Invalid Facebook URL').optional(),
    instagram: z.string().url('Invalid Instagram URL').optional(),
    twitter: z.string().url('Invalid Twitter URL').optional(),
    linkedin: z.string().url('Invalid LinkedIn URL').optional()
  }).optional()
});

const updateVendorSchema = createVendorSchema.partial();

// Get all vendors (public)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, city, specialty, verified } = req.query;
    
    const query: any = { isActive: true };
    
    if (city) query['location.city'] = new RegExp(city as string, 'i');
    if (specialty) query.specialties = new RegExp(specialty as string, 'i');
    if (verified === 'true') query.isVerified = true;
    
    const vendors = await Vendor.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ isVerified: -1, rating: -1, createdAt: -1 });
    
    const total = await Vendor.countDocuments(query);
    
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

// Get vendor by ID (public)
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate('activities');
    if (!vendor || !vendor.isActive) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    res.json({ vendor });
  } catch (error) {
    next(error);
  }
});

// Create new vendor (admin only)
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createVendorSchema.parse(req.body);
    
    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({ 
      'contactInfo.email': data.contactInfo.email 
    });
    if (existingVendor) {
      return res.status(400).json({ error: 'Vendor already exists with this email' });
    }
    
    const vendor = new Vendor(data);
    await vendor.save();
    
    res.status(201).json({
      message: 'Vendor created successfully',
      vendor
    });
  } catch (error) {
    next(error);
  }
});

// Update vendor profile (vendor or admin)
router.put('/:id', authenticateToken, requireVendor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateVendorSchema.parse(req.body);
    
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    // Check if user has permission to update this vendor
    if (req.user?.role !== 'admin' && vendor.owner.userId?.toString() !== req.user?.userId) {
      return res.status(403).json({ error: 'Insufficient permissions' });
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

// Verify vendor (admin only)
router.patch('/:id/verify', authenticateToken, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    vendor.isVerified = true;
    vendor.verifiedAt = new Date();
    await vendor.save();
    
    res.json({
      message: 'Vendor verified successfully',
      vendor
    });
  } catch (error) {
    next(error);
  }
});

// Deactivate vendor (admin only)
router.patch('/:id/deactivate', authenticateToken, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    vendor.isActive = false;
    // Update verification status to rejected when deactivated
    vendor.verificationStatus = 'rejected';
    await vendor.save();
    
    res.json({
      message: 'Vendor deactivated successfully',
      vendor
    });
  } catch (error) {
    next(error);
  }
});

// Get vendor's activities
router.get('/:id/activities', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor || !vendor.isActive) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    // This will be implemented when we add activity functionality
    res.json({ activities: [] });
  } catch (error) {
    next(error);
  }
});

// Get vendor statistics (vendor or admin)
router.get('/:id/stats', authenticateToken, requireVendor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    // Check permissions
    if (req.user?.role !== 'admin' && vendor.owner.userId?.toString() !== req.user?.userId) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // This will be implemented when we add booking and activity functionality
    res.json({
      stats: {
        totalActivities: 0,
        totalBookings: 0,
        totalRevenue: 0,
        averageRating: 0, // Will be calculated from reviews when implemented
        totalReviews: 0
      }
    });
  } catch (error) {
    next(error);
  }
});

// Upload vendor logo
router.post('/profile/logo', authenticateToken, requireVendor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // For now, this is a placeholder endpoint
    // In production, you would handle file upload to cloud storage
    // and return the URL of the uploaded image
    
    // Mock response for now
    const logoUrl = `https://via.placeholder.com/200x100?text=${encodeURIComponent('Logo')}`;
    
    // Find vendor by owner ID
    const vendor = await Vendor.findOne({ 'owner.userId': req.user?.userId });
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }
    
    // Update vendor's logo
    vendor.logo = logoUrl;
    await vendor.save();
    
    res.json({ 
      message: 'Logo uploaded successfully',
      logoUrl 
    });
  } catch (error) {
    next(error);
  }
});

// Upload vendor banner
router.post('/profile/banner', authenticateToken, requireVendor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // For now, this is a placeholder endpoint
    // In production, you would handle file upload to cloud storage
    // and return the URL of the uploaded image
    
    // Mock response for now
    const bannerUrl = `https://via.placeholder.com/800x200?text=${encodeURIComponent('Banner')}`;
    
    // Find vendor by owner ID
    const vendor = await Vendor.findOne({ 'owner.userId': req.user?.userId });
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }
    
    // Update vendor's banner
    vendor.banner = bannerUrl;
    await vendor.save();
    
    res.json({ 
      message: 'Banner uploaded successfully',
      bannerUrl 
    });
  } catch (error) {
    next(error);
  }
});

export default router;
