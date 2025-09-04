import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/Button';
import { motion } from 'framer-motion';
import onboardingService from '../../../services/onboardingService';

const InterestsStep = ({ config, stepData, onComplete, onBack, t }) => {
  const [selectedInterests, setSelectedInterests] = useState(stepData || []);
  const [isValid, setIsValid] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load categories from backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await onboardingService.getCategories();
        if (response.success) {
          setCategories(response.categories || []);
        } else {
          // Fallback to default categories
          setCategories(getDefaultCategories());
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories(getDefaultCategories());
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const getDefaultCategories = () => [
    { _id: 'fitness', name: { en: 'Fitness & Sports', ar: 'اللياقة البدنية والرياضة' }, icon: '🏃‍♂️', color: '#ef4444' },
    { _id: 'arts', name: { en: 'Arts & Creativity', ar: 'الفنون والإبداع' }, icon: '🎨', color: '#f97316' },
    { _id: 'food', name: { en: 'Food & Cooking', ar: 'الطعام والطبخ' }, icon: '🍳', color: '#eab308' },
    { _id: 'gaming', name: { en: 'Gaming & Tech', ar: 'الألعاب والتكنولوجيا' }, icon: '🎮', color: '#22c55e' },
    { _id: 'outdoor', name: { en: 'Outdoor Adventures', ar: 'مغامرات في الهواء الطلق' }, icon: '🏞️', color: '#06b6d4' },
    { _id: 'learning', name: { en: 'Learning & Workshops', ar: 'التعلم وورش العمل' }, icon: '📚', color: '#3b82f6' },
    { _id: 'music', name: { en: 'Music & Entertainment', ar: 'الموسيقى والترفيه' }, icon: '🎵', color: '#8b5cf6' },
    { _id: 'wellness', name: { en: 'Wellness & Mindfulness', ar: 'الصحة واليقظة' }, icon: '🧘‍♀️', color: '#ec4899' },
    { _id: 'automotive', name: { en: 'Automotive', ar: 'السيارات' }, icon: '🚗', color: '#6b7280' },
    { _id: 'photography', name: { en: 'Photography', ar: 'التصوير' }, icon: '📸', color: '#84cc16' },
    { _id: 'events', name: { en: 'Events & Festivals', ar: 'الفعاليات والمهرجانات' }, icon: '🎪', color: '#f59e0b' },
    { _id: 'networking', name: { en: 'Professional Networking', ar: 'الشبكات المهنية' }, icon: '🧑‍💼', color: '#6366f1' }
  ].filter(cat => cat.isActive !== false);

  const minSelections = config?.interestsConfig?.minSelections || 3;
  const maxSelections = config?.interestsConfig?.maxSelections || 12;

  useEffect(() => {
    setIsValid(selectedInterests.length >= minSelections && selectedInterests.length <= maxSelections);
  }, [selectedInterests, minSelections, maxSelections]);

  const toggleInterest = (categoryId) => {
    setSelectedInterests(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else if (prev.length < maxSelections) {
        return [...prev, categoryId];
      }
      return prev;
    });
  };

  const handleContinue = () => {
    if (isValid) {
      onComplete(selectedInterests);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4 }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl w-full">
        <motion.div
          variants={itemVariants}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {config?.interestsConfig?.title?.en || t('steps.interests.title')}
            </h2>
            <p className="text-gray-600 text-lg">
              {t('steps.interests.subtitle', { min: minSelections })}
            </p>
            <div className="mt-4">
              <span className="text-sm font-medium text-purple-600">
                {t('steps.interests.selectedCount', { 
                  count: selectedInterests.length, 
                  total: categories.length 
                })}
              </span>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {categories.map((category, index) => {
              const categoryId = category._id || category.categoryId;
              const isSelected = selectedInterests.includes(categoryId);
              const isDisabled = !isSelected && selectedInterests.length >= maxSelections;
              
              return (
                <motion.button
                  key={categoryId}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleInterest(categoryId)}
                  disabled={isDisabled}
                  className={`
                    relative p-6 rounded-2xl border-2 transition-all duration-300 text-center
                    ${isSelected 
                      ? 'border-purple-500 bg-purple-50 shadow-lg' 
                      : isDisabled
                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                    }
                  `}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}

                  {/* Category icon */}
                  <div className="text-4xl mb-3">{category.icon}</div>
                  
                  {/* Category name */}
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                    {category.name.en}
                  </h3>
                </motion.button>
              );
            })}
          </div>

          {/* Validation message */}
          {selectedInterests.length < minSelections && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <p className="text-red-600 text-sm">
                {t('validation.minSelections', { min: minSelections })}
              </p>
            </motion.div>
          )}

          {selectedInterests.length > maxSelections && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <p className="text-red-600 text-sm">
                {t('validation.maxSelections', { max: maxSelections })}
              </p>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              onClick={onBack}
              variant="outline"
            >
              {t('back')}
            </Button>
            
            <Button
              onClick={handleContinue}
              variant="primary"
              disabled={!isValid}
              className="min-w-[120px]"
            >
              {t('continue')}
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default InterestsStep;
