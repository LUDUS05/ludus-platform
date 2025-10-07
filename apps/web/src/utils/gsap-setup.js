// frontend/src/utils/gsap-setup.js - Optimized for Render deployment
import { gsap } from 'gsap/dist/gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

// Lazy load GSAP plugins to reduce initial bundle
const loadGSAPPlugins = async () => {
  if (typeof window !== 'undefined') {
    const { TextPlugin } = await import('gsap/dist/TextPlugin');
    const { DrawSVGPlugin } = await import('gsap/dist/DrawSVGPlugin');
    const { MorphSVGPlugin } = await import('gsap/dist/MorphSVGPlugin');
    
    gsap.registerPlugin(ScrollTrigger, TextPlugin, DrawSVGPlugin, MorphSVGPlugin);
  }
};

// Initialize GSAP with Render CDN optimization
export const initializeGSAP = async () => {
  await loadGSAPPlugins();
  
  // Global GSAP configuration
  gsap.config({
    force3D: true,
    nullTargetWarn: false,
    autoSleep: 60
  });

  // Set defaults optimized for mobile and Render CDN
  gsap.defaults({
    duration: 0.6,
    ease: 'power2.out'
  });

  // Reduced motion support
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) {
    gsap.globalTimeline.timeScale(0.01);
  }

  // RTL support for Arabic
  const isRTL = document.dir === 'rtl' || document.documentElement.dir === 'rtl';
  if (isRTL) {
    gsap.set('body', { direction: 'rtl' });
  }

  console.log('🎬 GSAP initialized for LUDUS Platform');
};

// Performance-optimized animation presets
export const animationPresets = {
  // Entrance animations
  slideUp: {
    y: 60,
    opacity: 0,
    duration: 0.6,
    ease: 'power3.out'
  },
  
  slideInFromRight: {
    x: 100,
    opacity: 0,
    duration: 0.6,
    ease: 'power2.out'
  },
  
  slideInFromLeft: {
    x: -100,
    opacity: 0,
    duration: 0.6,
    ease: 'power2.out'
  },
  
  scaleIn: {
    scale: 0.8,
    opacity: 0,
    duration: 0.5,
    ease: 'back.out(1.7)'
  },
  
  fadeIn: {
    opacity: 0,
    duration: 0.4,
    ease: 'power2.out'
  },

  // Hover animations
  hoverLift: {
    y: -8,
    scale: 1.02,
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    duration: 0.3,
    ease: 'power2.out'
  },
  
  hoverScale: {
    scale: 1.05,
    duration: 0.3,
    ease: 'power2.out'
  },

  // Loading animations
  pulse: {
    scale: 1.1,
    duration: 1,
    repeat: -1,
    yoyo: true,
    ease: 'power2.inOut'
  },
  
  spin: {
    rotation: 360,
    duration: 1,
    repeat: -1,
    ease: 'none'
  },

  // Success animations
  celebration: {
    scale: 1.2,
    rotation: 10,
    duration: 0.6,
    ease: 'back.out(1.7)'
  },
  
  checkmark: {
    drawSVG: '0%',
    duration: 0.8,
    ease: 'power2.out'
  },

  // Error animations
  shake: {
    x: 10,
    duration: 0.1,
    repeat: 5,
    yoyo: true,
    ease: 'power2.inOut'
  }
};

// Stagger configurations
export const staggerConfigs = {
  cards: {
    stagger: 0.1,
    from: 'start'
  },
  
  list: {
    stagger: 0.05,
    from: 'start'
  },
  
  grid: {
    stagger: 0.08,
    from: 'start'
  }
};

// RTL-aware animation helpers
export const rtlAware = {
  slideIn: (direction) => {
    const isRTL = document.dir === 'rtl' || document.documentElement.dir === 'rtl';
    if (direction === 'left') {
      return isRTL ? animationPresets.slideInFromRight : animationPresets.slideInFromLeft;
    } else {
      return isRTL ? animationPresets.slideInFromLeft : animationPresets.slideInFromRight;
    }
  },
  
  transform: (x, y) => {
    const isRTL = document.dir === 'rtl' || document.documentElement.dir === 'rtl';
    return {
      x: isRTL ? -x : x,
      y: y
    };
  }
};

// Performance monitoring
export const performanceMonitor = {
  startTime: null,
  
  start() {
    this.startTime = performance.now();
  },
  
  end(label = 'Animation') {
    if (this.startTime) {
      const duration = performance.now() - this.startTime;
      if (duration > 16.67) { // More than one frame at 60fps
        console.warn(`⚠️ ${label} took ${duration.toFixed(2)}ms (target: <16.67ms)`);
      }
      this.startTime = null;
    }
  }
};

// Memory management for animations
export const animationManager = {
  activeAnimations: new Set(),
  
  add(timeline) {
    this.activeAnimations.add(timeline);
  },
  
  remove(timeline) {
    this.activeAnimations.delete(timeline);
  },
  
  killAll() {
    this.activeAnimations.forEach(timeline => {
      if (timeline && timeline.kill) {
        timeline.kill();
      }
    });
    this.activeAnimations.clear();
  },
  
  pauseAll() {
    this.activeAnimations.forEach(timeline => {
      if (timeline && timeline.pause) {
        timeline.pause();
      }
    });
  },
  
  resumeAll() {
    this.activeAnimations.forEach(timeline => {
      if (timeline && timeline.resume) {
        timeline.resume();
      }
    });
  }
};

// Export GSAP instance for direct use
export { gsap };
export default gsap;
