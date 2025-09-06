/**
 * Project ATHENA - Stagger Onboarding JavaScript
 * Advanced GSAP Stagger Animations
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
const progressDots = document.querySelectorAll('.progress-dot');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const finishBtn = document.getElementById('finish-btn');
const langToggle = document.getElementById('lang-toggle');
const progressFill = document.querySelector('.progress-fill');
const body = document.body;

// Initialize the stagger onboarding experience
function initStaggerOnboarding() {
  console.log('🎬 Project ATHENA Stagger Onboarding - Initializing...');
  
  // Hide loading screen first
  hideLoadingScreen();
  
  // Set up event listeners
  setupEventListeners();
  
  // Initialize stagger animations
  initializeStaggerAnimations();
  
  // Start the experience
  startOnboarding();
}

// Hide loading screen
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  const onboardingContainer = document.getElementById('onboarding-container');
  
  if (loadingScreen && onboardingContainer) {
    gsap.to(loadingScreen, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => {
        loadingScreen.style.display = 'none';
        onboardingContainer.style.display = 'block';
        onboardingContainer.classList.add('loaded');
        
        gsap.fromTo(onboardingContainer, {
          opacity: 0,
          y: 20
        }, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out'
        });
      }
    });
  }
}

// Set up event listeners
function setupEventListeners() {
  // Navigation buttons
  prevBtn.addEventListener('click', goToPreviousStep);
  nextBtn.addEventListener('click', goToNextStep);
  finishBtn.addEventListener('click', finishOnboarding);
  
  // Progress dots
  progressDots.forEach((dot, index) => {
    dot.addEventListener('click', () => goToStep(index + 1));
  });
  
  // Language toggle
  langToggle.addEventListener('click', toggleLanguage);
  
  // Interactive elements
  setupInteractiveElements();
  
  // Keyboard navigation
  document.addEventListener('keydown', handleKeyboardNavigation);
  
  // Window resize
  window.addEventListener('resize', handleResize);
}

// Initialize stagger animations
function initializeStaggerAnimations() {
  // Set initial states for stagger elements
  gsap.set('.stagger-item', { y: 50, opacity: 0, rotation: 5 });
  gsap.set('.demo-element', { scale: 0, rotation: 180 });
  gsap.set('.rtl-line', { x: -50, opacity: 0 });
  gsap.set('.social-item', { y: 30, opacity: 0 });
  gsap.set('.metric-item', { scale: 0, opacity: 0 });
  gsap.set('.feed-item', { y: 50, opacity: 0 });
  gsap.set('.star', { scale: 0, opacity: 0 });
  gsap.set('.metric-card', { y: 30, opacity: 0 });
  
  // Set up scroll triggers for performance
  setupScrollTriggers();
}

// Set up scroll triggers
function setupScrollTriggers() {
  // Feature cards animation
  ScrollTrigger.create({
    trigger: '.features-showcase',
    start: 'top 80%',
    onEnter: () => animateFeatureCards()
  });
  
  // Demo section animation
  ScrollTrigger.create({
    trigger: '.demo-section',
    start: 'top 80%',
    onEnter: () => animateDemoSection()
  });
}

// Start the onboarding experience
function startOnboarding() {
  // Animate in the first step
  animateStepIn(1);
  
  // Update progress
  updateProgress();
  
  // Start stagger animations
  startStaggerAnimations();
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
    updateProgressDots();
    updateNavigationButtons();
    updateProgress();
    
    // Step-specific stagger animations
    animateStepSpecificStaggers(currentStep);
    
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

// Update progress dots
function updateProgressDots() {
  progressDots.forEach((dot, index) => {
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
    finishBtn.style.display = 'flex';
  } else {
    nextBtn.style.display = 'flex';
    finishBtn.style.display = 'none';
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

// Step-specific stagger animations
function animateStepSpecificStaggers(step) {
  switch (step) {
    case 1:
      animateWelcomeStaggers();
      break;
    case 2:
      animateFeaturesStaggers();
      break;
    case 3:
      animateDemoStaggers();
      break;
    case 4:
      animateReadyStaggers();
      break;
  }
}

// Welcome step stagger animations
function animateWelcomeStaggers() {
  const tl = gsap.timeline();
  
  tl.to('.step-header', {
    y: 0,
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out'
  })
  .to('.stagger-item', {
    y: 0,
    opacity: 1,
    rotation: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'back.out(1.7)'
  }, '-=0.4')
  .to('.step-description', {
    y: 0,
    opacity: 1,
    duration: 0.6,
    ease: 'power2.out'
  }, '-=0.2');
}

// Features step stagger animations
function animateFeaturesStaggers() {
  const tl = gsap.timeline();
  
  tl.to('.step-header', {
    y: 0,
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out'
  })
  .to('.feature-card', {
    y: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.2,
    ease: 'back.out(1.7)'
  }, '-=0.4');
  
  // Animate feature previews with stagger
  animateFeaturePreviews();
}

// Feature previews stagger animations
function animateFeaturePreviews() {
  // Animation demo elements
  gsap.to('.demo-element', {
    scale: 1,
    rotation: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: 'back.out(1.7)',
    delay: 0.5
  });
  
  // RTL lines
  gsap.to('.rtl-line', {
    x: 0,
    opacity: 1,
    duration: 0.6,
    stagger: 0.15,
    ease: 'power2.out',
    delay: 0.8
  });
  
  // Social items
  gsap.to('.social-item', {
    y: 0,
    opacity: 1,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power2.out',
    delay: 1.1
  });
  
  // Performance metrics
  gsap.to('.metric-item', {
    scale: 1,
    opacity: 1,
    duration: 0.6,
    stagger: 0.1,
    ease: 'back.out(1.7)',
    delay: 1.4
  });
}

// Demo step stagger animations
function animateDemoStaggers() {
  const tl = gsap.timeline();
  
  tl.to('.step-header', {
    y: 0,
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out'
  })
  .to('.demo-workspace', {
    y: 0,
    opacity: 1,
    scale: 1,
    duration: 1,
    ease: 'power2.out'
  }, '-=0.4')
  .to('.sidebar-header', {
    y: 0,
    opacity: 1,
    duration: 0.6,
    ease: 'power2.out'
  }, '-=0.6')
  .to('.menu-item', {
    x: 0,
    opacity: 1,
    duration: 0.5,
    stagger: 0.1,
    ease: 'power2.out'
  }, '-=0.4')
  .to('.feed-item', {
    y: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.2,
    ease: 'back.out(1.7)'
  }, '-=0.2');
}

// Ready step stagger animations
function animateReadyStaggers() {
  const tl = gsap.timeline();
  
  tl.to('.step-header', {
    y: 0,
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out'
  })
  .to('.success-visual', {
    y: 0,
    opacity: 1,
    duration: 1,
    ease: 'power2.out'
  }, '-=0.4')
  .to('.star', {
    scale: 1,
    opacity: 1,
    duration: 0.6,
    stagger: 0.1,
    ease: 'back.out(1.7)'
  }, '-=0.6')
  .to('.metric-card', {
    y: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.1,
    ease: 'back.out(1.7)'
  }, '-=0.4')
  .to('.final-cta', {
    y: 0,
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out'
  }, '-=0.2');
  
  // Animate rocket
  gsap.to('.rocket', {
    y: -20,
    rotation: 0,
    duration: 2,
    ease: 'power2.inOut',
    repeat: -1,
    yoyo: true,
    delay: 1
  });
}

// Start stagger animations
function startStaggerAnimations() {
  // Animate stagger items in sequence
  gsap.to('.stagger-item', {
    y: 0,
    opacity: 1,
    rotation: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'back.out(1.7)',
    delay: 0.5
  });
}

// Animate feature cards
function animateFeatureCards() {
  gsap.to('.feature-card', {
    y: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.2,
    ease: 'back.out(1.7)'
  });
}

// Animate demo section
function animateDemoSection() {
  gsap.to('.demo-workspace', {
    y: 0,
    opacity: 1,
    scale: 1,
    duration: 1,
    ease: 'power2.out'
  });
}

// Set up interactive elements
function setupInteractiveElements() {
  // Stagger item hover effects
  document.querySelectorAll('.stagger-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      gsap.to(item, {
        y: -10,
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    item.addEventListener('mouseleave', () => {
      gsap.to(item, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  });

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

  // Metric card hover effects
  document.querySelectorAll('.metric-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        y: -5,
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
      animateStepSpecificStaggers(currentStep);
    }, 300);
  }
}

// Finish onboarding
function finishOnboarding() {
  // Animate out all elements
  gsap.to('.onboarding-container', {
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
      <p>You've experienced the power of GSAP stagger animations!</p>
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
      finishOnboarding();
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
    startStaggerAnimations();
  }
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
  initStaggerOnboarding();
  monitorPerformance();
});

// Export functions for external use
window.StaggerOnboarding = {
  goToStep,
  toggleLanguage,
  finishOnboarding,
  currentStep: () => currentStep,
  totalSteps: () => totalSteps
};
