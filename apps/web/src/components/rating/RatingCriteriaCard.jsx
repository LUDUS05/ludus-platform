import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, MessageSquare, Info } from 'lucide-react';

const RatingCriteriaCard = ({ criterion, rating, onChange, error }) => {
  const { t } = useTranslation();
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState(rating?.comment || '');

  const handleScoreChange = (score) => {
    onChange(score, comment);
  };

  const handleCommentChange = (newComment) => {
    setComment(newComment);
    onChange(rating?.score || 0, newComment);
  };

  const getScoreLabel = (score) => {
    const labels = {
      1: t('rating.scores.poor'),
      2: t('rating.scores.fair'),
      3: t('rating.scores.good'),
      4: t('rating.scores.veryGood'),
      5: t('rating.scores.excellent')
    };
    return labels[score] || '';
  };

  const getScoreColor = (score) => {
    const colors = {
      1: 'text-red-500',
      2: 'text-orange-500',
      3: 'text-yellow-500',
      4: 'text-blue-500',
      5: 'text-green-500'
    };
    return colors[score] || 'text-gray-300';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {criterion.name}
          </h3>
          <p className="text-sm text-gray-600">
            {criterion.description}
          </p>
        </div>
        
        <div className="ml-4">
          <button
            type="button"
            onClick={() => setShowComment(!showComment)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title={t('rating.criteria.addComment')}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Star Rating */}
      <div className="mb-4">
        <div className="flex items-center space-x-1 mb-2">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => handleScoreChange(score)}
              className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  score <= (rating?.score || 0)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300 hover:text-yellow-300'
                }`}
              />
            </button>
          ))}
        </div>
        
        {/* Score Display */}
        {rating?.score > 0 && (
          <div className="flex items-center space-x-2">
            <span className={`text-lg font-semibold ${getScoreColor(rating.score)}`}>
              {rating.score}
            </span>
            <span className="text-sm text-gray-600">
              {getScoreLabel(rating.score)}
            </span>
          </div>
        )}
      </div>

      {/* Comment Section */}
      {showComment && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('rating.criteria.comment')}
          </label>
          <textarea
            value={comment}
            onChange={(e) => handleCommentChange(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={t('rating.criteria.commentPlaceholder', { criterion: criterion.name })}
          />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 text-red-500 text-sm">
          <Info className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Criteria Weight Indicator */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{t('rating.criteria.weight')}</span>
          <div className="flex items-center space-x-1">
            <div className="w-16 bg-gray-200 rounded-full h-1">
              <div
                className="bg-blue-500 h-1 rounded-full"
                style={{ width: `${(criterion.weight || 0.2) * 100}%` }}
              />
            </div>
            <span>{Math.round((criterion.weight || 0.2) * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingCriteriaCard;
