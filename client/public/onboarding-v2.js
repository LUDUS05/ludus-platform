/**
 * Project ATHENA - Onboarding V2 JavaScript
 * Advanced GSAP Animations and Interactive Features
 */

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// Global variables
let currentStep = 1;
const totalSteps = 4;
let isAnimating = false;
let isRTL = false;

// DOM elements
const steps = document.querySelectorAll('.onboarding-step');
const stepIndicators = document.querySelectorAll('.step-indicator');
const navDots = document.querySelectorAll('.nav-dot');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const skipBtn = document.getElementById('skip-btn');
const langToggle = document.getElementById('lang-toggle');
const progressFill = document.querySelector('.progress-fill');
const body = document.body;

// Initialize the onboarding experience
function initOnboarding() {
  console.log('🎬 Project ATHENA Onboarding V2 - Initializing...');
  
  // Set up event listeners
  setupEventListeners();
  
  // Initialize animations
  initializeAnimations();
  
  // Start the experience
  startOnboarding();
}

// Set up event listeners
function setupEventListeners() {
  // Navigation buttons
  prevBtn.addEventListener('click', goToPreviousStep);
  nextBtn.addEventListener('click', goToNextStep);
  skipBtn.addEventListener('click', skipOnboarding);
  
  // Step indicators
  stepIndicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => goToStep(index + 1));
  });
  
  // Navigation dots
  navDots.forEach((dot, index) => {
    dot.addEventListener('click', () => goToStep(index + 1));
  });
  
  // Language toggle
  langToggle.addEventListener('click', toggleLanguage);
  
  // Feature items hover effects
  setupFeatureHoverEffects();
  
  // Demo interactions
  setupDemoInteractions();
  
  // Keyboard navigation
  document.addEventListener('keydown', handleKeyboardNavigation);
  
  // Window resize
  window.addEventListener('resize', handleResize);
}

// Initialize GSAP animations
function initializeAnimations() {
  // Set initial states
  gsap.set('.onboarding-step', { opacity: 0, y: 50 });
  gsap.set('.step-indicator', { scale: 0.8, opacity: 0.6 });
  gsap.set('.nav-dot', { scale: 0.8, opacity: 0.6 });
  gsap.set('.bg-shape', { scale: 0, rotation: 0 });
  gsap.set('.particle', { opacity: 0, y: 100 });
  gsap.set('.floating-devices .device', { y: 50, rotation: 5, opacity: 0 });
  gsap.set('.feature-item', { y: 30, opacity: 0 });
  gsap.set('.animated-element', { scale: 0, rotation: 180 });
  gsap.set('.rocket', { y: 20, rotation: -10 });
  gsap.set('.star', { scale: 0, opacity: 0 });
  
  // Animate background elements
  animateBackgroundElements();
  
  // Animate particles
  animateParticles();
  
  // Set up scroll triggers for performance
  setupScrollTriggers();
}

// Animate background elements
function animateBackgroundElements() {
  const shapes = document.querySelectorAll('.bg-shape');
  
  shapes.forEach((shape, index) => {
    gsap.to(shape, {
      scale: 1,
      rotation: 360,
      duration: 20 + (index * 5),
      ease: 'none',
      repeat: -1,
      delay: index * 2
    });
  });
}

// Animate particles
function animateParticles() {
  const particles = document.querySelectorAll('.particle');
  
  particles.forEach((particle, index) => {
    gsap.to(particle, {
      opacity: 0.6,
      y: -100,
      duration: 15 + (index * 2),
      ease: 'none',
      repeat: -1,
      delay: index * 2,
      onComplete: () => {
        gsap.set(particle, { y: 100, opacity: 0 });
      }
    });
  });
}

// Set up scroll triggers
function setupScrollTriggers() {
  // Feature items animation on scroll
  ScrollTrigger.create({
    trigger: '.features-showcase',
    start: 'top 80%',
    onEnter: () => animateFeatureItems()
  });
  
  // Demo workspace animation
  ScrollTrigger.create({
    trigger: '.demo-workspace',
    start: 'top 80%',
    onEnter: () => animateDemoWorkspace()
  });
}

