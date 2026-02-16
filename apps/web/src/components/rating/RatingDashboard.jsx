import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Star, 
  Clock, 
  Users, 
  TrendingUp, 
  Award, 
  Target, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Zap,
  Trophy,
  BarChart3
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import TierProgressBar from './TierProgressBar';
import RatingStreakIndicator from './RatingStreakIndicator';
import GamificationProgress from './GamificationProgress';
import { ratingService } from '../../services/ratingService';

const RatingDashboard = ({ userId }) => {
  const { t } = useTranslation();
  const [userProfile, setUserProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, assignmentsRes, ratingsRes, statsRes] = await Promise.all([
        ratingService.getUserRatingProfile(userId),
        ratingService.getUserRatingAssignments(userId),
        ratingService.getUserRatings(userId),
        ratingService.getRatingStatistics()
      ]);

      if (profileRes.success) setUserProfile(profileRes.data);
      if (assignmentsRes.success) setAssignments(assignmentsRes.data);
      if (ratingsRes.success) setRatings(ratingsRes.data);
      if (statsRes.success) setStatistics(statsRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getPendingAssignments = () => {
    return assignments.filter(assignment => 
      assignment.status === 'active' && 
      assignment.pending.length > 0
    );
  };

  const getCompletedRatings = () => {
    return ratings.filter(rating => rating.status === 'completed');
  };

  const getRecentRatings = () => {
    return ratings
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 5);
  };

  const getRatingTrend = () => {
    if (!userProfile?.overall?.trend) return 'stable';
    return userProfile.overall.trend;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default:
        return <BarChart3 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Alert type="error">
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('rating.dashboard.title')}
        </h1>
        <p className="text-gray-600">
          {t('rating.dashboard.subtitle')}
        </p>
      </div>

      {/* Gamification Cards */}
      {userProfile && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <TierProgressBar 
            currentTier={userProfile.tier?.current}
            currentScore={userProfile.overall?.currentScore}
            nextTierProgress={userProfile.tier?.nextTierProgress}
          />
          
          <RatingStreakIndicator 
            streak={userProfile.statistics?.currentStreak || 0}
            maxStreak={userProfile.statistics?.maxStreak || 0}
          />
          
          <GamificationProgress 
            points={userProfile.rewards?.totalPoints || 0}
            level={userProfile.statistics?.level || 1}
            achievements={userProfile.rewards?.achievements || []}
          />
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: t('rating.dashboard.tabs.overview'), icon: BarChart3 },
            { id: 'assignments', label: t('rating.dashboard.tabs.assignments'), icon: Target },
            { id: 'ratings', label: t('rating.dashboard.tabs.ratings'), icon: Star },
            { id: 'statistics', label: t('rating.dashboard.tabs.statistics'), icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Star className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {t('rating.dashboard.stats.overallRating')}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {userProfile?.overall?.currentScore?.toFixed(1) || '0.0'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {t('rating.dashboard.stats.completedRatings')}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {getCompletedRatings().length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {t('rating.dashboard.stats.pendingRatings')}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {getPendingAssignments().length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  {getTrendIcon(getRatingTrend())}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {t('rating.dashboard.stats.trend')}
                  </p>
                  <p className={`text-2xl font-semibold ${getTrendColor(getRatingTrend())}`}>
                    {t(`rating.trends.${getRatingTrend()}`)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {t('rating.dashboard.recentActivity')}
              </h3>
            </div>
            <div className="p-6">
              {getRecentRatings().length > 0 ? (
                <div className="space-y-4">
                  {getRecentRatings().map((rating, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Star className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {t('rating.dashboard.ratedUser', { name: rating.targetUser?.name || 'Unknown' })}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(rating.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold text-gray-900">
                          {rating.overallScore.toFixed(1)}
                        </span>
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {t('rating.dashboard.noRecentActivity')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {t('rating.dashboard.pendingAssignments')}
              </h3>
            </div>
            <div className="p-6">
              {getPendingAssignments().length > 0 ? (
                <div className="space-y-4">
                  {getPendingAssignments().map((assignment, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {assignment.activityTitle}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {new Date(assignment.activityDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-gray-600">
                            {assignment.pending.length} {t('rating.dashboard.pending')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          {t('rating.dashboard.expiresOn', { 
                            date: new Date(assignment.expiresAt).toLocaleDateString() 
                          })}
                        </div>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          {t('rating.dashboard.startRating')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {t('rating.dashboard.noPendingAssignments')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ratings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {t('rating.dashboard.allRatings')}
              </h3>
            </div>
            <div className="p-6">
              {ratings.length > 0 ? (
                <div className="space-y-4">
                  {ratings.map((rating, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {rating.targetUser?.name || 'Unknown User'}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {new Date(rating.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-semibold text-gray-900">
                            {rating.overallScore.toFixed(1)}
                          </span>
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        </div>
                      </div>
                      {rating.generalComment && (
                        <p className="text-sm text-gray-600 mb-3">
                          "{rating.generalComment}"
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          {t('rating.dashboard.ratingTime', { 
                            time: Math.floor(rating.timeSpent / 60) 
                          })}
                        </div>
                        <div className="flex items-center space-x-2">
                          {rating.wouldParticipateAgain ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-sm text-gray-600">
                            {rating.wouldParticipateAgain 
                              ? t('rating.dashboard.wouldParticipateAgain') 
                              : t('rating.dashboard.wouldNotParticipateAgain')
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {t('rating.dashboard.noRatings')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'statistics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('rating.dashboard.ratingBreakdown')}
              </h3>
              {userProfile?.criteria && (
                <div className="space-y-3">
                  {Object.entries(userProfile.criteria).map(([key, criterion]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {criterion.name || key}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {criterion.score?.toFixed(1) || '0.0'}
                        </span>
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('rating.dashboard.ratingHistory')}
              </h3>
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {t('rating.dashboard.chartComingSoon')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingDashboard;
