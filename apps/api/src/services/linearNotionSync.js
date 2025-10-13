/**
 * Linear to Notion Sync Service
 * Automatically syncs Linear issues to Notion tasks database
 */

const { Client } = require('@notionhq/client');
const { LinearClient } = require('@linear/sdk');

class LinearNotionSyncService {
  constructor() {
    this.notion = new Client({ auth: process.env.NOTION_API_KEY });
    
    // Only initialize Linear client if API key is provided
    if (process.env.LINEAR_API_KEY) {
      this.linear = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });
    } else {
      this.linear = null;
      console.log('⚠️  Linear API key not provided - Linear integration disabled');
    }
    
    this.notionDatabaseId = process.env.NOTION_TASKS_DATABASE_ID || '9efe5329-42c7-49d1-920e-c927f4d4602c';
    
    // Status mapping: Linear -> Notion
    this.statusMapping = {
      'Backlog': 'Backlog',
      'Todo': 'Backlog',
      'In Progress': 'In Progress',
      'Done': 'Done',
      'Completed': 'Done',
      'Canceled': 'Blocked',
      'Cancelled': 'Blocked'
    };

    // Priority mapping: Linear (0-4) -> Notion
    this.priorityMapping = {
      0: null,        // No priority
      1: 'Critical',  // Urgent
      2: 'High',      // High
      3: 'Medium',    // Medium
      4: 'Medium'     // Low -> Medium (Notion doesn't have Low)
    };
  }

  /**
   * Process Linear webhook event
   * @param {Object} webhookData - Linear webhook payload
   */
  async processWebhook(webhookData) {
    try {
      if (!this.linear) {
        console.log('⚠️  Linear client not available - skipping webhook processing');
        return { success: false, message: 'Linear API key not provided' };
      }
      
      const { action, data, type } = webhookData;

      console.log(`[Linear Webhook] Received: ${type} - ${action}`);

      // Only process issue events
      if (type !== 'Issue') {
        console.log(`[Linear Webhook] Ignoring non-issue event: ${type}`);
        return { success: true, message: 'Event type not processed' };
      }

      // Get the issue data
      const issueId = data.id;
      const issue = await this.getLinearIssue(issueId);

      if (!issue) {
        console.error(`[Linear Webhook] Issue not found: ${issueId}`);
        return { success: false, error: 'Issue not found' };
      }

      // Check if task exists in Notion
      const notionTask = await this.findNotionTaskByLinearId(issue.identifier);

      if (action === 'create') {
        if (!notionTask) {
          await this.createNotionTask(issue);
          return { success: true, message: 'Task created in Notion' };
        }
        return { success: true, message: 'Task already exists' };
      }

      if (action === 'update') {
        if (notionTask) {
          await this.updateNotionTask(notionTask.id, issue);
          return { success: true, message: 'Task updated in Notion' };
        } else {
          await this.createNotionTask(issue);
          return { success: true, message: 'Task created in Notion' };
        }
      }

      if (action === 'remove') {
        if (notionTask) {
          await this.archiveNotionTask(notionTask.id);
          return { success: true, message: 'Task archived in Notion' };
        }
        return { success: true, message: 'Task not found in Notion' };
      }

      return { success: true, message: 'No action taken' };
    } catch (error) {
      console.error('[Linear Webhook] Error processing webhook:', error);
      throw error;
    }
  }

  /**
   * Get Linear issue details
   * @param {string} issueId - Linear issue ID
   */
  async getLinearIssue(issueId) {
    try {
      if (!this.linear) {
        throw new Error('Linear client not available');
      }
      
      const issue = await this.linear.issue(issueId);
      const state = await issue.state;
      const priority = issue.priority;
      const assignee = await issue.assignee;

      return {
        id: issue.id,
        identifier: issue.identifier, // e.g., "LET-23"
        title: issue.title,
        description: issue.description || '',
        status: state?.name || 'Backlog',
        priority: priority || 0,
        assignee: assignee?.name || '',
        dueDate: issue.dueDate || null,
        url: issue.url,
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt
      };
    } catch (error) {
      console.error('[Linear] Error fetching issue:', error);
      return null;
    }
  }

  /**
   * Find Notion task by Linear identifier
   * @param {string} linearIdentifier - Linear issue identifier (e.g., "LET-23")
   */
  async findNotionTaskByLinearId(linearIdentifier) {
    try {
      const response = await this.notion.databases.query({
        database_id: this.notionDatabaseId,
        filter: {
          property: 'Task Name',
          title: {
            contains: linearIdentifier
          }
        }
      });

      if (response.results.length > 0) {
        return response.results[0];
      }

      return null;
    } catch (error) {
      console.error('[Notion] Error finding task:', error);
      return null;
    }
  }

  /**
   * Create new task in Notion
   * @param {Object} linearIssue - Linear issue data
   */
  async createNotionTask(linearIssue) {
    try {
      const notionStatus = this.statusMapping[linearIssue.status] || 'Backlog';
      const notionPriority = this.priorityMapping[linearIssue.priority];

      const properties = {
        'Task Name': {
          title: [
            {
              text: {
                content: `${linearIssue.identifier}: ${linearIssue.title}`
              }
            }
          ]
        },
        'Status': {
          select: {
            name: notionStatus
          }
        },
        'Source Link': {
          rich_text: [
            {
              text: {
                content: linearIssue.url || ''
              }
            }
          ]
        }
      };

      // Add priority if available
      if (notionPriority) {
        properties['Priority'] = {
          select: {
            name: notionPriority
          }
        };
      }

      // Add due date if available
      if (linearIssue.dueDate) {
        properties['Due Date'] = {
          date: {
            start: linearIssue.dueDate
          }
        };
      }

      // Add assignee if available
      if (linearIssue.assignee) {
        properties['Assignee'] = {
          rich_text: [
            {
              text: {
                content: linearIssue.assignee
              }
            }
          ]
        };
      }

      const response = await this.notion.pages.create({
        parent: {
          database_id: this.notionDatabaseId
        },
        properties
      });

      console.log(`[Notion] Created task: ${linearIssue.identifier}`);
      return response;
    } catch (error) {
      console.error('[Notion] Error creating task:', error);
      throw error;
    }
  }

  /**
   * Update existing task in Notion
   * @param {string} notionPageId - Notion page ID
   * @param {Object} linearIssue - Linear issue data
   */
  async updateNotionTask(notionPageId, linearIssue) {
    try {
      const notionStatus = this.statusMapping[linearIssue.status] || 'Backlog';
      const notionPriority = this.priorityMapping[linearIssue.priority];

      const properties = {
        'Task Name': {
          title: [
            {
              text: {
                content: `${linearIssue.identifier}: ${linearIssue.title}`
              }
            }
          ]
        },
        'Status': {
          select: {
            name: notionStatus
          }
        },
        'Source Link': {
          rich_text: [
            {
              text: {
                content: linearIssue.url || ''
              }
            }
          ]
        }
      };

      // Add priority if available
      if (notionPriority) {
        properties['Priority'] = {
          select: {
            name: notionPriority
          }
        };
      }

      // Add due date if available
      if (linearIssue.dueDate) {
        properties['Due Date'] = {
          date: {
            start: linearIssue.dueDate
          }
        };
      }

      // Add assignee if available
      if (linearIssue.assignee) {
        properties['Assignee'] = {
          rich_text: [
            {
              text: {
                content: linearIssue.assignee
              }
            }
          ]
        };
      }

      const response = await this.notion.pages.update({
        page_id: notionPageId,
        properties
      });

      console.log(`[Notion] Updated task: ${linearIssue.identifier}`);
      return response;
    } catch (error) {
      console.error('[Notion] Error updating task:', error);
      throw error;
    }
  }

  /**
   * Archive task in Notion
   * @param {string} notionPageId - Notion page ID
   */
  async archiveNotionTask(notionPageId) {
    try {
      const response = await this.notion.pages.update({
        page_id: notionPageId,
        archived: true
      });

      console.log(`[Notion] Archived task: ${notionPageId}`);
      return response;
    } catch (error) {
      console.error('[Notion] Error archiving task:', error);
      throw error;
    }
  }

  /**
   * Sync all Linear issues to Notion (initial sync)
   * @param {Object} options - Sync options
   */
  async syncAllIssues(options = {}) {
    try {
      const { teamId, status, limit = 100 } = options;

      console.log('[Sync] Starting full sync from Linear to Notion...');

      // Get all issues from Linear
      const issues = await this.linear.issues({
        first: limit,
        filter: teamId ? { team: { id: { eq: teamId } } } : undefined
      });

      let created = 0;
      let updated = 0;
      let skipped = 0;

      for (const issue of issues.nodes) {
        const state = await issue.state;
        const priority = issue.priority;
        const assignee = await issue.assignee;

        const linearIssue = {
          id: issue.id,
          identifier: issue.identifier,
          title: issue.title,
          description: issue.description || '',
          status: state?.name || 'Backlog',
          priority: priority || 0,
          assignee: assignee?.name || '',
          dueDate: issue.dueDate || null,
          url: issue.url,
          createdAt: issue.createdAt,
          updatedAt: issue.updatedAt
        };

        // Check if task exists in Notion
        const notionTask = await this.findNotionTaskByLinearId(linearIssue.identifier);

        if (!notionTask) {
          await this.createNotionTask(linearIssue);
          created++;
        } else {
          await this.updateNotionTask(notionTask.id, linearIssue);
          updated++;
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      console.log(`[Sync] Completed: ${created} created, ${updated} updated, ${skipped} skipped`);

      return {
        success: true,
        created,
        updated,
        skipped,
        total: issues.nodes.length
      };
    } catch (error) {
      console.error('[Sync] Error during full sync:', error);
      throw error;
    }
  }
}

module.exports = LinearNotionSyncService;

