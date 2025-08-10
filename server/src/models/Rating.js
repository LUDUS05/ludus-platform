const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  // The user who submitted the rating
  rater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // The event being rated
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity', // Assuming activities represent events
    required: true
  },
  // Participant ratings (rating other users)
  participantRatings: [{
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 500,
      trim: true
    }
  }],
  // Event rating
  eventRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  // Partner/Vendor rating
  partnerRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  // General feedback
  feedback: {
    type: String,
    maxlength: 1000,
    trim: true
  },
  // Rating status
  status: {
    type: String,
    enum: ['submitted', 'verified', 'flagged'],
    default: 'submitted'
  },
  // Metadata
  submittedAt: {
    type: Date,
    default: Date.now
  },
  verifiedAt: {
    type: Date
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
ratingSchema.index({ rater: 1, event: 1 }, { unique: true }); // One rating per user per event
ratingSchema.index({ event: 1 });
ratingSchema.index({ 'participantRatings.participant': 1 });
ratingSchema.index({ submittedAt: -1 });

// Virtual for total participant ratings given
ratingSchema.virtual('totalParticipantRatings').get(function() {
  return this.participantRatings.length;
});

// Method to check if minimum rating requirements are met
ratingSchema.methods.meetsMinimumRequirements = function() {
  return this.participantRatings.length >= 2 && 
         this.eventRating >= 1 && 
         this.partnerRating >= 1;
};

// Method to get average ratings given by this user
ratingSchema.methods.getAverageParticipantRating = function() {
  if (this.participantRatings.length === 0) return 0;
  
  const sum = this.participantRatings.reduce((acc, rating) => acc + rating.rating, 0);
  return sum / this.participantRatings.length;
};

// Static method to check if user has already rated an event
ratingSchema.statics.hasUserRatedEvent = async function(userId, eventId) {
  const existingRating = await this.findOne({ 
    rater: userId, 
    event: eventId 
  });
  return !!existingRating;
};

// Static method to get user's community rating score
ratingSchema.statics.getUserCommunityRating = async function(userId) {
  const ratings = await this.find({
    'participantRatings.participant': userId,
    status: { $ne: 'flagged' }
  });

  if (ratings.length === 0) {
    return {
      averageRating: 0,
      totalRatings: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  let totalRatingSum = 0;
  let totalRatingCount = 0;
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  ratings.forEach(rating => {
    const userRatings = rating.participantRatings.filter(
      pr => pr.participant.toString() === userId.toString()
    );
    
    userRatings.forEach(userRating => {
      totalRatingSum += userRating.rating;
      totalRatingCount++;
      distribution[userRating.rating]++;
    });
  });

  return {
    averageRating: totalRatingCount > 0 ? totalRatingSum / totalRatingCount : 0,
    totalRatings: totalRatingCount,
    ratingDistribution: distribution
  };
};

// Static method to get event statistics
ratingSchema.statics.getEventRatingStats = async function(eventId) {
  const ratings = await this.find({ event: eventId, status: { $ne: 'flagged' } });
  
  if (ratings.length === 0) {
    return {
      averageEventRating: 0,
      averagePartnerRating: 0,
      totalRatings: 0
    };
  }

  const eventRatingSum = ratings.reduce((sum, rating) => sum + rating.eventRating, 0);
  const partnerRatingSum = ratings.reduce((sum, rating) => sum + rating.partnerRating, 0);

  return {
    averageEventRating: eventRatingSum / ratings.length,
    averagePartnerRating: partnerRatingSum / ratings.length,
    totalRatings: ratings.length,
    ratings: ratings.map(r => ({
      eventRating: r.eventRating,
      partnerRating: r.partnerRating,
      feedback: r.feedback,
      submittedAt: r.submittedAt
    }))
  };
};

// Static method to enforce minimum rating requirements
ratingSchema.statics.validateRatingRequirements = async function(ratingData, eventParticipants) {
  const { participantRatings, eventRating, partnerRating } = ratingData;
  
  // Check minimum participant ratings
  if (!participantRatings || participantRatings.length < 2) {
    throw new Error('You must rate at least 2 other participants');
  }

  // Check that rated participants were actually in the event
  const participantIds = eventParticipants.map(p => p.toString());
  const invalidRatings = participantRatings.filter(
    pr => !participantIds.includes(pr.participant.toString())
  );
  
  if (invalidRatings.length > 0) {
    throw new Error('You can only rate participants who attended this event');
  }

  // Check event and partner ratings
  if (!eventRating || eventRating < 1 || eventRating > 5) {
    throw new Error('Event rating must be between 1 and 5 stars');
  }

  if (!partnerRating || partnerRating < 1 || partnerRating > 5) {
    throw new Error('Partner rating must be between 1 and 5 stars');
  }

  // Validate individual participant ratings
  participantRatings.forEach(pr => {
    if (!pr.rating || pr.rating < 1 || pr.rating > 5) {
      throw new Error('All participant ratings must be between 1 and 5 stars');
    }
  });

  return true;
};

// Middleware to update user community ratings when rating is saved
ratingSchema.post('save', async function(doc) {
  try {
    // Update community rating for each rated participant
    for (const participantRating of doc.participantRatings) {
      const User = mongoose.model('User');
      const userId = participantRating.participant;
      
      // Calculate new community rating
      const communityRating = await Rating.getUserCommunityRating(userId);
      
      // Update user's community rating score
      await User.findByIdAndUpdate(userId, {
        'communityRating.averageRating': communityRating.averageRating,
        'communityRating.totalRatings': communityRating.totalRatings,
        'communityRating.ratingDistribution': communityRating.ratingDistribution,
        'communityRating.lastUpdated': new Date()
      });
    }
  } catch (error) {
    console.error('Error updating community ratings:', error);
  }
});

// Transform output
ratingSchema.methods.toJSON = function() {
  const rating = this.toObject();
  
  // Remove sensitive fields
  delete rating.__v;
  
  return rating;
};

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;