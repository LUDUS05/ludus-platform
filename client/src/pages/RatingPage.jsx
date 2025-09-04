import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Star, Users, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import EnhancedRatingForm from '../components/rating/EnhancedRatingForm';
import { ratingService } from '../services/ratingService';
import { useAuth } from '../context/AuthContext';

const RatingPage = () => {
  const { t } = useTranslation();
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [assignment, setAssignment] = useState(null);
  const [currentTarget, setCurrentTarget] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [gamificationData, setGamificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);

  useEffect(() => {
    if (assignmentId) {
      loadAssignment();
    }
  }, [assignmentId]);

  useEffect(() => {
    if (user?.id) {
      loadUserProfile();
    }
  }, [user?.id]);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      const response = await ratingService.getRatingAssignment(assignmentId);
      
      if (response.success) {
        setAssignment(response.data);
        
        // Set first target to rate
        if (response.data.assignments && response.data.assignments.length > 0) {
          const userAssignment = response.data.assignments.find(a => a.raterId === user?.id);
          if (userAssignment && userAssignment.toRate.length > 0) {
            setCurrentTarget(userAssignment.toRate[0]);
            setCurrentTargetIndex(0);
          }
        }
      } else {
        setError(response.message || t('rating.errors.assignmentNotFound'));
      }
    } catch (error) {
      console.error('Error loading assignment:', error);
      setError(error.message || t('rating.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const response = await ratingService.getUserRatingProfile(user.id);
      if (response.success) {
        setUserProfile(response.data);
        setGamificationData({
          points: response.data.rewards?.totalPoints || 0,
          level: response.data.statistics?.level || 1,
          streak: response.data.statistics?.currentStreak || 0,
          maxStreak: response.data.statistics?.maxStreak || 0,
          achievements: response.data.rewards?.achievements || []
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleRatingSubmitted = (ratingData) => {
    // Move to next target or complete
    const userAssignment = assignment.assignments.find(a => a.raterId === user?.id);
    if (userAssignment) {
      const nextIndex = currentTargetIndex + 1;
      if (nextIndex < userAssignment.toRate.length) {
        setCurrentTarget(userAssignment.toRate[nextIndex]);
        setCurrentTargetIndex(nextIndex);
      } else {
        // All ratings completed
        navigate('/dashboard/rating', { 
          state: { 
            message: t('rating.success.allCompleted'),
            completedCount: userAssignment.toRate.length
          }
        });
      }
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/rating');
  };

  const getProgressPercentage = () => {
    if (!assignment || !user) return 0;
    
    const userAssignment = assignment.assignments.find(a => a.raterId === user.id);
    if (!userAssignment) return 0;
    
    return ((currentTargetIndex + 1) / userAssignment.toRate.length) * 100;
  };

  const getRemainingCount = () => {
    if (!assignment || !user) return 0;
    
    const userAssignment = assignment.assignments.find(a => a.raterId === user.id);
    if (!userAssignment) return 0;
    
    return userAssignment.toRate.length - currentTargetIndex - 1;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('rating.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6">
          <Alert type="error" className="mb-6">
            {error}
          </Alert>
          <div className="text-center">
            <Button onClick={() => navigate('/dashboard/rating')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('rating.buttons.backToDashboard')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment || !currentTarget) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('rating.noAssignment')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('rating.noAssignmentMessage')}
          </p>
          <Button onClick={() => navigate('/dashboard/rating')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('rating.buttons.backToDashboard')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('rating.buttons.back')}
              </Button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {assignment.activityTitle}
                </h1>
                <p className="text-sm text-gray-600">
                  {new Date(assignment.activityDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">
                {t('rating.progress')}
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {currentTargetIndex + 1} / {assignment.assignments.find(a => a.raterId === user.id)?.toRate.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Rating Info */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('rating.ratingFor', { name: currentTarget.name })}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{t(`rating.types.${currentTarget.type}`)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{t('rating.estimatedTime', { minutes: 3 })}</span>
                  </div>
                </div>
              </div>
              
              {getRemainingCount() > 0 && (
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {t('rating.remaining')}
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {getRemainingCount()}
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Star className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900 mb-1">
                    {t('rating.instructions.title')}
                  </h3>
                  <p className="text-sm text-blue-800">
                    {t('rating.instructions.message')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Form */}
        <EnhancedRatingForm
          assignment={assignment}
          targetUser={currentTarget}
          onRatingSubmitted={handleRatingSubmitted}
          onCancel={handleCancel}
          userProfile={userProfile}
          gamificationData={gamificationData}
        />
      </div>
    </div>
  );
};

export default RatingPage;
