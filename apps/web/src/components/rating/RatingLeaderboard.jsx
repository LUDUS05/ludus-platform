import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Star, 
  TrendingUp, 
  Users, 
  Award,
  Zap,
  Target,
  Calendar
} from 'lucide-react';
import { Button } from '../ui/Button';
import { ratingService } from '../../services/ratingService';

const RatingLeaderboard = ({ timeRange = 'month', category = 'overall' }) => {
  const { t } = useTranslation();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, [timeRange, category]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await ratingService.getTopRatedUsers({
        timeRange,
        category,
        limit: 50
      });

      if (response.success) {
        setLeaderboard(response.data);
        
        // Find current user's rank
        const currentUserId = localStorage.getItem('userId'); // Assuming user ID is stored
        const userIndex = response.data.findIndex(user => user.id === currentUserId);
        if (userIndex !== -1) {
          setCurrentUser(response.data[userIndex]);
          setUserRank(userIndex + 1);
        }
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-amber-500 to-amber-700';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  const getTierIcon = (tier) => {
    const tierIcons = {
      bronze: <Award className="w-4 h-4 text-amber-600" />,
      silver: <Star className="w-4 h-4 text-gray-400" />,
      gold: <Crown className="w-4 h-4 text-yellow-500" />,
      platinum: <Zap className="w-4 h-4 text-purple-500" />
    };
    return tierIcons[tier] || tierIcons.bronze;
  };

  const getTierColor = (tier) => {
    const tierColors = {
      bronze: 'text-amber-600',
      silver: 'text-gray-400',
      gold: 'text-yellow-500',
      platinum: 'text-purple-500'
    };
    return tierColors[tier] || tierColors.bronze;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
    }
  };

  const formatScore = (score) => {
    return score.toFixed(1);
  };

  const formatChange = (change) => {
    if (change > 0) return `+${change.toFixed(1)}`;
    if (change < 0) return change.toFixed(1);
    return '0.0';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{error}</p>
          <Button onClick={loadLeaderboard} className="mt-4">
            {t('rating.leaderboard.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('rating.leaderboard.title')}
            </h1>
            <p className="text-gray-600">
              {t('rating.leaderboard.subtitle')}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">{t('rating.leaderboard.timeRanges.week')}</option>
              <option value="month">{t('rating.leaderboard.timeRanges.month')}</option>
              <option value="quarter">{t('rating.leaderboard.timeRanges.quarter')}</option>
              <option value="year">{t('rating.leaderboard.timeRanges.year')}</option>
              <option value="all">{t('rating.leaderboard.timeRanges.all')}</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-gray-500" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="overall">{t('rating.leaderboard.categories.overall')}</option>
              <option value="punctuality">{t('rating.leaderboard.categories.punctuality')}</option>
              <option value="participation">{t('rating.leaderboard.categories.participation')}</option>
              <option value="respectfulness">{t('rating.leaderboard.categories.respectfulness')}</option>
              <option value="helpfulness">{t('rating.leaderboard.categories.helpfulness')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Current User Rank */}
      {currentUser && userRank && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('rating.leaderboard.yourRank')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('rating.leaderboard.rankPosition', { rank: userRank, total: leaderboard.length })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {formatScore(currentUser.score)}
              </div>
              <div className="text-sm text-gray-600">
                {t('rating.leaderboard.yourScore')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {t('rating.leaderboard.topPerformers')}
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {leaderboard.map((user, index) => (
            <div
              key={user.id}
              className={`p-6 hover:bg-gray-50 transition-colors ${
                index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Rank */}
                  <div className="flex-shrink-0">
                    {getRankIcon(index + 1)}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <div className={`flex items-center space-x-1 ${getTierColor(user.tier)}`}>
                            {getTierIcon(user.tier)}
                            <span className="text-sm font-medium">
                              {t(`rating.tiers.${user.tier}.name`)}
                            </span>
                          </div>
                          {user.trend && (
                            <div className="flex items-center space-x-1">
                              {getTrendIcon(user.trend)}
                              <span className="text-sm text-gray-500">
                                {t(`rating.trends.${user.trend}`)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Score and Stats */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatScore(user.score)}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{user.totalRatings}</span>
                    </div>
                    {user.scoreChange && (
                      <div className={`flex items-center space-x-1 ${
                        user.scoreChange > 0 ? 'text-green-600' : 
                        user.scoreChange < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        <TrendingUp className={`w-4 h-4 ${
                          user.scoreChange < 0 ? 'rotate-180' : ''
                        }`} />
                        <span>{formatChange(user.scoreChange)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          {t('rating.leaderboard.lastUpdated', { 
            time: new Date().toLocaleTimeString() 
          })}
        </p>
        <p className="mt-1">
          {t('rating.leaderboard.disclaimer')}
        </p>
      </div>
    </div>
  );
};

export default RatingLeaderboard;
