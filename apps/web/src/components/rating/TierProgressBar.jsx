import React from 'react';
import { useTranslation } from 'react-i18next';
import { Crown, Star, TrendingUp, Award, Shield, Zap } from 'lucide-react';

const TierProgressBar = ({ currentTier, currentScore, nextTierProgress, tierBenefits = [] }) => {
  const { t } = useTranslation();

  const tierConfig = {
    bronze: {
      name: t('rating.tiers.bronze.name'),
      color: 'from-amber-600 to-amber-800',
      bgColor: 'from-amber-50 to-amber-100',
      borderColor: 'border-amber-200',
      icon: Shield,
      minScore: 0,
      maxScore: 2.5,
      benefits: [
        t('rating.tiers.bronze.benefits.basic'),
        t('rating.tiers.bronze.benefits.community')
      ]
    },
    silver: {
      name: t('rating.tiers.silver.name'),
      color: 'from-gray-400 to-gray-600',
      bgColor: 'from-gray-50 to-gray-100',
      borderColor: 'border-gray-200',
      icon: Star,
      minScore: 2.5,
      maxScore: 3.5,
      benefits: [
        t('rating.tiers.silver.benefits.priority'),
        t('rating.tiers.silver.benefits.discount')
      ]
    },
    gold: {
      name: t('rating.tiers.gold.name'),
      color: 'from-yellow-500 to-yellow-700',
      bgColor: 'from-yellow-50 to-yellow-100',
      borderColor: 'border-yellow-200',
      icon: Crown,
      minScore: 3.5,
      maxScore: 4.5,
      benefits: [
        t('rating.tiers.gold.benefits.premium'),
        t('rating.tiers.gold.benefits.exclusive')
      ]
    },
    platinum: {
      name: t('rating.tiers.platinum.name'),
      color: 'from-purple-500 to-purple-700',
      bgColor: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
      icon: Zap,
      minScore: 4.5,
      maxScore: 5.0,
      benefits: [
        t('rating.tiers.platinum.benefits.vip'),
        t('rating.tiers.platinum.benefits.ambassador')
      ]
    }
  };

  const getCurrentTierConfig = () => {
    return tierConfig[currentTier] || tierConfig.bronze;
  };

  const getNextTier = () => {
    const tiers = ['bronze', 'silver', 'gold', 'platinum'];
    const currentIndex = tiers.indexOf(currentTier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  };

  const getTierProgress = () => {
    const config = getCurrentTierConfig();
    const progress = ((currentScore - config.minScore) / (config.maxScore - config.minScore)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const getNextTierProgress = () => {
    const nextTier = getNextTier();
    if (!nextTier) return 100;
    
    const nextConfig = tierConfig[nextTier];
    const progress = ((currentScore - nextConfig.minScore) / (nextConfig.maxScore - nextConfig.minScore)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const getScoreToNextTier = () => {
    const nextTier = getNextTier();
    if (!nextTier) return 0;
    
    const nextConfig = tierConfig[nextTier];
    return Math.max(0, nextConfig.minScore - currentScore);
  };

  const getTierIcon = (tier) => {
    const IconComponent = tierConfig[tier]?.icon || Shield;
    return <IconComponent className="w-5 h-5" />;
  };

  const isMaxTier = () => {
    return currentTier === 'platinum';
  };

  return (
    <div className={`bg-gradient-to-br ${getCurrentTierConfig().bgColor} rounded-lg p-4 border ${getCurrentTierConfig().borderColor}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-full bg-gradient-to-r ${getCurrentTierConfig().color} text-white`}>
            {getTierIcon(currentTier)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {getCurrentTierConfig().name}
            </h3>
            <div className="text-sm text-gray-600">
              {t('rating.tiers.currentTier')}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {currentScore.toFixed(1)}
          </div>
          <div className="text-xs text-gray-600">
            {t('rating.tiers.currentScore')}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {t('rating.tiers.progress')}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(getTierProgress())}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`bg-gradient-to-r ${getCurrentTierConfig().color} h-3 rounded-full transition-all duration-500`}
            style={{ width: `${getTierProgress()}%` }}
          />
        </div>
        
        {!isMaxTier() && (
          <div className="text-xs text-gray-500 mt-1">
            {t('rating.tiers.scoreToNext', { 
              score: getScoreToNextTier().toFixed(1) 
            })}
          </div>
        )}
      </div>

      {/* Next Tier Preview */}
      {!isMaxTier() && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded-full bg-gray-300">
                {getTierIcon(getNextTier())}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {tierConfig[getNextTier()].name}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {Math.round(getNextTierProgress())}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-gray-400 to-gray-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${getNextTierProgress()}%` }}
            />
          </div>
        </div>
      )}

      {/* Tier Benefits */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Award className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium text-gray-700">
            {t('rating.tiers.benefits')}
          </span>
        </div>
        
        <div className="space-y-1">
          {getCurrentTierConfig().benefits.map((benefit, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tier Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-3 text-center shadow-sm">
          <TrendingUp className="w-4 h-4 text-blue-500 mx-auto mb-1" />
          <div className="text-xs text-gray-600">
            {t('rating.tiers.rank')}
          </div>
          <div className="text-sm font-semibold text-gray-900">
            #{Math.floor(Math.random() * 100) + 1}
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-3 text-center shadow-sm">
          <Star className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
          <div className="text-xs text-gray-600">
            {t('rating.tiers.discount')}
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {currentTier === 'bronze' ? '0%' : 
             currentTier === 'silver' ? '5%' :
             currentTier === 'gold' ? '10%' : '15%'}
          </div>
        </div>
      </div>

      {/* Max Tier Celebration */}
      {isMaxTier() && (
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-purple-600" />
            <div className="text-sm font-medium text-purple-800">
              {t('rating.tiers.maxTier.title')}
            </div>
          </div>
          <div className="text-xs text-purple-700 mt-1">
            {t('rating.tiers.maxTier.message')}
          </div>
        </div>
      )}
    </div>
  );
};

export default TierProgressBar;
