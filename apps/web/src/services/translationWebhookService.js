/**
 * Translation Webhook Service
 * Handles automatic scanning triggers when content changes
 */

class TranslationWebhookService {
  constructor() {
    this.webhooks = new Map();
    this.scanTriggers = new Set();
    this.isInitialized = false;
  }

  /**
   * Initialize the webhook service
   */
  async initialize() {
    if (this.isInitialized) return;
    
    console.log('🔗 Initializing Translation Webhook Service...');
    
    // Register webhook endpoints
    this.registerWebhooks();
    
    // Set up content change listeners
    this.setupContentChangeListeners();
    
    // Set up file system watchers (if available)
    this.setupFileWatchers();
    
    this.isInitialized = true;
    console.log('✅ Translation Webhook Service initialized');
  }

  /**
   * Register webhook endpoints for different content types
   */
  registerWebhooks() {
    // Page content changes
    this.webhooks.set('page-content-changed', {
      endpoint: '/api/webhooks/page-content-changed',
      handler: this.handlePageContentChange.bind(this),
      description: 'Triggered when page content is modified'
    });

    // Component changes
    this.webhooks.set('component-changed', {
      endpoint: '/api/webhooks/component-changed',
      handler: this.handleComponentChange.bind(this),
      description: 'Triggered when React components are modified'
    });

    // Translation file changes
    this.webhooks.set('translation-changed', {
      endpoint: '/api/webhooks/translation-changed',
      handler: this.handleTranslationChange.bind(this),
      description: 'Triggered when translation files are modified'
    });

    // New content added
    this.webhooks.set('content-added', {
      endpoint: '/api/webhooks/content-added',
      handler: this.handleContentAdded.bind(this),
      description: 'Triggered when new content is added'
    });

    // Content deleted
    this.webhooks.set('content-deleted', {
      endpoint: '/api/webhooks/content-deleted',
      handler: this.handleContentDeleted.bind(this),
      description: 'Triggered when content is deleted'
    });
  }

