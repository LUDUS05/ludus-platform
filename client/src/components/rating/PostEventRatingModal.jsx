import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import Card from '../ui/Card';

const PostEventRatingModal = ({ 
  isOpen, 
  onClose, 
  event, 
  participants = [], 
  onSubmitRatings 
}) => {
  const { t } = useTranslation();
  const [ratings, setRatings] = useState({});
  const [eventRating, setEventRating] = useState(0);
  const [partnerRating, setPartnerRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Participants, 2: Event/Partner, 3: Feedback

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setRatings({});
      setEventRating(0);
      setPartnerRating(0);
      setFeedback('');
      setError('');
      setStep(1);
    }
  }, [isOpen]);

  const handleParticipantRating = (participantId, rating, comment = '') => {
    setRatings(prev => ({
      ...prev,
      [participantId]: { rating, comment }
    }));
  };

  const validateStep1 = () => {
    const ratedParticipants = Object.keys(ratings).filter(
      participantId => ratings[participantId].rating > 0
    );
    
    if (ratedParticipants.length < Math.min(2, participants.length)) {
      setError(`Please rate at least ${Math.min(2, participants.length)} participants`);
      return false;
    }
    
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (eventRating === 0 || partnerRating === 0) {
      setError('Please rate both the event and the partner');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const ratingData = {
        eventId: event._id,
        participantRatings: Object.entries(ratings).map(([participantId, data]) => ({
          participantId,
          rating: data.rating,
          comment: data.comment
        })),
        eventRating,
        partnerRating,
        feedback
      };

      await onSubmitRatings(ratingData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit ratings');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Rate Your Experience</h2>
              <p className="text-gray-600 mt-1">{event?.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center mb-8">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-ludus-orange text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-12 h-0.5 ${
                    step > stepNumber ? 'bg-ludus-orange' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Step 1: Rate Participants */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Rate Other Participants
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Help build our community by rating at least {Math.min(2, participants.length)} other participants
                </p>
              </div>

              {participants.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No other participants to rate</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {participants.map((participant) => (
                    <ParticipantRatingCard
                      key={participant._id}
                      participant={participant}
                      rating={ratings[participant._id]?.rating || 0}
                      comment={ratings[participant._id]?.comment || ''}
                      onChange={(rating, comment) => handleParticipantRating(participant._id, rating, comment)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Rate Event and Partner */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Rate the Experience
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  How was the event and partner?
                </p>
              </div>

              <div className="space-y-6">
                {/* Event Rating */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Event Rating</h4>
                  <p className="text-sm text-gray-600 mb-3">How was the overall event experience?</p>
                  <StarRating 
                    rating={eventRating} 
                    onChange={setEventRating}
                    size="lg"
                  />
                </div>

                {/* Partner Rating */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Partner Rating</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    How was {event?.vendor?.name || 'the partner'}?
                  </p>
                  <StarRating 
                    rating={partnerRating} 
                    onChange={setPartnerRating}
                    size="lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Feedback */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Additional Feedback
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Share any additional thoughts about your experience (optional)
                </p>
              </div>

              <div>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us more about your experience..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-ludus-orange focus:border-ludus-orange resize-none"
                />
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Rating Summary</h4>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>Participants rated: {Object.keys(ratings).length}</p>
                  <p>Event rating: <span className="text-ludus-orange">{'★'.repeat(eventRating)}{'☆'.repeat(5 - eventRating)}</span></p>
                  <p>Partner rating: <span className="text-ludus-orange">{'★'.repeat(partnerRating)}{'☆'.repeat(5 - partnerRating)}</span></p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
            <div>
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={loading}
                >
                  Back
                </Button>
              )}
            </div>

            <div className="space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>

              {step < 3 ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Ratings'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Individual Participant Rating Card
const ParticipantRatingCard = ({ participant, rating, comment, onChange }) => {
  const [showComment, setShowComment] = useState(false);

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {participant.profileImage ? (
            <img 
              src={participant.profileImage} 
              alt={participant.name}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium text-sm">
                {participant.firstName?.charAt(0)}{participant.lastName?.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">
              {participant.firstName} {participant.lastName}
            </h4>
            <StarRating 
              rating={rating}
              onChange={(newRating) => onChange(newRating, comment)}
            />
          </div>

          {rating > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setShowComment(!showComment)}
                className="text-sm text-ludus-orange hover:text-ludus-orange-dark"
              >
                {showComment ? 'Hide comment' : 'Add comment'}
              </button>
              
              {showComment && (
                <textarea
                  value={comment}
                  onChange={(e) => onChange(rating, e.target.value)}
                  placeholder="Optional comment about this participant..."
                  rows={2}
                  className="w-full mt-2 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-ludus-orange focus:border-ludus-orange resize-none"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Star Rating Component
const StarRating = ({ rating, onChange, size = 'md' }) => {
  const [hover, setHover] = useState(0);
  
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${sizeClasses[size]} transition-colors ${
            star <= (hover || rating)
              ? 'text-ludus-orange'
              : 'text-gray-300 hover:text-ludus-orange'
          }`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
        >
          ★
        </button>
      ))}
    </div>
  );
};

export default PostEventRatingModal;