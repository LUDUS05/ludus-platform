#!/usr/bin/env node

/**
 * Team Directory Database Creator
 * Creates team member management and directory database
 */

const { BaseDatabaseCreator } = require('../lib/base-database-creator');

class TeamDatabaseCreator extends BaseDatabaseCreator {
  constructor(notionHelper, config = {}) {
    super(notionHelper, config);
    this.databaseName = 'Team Directory';
  }

  /**
   * Get database schema
   */
  getDatabaseSchema(projectsDatabaseId = null) {
    const schema = {
      'Name': this.buildProperty.title(),
      
      'Email': this.buildProperty.email(),
      
      'Phone': this.buildProperty.phoneNumber(),
      
      'Role': this.buildProperty.select([
        { name: 'Project Manager', color: 'red' },
        { name: 'Developer', color: 'blue' },
        { name: 'Senior Developer', color: 'blue' },
        { name: 'Designer', color: 'purple' },
        { name: 'DevOps Engineer', color: 'orange' },
        { name: 'QA Engineer', color: 'yellow' },
        { name: 'Business Analyst', color: 'green' },
        { name: 'Product Manager', color: 'pink' },
        { name: 'Operations Manager', color: 'brown' },
        { name: 'Marketing Manager', color: 'pink' }
      ]),
      
      'Department': this.buildProperty.select([
        { name: 'Management', color: 'red' },
        { name: 'Development', color: 'blue' },
        { name: 'Design', color: 'purple' },
        { name: 'Operations', color: 'brown' },
        { name: 'Marketing', color: 'pink' },
        { name: 'Finance', color: 'green' },
        { name: 'Legal', color: 'gray' },
        { name: 'HR', color: 'yellow' }
      ]),
      
      'Employment Type': this.buildProperty.select([
        { name: 'Full-time', color: 'green' },
        { name: 'Part-time', color: 'yellow' },
        { name: 'Contractor', color: 'blue' },
        { name: 'Consultant', color: 'purple' },
        { name: 'Intern', color: 'orange' }
      ]),
      
      'Start Date': this.buildProperty.date(),
      
      'Location': this.buildProperty.select([
        { name: 'Riyadh', color: 'green' },
        { name: 'Remote', color: 'blue' },
        { name: 'Hybrid', color: 'yellow' },
        { name: 'Other', color: 'gray' }
      ]),
      
      'Capacity %': this.buildProperty.number('percent'),
      
      'Notion Permissions': this.buildProperty.select([
        { name: 'Admin', color: 'red' },
        { name: 'Editor', color: 'blue' },
        { name: 'Viewer', color: 'gray' },
        { name: 'Comment Only', color: 'yellow' }
      ]),
      
      'Tool Access': this.buildProperty.multiSelect([
        'Linear',
        'GitHub',
        'Notion',
        'Slack',
        'Figma',
        'Render',
        'Firebase',
        'MongoDB',
        'AWS',
        'Google Workspace'
      ]),
      
      'Skills': this.buildProperty.multiSelect([
        'JavaScript',
        'TypeScript',
        'React',
        'Node.js',
        'Python',
        'MongoDB',
        'Firebase',
        'AWS',
        'DevOps',
        'UI/UX Design',
        'Project Management',
        'Agile/Scrum',
        'API Development',
        'Testing',
        'Security'
      ]),
      
      'Status': this.buildProperty.select([
        { name: 'Active', color: 'green' },
        { name: 'On Leave', color: 'yellow' },
        { name: 'Inactive', color: 'gray' },
        { name: 'Offboarding', color: 'red' }
      ]),
      
      'Emergency Contact': this.buildProperty.phoneNumber(),
      
      'Bio': this.buildProperty.richText(),
      
      'Notes': this.buildProperty.richText(),
      
      'Created Time': this.buildProperty.createdTime(),
      
      'Last Edited': this.buildProperty.lastEditedTime()
    };

    // Add Manager self-relation
    // Note: This will be added after database creation

    // Add Current Projects relation if projectsDatabaseId is provided
    if (projectsDatabaseId) {
      schema['Current Projects'] = this.buildProperty.relation(projectsDatabaseId, 'Team Members');
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
      { type: 'emoji', emoji: '👥' }
    );
    
    this.log(`${this.databaseName} created successfully`, 'success');
    
    return database;
  }

  /**
   * Add Manager self-relation after database creation
   */
  async addManagerRelation(databaseId) {
    try {
      this.log('Adding Manager relation property...', 'info');
      
      await this.notion.updateDatabase(databaseId, {
        properties: {
          'Manager': this.buildProperty.relation(databaseId, 'Direct Reports')
        }
      });
      
      this.log('Manager relation added', 'success');
      return true;
    } catch (error) {
      this.log(`Failed to add Manager relation: ${error.message}`, 'error');
      return false;
    }
  }
}

module.exports = { TeamDatabaseCreator };

// Allow running standalone
if (require.main === module) {
  const { NotionHelperExtended } = require('../lib/notion-helper-extended');
  const { ConfigManager } = require('../lib/config-manager');
  
  async function main() {
    try {
      const notion = new NotionHelperExtended({ token: process.env.NOTION_TOKEN });
      const config = new ConfigManager();
      const creator = new TeamDatabaseCreator(notion);
      
      const parentId = config.getPageId('main');
      const projectsDatabaseId = config.getDatabaseId('projects');
      
      if (!parentId) {
        console.error('❌ Parent page ID not found. Run main orchestrator first.');
        process.exit(1);
      }
      
      const database = await creator.create(parentId, projectsDatabaseId);
      
      // Add self-relation for Manager
      await creator.addManagerRelation(database.id);
      
      config.updateDatabase('team', {
        id: database.id,
        name: creator.databaseName,
        created: new Date().toISOString()
      });
      
      console.log('\n✅ Team Directory Database setup complete!');
      console.log(`   Database ID: ${database.id}`);
      
    } catch (error) {
      console.error('❌ Failed to create database:', error.message);
      process.exit(1);
    }
  }
  
  main();
}