  /**
   * Set up content change listeners
   */
  setupContentChangeListeners() {
    // Listen for DOM changes that might indicate new content
    if (typeof window !== 'undefined') {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            this.handleDOMContentChange(mutation);
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  /**
   * Set up file system watchers (for development)
   */
  setupFileWatchers() {
    // This would integrate with your build system or file watcher
    // For now, we'll simulate with periodic checks
    if (process.env.NODE_ENV === 'development') {
      this.setupDevelopmentWatchers();
    }
  }

  /**
   * Set up development file watchers
   */
  setupDevelopmentWatchers() {
    // Check for changes every 30 seconds in development
    setInterval(() => {
      this.checkForFileChanges();
    }, 30000);
  }

  /**
   * Check for file changes
   */
  async checkForFileChanges() {
    try {
      // This would check file modification times or use a file watcher
      const lastCheck = localStorage.getItem('lastFileCheck') || '0';
      const currentTime = Date.now();
      
      // Simulate file change detection
      if (currentTime - parseInt(lastCheck) > 30000) {
        localStorage.setItem('lastFileCheck', currentTime.toString());
        
        // Trigger a scan if significant time has passed
        this.triggerScan('file-change-detected', {
          timestamp: currentTime,
          type: 'periodic-check'
        });
      }
    } catch (error) {
      console.error('❌ File change check failed:', error);
    }
  }

  /**
   * Handle page content changes
   */
  async handlePageContentChange(payload) {
    console.log('📄 Page content changed:', payload);
    
    await this.triggerScan('page-content-changed', {
      pageId: payload.pageId,
      pageTitle: payload.pageTitle,
      changes: payload.changes,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle component changes
   */
  async handleComponentChange(payload) {
    console.log('🧩 Component changed:', payload);
    
    await this.triggerScan('component-changed', {
      componentName: payload.componentName,
      filePath: payload.filePath,
      changes: payload.changes,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle translation file changes
   */
  async handleTranslationChange(payload) {
    console.log('🌐 Translation changed:', payload);
    
    await this.triggerScan('translation-changed', {
      language: payload.language,
      keys: payload.keys,
      changes: payload.changes,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle new content added
   */
  async handleContentAdded(payload) {
    console.log('➕ Content added:', payload);
    
    await this.triggerScan('content-added', {
      contentType: payload.contentType,
      contentId: payload.contentId,
      content: payload.content,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle content deleted
   */
  async handleContentDeleted(payload) {
    console.log('➖ Content deleted:', payload);
    
    await this.triggerScan('content-deleted', {
      contentType: payload.contentType,
      contentId: payload.contentId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle DOM content changes
   */
  async handleDOMContentChange(mutation) {
    // Check if new content contains hardcoded text
    const addedNodes = Array.from(mutation.addedNodes);
    let hasHardcodedText = false;
    
    addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const textContent = node.textContent || '';
        // Simple check for hardcoded English text patterns
        if (textContent.match(/[A-Z][a-z]+ [A-Z][a-z]+/)) {
          hasHardcodedText = true;
        }
      }
    });
    
    if (hasHardcodedText) {
      await this.triggerScan('dom-content-changed', {
        mutation: mutation,
        hasHardcodedText: true,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Trigger a translation scan
   */
  async triggerScan(triggerType, payload) {
    try {
      console.log(`🔍 Triggering scan due to: ${triggerType}`);
      
      // Add to scan triggers
      this.scanTriggers.add({
        type: triggerType,
        payload: payload,
        timestamp: new Date().toISOString()
      });
      
      // Import and use the scan service
      const { default: translationScanService } = await import('./translationScanService');
      
      // Perform the scan
      const results = await translationScanService.performFullScan();
      
      // Store results with trigger information
      const scanRecord = {
        id: Date.now(),
        triggerType: triggerType,
        triggerPayload: payload,
        results: results,
        timestamp: new Date().toISOString()
      };
      
      // Save to localStorage or send to API
      this.saveScanRecord(scanRecord);
      
      // Notify subscribers
      this.notifyScanComplete(scanRecord);
      
      return results;
      
    } catch (error) {
      console.error('❌ Scan trigger failed:', error);
      throw error;
    }
  }

  /**
   * Save scan record
   */
  saveScanRecord(scanRecord) {
    try {
      const existingRecords = JSON.parse(
        localStorage.getItem('translationScanRecords') || '[]'
      );
      
      const updatedRecords = [scanRecord, ...existingRecords.slice(0, 49)]; // Keep last 50
      
      localStorage.setItem('translationScanRecords', JSON.stringify(updatedRecords));
    } catch (error) {
      console.error('❌ Failed to save scan record:', error);
    }
  }

  /**
   * Notify subscribers of scan completion
   */
  notifyScanComplete(scanRecord) {
    // Dispatch custom event
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('translationScanComplete', {
        detail: scanRecord
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * Get scan triggers history
   */
  getScanTriggers() {
    return Array.from(this.scanTriggers);
  }

  /**
   * Get scan records
   */
  getScanRecords() {
    try {
      return JSON.parse(localStorage.getItem('translationScanRecords') || '[]');
    } catch (error) {
      console.error('❌ Failed to get scan records:', error);
      return [];
    }
  }

  /**
   * Clear scan history
   */
  clearScanHistory() {
    this.scanTriggers.clear();
    localStorage.removeItem('translationScanRecords');
    console.log('🗑️ Scan history cleared');
  }

  /**
   * Register a custom webhook
   */
  registerCustomWebhook(name, endpoint, handler, description) {
    this.webhooks.set(name, {
      endpoint: endpoint,
      handler: handler,
      description: description
    });
    
    console.log(`🔗 Registered custom webhook: ${name}`);
  }

  /**
   * Unregister a webhook
   */
  unregisterWebhook(name) {
    if (this.webhooks.has(name)) {
      this.webhooks.delete(name);
      console.log(`🔗 Unregistered webhook: ${name}`);
    }
  }

  /**
   * Get all registered webhooks
   */
  getWebhooks() {
    return Array.from(this.webhooks.entries()).map(([name, config]) => ({
      name,
      ...config
    }));
  }

  /**
   * Test a webhook
   */
  async testWebhook(name, testPayload = {}) {
    const webhook = this.webhooks.get(name);
    if (!webhook) {
      throw new Error(`Webhook ${name} not found`);
    }
    
    try {
      await webhook.handler(testPayload);
      console.log(`✅ Webhook ${name} test successful`);
      return true;
    } catch (error) {
      console.error(`❌ Webhook ${name} test failed:`, error);
      return false;
    }
  }
}

// Create singleton instance
const translationWebhookService = new TranslationWebhookService();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  translationWebhookService.initialize();
}

export default translationWebhookService;
