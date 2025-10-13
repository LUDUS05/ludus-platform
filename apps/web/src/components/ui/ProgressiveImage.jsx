/**
 * LUDUS Platform - Progressive Image Component
 * Enhanced image loading with Unsplash integration, BlurHash, and animations
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Blurhash } from 'react-blurhash';
import { unsplashService } from '../../services/unsplashService';

const ProgressiveImage = ({ 
  unsplashId, 
  src, 
  alt, 
  blurHash,
  className = "",
  width,
  height,
  category,
  onLoad,
  attribution = true,
  fallbackGradient = true,
  quality = 80
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true);
      setError(false);
      
      try {
        let finalSrc = src;
        let finalBlurHash = blurHash;
        let userData = null;

        // Priority 1: Use provided src
        if (src) {
          finalSrc = src;
        }
        // Priority 2: Fetch by Unsplash ID
        else if (unsplashId) {
          const data = await unsplashService.getImageById(unsplashId);
          if (data) {
            finalSrc = width && height 
              ? unsplashService.getOptimizedUrl(data.urls.regular, width, height, quality)
              : data.urls.regular;
            finalBlurHash = data.blurHash;
            userData = data.user;
            setImageData(data);
          }
        }
        // Priority 3: Get random image from category
        else if (category) {
          const imageResult = await unsplashService.getRandomCategoryImage(category, {
            width: width || 800,
            height: height || 600
          });
          
          if (imageResult) {
            finalSrc = imageResult.optimizedUrl || imageResult.urls.regular;
            finalBlurHash = imageResult.blurHash;
            userData = imageResult.user;
            setImageData(imageResult);
          }
        }

        if (finalSrc) {
          // Preload the image
          const img = new Image();
          img.onload = () => {
            setImageSrc(finalSrc);
            setImageLoaded(true);
            setIsLoading(false);
            
            // Track download for Unsplash compliance
            if (imageData?.downloadUrl) {
              unsplashService.trackDownload(imageData.downloadUrl);
            }
            
            onLoad?.(imageData);
          };
          
          img.onerror = () => {
            console.error('Failed to load image:', finalSrc);
            setError(true);
            setIsLoading(false);
          };
          
          img.src = finalSrc;
        } else {
          setError(true);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Image loading error:', err);
        setError(true);
        setIsLoading(false);
      }
    };

    loadImage();
  }, [unsplashId, src, category, width, height, quality]);

  // Error state
  if (error) {
    return (
      <div className={`bg-warm dark:bg-dark-bg-tertiary flex items-center justify-center ${className}`}>
        <motion.div 
          className="text-center p-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-2 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Image unavailable</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* BlurHash placeholder */}
      <AnimatePresence>
        {!imageLoaded && blurHash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Blurhash
              hash={blurHash}
              width="100%"
              height="100%"
              resolutionX={32}
              resolutionY={32}
              punch={1}
              className="w-full h-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fallback gradient if no blurHash */}
      <AnimatePresence>
        {!imageLoaded && !blurHash && fallbackGradient && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-ludus-orange/20 to-ludus-orange-dark/20 dark:from-dark-ludus-orange/20 dark:to-dark-ludus-orange-dark/20"
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-ludus-orange border-t-transparent dark:border-dark-ludus-orange rounded-full"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main image */}
      <AnimatePresence>
        {imageSrc && (
          <motion.img
            src={imageSrc}
            alt={alt || imageData?.alt || 'Activity image'}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ 
              opacity: imageLoaded ? 1 : 0,
              scale: imageLoaded ? 1 : 1.05
            }}
            transition={{ 
              duration: 0.6, 
              ease: [0.25, 0.46, 0.45, 0.94] 
            }}
            onLoad={() => setImageLoaded(true)}
          />
        )}
      </AnimatePresence>

      {/* Attribution overlay */}
      <AnimatePresence>
        {attribution && imageData?.user && imageLoaded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="
              absolute bottom-2 right-2
              bg-black/50 backdrop-blur-sm rounded-full px-3 py-1
              text-xs text-white
              opacity-0 group-hover:opacity-100
              transition-opacity duration-200
            "
          >
            <a 
              href={imageData.user.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              {imageData.user.name}
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading indicator for top corner */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-full p-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-3 h-3 border border-white border-t-transparent rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProgressiveImage;