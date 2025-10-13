#!/usr/bin/env node

/**
 * Tasks & Issues Database Creator/Enhancer
 * Creates or enhances development tasks database
 */

const { BaseDatabaseCreator } = require('../lib/base-database-creator');

class TasksDatabaseCreator extends BaseDatabaseCreator {
  constructor(notionHelper, config = {}) {
    super(notionHelper, config);
    this.databaseName = 'Development Tasks';
  }

  /**
   * Get database schema
   */
  getDatabaseSchema(projectsDatabaseId = null) {
    const schema = {
      'Task Name': this.buildProperty.title(),
      
      'Description': this.buildProperty.richText(),
      
      'Status': this.buildProperty.status([
        { name: 'Backlog', color: 'gray' },
        { name: 'To Do', color: 'gray' },
        { name: 'In Progress', color: 'blue' },
        { name: 'Review', color: 'yellow' },
        { name: 'Done', color: 'green' },
        { name: 'Blocked', color: 'red' }
      ]),
      
      'Assignee': this.buildProperty.people(),
      
      'Due Date': this.buildProperty.date(),
      
      'Priority': this.buildProperty.select([
        { name: 'Urgent', color: 'red' },
        { name: 'High', color: 'orange' },
        { name: 'Medium', color: 'yellow' },
        { name: 'Low', color: 'green' }
      ]),
      
      'Task Type': this.buildProperty.select([
        { name: 'Development', color: 'blue' },
        { name: 'Design', color: 'purple' },
        { name: 'Testing', color: 'yellow' },
        { name: 'Documentation', color: 'green' },
        { name: 'Meeting', color: 'pink' },
        { name: 'Bug Fix', color: 'red' },
        { name: 'Feature', color: 'blue' },
        { name: 'Refactor', color: 'orange' }
      ]),
      
      'Story Points': this.buildProperty.number('number'),
      
      'Time Estimate': this.buildProperty.number('number'),
      
      'Time Spent': this.buildProperty.number('number'),
      
      'Linear Issue URL': this.buildProperty.url(),
      
      'GitHub Issue URL': this.buildProperty.url(),
      
      'Labels': this.buildProperty.multiSelect([
        'Frontend',
        'Backend',
        'API',
        'Database',
        'UI/UX',
        'Testing',
        'DevOps',
        'Security',
        'Performance',
        'Bug',
        'Enhancement',
        'Documentation'
      ]),
      
      'Notes': this.buildProperty.richText(),
      
      'Created Time': this.buildProperty.createdTime(),
      
      'Last Edited': this.buildProperty.lastEditedTime()
    };

    // Add Project relation if projectsDatabaseId is provided
    if (projectsDatabaseId) {
      schema['Project'] = this.buildProperty.relation(projectsDatabaseId, 'Tasks');
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
      { type: 'emoji', emoji: '✅' }
    );
    
    this.log(`${this.databaseName} created successfully`, 'success');
    
    return database;
  }

  /**
   * Add Sprint relation after Sprint database is created
   */
  async addSprintRelation(tasksDatabaseId, sprintsDatabaseId) {
    try {
      this.log('Adding Sprint relation property...', 'info');
      
      await this.notion.updateDatabase(tasksDatabaseId, {
        properties: {
          'Sprint': this.buildProperty.relation(sprintsDatabaseId, 'Sprint Tasks')
        }
      });
      
      this.log('Sprint relation added', 'success');
      return true;
    } catch (error) {
      this.log(`Failed to add Sprint relation: ${error.message}`, 'error');
      return false;
    }
  }
}

module.exports = { TasksDatabaseCreator };

// Allow running standalone
if (require.main === module) {
  const { NotionHelperExtended } = require('../lib/notion-helper-extended');
  const { ConfigManager } = require('../lib/config-manager');
  
  async function main() {
    try {
      const notion = new NotionHelperExtended({ token: process.env.NOTION_TOKEN });
      const config = new ConfigManager();
      const creator = new TasksDatabaseCreator(notion);
      
      const parentId = config.getPageId('project_management');
      const projectsDatabaseId = config.getDatabaseId('projects');
      
      if (!parentId) {
        console.error('❌ Parent page ID not found. Run main orchestrator first.');
        process.exit(1);
      }
      
      const database = await creator.create(parentId, projectsDatabaseId);
      
      config.updateDatabase('tasks', {
        id: database.id,
        name: creator.databaseName,
        created: new Date().toISOString()
      });
      
      console.log('\n✅ Development Tasks Database setup complete!');
      console.log(`   Database ID: ${database.id}`);
      
    } catch (error) {
      console.error('❌ Failed to create database:', error.message);
      process.exit(1);
    }
  }
  
  main();
}

