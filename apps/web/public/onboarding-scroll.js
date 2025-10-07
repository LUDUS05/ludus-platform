/**
 * Project ATHENA - ScrollTrigger Onboarding JavaScript
 * Advanced GSAP ScrollTrigger Integration
 */

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// Global variables
let isRTL = false;
let currentSection = 'hero';

// DOM elements
const body = document.body;
const langToggle = document.getElementById('lang-toggle');
const navDots = document.querySelectorAll('.nav-dot');
const sections = document.querySelectorAll('section');

// Initialize the ScrollTrigger onboarding experience
function initScrollOnboarding() {
  console.log('🎬 Project ATHENA ScrollTrigger Onboarding - Initializing...');
  
  // Set up event listeners
  setupEventListeners();
  
  // Initialize ScrollTrigger animations
  initializeScrollTriggerAnimations();
  
  // Set up navigation
  setupNavigation();
}

// Set up event listeners
function setupEventListeners() {
  // Language toggle
  langToggle.addEventListener('click', toggleLanguage);
  
  // Navigation dots
  navDots.forEach((dot, index) => {
    dot.addEventListener('click', () => scrollToSection(index));
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', handleKeyboardNavigation);
  
  // Window resize
  window.addEventListener('resize', () => ScrollTrigger.refresh());
}

// Initialize ScrollTrigger animations
function initializeScrollTriggerAnimations() {
  // Hero section animations
  setupHeroAnimations();
  
  // Features section animations
  setupFeaturesAnimations();
  
  // Demo section animations
  setupDemoAnimations();
  
  // CTA section animations
  setupCTAAnimations();
  
  // Background elements animations
  setupBackgroundAnimations();
  
  // Navigation animations
  setupNavigationAnimations();
}

// Hero section animations
function setupHeroAnimations() {
  // Hero content entrance animation
  gsap.fromTo('.hero-badge', {
    y: 50,
    opacity: 0
  }, {
    y: 0,
    opacity: 1,
    duration: 1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.hero-section',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse'
    }
  });

  // Title lines staggered animation
  gsap.fromTo('.hero-title .title-line', {
    y: 100,
    opacity: 0
  }, {
    y: 0,
    opacity: 1,
    duration: 1.2,
    stagger: 0.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.hero-title',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse'
    }
  });

  // Description animation
  gsap.fromTo('.hero-description', {
    y: 50,
    opacity: 0
  }, {
    y: 0,
    opacity: 1,
    duration: 1,
    delay: 0.6,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.hero-description',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse'
    }
  });

  // CTA buttons animation
  gsap.fromTo('.hero-cta .cta-button', {
    y: 50,
    opacity: 0
  }, {
    y: 0,
    opacity: 1,
    duration: 1,
    stagger: 0.1,
    delay: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.hero-cta',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse'
    }
  });

  // Scroll indicator animation
  gsap.fromTo('.scroll-indicator', {
    y: 20,
    opacity: 0
  }, {
    y: 0,
    opacity: 1,
    duration: 1,
    delay: 1.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.scroll-indicator',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse'
    }
  });
}

// Features section animations
function setupFeaturesAnimations() {
  // Section header animation
  gsap.fromTo('.features-section .section-header', {
    y: 100,
    opacity: 0
  }, {
    y: 0,
    opacity: 1,
    duration: 1.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.features-section',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse'
    }
  });

  // Feature cards animation with stagger
  gsap.fromTo('.feature-card', {
    y: 100,
    opacity: 0,
    rotation: 5
  }, {
    y: 0,
    opacity: 1,
    rotation: 0,
    duration: 1,
    stagger: 0.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.features-container',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse'
    }
  });

  // Feature visual animations
  setupFeatureVisualAnimations();
}

// Feature visual animations
function setupFeatureVisualAnimations() {
  // Animation demo circles
  gsap.fromTo('.demo-circle', {
    scale: 0,
    rotation: 180
  }, {
    scale: 1,
    rotation: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'back.out(1.7)',
    scrollTrigger: {
      trigger: '.feature-card[data-feature="animations"]',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse'
    }
  });

  // RTL text animation
  gsap.fromTo('.rtl-text', {
    x: -50,
    opacity: 0
  }, {
    x: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.feature-card[data-feature="rtl"]',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse'
    }
  });

  // Social demo animation
  gsap.fromTo('.social-post, .social-actions', {
    y: 30,
    opacity: 0
  }, {
    y: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.feature-card[data-feature="social"]',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse'
    }
  });

  // Performance bars animation
  gsap.fromTo('.bar-fill', {
    width: 0
  }, {
    width: 'auto',
    duration: 2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.feature-card[data-feature="performance"]',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse'
    }
  });
}

