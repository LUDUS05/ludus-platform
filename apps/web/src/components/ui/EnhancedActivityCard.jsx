// frontend/src/components/ui/EnhancedActivityCard.jsx
import React, { useState, useRef, useEffect } from 'react';
import { gsap } from '../../utils/gsap-setup';
import { animationPresets, rtlAware } from '../../utils/gsap-setup';
import { apiService } from '../../services/apiService';
import { notificationService } from '../../services/notificationService';

const EnhancedActivityCard = ({ activity, index = 0, onJoin, onLike }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const likeButtonRef = useRef(null);

  useEffect(() => {
    // Staggered entrance animation
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, 
        { 
          y: 60, 
          opacity: 0, 
          scale: 0.9 
        },
        {
          duration: 0.6,
          y: 0,
          opacity: 1,
          scale: 1,
          delay: index * 0.1,
          ease: 'power3.out'
        }
      );
    }
  }, [index]);

  const handleLike = async (e) => {
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Optimistic UI update
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    
    // Animate like button
    animateLikeButton(newLikedState);
    
    try {
      await apiService.toggleLike(activity.id, 'activity');
      onLike?.(activity.id, newLikedState);
    } catch (error) {
      // Revert on error
      setIsLiked(!newLikedState);
      notificationService.show('error', 'Failed to update like status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Optimistic UI update
    const newJoinedState = !isJoined;
    setIsJoined(newJoinedState);
    
    // Animate join button
    animateJoinButton(newJoinedState);
    
    try {
      if (newJoinedState) {
        await apiService.joinEvent(activity.id);
      } else {
        await apiService.leaveEvent(activity.id);
      }
      onJoin?.(activity.id, newJoinedState);
    } catch (error) {
      // Revert on error
      setIsJoined(!newJoinedState);
      notificationService.show('error', 'Failed to update join status');
    } finally {
      setIsLoading(false);
    }
  };

  const animateLikeButton = (liked) => {
    if (!likeButtonRef.current) return;
    
    const heart = likeButtonRef.current.querySelector('.heart-icon');
    const tl = gsap.timeline();
    
    if (liked) {
      tl.to(heart, { duration: 0.1, scale: 0.8 })
        .to(heart, {
          duration: 0.4,
          scale: 1.3,
          color: '#e74c3c',
          ease: 'back.out(1.7)'
        })
        .to(heart, { duration: 0.2, scale: 1 });
      
      // Create heart particles
      createHeartParticles(likeButtonRef.current);
    } else {
      tl.to(heart, {
        duration: 0.3,
        scale: 0.9,
        color: '#666'
      })
      .to(heart, { duration: 0.2, scale: 1 });
    }
  };

  const animateJoinButton = (joined) => {
    const button = cardRef.current?.querySelector('.join-button');
    if (!button) return;
    
    const tl = gsap.timeline();
    
    if (joined) {
      tl.to(button, {
        duration: 0.4,
        backgroundColor: '#28a745',
        color: '#ffffff',
        ease: 'power2.out'
      })
      .from(button.querySelector('.success-icon'), {
        duration: 0.6,
        scale: 0,
        rotation: 180,
        ease: 'back.out(1.7)'
      }, '-=0.2');
    } else {
      tl.to(button, {
        duration: 0.3,
        backgroundColor: '#007bff',
        color: '#ffffff',
        ease: 'power2.out'
      });
    }
  };

  const createHeartParticles = (element) => {
    const rect = element.getBoundingClientRect();
    const colors = ['#e74c3c', '#ff6b6b', '#ff8e8e'];
    
    for (let i = 0; i < 6; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: fixed;
        width: 6px;
        height: 6px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        pointer-events: none;
        z-index: 10000;
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top + rect.height / 2}px;
      `;
      
      document.body.appendChild(particle);
      
      gsap.to(particle, {
        duration: Math.random() * 1 + 0.5,
        x: (Math.random() - 0.5) * 100,
        y: -Math.random() * 100 - 50,
        opacity: 0,
        scale: 0,
        ease: 'power2.out',
        onComplete: () => particle.remove()
      });
    }
  };

  const handleCardHover = (isHovering) => {
    if (!cardRef.current || !imageRef.current) return;
    
    const tl = gsap.timeline();
    
    if (isHovering) {
      tl.to(cardRef.current, {
        duration: 0.3,
        y: -8,
        scale: 1.02,
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        ease: 'power2.out'
      })
      .to(imageRef.current, {
        duration: 0.4,
        scale: 1.05,
        ease: 'power2.out'
      }, '-=0.2');
    } else {
      tl.to(cardRef.current, {
        duration: 0.4,
        y: 0,
        scale: 1,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        ease: 'power2.out'
      })
      .to(imageRef.current, {
        duration: 0.5,
        scale: 1,
        ease: 'power2.out'
      }, '-=0.3');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCapacityPercentage = () => {
    if (!activity.capacity) return 0;
    return Math.min((activity.attendees || 0) / activity.capacity * 100, 100);
  };

  const getCapacityColor = () => {
    const percentage = getCapacityPercentage();
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div
      ref={cardRef}
      className="activity-card bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300"
      onMouseEnter={() => handleCardHover(true)}
      onMouseLeave={() => handleCardHover(false)}
      onClick={() => window.location.href = `/activities/${activity.id}`}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden h-48">
        <img
          ref={imageRef}
          src={activity.image || '/default-activity.jpg'}
          alt={activity.title}
          className="w-full h-full object-cover transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-start justify-between p-4">
          {/* Like Button */}
          <button
            ref={likeButtonRef}
            onClick={handleLike}
            disabled={isLoading}
            className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
              isLiked 
                ? 'bg-red-500 text-white' 
                : 'bg-white bg-opacity-80 text-gray-600 hover:bg-opacity-100'
            }`}
          >
            <svg 
              className="heart-icon w-5 h-5 transition-all duration-300" 
              fill={isLiked ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
          </button>

          {/* Capacity Indicator */}
          {activity.capacity && (
            <div className="bg-white bg-opacity-90 rounded-lg px-3 py-1 text-sm font-medium">
              {activity.attendees || 0}/{activity.capacity}
            </div>
          )}
        </div>

        {/* Category Badge */}
        {activity.category && (
          <div className="absolute bottom-4 left-4">
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {activity.category}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
          {activity.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {activity.description}
        </p>

        {/* Date and Location */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(activity.date)}
          </div>
          
          {activity.location && (
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {activity.location}
            </div>
          )}
        </div>

        {/* Capacity Bar */}
        {activity.capacity && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>المقاعد المتاحة</span>
              <span>{activity.capacity - (activity.attendees || 0)} متبقي</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getCapacityColor()}`}
                style={{ width: `${getCapacityPercentage()}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Price and Join Button */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-800">
            {activity.price ? `$${activity.price}` : 'مجاني'}
          </div>
          
          <button
            onClick={handleJoin}
            disabled={isLoading}
            className={`join-button px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
              isJoined
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                جاري...
              </div>
            ) : isJoined ? (
              <div className="flex items-center">
                <svg className="success-icon w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                انضممت
              </div>
            ) : (
              'انضم الآن'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedActivityCard;
