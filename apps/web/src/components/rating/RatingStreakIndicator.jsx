import React from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, Calendar, Target, Award } from 'lucide-react';

const RatingStreakIndicator = ({ streak, maxStreak, streakType = 'rating' }) => {
  const { t } = useTranslation();

  const getStreakColor = (streak) => {
    if (streak >= 30) return 'from-red-500 to-orange-500';
    if (streak >= 15) return 'from-orange-500 to-yellow-500';
    if (streak >= 7) return 'from-yellow-500 to-green-500';
    if (streak >= 3) return 'from-green-500 to-blue-500';
    return 'from-gray-400 to-gray-600';
  };

  const getStreakLevel = (streak) => {
    if (streak >= 30) return t('rating.streak.levels.legendary');
    if (streak >= 15) return t('rating.streak.levels.epic');
    if (streak >= 7) return t('rating.streak.levels.great');
    if (streak >= 3) return t('rating.streak.levels.good');
    return t('rating.streak.levels.starting');
  };

  const getStreakReward = (streak) => {
    if (streak >= 30) return 50;
    if (streak >= 15) return 25;
    if (streak >= 7) return 15;
    if (streak >= 3) return 10;
    return 5;
  };

  const getNextMilestone = (currentStreak) => {
    const milestones = [3, 7, 15, 30, 50, 100];
    return milestones.find(milestone => milestone > currentStreak);
  };

  const getStreakProgress = () => {
    const nextMilestone = getNextMilestone(streak);
    if (!nextMilestone) return 100;
    
    const previousMilestone = nextMilestone === 3 ? 0 : 
      [3, 7, 15, 30, 50].find(m => m < nextMilestone);
    
    const progress = ((streak - previousMilestone) / (nextMilestone - previousMilestone)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const getStreakMessage = () => {
    if (streak === 0) return t('rating.streak.messages.start');
    if (streak === 1) return t('rating.streak.messages.first');
    if (streak < 3) return t('rating.streak.messages.building');
    if (streak < 7) return t('rating.streak.messages.good');
    if (streak < 15) return t('rating.streak.messages.great');
    if (streak < 30) return t('rating.streak.messages.epic');
    return t('rating.streak.messages.legendary');
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Flame className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {t('rating.streak.title')}
          </h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-600">
            {streak}
          </div>
          <div className="text-xs text-gray-600">
            {t('rating.streak.days')}
          </div>
        </div>
      </div>

      {/* Streak Level */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {getStreakLevel(streak)}
          </span>
          <div className="flex items-center space-x-1">
            <Award className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-600">
              +{getStreakReward(streak)} {t('rating.gamification.points')}
            </span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`bg-gradient-to-r ${getStreakColor(streak)} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${getStreakProgress()}%` }}
          />
        </div>
        
        {getNextMilestone(streak) && (
          <div className="text-xs text-gray-500 mt-1">
            {t('rating.streak.nextMilestone', { 
              days: getNextMilestone(streak) - streak 
            })}
          </div>
        )}
      </div>

      {/* Streak Message */}
      <div className="mb-4">
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="text-sm text-gray-700 text-center">
            {getStreakMessage()}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-3 text-center shadow-sm">
          <Calendar className="w-4 h-4 text-blue-500 mx-auto mb-1" />
          <div className="text-xs text-gray-600">
            {t('rating.streak.best')}
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {maxStreak}
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-3 text-center shadow-sm">
          <Target className="w-4 h-4 text-green-500 mx-auto mb-1" />
          <div className="text-xs text-gray-600">
            {t('rating.streak.reward')}
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {getStreakReward(streak)}x
          </div>
        </div>
      </div>

      {/* Streak Tips */}
      {streak > 0 && streak < 7 && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-xs text-yellow-800">
            <strong>{t('rating.streak.tip.title')}:</strong> {t('rating.streak.tip.message')}
          </div>
        </div>
      )}

      {/* Streak Celebration */}
      {streak > 0 && streak % 7 === 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-300">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-yellow-600" />
            <div className="text-sm font-medium text-yellow-800">
              {t('rating.streak.celebration.week')}
            </div>
          </div>
          <div className="text-xs text-yellow-700 mt-1">
            {t('rating.streak.celebration.bonus', { days: streak })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingStreakIndicator;