// Demo section animations
function setupDemoAnimations() {
  // Demo workspace entrance
  gsap.fromTo('.demo-workspace', {
    y: 100,
    opacity: 0,
    scale: 0.9
  }, {
    y: 0,
    opacity: 1,
    scale: 1,
    duration: 1.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.demo-section',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse'
    }
  });

  // Sidebar animations
  gsap.fromTo('.sidebar-header', {
    x: -50,
    opacity: 0
  }, {
    x: 0,
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.demo-sidebar',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse'
    }
  });

  // Menu items animation
  gsap.fromTo('.menu-item', {
    x: -30,
    opacity: 0
  }, {
    x: 0,
    opacity: 1,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.sidebar-menu',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse'
    }
  });

  // Feed items animation
  gsap.fromTo('.feed-item', {
    y: 50,
    opacity: 0
  }, {
    y: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.2,
    ease: 'back.out(1.7)',
    scrollTrigger: {
      trigger: '.demo-feed',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse'
    }
  });
}

// CTA section animations
function setupCTAAnimations() {
  // CTA visual animation
  gsap.fromTo('.cta-visual', {
    y: 100,
    opacity: 0
  }, {
    y: 0,
    opacity: 1,
    duration: 1.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.cta-section',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse'
    }
  });

  // CTA content animation
  gsap.fromTo('.cta-text', {
    y: 50,
    opacity: 0
  }, {
    y: 0,
    opacity: 1,
    duration: 1,
    delay: 0.3,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.cta-text',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse'
    }
  });

  // Rocket animation
  gsap.fromTo('.rocket', {
    y: 20,
    rotation: -10
  }, {
    y: -20,
    rotation: 0,
    duration: 2,
    ease: 'power2.inOut',
    repeat: -1,
    yoyo: true,
    scrollTrigger: {
      trigger: '.rocket-container',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse'
    }
  });

  // Stars animation
  gsap.fromTo('.star', {
    scale: 0,
    opacity: 0
  }, {
    scale: 1,
    opacity: 1,
    duration: 0.6,
    stagger: 0.1,
    ease: 'back.out(1.7)',
    scrollTrigger: {
      trigger: '.stars',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse'
    }
  });

  // CTA buttons animation
  gsap.fromTo('.cta-actions .cta-button', {
    y: 50,
    opacity: 0
  }, {
    y: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.1,
    delay: 0.6,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.cta-actions',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse'
    }
  });
}

// Background elements animations
function setupBackgroundAnimations() {
  // Background elements floating animation
  gsap.to('.bg-element', {
    y: -20,
    rotation: 360,
    duration: 20,
    ease: 'none',
    repeat: -1,
    stagger: 5
  });

  // Parallax effect for background elements
  gsap.to('.bg-1', {
    y: -100,
    ease: 'none',
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom top',
      scrub: 1
    }
  });

  gsap.to('.bg-2', {
    y: -50,
    ease: 'none',
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom top',
      scrub: 1
    }
  });

  gsap.to('.bg-3', {
    y: -75,
    ease: 'none',
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom top',
      scrub: 1
    }
  });
}

// Navigation animations
function setupNavigationAnimations() {
  // Navigation dots entrance
  gsap.fromTo('.nav-dot', {
    scale: 0,
    opacity: 0
  }, {
    scale: 1,
    opacity: 0.6,
    duration: 0.6,
    stagger: 0.1,
    ease: 'back.out(1.7)',
    delay: 1
  });

  // Language toggle entrance
  gsap.fromTo('.language-toggle', {
    x: 50,
    opacity: 0
  }, {
    x: 0,
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out',
    delay: 1.2
  });
}

// Set up navigation
function setupNavigation() {
  // Update active nav dot based on scroll position
  sections.forEach((section, index) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter: () => updateActiveNavDot(index),
      onEnterBack: () => updateActiveNavDot(index)
    });
  });
}

