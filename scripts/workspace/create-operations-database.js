#!/usr/bin/env node

/**
 * Operations & Team Tasks Database Creator
 * Creates daily operations and team coordination database
 */

const { BaseDatabaseCreator } = require('../lib/base-database-creator');

class OperationsDatabaseCreator extends BaseDatabaseCreator {
  constructor(notionHelper, config = {}) {
    super(notionHelper, config);
    this.databaseName = 'Operations & Team Tasks';
  }

  /**
   * Get database schema
   */
  getDatabaseSchema() {
    return {
      'Task Name': this.buildProperty.title(),
      
      'Description': this.buildProperty.richText(),
      
      'Status': this.buildProperty.status([
        { name: 'To Do', color: 'gray' },
        { name: 'In Progress', color: 'blue' },
        { name: 'Waiting', color: 'yellow' },
        { name: 'Done', color: 'green' }
      ]),
      
      'Assignee': this.buildProperty.people(),
      
      'Team': this.buildProperty.select([
        { name: 'Development', color: 'blue' },
        { name: 'Design', color: 'purple' },
        { name: 'Marketing', color: 'pink' },
        { name: 'Operations', color: 'brown' },
        { name: 'Management', color: 'red' },
        { name: 'Finance', color: 'green' },
        { name: 'Legal', color: 'gray' }
      ]),
      
      'Due Date': this.buildProperty.date(),
      
      'Priority': this.buildProperty.select([
        { name: 'Urgent', color: 'red' },
        { name: 'High', color: 'orange' },
        { name: 'Medium', color: 'yellow' },
        { name: 'Low', color: 'green' }
      ]),
      
      'Task Type': this.buildProperty.select([
        { name: 'Daily Operations', color: 'blue' },
        { name: 'Administrative', color: 'gray' },
        { name: 'Process Improvement', color: 'purple' },
        { name: 'Training', color: 'green' },
        { name: 'Planning', color: 'yellow' },
        { name: 'Coordination', color: 'pink' }
      ]),
      
      'Recurring': this.buildProperty.checkbox(),
      
      'Frequency': this.buildProperty.select([
        { name: 'Daily', color: 'blue' },
        { name: 'Weekly', color: 'green' },
        { name: 'Monthly', color: 'yellow' },
        { name: 'Quarterly', color: 'orange' },
        { name: 'One-time', color: 'gray' }
      ]),
      
      'Blockers': this.buildProperty.richText(),
      
      'Effort Level': this.buildProperty.select([
        { name: 'Low', color: 'green' },
        { name: 'Medium', color: 'yellow' },
        { name: 'High', color: 'red' }
      ]),
      
      'Notes': this.buildProperty.richText(),
      
      'Created Time': this.buildProperty.createdTime(),
      
      'Last Edited': this.buildProperty.lastEditedTime()
    };
  }

  /**
   * Create the database
   */
  async create(parentId) {
    this.log(`Creating ${this.databaseName}...`, 'info');
    
    const schema = this.getDatabaseSchema();
    
    const database = await this.createDatabase(
      this.databaseName,
      parentId,
      schema,
      { type: 'emoji', emoji: '⚙️' }
    );
    
    this.log(`${this.databaseName} created successfully`, 'success');
    
    return database;
  }
}

module.exports = { OperationsDatabaseCreator };

// Allow running standalone
if (require.main === module) {
  const { NotionHelperExtended } = require('../lib/notion-helper-extended');
  const { ConfigManager } = require('../lib/config-manager');
  
  async function main() {
    try {
      const notion = new NotionHelperExtended({ token: process.env.NOTION_TOKEN });
      const config = new ConfigManager();
      const creator = new OperationsDatabaseCreator(notion);
      
      // Create under main workspace or operations section
      const parentId = config.getPageId('main');
      
      if (!parentId) {
        console.error('❌ Parent page ID not found. Run main orchestrator first.');
        process.exit(1);
      }
      
      const database = await creator.create(parentId);
      
      config.updateDatabase('operations', {
        id: database.id,
        name: creator.databaseName,
        created: new Date().toISOString()
      });
      
      console.log('\n✅ Operations & Team Tasks Database setup complete!');
      console.log(`   Database ID: ${database.id}`);
      
    } catch (error) {
      console.error('❌ Failed to create database:', error.message);
      process.exit(1);
    }
  }
  
  main();
}