// Start the onboarding experience
function startOnboarding() {
  // Animate in the first step
  animateStepIn(1);
  
  // Animate progress
  updateProgress();
  
  // Start floating device animations
  animateFloatingDevices();
  
  // Start content pulse animations
  animateContentPulse();
}

// Go to next step
function goToNextStep() {
  if (currentStep < totalSteps && !isAnimating) {
    goToStep(currentStep + 1);
  }
}

// Go to previous step
function goToPreviousStep() {
  if (currentStep > 1 && !isAnimating) {
    goToStep(currentStep - 1);
  }
}

// Go to specific step
function goToStep(step) {
  if (step < 1 || step > totalSteps || isAnimating || step === currentStep) {
    return;
  }
  
  isAnimating = true;
  
  // Animate out current step
  animateStepOut(currentStep, () => {
    // Update current step
    currentStep = step;
    
    // Animate in new step
    animateStepIn(step);
    
    // Update UI
    updateStepIndicators();
    updateNavigationButtons();
    updateProgress();
    
    // Step-specific animations
    animateStepSpecific(currentStep);
    
    isAnimating = false;
  });
}

// Animate step out
function animateStepOut(step, callback) {
  const stepElement = document.getElementById(`step${step}`);
  
  gsap.to(stepElement, {
    opacity: 0,
    y: -50,
    duration: 0.5,
    ease: 'power2.inOut',
    onComplete: callback
  });
}

// Animate step in
function animateStepIn(step) {
  const stepElement = document.getElementById(`step${step}`);
  
  // Remove active class from all steps
  steps.forEach(s => s.classList.remove('active'));
  
  // Add active class to current step
  stepElement.classList.add('active');
  
  // Animate in
  gsap.to(stepElement, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'power2.out'
  });
}

// Update step indicators
function updateStepIndicators() {
  stepIndicators.forEach((indicator, index) => {
    const isActive = index + 1 === currentStep;
    
    gsap.to(indicator, {
      scale: isActive ? 1.1 : 0.8,
      opacity: isActive ? 1 : 0.6,
      duration: 0.3,
      ease: 'power2.out'
    });
    
    indicator.classList.toggle('active', isActive);
  });
  
  navDots.forEach((dot, index) => {
    const isActive = index + 1 === currentStep;
    
    gsap.to(dot, {
      scale: isActive ? 1.2 : 0.8,
      opacity: isActive ? 1 : 0.6,
      duration: 0.3,
      ease: 'power2.out'
    });
    
    dot.classList.toggle('active', isActive);
  });
}

// Update navigation buttons
function updateNavigationButtons() {
  // Previous button
  prevBtn.disabled = currentStep === 1;
  gsap.to(prevBtn, {
    opacity: currentStep === 1 ? 0.5 : 1,
    duration: 0.3
  });
  
  // Next/Finish button
  if (currentStep === totalSteps) {
    nextBtn.style.display = 'none';
    document.getElementById('finish-btn').style.display = 'flex';
  } else {
    nextBtn.style.display = 'flex';
    document.getElementById('finish-btn').style.display = 'none';
  }
}

// Update progress
function updateProgress() {
  const progress = (currentStep / totalSteps) * 100;
  
  gsap.to(progressFill, {
    width: `${progress}%`,
    duration: 0.5,
    ease: 'power2.out'
  });
}

// Step-specific animations
function animateStepSpecific(step) {
  switch (step) {
    case 1:
      animateHeroSection();
      break;
    case 2:
      animateFeatureItems();
      break;
    case 3:
      animateDemoWorkspace();
      break;
    case 4:
      animateLaunchSection();
      break;
  }
}

// Animate hero section
function animateHeroSection() {
  const tl = gsap.timeline();
  
  tl.to('.hero-badge', {
    y: 0,
    opacity: 1,
    duration: 0.6,
    ease: 'back.out(1.7)'
  })
  .to('.hero-title .title-line', {
    y: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power2.out'
  }, '-=0.3')
  .to('.hero-description', {
    y: 0,
    opacity: 1,
    duration: 0.6,
    ease: 'power2.out'
  }, '-=0.4')
  .to('.stat-card', {
    y: 0,
    opacity: 1,
    duration: 0.6,
    stagger: 0.1,
    ease: 'back.out(1.7)'
  }, '-=0.2');
}

