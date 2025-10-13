#!/usr/bin/env node

/**
 * Budget & Financial Tracking Database Creator
 * Creates comprehensive financial management database
 */

const { BaseDatabaseCreator } = require('../lib/base-database-creator');

class BudgetDatabaseCreator extends BaseDatabaseCreator {
  constructor(notionHelper, config = {}) {
    super(notionHelper, config);
    this.databaseName = 'Budget & Financial Tracking';
  }

  /**
   * Get database schema
   */
  getDatabaseSchema(projectsDatabaseId = null) {
    const schema = {
      'Item Name': this.buildProperty.title(),
      
      'Description': this.buildProperty.richText(),
      
      'Category': this.buildProperty.select([
        { name: 'Development', color: 'blue' },
        { name: 'Design', color: 'purple' },
        { name: 'Infrastructure', color: 'red' },
        { name: 'Marketing', color: 'pink' },
        { name: 'Operations', color: 'brown' },
        { name: 'Legal', color: 'gray' },
        { name: 'Salaries', color: 'green' },
        { name: 'Tools & Software', color: 'yellow' },
        { name: 'Office & Admin', color: 'orange' }
      ]),
      
      'Budget Type': this.buildProperty.select([
        { name: 'CAPEX', color: 'blue' },
        { name: 'OPEX', color: 'green' },
        { name: 'One-time', color: 'yellow' },
        { name: 'Recurring', color: 'orange' }
      ]),
      
      'Planned Amount SAR': this.buildProperty.number('dollar'),
      
      'Actual Amount SAR': this.buildProperty.number('dollar'),
      
      'Variance SAR': this.buildProperty.formula('prop("Actual Amount SAR") - prop("Planned Amount SAR")'),
      
      'Variance %': this.buildProperty.formula('if(prop("Planned Amount SAR") > 0, round(((prop("Actual Amount SAR") - prop("Planned Amount SAR")) / prop("Planned Amount SAR")) * 100), 0)'),
      
      'Budget Period': this.buildProperty.date(),
      
      'Approval Status': this.buildProperty.select([
        { name: 'Pending', color: 'yellow' },
        { name: 'Approved', color: 'green' },
        { name: 'Rejected', color: 'red' },
        { name: 'Under Review', color: 'blue' }
      ]),
      
      'Approver': this.buildProperty.people(),
      
      'KPI Category': this.buildProperty.select([
        { name: 'Revenue', color: 'green' },
        { name: 'Cost', color: 'red' },
        { name: 'Efficiency', color: 'blue' },
        { name: 'Quality', color: 'purple' },
        { name: 'Growth', color: 'yellow' }
      ]),
      
      'Target Value': this.buildProperty.number('number'),
      
      'Actual Value': this.buildProperty.number('number'),
      
      'Payment Status': this.buildProperty.select([
        { name: 'Not Paid', color: 'gray' },
        { name: 'Partially Paid', color: 'yellow' },
        { name: 'Fully Paid', color: 'green' },
        { name: 'Overdue', color: 'red' }
      ]),
      
      'Invoice Number': this.buildProperty.richText(),
      
      'Notes': this.buildProperty.richText(),
      
      'Created Time': this.buildProperty.createdTime(),
      
      'Last Edited': this.buildProperty.lastEditedTime()
    };

    // Add Project relation if projectsDatabaseId is provided
    if (projectsDatabaseId) {
      schema['Project'] = this.buildProperty.relation(projectsDatabaseId, 'Budget Items');
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
      { type: 'emoji', emoji: '💰' }
    );
    
    this.log(`${this.databaseName} created successfully`, 'success');
    
    return database;
  }
}

module.exports = { BudgetDatabaseCreator };

// Allow running standalone
if (require.main === module) {
  const { NotionHelperExtended } = require('../lib/notion-helper-extended');
  const { ConfigManager } = require('../lib/config-manager');
  
  async function main() {
    try {
      const notion = new NotionHelperExtended({ token: process.env.NOTION_TOKEN });
      const config = new ConfigManager();
      const creator = new BudgetDatabaseCreator(notion);
      
      const parentId = config.getPageId('main');
      const projectsDatabaseId = config.getDatabaseId('projects');
      
      if (!parentId) {
        console.error('❌ Parent page ID not found. Run main orchestrator first.');
        process.exit(1);
      }
      
      const database = await creator.create(parentId, projectsDatabaseId);
      
      config.updateDatabase('budget', {
        id: database.id,
        name: creator.databaseName,
        created: new Date().toISOString()
      });
      
      console.log('\n✅ Budget & Financial Tracking Database setup complete!');
      console.log(`   Database ID: ${database.id}`);
      
    } catch (error) {
      console.error('❌ Failed to create database:', error.message);
      process.exit(1);
    }
  }
  
  main();
}

