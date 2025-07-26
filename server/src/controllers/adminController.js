const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Activity = require('../models/Activity');
const Booking = require('../models/Booking');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
  try {
    // Get counts for all entities
    const [totalUsers, totalVendors, totalActivities, totalBookings] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Vendor.countDocuments(),
      Activity.countDocuments(),
      Booking.countDocuments()
    ]);

    // Calculate total revenue from completed bookings
    const revenueAggregation = await Booking.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$pricing.totalPrice' } } }
    ]);
    const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;

    // Get recent bookings
    const recentBookings = await Booking.find()
      .populate('user', 'firstName lastName email')
      .populate('activity', 'title')
      .populate('vendor', 'businessName')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get booking stats by status
    const bookingStats = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get activity stats by category
    const activityStats = await Activity.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Get revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Booking.aggregate([
      { 
        $match: { 
          'payment.status': 'paid',
          createdAt: { $gte: sixMonthsAgo }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$pricing.totalPrice' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalVendors,
          totalActivities,
          totalBookings,
          totalRevenue
        },
        recentBookings,
        stats: {
          bookingsByStatus: bookingStats,
          activitiesByCategory: activityStats,
          monthlyRevenue
        }
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

// @desc    Get all vendors for admin
// @route   GET /api/admin/vendors
// @access  Private (Admin only)
const getVendors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const status = req.query.status || '';

    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { 'contactInfo.email': { $regex: search, $options: 'i' } }
      ];
    }
    if (category) filter.categories = category;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    // Get vendors with pagination
    const vendors = await Vendor.find(filter)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalVendors = await Vendor.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        vendors,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalVendors / limit),
          totalVendors
        }
      }
    });

  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendors'
    });
  }
};

// @desc    Create new vendor
// @route   POST /api/admin/vendors
// @access  Private (Admin only)
const createVendor = async (req, res) => {
  try {
    const vendorData = {
      ...req.body,
      createdBy: req.user._id
    };

    const vendor = new Vendor(vendorData);
    await vendor.save();

    // Populate creator info for response
    await vendor.populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Vendor created successfully',
      data: { vendor }
    });

  } catch (error) {
    console.error('Create vendor error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create vendor'
    });
  }
};

// @desc    Update vendor
// @route   PUT /api/admin/vendors/:id
// @access  Private (Admin only)
const updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vendor updated successfully',
      data: { vendor }
    });

  } catch (error) {
    console.error('Update vendor error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update vendor'
    });
  }
};

// @desc    Delete vendor
// @route   DELETE /api/admin/vendors/:id
// @access  Private (Admin only)
const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Check if vendor has activities
    const activityCount = await Activity.countDocuments({ vendor: vendor._id });
    
    if (activityCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete vendor. ${activityCount} activities are associated with this vendor.`
      });
    }

    await vendor.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Vendor deleted successfully'
    });

  } catch (error) {
    console.error('Delete vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete vendor'
    });
  }
};

// @desc    Get all activities for admin
// @route   GET /api/admin/activities
// @access  Private (Admin only)
const getActivities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const vendor = req.query.vendor || '';
    const status = req.query.status || '';

    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) filter.category = category;
    if (vendor) filter.vendor = vendor;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    // Get activities with pagination
    const activities = await Activity.find(filter)
      .populate('vendor', 'businessName')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalActivities = await Activity.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalActivities / limit),
          totalActivities
        }
      }
    });

  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities'
    });
  }
};

// @desc    Create new activity
// @route   POST /api/admin/activities
// @access  Private (Admin only)
const createActivity = async (req, res) => {
  try {
    const activityData = {
      ...req.body,
      createdBy: req.user._id
    };

    const activity = new Activity(activityData);
    await activity.save();

    // Populate related data for response
    await activity.populate([
      { path: 'vendor', select: 'businessName' },
      { path: 'createdBy', select: 'firstName lastName' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: { activity }
    });

  } catch (error) {
    console.error('Create activity error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create activity'
    });
  }
};

// @desc    Update activity
// @route   PUT /api/admin/activities/:id
// @access  Private (Admin only)
const updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'vendor', select: 'businessName' },
      { path: 'createdBy', select: 'firstName lastName' }
    ]);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Activity updated successfully',
      data: { activity }
    });

  } catch (error) {
    console.error('Update activity error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update activity'
    });
  }
};

// @desc    Delete activity
// @route   DELETE /api/admin/activities/:id
// @access  Private (Admin only)
const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Check if activity has bookings
    const bookingCount = await Booking.countDocuments({ activity: activity._id });
    
    if (bookingCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete activity. ${bookingCount} bookings are associated with this activity.`
      });
    }

    await activity.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Activity deleted successfully'
    });

  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete activity'
    });
  }
};

// @desc    Get all bookings for admin
// @route   GET /api/admin/bookings
// @access  Private (Admin only)
const getBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || '';
    const paymentStatus = req.query.paymentStatus || '';
    const search = req.query.search || '';

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter['payment.status'] = paymentStatus;
    if (search) {
      filter.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { 'contactInfo.email': { $regex: search, $options: 'i' } }
      ];
    }

    // Get bookings with pagination
    const bookings = await Booking.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('activity', 'title')
      .populate('vendor', 'businessName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalBookings = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalBookings / limit),
          totalBookings
        }
      }
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/admin/bookings/:id/status
// @access  Private (Admin only)
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate([
      { path: 'user', select: 'firstName lastName email' },
      { path: 'activity', select: 'title' },
      { path: 'vendor', select: 'businessName' }
    ]);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status'
    });
  }
};

module.exports = {
  getDashboardStats,
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getBookings,
  updateBookingStatus
};