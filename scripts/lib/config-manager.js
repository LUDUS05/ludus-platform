#!/usr/bin/env node

/**
 * Configuration Manager
 * Manages workspace configuration and state
 */

const fs = require('fs');
const path = require('path');

class ConfigManager {
  constructor(configPath = null) {
    this.configPath = configPath || path.join(process.cwd(), 'config', 'workspace-config.json');
    this.config = this.load();
  }

  /**
   * Load configuration from file
   */
  load() {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf8');
        return JSON.parse(data);
      }
      console.warn('⚠️  Configuration file not found, using defaults');
      return this.getDefaultConfig();
    } catch (error) {
      console.error('❌ Failed to load configuration:', error.message);
      return this.getDefaultConfig();
    }
  }

  /**
   * Save configuration to file
   */
  save() {
    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      this.config.workspace.lastUpdated = new Date().toISOString();
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error('❌ Failed to save configuration:', error.message);
      return false;
    }
  }

  /**
   * Get default configuration
   */
  getDefaultConfig() {
    return {
      workspace: {
        name: 'LUDUS Platform Management',
        description: 'Comprehensive project management system',
        version: '1.0.0',
        lastUpdated: null
      },
      databases: {},
      pages: {},
      integrations: {},
      automation: {},
      settings: {
        timezone: 'Asia/Riyadh',
        currency: 'SAR',
        dateFormat: 'YYYY-MM-DD',
        locale: 'ar-SA'
      }
    };
  }

  /**
   * Update database configuration
   */
  updateDatabase(key, data) {
    if (!this.config.databases[key]) {
      this.config.databases[key] = {};
    }
    
    this.config.databases[key] = {
      ...this.config.databases[key],
      ...data,
      updated: new Date().toISOString()
    };
    
    this.save();
  }

  /**
   * Update page configuration
   */
  updatePage(key, data) {
    if (!this.config.pages[key]) {
      this.config.pages[key] = {};
    }
    
    this.config.pages[key] = {
      ...this.config.pages[key],
      ...data,
      updated: new Date().toISOString()
    };
    
    this.save();
  }

  /**
   * Get database ID by key
   */
  getDatabaseId(key) {
    return this.config.databases[key]?.id || null;
  }

  /**
   * Get page ID by key
   */
  getPageId(key) {
    return this.config.pages[key]?.id || null;
  }

  /**
   * Get all database IDs
   */
  getAllDatabaseIds() {
    const ids = {};
    for (const [key, value] of Object.entries(this.config.databases)) {
      if (value.id) {
        ids[key] = value.id;
      }
    }
    return ids;
  }

  /**
   * Get all page IDs
   */
  getAllPageIds() {
    const ids = {};
    for (const [key, value] of Object.entries(this.config.pages)) {
      if (value.id) {
        ids[key] = value.id;
      }
    }
    return ids;
  }

  /**
   * Check if database exists
   */
  databaseExists(key) {
    return !!(this.config.databases[key]?.id);
  }

  /**
   * Check if page exists
   */
  pageExists(key) {
    return !!(this.config.pages[key]?.id);
  }

  /**
   * Get integration settings
   */
  getIntegration(name) {
    return this.config.integrations[name] || null;
  }

  /**
   * Update integration settings
   */
  updateIntegration(name, data) {
    this.config.integrations[name] = {
      ...this.config.integrations[name],
      ...data
    };
    this.save();
  }

  /**
   * Get automation settings
   */
  getAutomation(name) {
    return this.config.automation[name] || null;
  }

  /**
   * Update automation settings
   */
  updateAutomation(name, data) {
    this.config.automation[name] = {
      ...this.config.automation[name],
      ...data
    };
    this.save();
  }

  /**
   * Get settings
   */
  getSettings() {
    return this.config.settings || {};
  }

  /**
   * Update settings
   */
  updateSettings(data) {
    this.config.settings = {
      ...this.config.settings,
      ...data
    };
    this.save();
  }

  /**
   * Export configuration
   */
  export(filePath) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(this.config, null, 2), 'utf8');
      console.log(`✅ Configuration exported to: ${filePath}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to export configuration:', error.message);
      return false;
    }
  }

  /**
   * Import configuration
   */
  import(filePath) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      this.config = JSON.parse(data);
      this.save();
      console.log(`✅ Configuration imported from: ${filePath}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to import configuration:', error.message);
      return false;
    }
  }

  /**
   * Reset configuration
   */
  reset() {
    this.config = this.getDefaultConfig();
    this.save();
    console.log('✅ Configuration reset to defaults');
  }

  /**
   * Get configuration summary
   */
  getSummary() {
    const dbCount = Object.keys(this.config.databases).filter(key => 
      this.config.databases[key].id
    ).length;
    
    const pageCount = Object.keys(this.config.pages).filter(key => 
      this.config.pages[key].id
    ).length;

    return {
      workspace: this.config.workspace.name,
      version: this.config.workspace.version,
      lastUpdated: this.config.workspace.lastUpdated,
      databases: dbCount,
      pages: pageCount,
      integrations: Object.keys(this.config.integrations).filter(key =>
        this.config.integrations[key]?.enabled
      ).length
    };
  }

  /**
   * Print configuration summary
   */
  printSummary() {
    const summary = this.getSummary();
    console.log('\n📊 Workspace Configuration Summary:');
    console.log(`   Workspace: ${summary.workspace}`);
    console.log(`   Version: ${summary.version}`);
    console.log(`   Last Updated: ${summary.lastUpdated || 'Never'}`);
    console.log(`   Databases: ${summary.databases}`);
    console.log(`   Pages: ${summary.pages}`);
    console.log(`   Active Integrations: ${summary.integrations}`);
    console.log('');
  }
}

module.exports = { ConfigManager };