// Animate floating devices
function animateFloatingDevices() {
  const devices = document.querySelectorAll('.floating-devices .device');
  
  devices.forEach((device, index) => {
    gsap.to(device, {
      y: 0,
      rotation: 0,
      opacity: 1,
      duration: 1,
      delay: index * 0.3,
      ease: 'back.out(1.7)'
    });
  });
}

// Animate content pulse
function animateContentPulse() {
  const contentItems = document.querySelectorAll('.content-item');
  
  contentItems.forEach((item, index) => {
    gsap.to(item, {
      scale: 1.1,
      opacity: 1,
      duration: 0.8,
      delay: index * 0.2,
      ease: 'power2.out',
      yoyo: true,
      repeat: -1,
      repeatDelay: 2
    });
  });
}

// Animate feature items
function animateFeatureItems() {
  const featureItems = document.querySelectorAll('.feature-item');
  
  featureItems.forEach((item, index) => {
    gsap.to(item, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      delay: index * 0.2,
      ease: 'back.out(1.7)'
    });
  });
  
  // Animate feature previews
  animateFeaturePreviews();
}

// Animate feature previews
function animateFeaturePreviews() {
  // Animation demo
  const animatedElements = document.querySelectorAll('.animated-element');
  gsap.to(animatedElements, {
    scale: 1,
    rotation: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: 'back.out(1.7)',
    delay: 0.5
  });
  
  // RTL demo
  const rtlTexts = document.querySelectorAll('.rtl-text');
  gsap.to(rtlTexts, {
    y: 0,
    opacity: 1,
    duration: 0.6,
    stagger: 0.3,
    ease: 'power2.out',
    delay: 0.8
  });
  
  // Social demo
  const socialElements = document.querySelectorAll('.social-interaction, .social-actions');
  gsap.to(socialElements, {
    y: 0,
    opacity: 1,
    duration: 0.6,
    stagger: 0.2,
    ease: 'power2.out',
    delay: 1.1
  });
  
  // Referral demo
  const referralElements = document.querySelectorAll('.referral-card, .referral-stats');
  gsap.to(referralElements, {
    y: 0,
    opacity: 1,
    duration: 0.6,
    stagger: 0.2,
    ease: 'power2.out',
    delay: 1.4
  });
}

// Animate demo workspace
function animateDemoWorkspace() {
  const tl = gsap.timeline();
  
  tl.to('.demo-workspace', {
    y: 0,
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out'
  })
  .to('.sidebar-header', {
    y: 0,
    opacity: 1,
    duration: 0.6,
    ease: 'power2.out'
  }, '-=0.4')
  .to('.menu-item', {
    x: 0,
    opacity: 1,
    duration: 0.5,
    stagger: 0.1,
    ease: 'power2.out'
  }, '-=0.3')
  .to('.feed-item', {
    y: 0,
    opacity: 1,
    duration: 0.6,
    stagger: 0.2,
    ease: 'back.out(1.7)'
  }, '-=0.2');
}

// Animate launch section
function animateLaunchSection() {
  const tl = gsap.timeline();
  
  tl.to('.launch-badge', {
    y: 0,
    opacity: 1,
    duration: 0.6,
    ease: 'back.out(1.7)'
  })
  .to('.launch-title', {
    y: 0,
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out'
  }, '-=0.3')
  .to('.launch-description', {
    y: 0,
    opacity: 1,
    duration: 0.6,
    ease: 'power2.out'
  }, '-=0.4')
  .to('.metric-item', {
    y: 0,
    opacity: 1,
    duration: 0.6,
    stagger: 0.1,
    ease: 'back.out(1.7)'
  }, '-=0.2')
  .to('.launch-actions', {
    y: 0,
    opacity: 1,
    duration: 0.6,
    ease: 'power2.out'
  }, '-=0.3');
  
  // Animate rocket and stars
  animateRocketLaunch();
}

