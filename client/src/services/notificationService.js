// frontend/src/services/notificationService.js
import { gsap } from '../utils/gsap-setup';
import { animationPresets, rtlAware } from '../utils/gsap-setup';

class LUDUSNotificationService {
  constructor() {
    this.container = null;
    this.notifications = new Map();
    this.init();
  }

  init() {
    // Create notification container
    this.container = document.createElement('div');
    this.container.className = 'ludus-notification-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
      max-width: 400px;
    `;
    
    // RTL support
    const isRTL = document.dir === 'rtl' || document.documentElement.dir === 'rtl';
    if (isRTL) {
      this.container.style.right = 'auto';
      this.container.style.left = '20px';
    }
    
    document.body.appendChild(this.container);
  }

  show(type, message, duration = 4000, options = {}) {
    const notification = this.createNotification(type, message, options);
    const id = Date.now() + Math.random();
    
    this.notifications.set(id, notification);
    this.container.appendChild(notification);
    
    const tl = gsap.timeline({
      onComplete: () => this.remove(id)
    });
    
    // RTL-aware entrance animation
    const isRTL = document.dir === 'rtl' || document.documentElement.dir === 'rtl';
    const entranceX = isRTL ? -20 : 20;
    
    tl.from(notification, {
      duration: 0.5,
      y: -50,
      x: entranceX,
      opacity: 0,
      scale: 0.9,
      ease: 'back.out(1.7)'
    })
    .to(notification, {
      duration: 0.3,
      y: -70,
      opacity: 0,
      scale: 0.95,
      ease: 'power2.in',
      delay: duration / 1000
    });

    // Auto-remove after duration
    setTimeout(() => {
      if (this.notifications.has(id)) {
        this.remove(id);
      }
    }, duration);

    return id;
  }

  createNotification(type, message, options = {}) {
    const notification = document.createElement('div');
    notification.className = `ludus-notification ludus-notification--${type}`;
    
    // Base styles
    notification.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      border-left: 4px solid;
      pointer-events: auto;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.4;
      max-width: 100%;
      word-wrap: break-word;
    `;

    // Type-specific styling
    const typeStyles = {
      success: {
        borderLeftColor: '#10b981',
        color: '#065f46'
      },
      error: {
        borderLeftColor: '#ef4444',
        color: '#991b1b'
      },
      warning: {
        borderLeftColor: '#f59e0b',
        color: '#92400e'
      },
      info: {
        borderLeftColor: '#3b82f6',
        color: '#1e40af'
      }
    };

    const style = typeStyles[type] || typeStyles.info;
    Object.assign(notification.style, style);

    // Add icon and content
    const icon = this.getIcon(type);
    notification.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div class="notification-icon" style="flex-shrink: 0; margin-top: 2px;">
          ${icon}
        </div>
        <div class="notification-content" style="flex: 1;">
          <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" style="
          flex-shrink: 0;
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #6b7280;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">×</button>
      </div>
    `;

    // Add click handlers
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.remove(notification);
    });

    return notification;
  }

  getIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }

  remove(idOrElement) {
    let notification;
    
    if (typeof idOrElement === 'number') {
      notification = this.notifications.get(idOrElement);
      this.notifications.delete(idOrElement);
    } else {
      notification = idOrElement;
      // Find and remove from map
      for (const [id, notif] of this.notifications.entries()) {
        if (notif === notification) {
          this.notifications.delete(id);
          break;
        }
      }
    }

    if (notification && notification.parentNode) {
      gsap.to(notification, {
        duration: 0.3,
        x: rtlAware.transform(100, 0).x,
        opacity: 0,
        scale: 0.9,
        ease: 'power2.in',
        onComplete: () => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }
      });
    }
  }

  // Show notification from API responses
  showFromAPIResponse(response) {
    if (response.animationTriggers) {
      const { errorMessage, successMessage, errorShake } = response.animationTriggers;
      
      if (errorMessage) {
        this.show('error', errorMessage);
        if (errorShake) this.triggerErrorShake();
      }
      
      if (successMessage) {
        this.show('success', successMessage);
      }
    }
  }

  triggerErrorShake() {
    const mainContainer = document.querySelector('.main-container') || document.body;
    gsap.to(mainContainer, {
      duration: 0.1,
      x: 5,
      repeat: 5,
      yoyo: true,
      ease: 'power2.inOut'
    });
  }

  // Clear all notifications
  clear() {
    this.notifications.forEach((notification, id) => {
      this.remove(id);
    });
  }
}

// Create singleton instance
export const notificationService = new LUDUSNotificationService();
export default notificationService;