#!/usr/bin/env node

/**
 * Linear-Notion Bi-directional Sync
 * Syncs tasks between Linear and Notion with conflict resolution
 */

const { LinearHelperExtended } = require('../lib/linear-helper-extended');
const { NotionHelperExtended } = require('../lib/notion-helper-extended');
const { ConfigManager } = require('../lib/config-manager');
const { parseArgs, loadEnv } = require('../lib/utils');

class LinearNotionSync {
  constructor(options = {}) {
    loadEnv('development.env');
    
    this.linear = new LinearHelperExtended({ token: process.env.LINEAR_API_KEY });
    this.notion = new NotionHelperExtended({ token: process.env.NOTION_TOKEN });
    this.config = new ConfigManager();
    
    this.dryRun = options.dryRun || false;
    this.direction = options.direction || 'both'; // 'linear-to-notion', 'notion-to-linear', 'both'
  }

  /**
   * Main sync method
   */
  async sync() {
    console.log('\n🔄 Linear-Notion Bidirectional Sync');
    console.log('===================================\n');
    
    const tasksDbId = this.config.getDatabaseId('tasks');
    if (!tasksDbId) {
      throw new Error('Tasks database not found. Run workspace setup first.');
    }
    
    const stats = {
      linearToNotion: 0,
      notionToLinear: 0,
      conflicts: 0,
      errors: []
    };
    
    try {
      if (this.direction === 'linear-to-notion' || this.direction === 'both') {
        stats.linearToNotion = await this.syncLinearToNotion(tasksDbId);
      }
      
      if (this.direction === 'notion-to-linear' || this.direction === 'both') {
        stats.notionToLinear = await this.syncNotionToLinear(tasksDbId);
      }
      
      console.log('\n✅ Sync completed successfully!');
      console.log(`   Linear → Notion: ${stats.linearToNotion} tasks`);
      console.log(`   Notion → Linear: ${stats.notionToLinear} tasks`);
      console.log(`   Conflicts: ${stats.conflicts}`);
      
      if (stats.errors.length > 0) {
        console.log(`\n⚠️  ${stats.errors.length} errors occurred:`);
        stats.errors.forEach(err => console.log(`   • ${err}`));
      }
      
    } catch (error) {
      console.error('\n❌ Sync failed:', error.message);
      throw error;
    }
  }

  /**
   * Sync Linear issues to Notion tasks
   */
  async syncLinearToNotion(tasksDbId) {
    console.log('📥 Syncing Linear → Notion...');
    
    // Get all Notion tasks with Linear URLs
    const notionTasks = await this.notion.queryDatabase(tasksDbId, {
      filter: {
        property: 'Linear Issue URL',
        url: { is_not_empty: true }
      }
    });
    
    let synced = 0;
    
    for (const notionTask of notionTasks) {
      try {
        const linearUrl = notionTask.properties['Linear Issue URL']?.url;
        if (!linearUrl) continue;
        
        // Extract Linear issue ID from URL
        const issueId = this.extractLinearIssueId(linearUrl);
        if (!issueId) continue;
        
        // Get Linear issue details
        const linearIssue = await this.linear.getIssueDetails(issueId);
        if (!linearIssue) continue;
        
        // Check if update is needed
        const needsUpdate = this.checkIfNotionNeedsUpdate(notionTask, linearIssue);
        if (!needsUpdate) continue;
        
        // Update Notion task
        if (!this.dryRun) {
          await this.updateNotionFromLinear(notionTask.id, linearIssue);
        }
        
        synced++;
        console.log(`   ✓ Synced: ${linearIssue.identifier} - ${linearIssue.title}`);
        
      } catch (error) {
        console.log(`   ✗ Error syncing task: ${error.message}`);
      }
    }
    
    return synced;
  }

