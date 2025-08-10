import React, { useState, useEffect } from 'react';
import { ratingService } from '../../services/ratingService';
import PostEventRatingModal from './PostEventRatingModal';
import Button from '../ui/Button';

const RatingTrigger = ({ event, onRatingCompleted }) => {
  const [showModal, setShowModal] = useState(false);
  const [ratingStatus, setRatingStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkRatingStatus();
  }, [event._id]);

  const checkRatingStatus = async () => {
    try {
      setLoading(true);
      const response = await ratingService.checkRatingStatus(event._id);
      setRatingStatus(response.data);
    } catch (error) {
      console.error('Failed to check rating status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRatings = async (ratingData) => {
    try {
      await ratingService.submitRating(ratingData);
      onRatingCompleted?.();
      setRatingStatus({ needsRating: false, reason: 'Already rated' });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit ratings');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!ratingStatus?.needsRating) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className="bg-ludus-orange hover:bg-ludus-orange-dark text-white"
        size="sm"
      >
        <span className="mr-2">⭐</span>
        Rate Experience
      </Button>

      <PostEventRatingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        event={event}
        participants={ratingStatus.participants || []}
        onSubmitRatings={handleSubmitRatings}
      />
    </>
  );
};

export default RatingTrigger;