#!/usr/bin/env node

/**
 * Projects Master Database Creator
 * Creates comprehensive project management database
 */

const { BaseDatabaseCreator } = require('../lib/base-database-creator');

class ProjectsDatabaseCreator extends BaseDatabaseCreator {
  constructor(notionHelper, config = {}) {
    super(notionHelper, config);
    this.databaseName = 'LUDUS Projects Master';
  }

  /**
   * Get database schema
   */
  getDatabaseSchema() {
    return {
      'Project Name': this.buildProperty.title(),
      
      'Description': this.buildProperty.richText(),
      
      'Phase': this.buildProperty.select([
        { name: 'Planning', color: 'gray' },
        { name: 'Design', color: 'purple' },
        { name: 'Development', color: 'blue' },
        { name: 'Testing', color: 'yellow' },
        { name: 'Deployment', color: 'orange' },
        { name: 'Operations', color: 'green' },
        { name: 'Complete', color: 'green' }
      ]),
      
      'Priority': this.buildProperty.select([
        { name: 'P0 - Critical', color: 'red' },
        { name: 'P1 - High', color: 'orange' },
        { name: 'P2 - Medium', color: 'yellow' },
        { name: 'P3 - Low', color: 'green' }
      ]),
      
      'Owner': this.buildProperty.people(),
      
      'Start Date': this.buildProperty.date(),
      
      'End Date': this.buildProperty.date(),
      
      'Progress': this.buildProperty.number('percent'),
      
      'Budget SAR': this.buildProperty.number('dollar'),
      
      'Actual Cost SAR': this.buildProperty.number('dollar'),
      
      'Category': this.buildProperty.select([
        { name: 'Development', color: 'blue' },
        { name: 'Design', color: 'purple' },
        { name: 'Marketing', color: 'pink' },
        { name: 'Operations', color: 'brown' },
        { name: 'Legal', color: 'gray' },
        { name: 'Finance', color: 'green' },
        { name: 'Infrastructure', color: 'red' }
      ]),
      
      'Milestone': this.buildProperty.checkbox(),
      
      'Risk Level': this.buildProperty.select([
        { name: 'Low', color: 'green' },
        { name: 'Medium', color: 'yellow' },
        { name: 'High', color: 'orange' },
        { name: 'Critical', color: 'red' }
      ]),
      
      'Status': this.buildProperty.status([
        { name: 'Not Started', color: 'gray' },
        { name: 'In Progress', color: 'blue' },
        { name: 'Blocked', color: 'red' },
        { name: 'Review', color: 'yellow' },
        { name: 'Done', color: 'green' }
      ], [
        {
          name: 'To Do',
          option_ids: []
        },
        {
          name: 'In Progress',
          option_ids: []
        },
        {
          name: 'Complete',
          option_ids: []
        }
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
      { type: 'emoji', emoji: '📊' }
    );
    
    this.log(`${this.databaseName} created successfully`, 'success');
    
    return database;
  }

  /**
   * Add Dependencies relation after database creation
   */
  async addDependenciesRelation(databaseId) {
    try {
      this.log('Adding Dependencies relation property...', 'info');
      
      await this.notion.updateDatabase(databaseId, {
        properties: {
          'Dependencies': this.buildProperty.relation(databaseId, 'Dependent Projects')
        }
      });
      
      this.log('Dependencies relation added', 'success');
      return true;
    } catch (error) {
      this.log(`Failed to add Dependencies relation: ${error.message}`, 'error');
      return false;
    }
  }
}

module.exports = { ProjectsDatabaseCreator };

// Allow running standalone
if (require.main === module) {
  const { NotionHelperExtended } = require('../lib/notion-helper-extended');
  const { ConfigManager } = require('../lib/config-manager');
  
  async function main() {
    try {
      const notion = new NotionHelperExtended({ token: process.env.NOTION_TOKEN });
      const config = new ConfigManager();
      const creator = new ProjectsDatabaseCreator(notion);
      
      // Get parent page ID from config or create new page
      const parentId = config.getPageId('project_management');
      
      if (!parentId) {
        console.error('❌ Parent page ID not found. Run main orchestrator first.');
        process.exit(1);
      }
      
      const database = await creator.create(parentId);
      
      // Update config
      config.updateDatabase('projects', {
        id: database.id,
        name: creator.databaseName,
        created: new Date().toISOString()
      });
      
      // Add self-relation for dependencies
      await creator.addDependenciesRelation(database.id);
      
      console.log('\n✅ Projects Master Database setup complete!');
      console.log(`   Database ID: ${database.id}`);
      
    } catch (error) {
      console.error('❌ Failed to create database:', error.message);
      process.exit(1);
    }
  }
  
  main();
}

