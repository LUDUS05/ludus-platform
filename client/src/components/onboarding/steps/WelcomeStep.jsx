import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/Button';
import { motion } from 'framer-motion';

const WelcomeStep = ({ config, onComplete, t }) => {
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
      className="min-h-screen flex items-center justify-center px-4"
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
    >
      <div className="max-w-4xl w-full text-center">
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
              {config?.welcomeConfig?.title?.en || t('steps.welcome.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {config?.welcomeConfig?.subtitle?.en || t('steps.welcome.subtitle')}
            </p>
          </div>
        </motion.div>

        {/* Value Propositions */}
        <motion.div 
          variants={itemVariants}
          className="grid md:grid-cols-3 gap-8 mb-12"
        >
          {valuePropositions.map((proposition, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-4xl mb-4">{proposition.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {proposition.title.en}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {proposition.description.en}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div variants={itemVariants}>
          <Button
            onClick={handleGetStarted}
            variant="primary"
            size="lg"
            className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
          >
            {t('getStarted')}
          </Button>
        </motion.div>

        {/* Background Animation */}
        {config?.welcomeConfig?.backgroundAnimation === 'particles' && (
          <div className="fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
              {/* Animated particles */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-purple-300 rounded-full opacity-30"
                  animate={{
                    x: [0, 100, 0],
                    y: [0, -100, 0],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 10 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WelcomeStep;
