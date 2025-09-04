import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/Button';
import { motion } from 'framer-motion';

const SuccessStep = ({ onComplete, t }) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
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

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-md w-full text-center">
        <motion.div
          variants={itemVariants}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg"
        >
          {/* Success Icon */}
          <motion.div
            variants={itemVariants}
            className="mb-8"
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <motion.svg
                className="w-12 h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('success.title')}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              {t('success.message')}
            </p>
          </motion.div>

          {/* Countdown */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-gray-600">{t('success.redirecting')}</span>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold">{countdown}</span>
              </div>
            </div>
          </motion.div>

          {/* Manual Continue Button */}
          <motion.div variants={itemVariants}>
            <Button
              onClick={onComplete}
              variant="primary"
              className="w-full"
            >
              Continue to Dashboard
            </Button>
          </motion.div>
        </motion.div>

        {/* Confetti Animation */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-purple-400 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: -10,
                opacity: 1,
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{
                y: window.innerHeight + 10,
                opacity: 0,
                rotate: 360
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                repeatDelay: Math.random() * 5
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SuccessStep;
