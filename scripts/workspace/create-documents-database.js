#!/usr/bin/env node

/**
 * Documents Hub Database Creator
 * Creates document management and knowledge base database
 */

const { BaseDatabaseCreator } = require('../lib/base-database-creator');

class DocumentsDatabaseCreator extends BaseDatabaseCreator {
  constructor(notionHelper, config = {}) {
    super(notionHelper, config);
    this.databaseName = 'Documents Hub';
  }

  /**
   * Get database schema
   */
  getDatabaseSchema(projectsDatabaseId = null) {
    const schema = {
      'Document Name': this.buildProperty.title(),
      
      'Description': this.buildProperty.richText(),
      
      'Document Type': this.buildProperty.select([
        { name: 'Specification', color: 'blue' },
        { name: 'Process', color: 'purple' },
        { name: 'Legal', color: 'red' },
        { name: 'Compliance', color: 'orange' },
        { name: 'Training', color: 'green' },
        { name: 'Meeting Notes', color: 'yellow' },
        { name: 'Technical', color: 'blue' },
        { name: 'Business', color: 'pink' },
        { name: 'Report', color: 'gray' }
      ]),
      
      'Category': this.buildProperty.select([
        { name: 'Technical', color: 'blue' },
        { name: 'Business', color: 'green' },
        { name: 'Legal', color: 'red' },
        { name: 'HR', color: 'purple' },
        { name: 'Marketing', color: 'pink' },
        { name: 'Operations', color: 'brown' },
        { name: 'Finance', color: 'yellow' }
      ]),
      
      'Owner': this.buildProperty.people(),
      
      'Status': this.buildProperty.status([
        { name: 'Draft', color: 'gray' },
        { name: 'In Review', color: 'yellow' },
        { name: 'Approved', color: 'green' },
        { name: 'Published', color: 'blue' },
        { name: 'Archived', color: 'red' }
      ]),
      
      'Created Date': this.buildProperty.createdTime(),
      
      'Last Review Date': this.buildProperty.date(),
      
      'Next Review Date': this.buildProperty.date(),
      
      'Tags': this.buildProperty.multiSelect([
        'Important',
        'Confidential',
        'Public',
        'Internal',
        'Client-Facing',
        'Template',
        'Policy',
        'Guideline',
        'SOP',
        'Reference'
      ]),
      
      'Access Level': this.buildProperty.select([
        { name: 'Public', color: 'green' },
        { name: 'Team Only', color: 'blue' },
        { name: 'Restricted', color: 'yellow' },
        { name: 'Confidential', color: 'red' }
      ]),
      
      'File Attachments': this.buildProperty.files(),
      
      'External Links': this.buildProperty.url(),
      
      'Version': this.buildProperty.richText(),
      
      'Version Notes': this.buildProperty.richText(),
      
      'Reviewers': this.buildProperty.people(),
      
      'Notes': this.buildProperty.richText(),
      
      'Last Edited': this.buildProperty.lastEditedTime()
    };

    // Add Related Projects relation if projectsDatabaseId is provided
    if (projectsDatabaseId) {
      schema['Related Projects'] = this.buildProperty.relation(projectsDatabaseId, 'Documents');
    }

    return schema;
  }

  /**
   * Create the database
   */
  async create(parentId, projectsDatabaseId = null) {
    this.log(`Creating ${this.databaseName}...`, 'info');
    
    const schema = this.getDatabaseSchema(projectsDatabaseId);
    
    const database = await this.createDatabase(
      this.databaseName,
      parentId,
      schema,
      { type: 'emoji', emoji: '📚' }
    );
    
    this.log(`${this.databaseName} created successfully`, 'success');
    
    return database;
  }
}

module.exports = { DocumentsDatabaseCreator };

// Allow running standalone
if (require.main === module) {
  const { NotionHelperExtended } = require('../lib/notion-helper-extended');
  const { ConfigManager } = require('../lib/config-manager');
  
  async function main() {
    try {
      const notion = new NotionHelperExtended({ token: process.env.NOTION_TOKEN });
      const config = new ConfigManager();
      const creator = new DocumentsDatabaseCreator(notion);
      
      const parentId = config.getPageId('documentation');
      const projectsDatabaseId = config.getDatabaseId('projects');
      
      if (!parentId) {
        console.error('❌ Parent page ID not found. Run main orchestrator first.');
        process.exit(1);
      }
      
      const database = await creator.create(parentId, projectsDatabaseId);
      
      config.updateDatabase('documents', {
        id: database.id,
        name: creator.databaseName,
        created: new Date().toISOString()
      });
      
      console.log('\n✅ Documents Hub Database setup complete!');
      console.log(`   Database ID: ${database.id}`);
      
    } catch (error) {
      console.error('❌ Failed to create database:', error.message);
      process.exit(1);
    }
  }
  
  main();
}

