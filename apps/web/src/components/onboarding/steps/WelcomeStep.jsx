import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Logo from '../../common/Logo';

const WelcomeStep = ({ config, onComplete, t }) => {
  const { i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGetStarted = () => {
    onComplete({});
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const valuePropositions = config?.welcomeConfig?.valuePropositions || [
    {
      icon: '🔍',
      title: { en: 'Discover', ar: 'اكتشف' },
      description: { en: 'Find amazing activities in your city', ar: 'اعثر على أنشطة رائعة في مدينتك' }
    },
    {
      icon: '🤝',
      title: { en: 'Share', ar: 'شارك' },
      description: { en: 'Connect with like-minded people', ar: 'تواصل مع أشخاص متشابهين في التفكير' }
    },
    {
      icon: '💬',
      title: { en: 'Engage', ar: 'تفاعل' },
      description: { en: 'Build lasting communities', ar: 'ابن مجتمعات دائمة' }
    }
  ];

  return (
    <motion.div
      className="neumorphic rounded-2xl p-8 text-center"
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
    >
      {/* Logo */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex justify-center">
          <Logo className="h-16 w-auto" />
        </div>
      </motion.div>

      {/* Hero Section */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {i18n.language === 'ar' 
            ? (config?.welcomeConfig?.title?.ar || t('onboarding.steps.welcome.title'))
            : (config?.welcomeConfig?.title?.en || t('onboarding.steps.welcome.title'))
          }
        </h1>
        <p className="text-gray-600 mb-4">
          {i18n.language === 'ar' 
            ? (config?.welcomeConfig?.subtitle?.ar || t('onboarding.steps.welcome.subtitle'))
            : (config?.welcomeConfig?.subtitle?.en || t('onboarding.steps.welcome.subtitle'))
          }
        </p>
        <p className="text-sm text-gray-500">
          {t('onboarding.valuePromise')}
        </p>
      </motion.div>

      {/* Value Propositions */}
      <motion.div 
        variants={itemVariants}
        className="space-y-4 mb-8"
      >
        {valuePropositions.map((proposition, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="neumorphic-subtle rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{proposition.icon}</div>
              <div className="text-right flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {i18n.language === 'ar' ? proposition.title.ar : proposition.title.en}
                </h3>
                <p className="text-sm text-gray-600">
                  {i18n.language === 'ar' ? proposition.description.ar : proposition.description.en}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Button */}
      <motion.div variants={itemVariants}>
        <button
          onClick={handleGetStarted}
          className="neumorphic-subtle hover:neumorphic-pressed w-full py-3 px-6 rounded-xl text-lg font-medium text-gray-700 transition-all duration-200"
        >
          {t('common.getStarted')}
        </button>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeStep;