// Animate rocket launch
function animateRocketLaunch() {
  const tl = gsap.timeline();
  
  tl.to('.rocket', {
    y: -20,
    rotation: 0,
    duration: 1,
    ease: 'power2.out'
  })
  .to('.trail', {
    scaleY: 1.5,
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out'
  }, '-=0.8')
  .to('.star', {
    scale: 1,
    opacity: 1,
    duration: 0.6,
    stagger: 0.1,
    ease: 'back.out(1.7)'
  }, '-=0.6');
}

// Set up feature hover effects
function setupFeatureHoverEffects() {
  const featureItems = document.querySelectorAll('.feature-item');
  
  featureItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      gsap.to(item, {
        y: -10,
        scale: 1.02,
        duration: 0.3,
        ease: 'power2.out'
      });
      
      // Animate preview elements
      const preview = item.querySelector('.preview-container');
      if (preview) {
        gsap.to(preview, {
          scale: 1.05,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });
    
    item.addEventListener('mouseleave', () => {
      gsap.to(item, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
      
      const preview = item.querySelector('.preview-container');
      if (preview) {
        gsap.to(preview, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });
  });
}

// Set up demo interactions
function setupDemoInteractions() {
  // Menu item interactions
  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active class from all items
      menuItems.forEach(mi => mi.classList.remove('active'));
      
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
  
  // Action button interactions
  const actionBtns = document.querySelectorAll('.action-btn');
  actionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Animate button click
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
  
  // Re-animate current step for RTL
  if (isRTL) {
    setTimeout(() => {
      animateStepSpecific(currentStep);
    }, 300);
  }
}

// Skip onboarding
function skipOnboarding() {
  // Animate out all elements
  gsap.to('.onboarding-v2-container', {
    opacity: 0,
    y: -50,
    duration: 0.5,
    ease: 'power2.inOut',
    onComplete: () => {
      // Redirect to main app or show completion message
      showCompletionMessage();
    }
  });
}

// Show completion message
function showCompletionMessage() {
  const message = document.createElement('div');
  message.className = 'completion-message';
  message.innerHTML = `
    <div class="completion-content">
      <h2>🎉 Welcome to Project ATHENA!</h2>
      <p>You're ready to explore the enhanced LUDUS platform.</p>
      <button onclick="window.location.href='/'">Get Started</button>
    </div>
  `;
  
  document.body.appendChild(message);
  
  // Animate in
  gsap.fromTo(message, {
    opacity: 0,
    scale: 0.8
  }, {
    opacity: 1,
    scale: 1,
    duration: 0.6,
    ease: 'back.out(1.7)'
  });
}

// Handle keyboard navigation
function handleKeyboardNavigation(e) {
  switch (e.key) {
    case 'ArrowRight':
    case ' ':
      e.preventDefault();
      goToNextStep();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      goToPreviousStep();
      break;
    case 'Escape':
      e.preventDefault();
      skipOnboarding();
      break;
    case 'l':
    case 'L':
      e.preventDefault();
      toggleLanguage();
      break;
  }
}

// Handle window resize
function handleResize() {
  // Refresh ScrollTrigger
  ScrollTrigger.refresh();
  
  // Recalculate animations if needed
  if (currentStep === 1) {
    animateFloatingDevices();
  }
}

// Performance monitoring
function monitorPerformance() {
  // Monitor frame rate
  let lastTime = performance.now();
  let frameCount = 0;
  
  function checkFrameRate() {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      
      if (fps < 30) {
        console.warn(`⚠️ Low FPS detected: ${fps}fps`);
      }
      
      frameCount = 0;
      lastTime = currentTime;
    }
    
    requestAnimationFrame(checkFrameRate);
  }
  
  checkFrameRate();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initOnboarding();
  monitorPerformance();
});

// Export functions for external use
window.OnboardingV2 = {
  goToStep,
  toggleLanguage,
  skipOnboarding,
  currentStep: () => currentStep,
  totalSteps: () => totalSteps
};
