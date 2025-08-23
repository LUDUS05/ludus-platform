import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { User } from '../models';
import { authenticateToken, requireUser } from '../middleware/auth';

const router = Router();

// Apply authentication to all user routes
router.use(authenticateToken);
router.use(requireUser);

// Validation schemas
const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  profilePicture: z.string().url('Invalid profile picture URL').optional(),
  location: z.object({
    coordinates: z.array(z.number()).length(2).optional(),
    address: z.string().min(1, 'Address is required').optional(),
    city: z.string().min(1, 'City is required').optional(),
    state: z.string().min(1, 'State is required').optional(),
    zipCode: z.string().min(1, 'ZIP code is required').optional(),
    country: z.string().optional()
  }).optional(),
  preferences: z.object({
    activityTypes: z.array(z.string()).optional(),
    priceRange: z.object({
      min: z.number().min(0).optional(),
      max: z.number().min(0).optional()
    }).optional(),
    maxDistance: z.number().min(1).max(100).optional(),
    groupSize: z.object({
      min: z.number().min(1).optional(),
      max: z.number().min(1).max(50).optional()
    }).optional()
  }).optional()
});

const updatePreferencesSchema = z.object({
  activityTypes: z.array(z.string()).optional(),
  priceRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0)
  }).optional(),
  maxDistance: z.number().min(1).max(100).optional(),
  groupSize: z.object({
    min: z.number().min(1),
    max: z.number().min(1).max(50)
  }).optional()
});

// Get user profile
router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: user.toJSON() });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update only provided fields
    Object.assign(user, data);
    await user.save();
    
    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Update user preferences
router.put('/preferences', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updatePreferencesSchema.parse(req.body);
    
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update preferences
    if (data.activityTypes) user.preferences.activityTypes = data.activityTypes;
    if (data.priceRange) user.preferences.priceRange = data.priceRange;
    if (data.maxDistance) user.preferences.maxDistance = data.maxDistance;
    if (data.groupSize) user.preferences.groupSize = data.groupSize;
    
    await user.save();
    
    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    next(error);
  }
});

// Change password
router.post('/change-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }
    
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

// Upload avatar
router.post('/profile/avatar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // For now, this is a placeholder endpoint
    // In production, you would handle file upload to cloud storage
    // and return the URL of the uploaded image
    
    // Mock response for now
    const avatarUrl = `https://via.placeholder.com/150x150?text=${encodeURIComponent('Avatar')}`;
    
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user's profile picture
    user.profilePicture = avatarUrl;
    await user.save();
    
    res.json({ 
      message: 'Avatar uploaded successfully',
      avatarUrl 
    });
  } catch (error) {
    next(error);
  }
});

// Get user's saved activities (bookmarks)
router.get('/saved-activities', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // This will be implemented when we add saved activities functionality
    res.json({ savedActivities: [] });
  } catch (error) {
    next(error);
  }
});

// Get user's booking history
router.get('/bookings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // This will be implemented when we add booking functionality
    res.json({ bookings: [] });
  } catch (error) {
    next(error);
  }
});

// Get user's activity recommendations based on preferences
router.get('/recommendations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // This will be implemented when we add activity discovery
    // For now, return empty recommendations
    res.json({ recommendations: [] });
  } catch (error) {
    next(error);
  }
});

// Delete user account (soft delete)
router.delete('/account', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Soft delete by setting isActive to false
    user.isActive = false;
    await user.save();
    
    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
