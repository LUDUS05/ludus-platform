/**
 * Project ATHENA - Onboarding JavaScript
 * GSAP Animations and Interactive Features
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
const progressDots = document.querySelectorAll('.progress-dots .dot');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const finishBtn = document.getElementById('finish-btn');
const langToggle = document.getElementById('lang-toggle');
const progressFill = document.querySelector('.progress-fill');
const body = document.body;

// Initialize the onboarding experience
function initOnboarding() {
  console.log('🎬 Project ATHENA Onboarding - Initializing...');
  
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
  finishBtn.addEventListener('click', finishOnboarding);
  
  // Progress dots
  progressDots.forEach((dot, index) => {
    dot.addEventListener('click', () => goToStep(index + 1));
  });
  
  // Language toggle
  langToggle.addEventListener('click', toggleLanguage);
  
  // Feature cards hover effects
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
  gsap.set('.onboarding-step', { opacity: 0, x: 100 });
  gsap.set('.floating-card', { y: 50, opacity: 0, rotation: 10 });
  gsap.set('.feature-card', { y: 30, opacity: 0 });
  gsap.set('.demo-activity-card', { y: 50, opacity: 0 });
  gsap.set('.checkmark', { scale: 0, rotation: -180 });
  gsap.set('.progress-dot', { scale: 0.8, opacity: 0.6 });
  
  // Animate background elements
  animateBackgroundElements();
  
  // Set up scroll triggers
  setupScrollTriggers();
}

// Animate background elements
function animateBackgroundElements() {
  // Animate floating cards
  const floatingCards = document.querySelectorAll('.floating-card');
  floatingCards.forEach((card, index) => {
    gsap.to(card, {
      y: 0,
      opacity: 1,
      rotation: 0,
      duration: 0.8,
      delay: index * 0.2,
      ease: 'back.out(1.7)'
    });
  });
}

// Set up scroll triggers
function setupScrollTriggers() {
  // Feature cards animation
  ScrollTrigger.create({
    trigger: '.features-grid',
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
  
  // Start floating animations
  startFloatingAnimations();
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
    x: -100,
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
    x: 0,
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

// Step-specific animations
function animateStepSpecific(step) {
  switch (step) {
    case 1:
      animateWelcomeStep();
      break;
    case 2:
      animateFeaturesStep();
      break;
    case 3:
      animateDemoStep();
      break;
    case 4:
      animateReadyStep();
      break;
  }
}

// Animate welcome step
function animateWelcomeStep() {
  const tl = gsap.timeline();
  
  tl.to('.step-header', {
    y: 0,
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out'
  })
  .to('.floating-card', {
    y: 0,
    opacity: 1,
    rotation: 0,
    duration: 0.6,
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

// Animate features step
function animateFeaturesStep() {
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
    duration: 0.6,
    stagger: 0.1,
    ease: 'back.out(1.7)'
  }, '-=0.4');
}

// Animate demo step
function animateDemoStep() {
  const tl = gsap.timeline();
  
  tl.to('.step-header', {
    y: 0,
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out'
  })
  .to('.demo-activity-card', {
    y: 0,
    opacity: 1,
    duration: 0.8,
    ease: 'back.out(1.7)'
  }, '-=0.4');
}

// Animate ready step
function animateReadyStep() {
  const tl = gsap.timeline();
  
  tl.to('.step-header', {
    y: 0,
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out'
  })
  .to('.final-cta', {
    y: 0,
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out'
  }, '-=0.4')
  .to('.checkmark', {
    scale: 1,
    rotation: 0,
    duration: 0.8,
    ease: 'back.out(1.7)'
  }, '-=0.6');
}

// Start floating animations
function startFloatingAnimations() {
  const floatingCards = document.querySelectorAll('.floating-card');
  
  floatingCards.forEach((card, index) => {
    gsap.to(card, {
      y: -20,
      duration: 3 + (index * 0.5),
      ease: 'power2.inOut',
      yoyo: true,
      repeat: -1,
      delay: index * 0.5
    });
  });
}

// Animate feature cards
function animateFeatureCards() {
  const featureCards = document.querySelectorAll('.feature-card');
  
  featureCards.forEach((card, index) => {
    gsap.to(card, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      delay: index * 0.1,
      ease: 'back.out(1.7)'
    });
  });
}

// Animate demo section
function animateDemoSection() {
  const demoCard = document.querySelector('.demo-activity-card');
  
  gsap.to(demoCard, {
    y: 0,
    opacity: 1,
    duration: 0.8,
    ease: 'back.out(1.7)'
  });
}

// Set up feature hover effects
function setupFeatureHoverEffects() {
  const featureCards = document.querySelectorAll('.feature-card');
  
  featureCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        y: -10,
        scale: 1.02,
        duration: 0.3,
        ease: 'power2.out'
      });
      
      // Animate demo elements
      const demo = card.querySelector('.feature-demo');
      if (demo) {
        gsap.to(demo, {
          scale: 1.1,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });
    
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
      
      const demo = card.querySelector('.feature-demo');
      if (demo) {
        gsap.to(demo, {
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
  
  // Demo circle animation
  const demoCircles = document.querySelectorAll('.demo-circle');
  demoCircles.forEach(circle => {
    circle.addEventListener('mouseenter', () => {
      gsap.to(circle, {
        scale: 1.2,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    circle.addEventListener('mouseleave', () => {
      gsap.to(circle, {
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
      animateStepSpecific(currentStep);
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
    startFloatingAnimations();
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
window.Onboarding = {
  goToStep,
  toggleLanguage,
  finishOnboarding,
  currentStep: () => currentStep,
  totalSteps: () => totalSteps
};