  /**
   * Sync Notion tasks to Linear issues
   */
  async syncNotionToLinear(tasksDbId) {
    console.log('📤 Syncing Notion → Linear...');
    
    // Get Notion tasks modified in last 24 hours with Linear URLs
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const notionTasks = await this.notion.queryDatabase(tasksDbId, {
      filter: {
        and: [
          {
            property: 'Linear Issue URL',
            url: { is_not_empty: true }
          },
          {
            property: 'Last Edited',
            last_edited_time: { after: yesterday.toISOString() }
          }
        ]
      }
    });
    
    let synced = 0;
    
    for (const notionTask of notionTasks) {
      try {
        const linearUrl = notionTask.properties['Linear Issue URL']?.url;
        if (!linearUrl) continue;
        
        const issueId = this.extractLinearIssueId(linearUrl);
        if (!issueId) continue;
        
        const linearIssue = await this.linear.getIssueDetails(issueId);
        if (!linearIssue) continue;
        
        // Check if Linear needs update
        const needsUpdate = this.checkIfLinearNeedsUpdate(notionTask, linearIssue);
        if (!needsUpdate) continue;
        
        // Update Linear issue
        if (!this.dryRun) {
          await this.updateLinearFromNotion(issueId, notionTask);
        }
        
        synced++;
        console.log(`   ✓ Synced: ${notionTask.properties['Task Name']?.title[0]?.plain_text}`);
        
      } catch (error) {
        console.log(`   ✗ Error syncing task: ${error.message}`);
      }
    }
    
    return synced;
  }

  /**
   * Extract Linear issue ID from URL
   */
  extractLinearIssueId(url) {
    const match = url.match(/issue\/([A-Z]+-\d+)/);
    return match ? match[1] : null;
  }

  /**
   * Check if Notion task needs update from Linear
   */
  checkIfNotionNeedsUpdate(notionTask, linearIssue) {
    const notionStatus = notionTask.properties['Status']?.status?.name;
    const linearStatus = this.linear.mapStateToNotion(linearIssue.state);
    
    return notionStatus !== linearStatus;
  }

  /**
   * Check if Linear issue needs update from Notion
   */
  checkIfLinearNeedsUpdate(notionTask, linearIssue) {
    const notionStatus = notionTask.properties['Status']?.status?.name;
    const linearStatus = this.linear.mapStateToNotion(linearIssue.state);
    
    return notionStatus !== linearStatus;
  }

  /**
   * Update Notion task from Linear issue
   */
  async updateNotionFromLinear(notionTaskId, linearIssue) {
    const updates = {
      'Status': {
        status: {
          name: this.linear.mapStateToNotion(linearIssue.state)
        }
      },
      'Priority': {
        select: {
          name: this.linear.mapPriorityToNotion(linearIssue.priority)
        }
      }
    };
    
    if (linearIssue.dueDate) {
      updates['Due Date'] = {
        date: {
          start: linearIssue.dueDate
        }
      };
    }
    
    if (linearIssue.estimate) {
      updates['Story Points'] = {
        number: linearIssue.estimate
      };
    }
    
    await this.notion.updatePage(notionTaskId, updates);
  }

  /**
   * Update Linear issue from Notion task
   */
  async updateLinearFromNotion(linearIssueId, notionTask) {
    const status = notionTask.properties['Status']?.status?.name;
    const priority = notionTask.properties['Priority']?.select?.name;
    
    const updates = {};
    
    if (status) {
      const stateType = this.linear.mapStatusToLinear(status);
      // Get workflow state ID for this state type
      const states = await this.linear.getWorkflowStates();
      const state = states.find(s => s.type === stateType);
      if (state) {
        updates.stateId = state.id;
      }
    }
    
    if (priority) {
      updates.priority = this.linear.mapPriorityToLinear(priority);
    }
    
    await this.linear.updateIssue(linearIssueId, updates);
  }
}

// Main execution
async function main() {
  const args = parseArgs(process.argv.slice(2));
  
  const sync = new LinearNotionSync({
    dryRun: args['dry-run'] || false,
    direction: args.direction || 'both'
  });
  
  await sync.sync();
}

if (require.main === module) {
  main().catch(error => {
    console.error('Sync failed:', error);
    process.exit(1);
  });
}

module.exports = { LinearNotionSync };

