/**
 * LUDUS Platform - Floating Action Button
 * Magnetic floating action button with notifications
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingActionButton = ({ 
  onClick, 
  icon: Icon, 
  notifications = 0,
  position = 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
  tooltip,
  className = ""
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setMousePosition({
      x: (e.clientX - centerX) * 0.3,
      y: (e.clientY - centerY) * 0.3
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (tooltip) {
      setTimeout(() => setShowTooltip(true), 500);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowTooltip(false);
    setMousePosition({ x: 0, y: 0 });
  };

  // Position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'top-left':
        return 'top-6 left-6';
      default:
        return 'bottom-6 right-6';
    }
  };

  // Tooltip position
  const getTooltipPosition = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-full mb-2 left-0';
      case 'top-right':
        return 'top-full mt-2 right-0';
      case 'top-left':
        return 'top-full mt-2 left-0';
      default:
        return 'bottom-full mb-2 right-0';
    }
  };

  return (
    <>
      <motion.button
        className={`
          fixed z-50
          w-14 h-14 
          bg-ludus-orange hover:bg-ludus-orange-dark
          dark:bg-dark-ludus-orange dark:hover:bg-dark-ludus-orange-dark
          rounded-full shadow-lg hover:shadow-2xl
          flex items-center justify-center
          text-white
          transition-colors duration-200
          ${getPositionClasses()}
          ${className}
        `}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
          scale: isHovered ? 1.1 : 1
        }}
        whileTap={{ scale: 0.9 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          scale: { duration: 0.2 }
        }}
      >
        {/* Icon */}
        <motion.div
          animate={{ rotate: isHovered ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {Icon && <Icon className="w-6 h-6" />}
        </motion.div>

        {/* Notification badge */}
        <AnimatePresence>
          {notifications > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="
                absolute -top-2 -right-2
                min-w-[24px] h-6 px-1
                bg-error-red
                rounded-full flex items-center justify-center
                text-xs font-bold text-white
                shadow-lg
              "
            >
              <motion.span
                key={notifications}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {notifications > 99 ? '99+' : notifications}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ripple effect */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white/30"
          animate={{
            scale: [1, 2, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className={`
              fixed z-40
              px-3 py-2
              bg-charcoal dark:bg-dark-bg-secondary
              text-white dark:text-dark-text-primary
              text-sm font-medium
              rounded-lg shadow-lg
              pointer-events-none
              ${getPositionClasses()}
              ${getTooltipPosition()}
            `}
          >
            {tooltip}
            
            {/* Tooltip arrow */}
            <div className={`
              absolute w-2 h-2 
              bg-charcoal dark:bg-dark-bg-secondary
              transform rotate-45
              ${position.includes('bottom') ? 'top-full -mt-1' : 'bottom-full -mb-1'}
              ${position.includes('right') ? 'right-4' : 'left-4'}
            `} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingActionButton;