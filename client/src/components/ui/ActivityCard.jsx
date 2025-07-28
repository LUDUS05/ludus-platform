/**
 * LUDUS Platform - Enhanced Activity Card
 * Professional activity card with Unsplash images, animations, and glass morphism
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressiveImage from './ProgressiveImage';

const ActivityCard = ({ 
  activity, 
  onBook, 
  onSave, 
  index = 0,
  variant = 'default', // 'default', 'compact', 'featured'
  showSaveButton = true,
  showCategory = true,
  animate = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(activity?.isSaved || false);

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.(activity, !isSaved);
  };

  const handleBook = () => {
    onBook?.(activity);
  };

  // Animation variants
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.5, 
        delay: animate ? index * 0.1 : 0,
        ease: [0.25, 0.46, 0.45, 0.94] 
      }
    },
    hover: { 
      y: -8,
      scale: 1.02,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    tap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  const imageVariants = {
    hover: { 
      scale: 1.1,
      transition: { duration: 0.7, ease: "easeOut" }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    hover: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  // Determine card height based on variant
  const getCardHeight = () => {
    switch (variant) {
      case 'compact': return 'h-64';
      case 'featured': return 'h-80';
      default: return 'h-72';
    }
  };

  const getImageHeight = () => {
    switch (variant) {
      case 'compact': return 'h-40';
      case 'featured': return 'h-56';
      default: return 'h-48';
    }
  };

  return (
    <motion.div
      variants={animate ? cardVariants : {}}
      initial={animate ? "hidden" : "visible"}
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`
        group relative overflow-hidden rounded-2xl cursor-pointer
        bg-white dark:bg-dark-bg-secondary
        shadow-lg hover:shadow-2xl
        border border-transparent dark:border-dark-border-secondary
        transition-all duration-300 ease-out
        ${getCardHeight()}
      `}
    >
      {/* Enhanced image with Unsplash integration */}
      <div className={`relative overflow-hidden ${getImageHeight()}`}>
        <motion.div variants={imageVariants}>
          <ProgressiveImage
            unsplashId={activity.unsplashId}
            src={activity.image}
            category={activity.category}
            alt={activity.title}
            width={400}
            height={variant === 'featured' ? 280 : 240}
            className="w-full h-full"
            attribution={false}
          />
        </motion.div>
        
        {/* Dynamic gradient overlay */}
        <motion.div 
          variants={overlayVariants}
          initial="hidden"
          animate={isHovered ? "hover" : "hidden"}
          className="
            absolute inset-0 
            bg-gradient-to-t from-black/60 via-black/20 to-transparent
          " 
        />
        
        {/* Glass morphism save button */}
        <AnimatePresence>
          {showSaveButton && (
            <motion.button 
              onClick={handleSave}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="
                absolute top-4 right-4 p-3
                bg-white/20 backdrop-blur-md rounded-full
                border border-white/30
                text-white shadow-lg
                hover:bg-white/30
                transition-all duration-200
              "
            >
              <motion.svg 
                className="w-5 h-5" 
                fill={isSaved ? "currentColor" : "none"} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                animate={{ 
                  fill: isSaved ? "#FF6600" : "none",
                  scale: isSaved ? [1, 1.3, 1] : 1
                }}
                transition={{ duration: 0.3 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </motion.svg>
            </motion.button>
          )}
        </AnimatePresence>
        
        {/* Category badge with slide animation */}
        <AnimatePresence>
          {showCategory && activity.category && (
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="
                absolute bottom-4 left-4
                px-3 py-1 
                bg-white/20 backdrop-blur-md rounded-full
                border border-white/30
                text-xs font-medium text-white
                shadow-lg
              "
            >
              {activity.category}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quality indicator */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.8
          }}
          transition={{ duration: 0.2 }}
          className="
            absolute top-4 left-4
            px-2 py-1 
            bg-ludus-orange/80 backdrop-blur-sm rounded-full
            text-xs font-medium text-white
            shadow-lg
          "
        >
          HD
        </motion.div>
      </div>

      {/* Content section with stagger animation */}
      <motion.div 
        className="p-4 flex-1 flex flex-col justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {/* Title and description */}
        <div className="mb-3">
          <motion.h3 
            className="
              text-lg font-semibold mb-2 line-clamp-2
              text-charcoal dark:text-dark-text-primary
              group-hover:text-ludus-orange dark:group-hover:text-dark-ludus-orange
              transition-colors duration-200
            "
            whileHover={{ scale: 1.02 }}
          >
            {activity.title}
          </motion.h3>
          
          {activity.description && variant !== 'compact' && (
            <p className="text-sm text-gray-600 dark:text-dark-text-tertiary line-clamp-2">
              {activity.description}
            </p>
          )}
        </div>

        {/* Activity metadata */}
        {activity.location && (
          <div className="flex items-center text-xs text-gray-500 dark:text-dark-text-tertiary mb-3">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {activity.location}
          </div>
        )}

        {/* Price and booking section */}
        <div className="flex items-center justify-between">
          <motion.div 
            className="text-lg font-bold text-ludus-orange dark:text-dark-ludus-orange"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {activity.price} SAR
          </motion.div>
          
          <motion.button
            onClick={handleBook}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="
              px-4 py-2 
              bg-ludus-orange hover:bg-ludus-orange-dark
              dark:bg-dark-ludus-orange dark:hover:bg-dark-ludus-orange-dark
              text-white font-semibold rounded-xl
              shadow-lg hover:shadow-xl
              transition-all duration-200
              relative overflow-hidden
              group/button
            "
          >
            {/* Button ripple effect */}
            <motion.div
              className="absolute inset-0 bg-white/20 rounded-xl"
              initial={{ scale: 0, opacity: 0 }}
              whileTap={{ scale: 4, opacity: [0, 1, 0] }}
              transition={{ duration: 0.6 }}
            />
            
            <span className="relative z-10">Join</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 pointer-events-none"
        style={{
          background: 'linear-gradient(45deg, rgba(255, 102, 0, 0.1), rgba(255, 133, 51, 0.1))',
          filter: 'blur(20px)',
        }}
        animate={{ 
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1.1 : 1
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default ActivityCard;