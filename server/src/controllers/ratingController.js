const Rating = require('../models/Rating');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Booking = require('../models/Booking');

// @desc    Submit post-event rating
// @route   POST /api/ratings
// @access  Private
const submitRating = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { eventId, participantRatings, eventRating, partnerRating, feedback } = req.body;

    // Validation
    if (!eventId || !participantRatings || !eventRating || !partnerRating) {
      return res.status(400).json({
        success: false,
        message: 'Event ID, participant ratings, event rating, and partner rating are required'
      });
    }

    // Check if user has already rated this event
    const hasRated = await Rating.hasUserRatedEvent(userId, eventId);
    if (hasRated) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this event'
      });
    }

    // Verify user attended the event (has a booking)
    const userBooking = await Booking.findOne({
      user: userId,
      activity: eventId,
      status: { $in: ['confirmed', 'completed'] }
    });

    if (!userBooking) {
      return res.status(403).json({
        success: false,
        message: 'You can only rate events you have attended'
      });
    }

    // Get all event participants (users with confirmed bookings)
    const eventBookings = await Booking.find({
      activity: eventId,
      status: { $in: ['confirmed', 'completed'] }
    }).populate('user');

    const eventParticipants = eventBookings
      .map(booking => booking.user._id)
      .filter(participantId => participantId.toString() !== userId.toString()); // Exclude the rater

    // Validate rating requirements
    await Rating.validateRatingRequirements({
      participantRatings,
      eventRating,
      partnerRating
    }, eventParticipants);

    // Enforce minimum 2 participants rule
    if (participantRatings.length < Math.min(2, eventParticipants.length)) {
      return res.status(400).json({
        success: false,
        message: `You must rate at least ${Math.min(2, eventParticipants.length)} other participants`
      });
    }

    // Create the rating
    const rating = new Rating({
      rater: userId,
      event: eventId,
      participantRatings,
      eventRating,
      partnerRating,
      feedback: feedback || '',
      status: 'submitted'
    });

    await rating.save();

    // Populate the rating for response
    await rating.populate([
      { path: 'rater', select: 'firstName lastName' },
      { path: 'event', select: 'title' },
      { path: 'participantRatings.participant', select: 'firstName lastName' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: { rating }
    });

  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit rating'
    });
  }
};

// @desc    Get user's community rating
// @route   GET /api/ratings/community/:userId
// @access  Public
const getUserCommunityRating = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Verify user exists
    const user = await User.findById(userId).select('firstName lastName communityRating');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get community rating from database (updated by Rating model middleware)
    const communityRating = user.communityRating;

    // Also get recent ratings for context
    const recentRatings = await Rating.find({
      'participantRatings.participant': userId,
      status: { $ne: 'flagged' }
    })
    .sort({ submittedAt: -1 })
    .limit(10)
    .populate('rater', 'firstName lastName')
    .populate('event', 'title');

    const recentRatingComments = recentRatings.flatMap(rating => 
      rating.participantRatings
        .filter(pr => pr.participant.toString() === userId.toString())
        .map(pr => ({
          rating: pr.rating,
          comment: pr.comment,
          raterName: rating.rater.firstName + ' ' + rating.rater.lastName,
          eventTitle: rating.event.title,
          submittedAt: rating.submittedAt
        }))
    ).filter(r => r.comment); // Only include ratings with comments

    res.json({
      success: true,
      data: {
        user: {
          firstName: user.firstName,
          lastName: user.lastName
        },
        communityRating,
        recentComments: recentRatingComments.slice(0, 5) // Latest 5 comments
      }
    });

  } catch (error) {
    console.error('Get user community rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch community rating'
    });
  }
};

// @desc    Get event rating statistics
// @route   GET /api/ratings/event/:eventId
// @access  Public
const getEventRatings = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    // Verify event exists
    const event = await Activity.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const eventStats = await Rating.getEventRatingStats(eventId);

    res.json({
      success: true,
      data: {
        eventId,
        eventTitle: event.title,
        ...eventStats
      }
    });

  } catch (error) {
    console.error('Get event ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event ratings'
    });
  }
};

// @desc    Get user's submitted ratings
// @route   GET /api/ratings/my-ratings
// @access  Private
const getMyRatings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const ratings = await Rating.find({ rater: userId })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('event', 'title vendor')
      .populate('participantRatings.participant', 'firstName lastName');

    const total = await Rating.countDocuments({ rater: userId });

    res.json({
      success: true,
      data: {
        ratings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get my ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your ratings'
    });
  }
};

// @desc    Check if user needs to rate an event
// @route   GET /api/ratings/check/:eventId
// @access  Private
const checkRatingStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;

    // Check if user has a completed booking for this event
    const userBooking = await Booking.findOne({
      user: userId,
      activity: eventId,
      status: 'completed' // Only completed events need ratings
    });

    if (!userBooking) {
      return res.json({
        success: true,
        data: {
          needsRating: false,
          reason: 'No completed booking found'
        }
      });
    }

    // Check if user has already rated
    const hasRated = await Rating.hasUserRatedEvent(userId, eventId);
    if (hasRated) {
      return res.json({
        success: true,
        data: {
          needsRating: false,
          reason: 'Already rated'
        }
      });
    }

    // Get other participants for rating
    const eventBookings = await Booking.find({
      activity: eventId,
      status: { $in: ['confirmed', 'completed'] }
    }).populate('user', 'firstName lastName profileImage');

    const otherParticipants = eventBookings
      .map(booking => booking.user)
      .filter(participant => participant._id.toString() !== userId.toString());

    res.json({
      success: true,
      data: {
        needsRating: true,
        participants: otherParticipants,
        minimumRatingsRequired: Math.min(2, otherParticipants.length)
      }
    });

  } catch (error) {
    console.error('Check rating status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check rating status'
    });
  }
};

// @desc    Get rating statistics for admin
// @route   GET /api/ratings/admin/stats
// @access  Private (Admin only)
const getAdminRatingStats = async (req, res, next) => {
  try {
    // Verify admin access
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const totalRatings = await Rating.countDocuments();
    const pendingRatings = await Rating.countDocuments({ status: 'submitted' });
    const flaggedRatings = await Rating.countDocuments({ status: 'flagged' });

    // Average ratings
    const avgEventRating = await Rating.aggregate([
      { $match: { status: { $ne: 'flagged' } } },
      { $group: { _id: null, avgRating: { $avg: '$eventRating' } } }
    ]);

    const avgPartnerRating = await Rating.aggregate([
      { $match: { status: { $ne: 'flagged' } } },
      { $group: { _id: null, avgRating: { $avg: '$partnerRating' } } }
    ]);

    // Recent ratings
    const recentRatings = await Rating.find({ status: 'submitted' })
      .sort({ submittedAt: -1 })
      .limit(10)
      .populate('rater', 'firstName lastName')
      .populate('event', 'title');

    res.json({
      success: true,
      data: {
        totalRatings,
        pendingRatings,
        flaggedRatings,
        averageEventRating: avgEventRating[0]?.avgRating || 0,
        averagePartnerRating: avgPartnerRating[0]?.avgRating || 0,
        recentRatings
      }
    });

  } catch (error) {
    console.error('Get admin rating stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rating statistics'
    });
  }
};

module.exports = {
  submitRating,
  getUserCommunityRating,
  getEventRatings,
  getMyRatings,
  checkRatingStatus,
  getAdminRatingStats
};