// Update active navigation dot
function updateActiveNavDot(index) {
  navDots.forEach((dot, i) => {
    if (i === index) {
      dot.classList.add('active');
      gsap.to(dot, {
        scale: 1.2,
        duration: 0.3,
        ease: 'power2.out'
      });
    } else {
      dot.classList.remove('active');
      gsap.to(dot, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  });
  
  currentSection = sections[index].id;
}

// Scroll to specific section
function scrollToSection(index) {
  const section = sections[index];
  if (section) {
    gsap.to(window, {
      duration: 1,
      scrollTo: {
        y: section,
        offsetY: 0
      },
      ease: 'power2.inOut'
    });
  }
}

// Toggle language (RTL/LTR)
function toggleLanguage() {
  isRTL = !isRTL;
  
  // Update body direction
  body.dir = isRTL ? 'rtl' : 'ltr';
  
  // Update language button text
  const langText = langToggle.querySelector('.lang-text');
  langText.textContent = isRTL ? 'English' : 'العربية';
  
  // Animate the toggle
  gsap.to(langToggle, {
    scale: 0.95,
    duration: 0.1,
    yoyo: true,
    repeat: 1,
    ease: 'power2.inOut'
  });
  
  // Refresh ScrollTrigger for RTL
  if (isRTL) {
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);
  }
}

// Handle keyboard navigation
function handleKeyboardNavigation(e) {
  switch (e.key) {
    case 'ArrowDown':
    case ' ':
      e.preventDefault();
      scrollToNextSection();
      break;
    case 'ArrowUp':
      e.preventDefault();
      scrollToPreviousSection();
      break;
    case 'Home':
      e.preventDefault();
      scrollToSection(0);
      break;
    case 'End':
      e.preventDefault();
      scrollToSection(sections.length - 1);
      break;
    case 'l':
    case 'L':
      e.preventDefault();
      toggleLanguage();
      break;
  }
}

// Scroll to next section
function scrollToNextSection() {
  const currentIndex = Array.from(sections).findIndex(section => section.id === currentSection);
  const nextIndex = Math.min(currentIndex + 1, sections.length - 1);
  scrollToSection(nextIndex);
}

// Scroll to previous section
function scrollToPreviousSection() {
  const currentIndex = Array.from(sections).findIndex(section => section.id === currentSection);
  const prevIndex = Math.max(currentIndex - 1, 0);
  scrollToSection(prevIndex);
}

// Set up interactive elements
function setupInteractiveElements() {
  // Feature card hover effects
  document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        y: -10,
        scale: 1.02,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  });

  // CTA button hover effects
  document.querySelectorAll('.cta-button').forEach(button => {
    button.addEventListener('mouseenter', () => {
      gsap.to(button, {
        y: -3,
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    button.addEventListener('mouseleave', () => {
      gsap.to(button, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  });

  // Action button interactions
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      gsap.to(btn, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });
      
      // Update count if it exists
      const count = btn.querySelector('.btn-count');
      if (count) {
        const currentCount = parseInt(count.textContent);
        const newCount = currentCount + 1;
        
        gsap.to(count, {
          scale: 1.2,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: 'power2.inOut',
          onComplete: () => {
            count.textContent = newCount;
          }
        });
      }
    });
  });

  // Menu item interactions
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
      // Remove active class from all items
      document.querySelectorAll('.menu-item').forEach(mi => mi.classList.remove('active'));
      
      // Add active class to clicked item
      item.classList.add('active');
      
      // Animate the change
      gsap.to(item, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });
    });
  });
}

// Performance monitoring
function monitorPerformance() {
  let lastTime = performance.now();
  let frameCount = 0;
  let checkCount = 0;
  
  function checkFrameRate() {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 2000) {
      const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      
      if (fps < 20 && checkCount > 2) {
        console.warn(`⚠️ Low FPS detected: ${fps}fps`);
      }
      
      frameCount = 0;
      lastTime = currentTime;
      checkCount++;
    }
    
    if (checkCount < 5) {
      requestAnimationFrame(checkFrameRate);
    }
  }
  
  checkFrameRate();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initScrollOnboarding();
  setupInteractiveElements();
  monitorPerformance();
});

// Export functions for external use
window.ScrollOnboarding = {
  scrollToSection,
  toggleLanguage,
  currentSection: () => currentSection,
  totalSections: () => sections.length
};
