/**
 * @fileoverview Controller for handling social interactions.
 * @module controllers/socialController
 */

const Activity = require('../models/Activity');
const User = require('../models/User');
const Like = require('../models/Like');

/**
 * Join an event.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const joinEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.body;

    // Validate event exists and is active
    const event = await Activity.findById(eventId);
    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or inactive',
        animationTriggers: {
          errorMessage: 'الحدث غير موجود أو غير نشط',
          errorShake: true
        }
      });
    }

    // Check if user is already attending
    const isAlreadyAttending = event.attendees && event.attendees.includes(userId);
    if (isAlreadyAttending) {
      return res.status(400).json({
        success: false,
        message: 'You are already attending this event',
        animationTriggers: {
          errorMessage: 'أنت منضم بالفعل لهذا الحدث',
          errorShake: true
        }
      });
    }

    // Check capacity
    const currentAttendees = event.attendees ? event.attendees.length : 0;
    if (event.capacity && currentAttendees >= event.capacity.max) {
      return res.status(400).json({
        success: false,
        message: 'Event is at full capacity',
        animationTriggers: {
          errorMessage: 'الحدث ممتلئ بالكامل',
          errorShake: true
        }
      });
    }

    // Add user to attendees
    if (!event.attendees) {
      event.attendees = [];
    }
    event.attendees.push(userId);
    await event.save();

    // Get updated attendee count
    const newAttendeeCount = event.attendees.length;

    res.status(200).json({
      success: true,
      message: 'Successfully joined the event',
      data: {
        eventId,
        newAttendeeCount,
        isJoined: true
      },
      animationTriggers: {
        successMessage: 'تم الانضمام للحدث بنجاح! 🎉',
        hapticFeedback: true,
        celebration: true
      }
    });

  } catch (error) {
    console.error('Join event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join event',
      animationTriggers: {
        errorMessage: 'فشل في الانضمام للحدث',
        errorShake: true
      }
    });
  }
};

/**
 * Leave an event.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const leaveEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.body;

    // Validate event exists
    const event = await Activity.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
        animationTriggers: {
          errorMessage: 'الحدث غير موجود',
          errorShake: true
        }
      });
    }

    // Check if user is attending
    if (!event.attendees || !event.attendees.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are not attending this event',
        animationTriggers: {
          errorMessage: 'أنت غير منضم لهذا الحدث',
          errorShake: true
        }
      });
    }

    // Remove user from attendees
    event.attendees = event.attendees.filter(id => id.toString() !== userId);
    await event.save();

    // Get updated attendee count
    const newAttendeeCount = event.attendees.length;

    res.status(200).json({
      success: true,
      message: 'Successfully left the event',
      data: {
        eventId,
        newAttendeeCount,
        isJoined: false
      },
      animationTriggers: {
        successMessage: 'تم ترك الحدث بنجاح',
        hapticFeedback: true
      }
    });

  } catch (error) {
    console.error('Leave event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave event',
      animationTriggers: {
        errorMessage: 'فشل في ترك الحدث',
        errorShake: true
      }
    });
  }
};

/**
 * Toggle like on a piece of content.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const toggleLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contentId, contentType } = req.body;

    // Validate content type
    const validContentTypes = ['activity', 'user', 'comment', 'post'];
    if (!validContentTypes.includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content type',
        animationTriggers: {
          errorMessage: 'نوع المحتوى غير صحيح',
          errorShake: true
        }
      });
    }

    // Check if like already exists
    const existingLike = await Like.findOne({
      user: userId,
      contentId,
      contentType
    });

    let isLiked;
    let newLikeCount;

    if (existingLike) {
      // Unlike - remove the like
      await Like.findByIdAndDelete(existingLike._id);
      isLiked = false;
      
      // Update like count in the content
      await updateLikeCount(contentId, contentType, -1);
      
    } else {
      // Like - create new like
      const newLike = new Like({
        user: userId,
        contentId,
        contentType
      });
      await newLike.save();
      isLiked = true;
      
      // Update like count in the content
      await updateLikeCount(contentId, contentType, 1);
    }

    // Get updated like count
    newLikeCount = await getLikeCount(contentId, contentType);

    res.status(200).json({
      success: true,
      message: isLiked ? 'Content liked' : 'Content unliked',
      data: {
        contentId,
        contentType,
        isLiked,
        newLikeCount
      },
      animationTriggers: {
        heartAnimation: true,
        hapticFeedback: true,
        successMessage: isLiked ? 'تم الإعجاب بالمحتوى ❤️' : 'تم إلغاء الإعجاب'
      }
    });

  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like',
      animationTriggers: {
        errorMessage: 'فشل في تحديث الإعجاب',
        errorShake: true
      }
    });
  }
};

/**
 * Get the attendees for a specific event.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getEventAttendees = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const event = await Activity.findById(eventId)
      .populate({
        path: 'attendees',
        select: 'firstName lastName profilePicture',
        options: {
          limit: limit * 1,
          skip: (page - 1) * limit
        }
      });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const totalAttendees = event.attendees ? event.attendees.length : 0;

    res.status(200).json({
      success: true,
      data: {
        attendees: event.attendees || [],
        totalAttendees,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalAttendees / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get event attendees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event attendees'
    });
  }
};

/**
 * Get all content liked by the authenticated user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getUserLikes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, contentType } = req.query;

    const filter = { user: userId };
    if (contentType) {
      filter.contentType = contentType;
    }

    const likes = await Like.find(filter)
      .populate('contentId', 'title description images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalLikes = await Like.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        likes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalLikes / limit),
          totalLikes
        }
      }
    });

  } catch (error) {
    console.error('Get user likes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user likes'
    });
  }
};

/**
 * Helper function to update the like count on a piece of content.
 * @param {string} contentId - The ID of the content to update.
 * @param {string} contentType - The type of content to update.
 * @param {number} increment - The amount to increment the like count by.
 * @returns {Promise<void>}
 */
const updateLikeCount = async (contentId, contentType, increment) => {
  try {
    let Model;
    let likeField;

    switch (contentType) {
      case 'activity':
        Model = Activity;
        likeField = 'likes';
        break;
      case 'user':
        Model = User;
        likeField = 'likes';
        break;
      default:
        return;
    }

    await Model.findByIdAndUpdate(contentId, {
      $inc: { [likeField]: increment }
    });
  } catch (error) {
    console.error('Update like count error:', error);
  }
};

/**
 * Helper function to get the like count for a piece of content.
 * @param {string} contentId - The ID of the content.
 * @param {string} contentType - The type of content.
 * @returns {Promise<number>} The like count.
 */
const getLikeCount = async (contentId, contentType) => {
  try {
    let Model;
    let likeField;

    switch (contentType) {
      case 'activity':
        Model = Activity;
        likeField = 'likes';
        break;
      case 'user':
        Model = User;
        likeField = 'likes';
        break;
      default:
        return 0;
    }

    const content = await Model.findById(contentId).select(likeField);
    return content ? content[likeField] || 0 : 0;
  } catch (error) {
    console.error('Get like count error:', error);
    return 0;
  }
};

module.exports = {
  joinEvent,
  leaveEvent,
  toggleLike,
  getEventAttendees,
  getUserLikes
};
