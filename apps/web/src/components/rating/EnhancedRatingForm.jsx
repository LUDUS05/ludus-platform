import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Trophy, Target, Clock, Users, Award, Zap, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import RatingCriteriaCard from './RatingCriteriaCard';
import GamificationProgress from './GamificationProgress';
import RatingStreakIndicator from './RatingStreakIndicator';
import TierProgressBar from './TierProgressBar';
import { ratingService } from '../../services/ratingService';

const EnhancedRatingForm = ({ 
  assignment, 
  targetUser, 
  onRatingSubmitted, 
  onCancel,
  userProfile,
  gamificationData 
}) => {
  const { t } = useTranslation();
  const [ratings, setRatings] = useState({});
  const [overallRating, setOverallRating] = useState(0);
  const [generalComment, setGeneralComment] = useState('');
  const [wouldParticipateAgain, setWouldParticipateAgain] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showGamification, setShowGamification] = useState(false);

  const totalSteps = 3;
  const criteria = assignment?.criteria || [];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Initialize ratings with default values
    const initialRatings = {};
    criteria.forEach(criterion => {
      initialRatings[criterion.id] = {
        score: 0,
        comment: ''
      };
    });
    setRatings(initialRatings);
  }, [criteria]);

  const handleCriteriaChange = (criterionId, score, comment) => {
    setRatings(prev => ({
      ...prev,
      [criterionId]: { score, comment }
    }));
    
    // Calculate overall rating
    const totalScore = Object.values({
      ...ratings,
      [criterionId]: { score, comment }
    }).reduce((sum, rating) => sum + rating.score, 0);
    
    const averageScore = totalScore / criteria.length;
    setOverallRating(averageScore);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Check if all criteria are rated
    criteria.forEach(criterion => {
      if (!ratings[criterion.id] || ratings[criterion.id].score === 0) {
        newErrors[criterion.id] = t('rating.errors.criteriaRequired');
      }
    });
    
    // Check overall rating
    if (overallRating === 0) {
      newErrors.overall = t('rating.errors.overallRequired');
    }
    
    // Check comment length
    if (generalComment.length < 10) {
      newErrors.comment = t('rating.errors.commentTooShort');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const ratingData = {
        assignmentId: assignment.id,
        targetUserId: targetUser.id,
        targetType: targetUser.type,
        criteria: ratings,
        overallScore: overallRating,
        generalComment,
        wouldParticipateAgain,
        timeSpent,
        submittedAt: new Date().toISOString()
      };

      const response = await ratingService.submitRating(ratingData);
      
      if (response.success) {
        setShowSuccess(true);
        setShowGamification(true);
        
        // Show success for 3 seconds then call onRatingSubmitted
        setTimeout(() => {
          onRatingSubmitted(response.data);
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      setErrors({ submit: error.message || t('rating.errors.submitFailed') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = (step) => {
    switch (step) {
      case 1:
        return t('rating.steps.criteria');
      case 2:
        return t('rating.steps.overall');
      case 3:
        return t('rating.steps.review');
      default:
        return '';
    }
  };

  const getProgressPercentage = () => {
    return (currentStep / totalSteps) * 100;
  };

  const getTimeBonus = () => {
    // Calculate time bonus based on time spent (encourage thoughtful ratings)
    if (timeSpent < 30) return 0;
    if (timeSpent < 60) return 5;
    if (timeSpent < 120) return 10;
    return 15;
  };

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('rating.success.title')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('rating.success.message')}
          </p>
          
          {showGamification && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-yellow-500 mr-2" />
                <span className="text-lg font-semibold text-gray-900">
                  {t('rating.gamification.bonusEarned')}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    +{getTimeBonus()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t('rating.gamification.timeBonus')}
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <Award className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">
                    +10
                  </div>
                  <div className="text-sm text-gray-600">
                    {t('rating.gamification.ratingBonus')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header with Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('rating.title')}
            </h1>
            <p className="text-gray-600 mt-2">
              {t('rating.subtitle', { name: targetUser.name, type: targetUser.type })}
            </p>
          </div>
          
          <div className="text-right">
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <Clock className="w-4 h-4 mr-1" />
              {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-400">
              {t('rating.timeSpent')}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>{getStepTitle(currentStep)}</span>
          <span>{currentStep} / {totalSteps}</span>
        </div>
      </div>

      {/* Gamification Elements */}
      {userProfile && (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TierProgressBar 
              currentTier={userProfile.tier?.current}
              currentScore={userProfile.overall?.currentScore}
              nextTierProgress={userProfile.tier?.nextTierProgress}
            />
            
            <RatingStreakIndicator 
              streak={gamificationData?.streak || 0}
              maxStreak={gamificationData?.maxStreak || 0}
            />
            
            <GamificationProgress 
              points={gamificationData?.points || 0}
              level={gamificationData?.level || 1}
            />
          </div>
        </div>
      )}

      {/* Step 1: Criteria Rating */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('rating.steps.criteria')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {criteria.map((criterion) => (
              <RatingCriteriaCard
                key={criterion.id}
                criterion={criterion}
                rating={ratings[criterion.id]}
                onChange={(score, comment) => handleCriteriaChange(criterion.id, score, comment)}
                error={errors[criterion.id]}
              />
            ))}
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={() => setCurrentStep(2)}
              disabled={Object.values(ratings).some(r => r.score === 0)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {t('rating.buttons.next')}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Overall Rating */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('rating.steps.overall')}
          </h2>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {overallRating.toFixed(1)}
              </div>
              <div className="text-gray-600">
                {t('rating.overall.calculatedScore')}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('rating.overall.comment')}
                </label>
                <textarea
                  value={generalComment}
                  onChange={(e) => setGeneralComment(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('rating.overall.commentPlaceholder')}
                />
                {errors.comment && (
                  <p className="text-red-500 text-sm mt-1">{errors.comment}</p>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="wouldParticipateAgain"
                  checked={wouldParticipateAgain}
                  onChange={(e) => setWouldParticipateAgain(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="wouldParticipateAgain" className="ml-2 text-sm text-gray-700">
                  {t('rating.overall.wouldParticipateAgain')}
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button
              onClick={() => setCurrentStep(1)}
              variant="outline"
            >
              {t('rating.buttons.back')}
            </Button>
            <Button
              onClick={() => setCurrentStep(3)}
              disabled={generalComment.length < 10}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {t('rating.buttons.next')}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('rating.steps.review')}
          </h2>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {overallRating.toFixed(1)} / 5.0
                </div>
                <div className="flex justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < Math.floor(overallRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                {criteria.map((criterion) => (
                  <div key={criterion.id} className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-700">{criterion.name}</span>
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-gray-900 mr-2">
                        {ratings[criterion.id]?.score || 0}
                      </span>
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4">
                <div className="text-sm text-gray-600 mb-2">
                  {t('rating.review.comment')}
                </div>
                <div className="bg-white p-3 rounded border">
                  {generalComment}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button
              onClick={() => setCurrentStep(2)}
              variant="outline"
            >
              {t('rating.buttons.back')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? t('rating.buttons.submitting') : t('rating.buttons.submit')}
            </Button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {Object.keys(errors).length > 0 && (
        <Alert type="error" className="mt-4">
          <ul className="list-disc list-inside">
            {Object.values(errors).map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}
    </div>
  );
};

export default EnhancedRatingForm;
