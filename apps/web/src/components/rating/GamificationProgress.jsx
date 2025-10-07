import React from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, Trophy, Target, TrendingUp } from 'lucide-react';

const GamificationProgress = ({ points, level, nextLevelPoints, achievements = [] }) => {
  const { t } = useTranslation();

  const getLevelColor = (level) => {
    const colors = {
      1: 'from-gray-400 to-gray-600',
      2: 'from-blue-400 to-blue-600',
      3: 'from-green-400 to-green-600',
      4: 'from-purple-400 to-purple-600',
      5: 'from-yellow-400 to-yellow-600',
      6: 'from-red-400 to-red-600'
    };
    return colors[level] || colors[1];
  };

  const getLevelName = (level) => {
    const names = {
      1: t('rating.gamification.levels.beginner'),
      2: t('rating.gamification.levels.explorer'),
      3: t('rating.gamification.levels.contributor'),
      4: t('rating.gamification.levels.expert'),
      5: t('rating.gamification.levels.master'),
      6: t('rating.gamification.levels.legend')
    };
    return names[level] || names[1];
  };

  const getProgressPercentage = () => {
    if (!nextLevelPoints || nextLevelPoints === 0) return 100;
    const currentLevelStart = (level - 1) * 1000; // Assuming 1000 points per level
    const progress = ((points - currentLevelStart) / (nextLevelPoints - currentLevelStart)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const getRecentAchievements = () => {
    return achievements.filter(achievement => 
      new Date(achievement.earnedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).slice(0, 3);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {t('rating.gamification.progress')}
          </h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-600">
            {points.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">
            {t('rating.gamification.points')}
          </div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">
              {getLevelName(level)}
            </span>
          </div>
          <span className="text-sm text-gray-600">
            {t('rating.gamification.level')} {level}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`bg-gradient-to-r ${getLevelColor(level)} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
        
        {nextLevelPoints && (
          <div className="text-xs text-gray-500 mt-1">
            {t('rating.gamification.nextLevel', { 
              points: (nextLevelPoints - points).toLocaleString() 
            })}
          </div>
        )}
      </div>

      {/* Recent Achievements */}
      {getRecentAchievements().length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700">
              {t('rating.gamification.recentAchievements')}
            </span>
          </div>
          
          <div className="space-y-2">
            {getRecentAchievements().map((achievement, index) => (
              <div key={index} className="flex items-center space-x-2 bg-white rounded-lg p-2 shadow-sm">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-3 h-3 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-900">
                    {achievement.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    +{achievement.points} {t('rating.gamification.points')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-3 text-center shadow-sm">
          <TrendingUp className="w-4 h-4 text-blue-500 mx-auto mb-1" />
          <div className="text-xs text-gray-600">
            {t('rating.gamification.thisWeek')}
          </div>
          <div className="text-sm font-semibold text-gray-900">
            +{Math.floor(points * 0.1)}
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-3 text-center shadow-sm">
          <Zap className="w-4 h-4 text-purple-500 mx-auto mb-1" />
          <div className="text-xs text-gray-600">
            {t('rating.gamification.streak')}
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {achievements.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationProgress;
