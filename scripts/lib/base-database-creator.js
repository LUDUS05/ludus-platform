#!/usr/bin/env node

/**
 * Base Database Creator
 * Abstract class for creating Notion databases with views
 */

class BaseDatabaseCreator {
  constructor(notionHelper, config = {}) {
    this.notion = notionHelper;
    this.config = config;
    this.dryRun = config.dryRun || false;
  }

  /**
   * Main creation method - to be implemented by subclasses
   */
  async create(parentId) {
    throw new Error('create() method must be implemented by subclass');
  }

  /**
   * Get database schema - to be implemented by subclasses
   */
  getDatabaseSchema() {
    throw new Error('getDatabaseSchema() method must be implemented by subclass');
  }

  /**
   * Get database views configuration - to be implemented by subclasses
   */
  getViewsConfiguration() {
    return [];
  }

  /**
   * Create database with properties
   */
  async createDatabase(title, parentId, properties, icon = null) {
    if (this.dryRun) {
      console.log(`   [DRY RUN] Would create database: ${title}`);
      return { id: `dry-run-${Date.now()}`, title };
    }

    return await this.notion.createDatabase({
      title,
      parentId,
      properties,
      icon
    });
  }

  /**
   * Build property schema helpers
   */
  buildProperty = {
    title: () => ({ title: {} }),
    
    richText: () => ({ rich_text: {} }),
    
    number: (format = 'number') => ({ 
      number: { format } 
    }),
    
    select: (options) => ({
      select: {
        options: options.map(opt => ({
          name: opt.name || opt,
          color: opt.color || this._getDefaultColor(opt.name || opt)
        }))
      }
    }),
    
    multiSelect: (options) => ({
      multi_select: {
        options: options.map(opt => ({
          name: opt.name || opt,
          color: opt.color || this._getDefaultColor(opt.name || opt)
        }))
      }
    }),
    
    status: (options, groups = []) => {
      const statusOptions = options.map(opt => ({
        name: opt.name || opt,
        color: opt.color || this._getDefaultColor(opt.name || opt)
      }));

      const statusConfig = { options: statusOptions };
      
      if (groups.length > 0) {
        statusConfig.groups = groups;
      }

      return { status: statusConfig };
    },
    
    date: () => ({ date: {} }),
    
    people: () => ({ people: {} }),
    
    files: () => ({ files: {} }),
    
    checkbox: () => ({ checkbox: {} }),
    
    url: () => ({ url: {} }),
    
    email: () => ({ email: {} }),
    
    phoneNumber: () => ({ phone_number: {} }),
    
    formula: (expression) => ({
      formula: { expression }
    }),
    
    relation: (databaseId, syncedPropertyName = null) => {
      const config = {
        relation: {
          database_id: databaseId,
          type: 'dual_property'
        }
      };
      
      if (syncedPropertyName) {
        config.relation.synced_property_name = syncedPropertyName;
      }
      
      return config;
    },
    
    rollup: (relationPropertyName, propertyName, function_type) => ({
      rollup: {
        relation_property_name: relationPropertyName,
        rollup_property_name: propertyName,
        function: function_type
      }
    }),
    
    createdTime: () => ({ created_time: {} }),
    
    createdBy: () => ({ created_by: {} }),
    
    lastEditedTime: () => ({ last_edited_time: {} }),
    
    lastEditedBy: () => ({ last_edited_by: {} })
  };

  /**
   * Get default color for option
   */
  _getDefaultColor(name) {
    const colorMap = {
      // Status colors
      'planning': 'gray',
      'in progress': 'blue',
      'review': 'yellow',
      'completed': 'green',
      'on hold': 'red',
      'blocked': 'red',
      'done': 'green',
      'to do': 'gray',
      'todo': 'gray',
      
      // Priority colors
      'critical': 'red',
      'urgent': 'red',
      'high': 'orange',
      'medium': 'yellow',
      'low': 'green',
      'p0': 'red',
      'p1': 'orange',
      'p2': 'yellow',
      'p3': 'green',
      
      // Risk colors
      'low': 'green',
      'medium': 'yellow',
      'high': 'orange',
      
      // Category colors
      'development': 'blue',
      'design': 'purple',
      'marketing': 'pink',
      'operations': 'brown',
      'legal': 'gray',
      'finance': 'green',
      
      // General
      'active': 'green',
      'inactive': 'gray',
      'pending': 'yellow',
      'approved': 'green',
      'rejected': 'red',
      'draft': 'gray',
      'published': 'green',
      'archived': 'gray'
    };

    return colorMap[name.toLowerCase()] || 'default';
  }

  /**
   * Log creation progress
   */
  log(message, type = 'info') {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      progress: '⏳'
    };
    
    console.log(`   ${icons[type] || '•'} ${message}`);
  }

  /**
   * Validate configuration
   */
  validateConfig() {
    if (!this.notion) {
      throw new Error('NotionHelper instance is required');
    }
    return true;
  }
}

module.exports = { BaseDatabaseCreator };

