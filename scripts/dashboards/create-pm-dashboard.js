/**
 * Project Manager Dashboard Creator - LUDUS Workspace
 * Creates PM-focused dashboard with project portfolio and resource management
 */

const { NotionHelperExtended } = require('../lib/notion-helper-extended');
const { ConfigManager } = require('../lib/config-manager');

class PMDashboardCreator {
  constructor({ notionToken }) {
    this.notion = new NotionHelperExtended({ token: notionToken });
    this.config = new ConfigManager();
  }

  /**
   * Create PM dashboard page
   */
  async createDashboard() {
    console.log('\n📊 Creating Project Manager Dashboard...');

    const parentPageId = this.config.getPageId('project_management');
    if (!parentPageId) {
      throw new Error('Project Management page not found. Run workspace setup first.');
    }

    const dashboardContent = this.generateDashboardContent();

    const page = await this.notion.createPage({
      title: '🎯 Project Manager Dashboard',
      parentId: parentPageId,
      content: dashboardContent,
      icon: { type: 'emoji', emoji: '🎯' }
    });

    console.log(`   ✓ Dashboard created: ${page.id}`);
    
    // Save dashboard ID
    this.config.updatePage('pm_dashboard', {
      id: page.id,
      name: 'PM Dashboard',
      created: new Date().toISOString()
    });

    return page;
  }

  /**
   * Generate PM dashboard content
   */
  generateDashboardContent() {
    const projectsDbId = this.config.getDatabaseId('projects');
    const tasksDbId = this.config.getDatabaseId('tasks');
    const teamDbId = this.config.getDatabaseId('team');

    return [
      {
        type: 'heading_1',
        heading_1: {
          rich_text: [{ text: { content: '🎯 Project Manager Dashboard' } }]
        }
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            text: {
              content: 'Comprehensive project portfolio management, resource allocation, and timeline tracking.'
            }
          }]
        }
      },
      {
        type: 'divider',
        divider: {}
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: '📂 Project Portfolio' } }]
        }
      },
      {
        type: 'callout',
        callout: {
          rich_text: [{
            text: {
              content: 'Active projects with health status and timeline view'
            }
          }],
          icon: { emoji: '📂' },
          color: 'blue_background'
        }
      },
      {
        type: 'linked_database',
        linked_database: {
          database_id: projectsDbId
        }
      },
      {
        type: 'divider',
        divider: {}
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: '👥 Resource Allocation' } }]
        }
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            text: {
              content: 'Team capacity and workload distribution:'
            }
          }]
        }
      },
      {
        type: 'linked_database',
        linked_database: {
          database_id: teamDbId
        }
      },
      {
        type: 'divider',
        divider: {}
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: '⚠️ Risk Assessment' } }]
        }
      },
      {
        type: 'callout',
        callout: {
          rich_text: [{
            text: {
              content: 'Projects at risk and requiring attention'
            }
          }],
          icon: { emoji: '⚠️' },
          color: 'yellow_background'
        }
      },
      {
        type: 'to_do',
        to_do: {
          rich_text: [{ text: { content: 'Review high-risk projects' } }],
          checked: false
        }
      },
      {
        type: 'to_do',
        to_do: {
          rich_text: [{ text: { content: 'Update project timelines' } }],
          checked: false
        }
      },
      {
        type: 'to_do',
        to_do: {
          rich_text: [{ text: { content: 'Allocate resources for blocked tasks' } }],
          checked: false
        }
      },
      {
        type: 'divider',
        divider: {}
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: '📅 Timeline Adherence' } }]
        }
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            text: {
              content: 'Track project milestones and delivery dates:'
            }
          }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{
            text: {
              content: 'On-time delivery rate: Track % of milestones met on schedule'
            }
          }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{
            text: {
              content: 'Schedule variance: Monitor deviation from planned timelines'
            }
          }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{
            text: {
              content: 'Critical path: Identify tasks blocking project completion'
            }
          }]
        }
      },
      {
        type: 'divider',
        divider: {}
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: '🎯 Sprint Board' } }]
        }
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            text: {
              content: 'Current sprint tasks and progress:'
            }
          }]
        }
      },
      {
        type: 'linked_database',
        linked_database: {
          database_id: tasksDbId
        }
      }
    ];
  }

  /**
   * Run PM dashboard creation
   */
  async run() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║      🎯 PM Dashboard Setup 🎯         ║');
    console.log('╚════════════════════════════════════════╝\n');

    const dashboard = await this.createDashboard();

    console.log('\n✅ PM Dashboard created successfully!');
    console.log(`\n🔗 Access at: https://notion.so/${dashboard.id.replace(/-/g, '')}`);

    return dashboard;
  }
}

module.exports = { PMDashboardCreator };

// CLI Usage
if (require.main === module) {
  const fs = require('fs');
  const envContent = fs.readFileSync('development.env', 'utf8');
  const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1] : process.env[key];
  };

  const creator = new PMDashboardCreator({
    notionToken: getEnv('NOTION_TOKEN')
  });

  creator.run()
    .then(() => {
      console.log('\n✅ Setup complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error:', error.message);
      console.error(error.stack);
      process.exit(1);
    });
}

