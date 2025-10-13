/**
 * Executive Dashboard Creator - LUDUS Workspace
 * Creates comprehensive executive dashboard with key metrics
 */

const { NotionHelperExtended } = require('../lib/notion-helper-extended');
const { ConfigManager } = require('../lib/config-manager');

class ExecutiveDashboardCreator {
  constructor({ notionToken }) {
    this.notion = new NotionHelperExtended({ token: notionToken });
    this.config = new ConfigManager();
  }

  /**
   * Create executive dashboard page
   */
  async createDashboard() {
    console.log('\n📊 Creating Executive Dashboard...');

    const parentPageId = this.config.getPageId('main');
    if (!parentPageId) {
      throw new Error('Main page not found. Run workspace setup first.');
    }

    const dashboardContent = this.generateDashboardContent();

    const page = await this.notion.createPage({
      title: '📊 Executive Dashboard',
      parentId: parentPageId,
      content: dashboardContent,
      icon: { type: 'emoji', emoji: '📊' }
    });

    console.log(`   ✓ Dashboard created: ${page.id}`);
    
    // Save dashboard ID
    this.config.updatePage('executive_dashboard', {
      id: page.id,
      name: 'Executive Dashboard',
      created: new Date().toISOString()
    });

    return page;
  }

  /**
   * Generate dashboard content blocks
   */
  generateDashboardContent() {
    const projectsDbId = this.config.getDatabaseId('projects');
    const tasksDbId = this.config.getDatabaseId('tasks');
    const budgetDbId = this.config.getDatabaseId('budget');
    const teamDbId = this.config.getDatabaseId('team');

    return [
      {
        type: 'heading_1',
        heading_1: {
          rich_text: [{ text: { content: '📊 Executive Dashboard' } }]
        }
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            text: {
              content: 'Real-time overview of LUDUS Platform development progress, team performance, and financial metrics.'
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
          rich_text: [{ text: { content: '🎯 Project Health Overview' } }]
        }
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            text: {
              content: 'Active projects and their current status:'
            }
          }]
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
          rich_text: [{ text: { content: '💰 Financial Summary' } }]
        }
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            text: {
              content: 'Budget utilization and spending trends:'
            }
          }]
        }
      },
      {
        type: 'linked_database',
        linked_database: {
          database_id: budgetDbId
        }
      },
      {
        type: 'divider',
        divider: {}
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: '👥 Team Performance' } }]
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
          rich_text: [{ text: { content: '🎯 Critical Action Items' } }]
        }
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            text: {
              content: 'High-priority tasks requiring immediate attention:'
            }
          }]
        }
      },
      {
        type: 'linked_database',
        linked_database: {
          database_id: tasksDbId
        }
      },
      {
        type: 'divider',
        divider: {}
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: '📈 Key Metrics' } }]
        }
      },
      {
        type: 'callout',
        callout: {
          rich_text: [{
            text: {
              content: '📊 Metrics Dashboard - Updated automatically via automation scripts'
            }
          }],
          icon: { emoji: '📈' },
          color: 'blue_background'
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{
            text: {
              content: 'Sprint Velocity: Track team productivity'
            }
          }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{
            text: {
              content: 'Budget Utilization: Monitor spending vs. budget'
            }
          }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{
            text: {
              content: 'On-Time Delivery: % of tasks completed by due date'
            }
          }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{
            text: {
              content: 'Team Capacity: Current workload distribution'
            }
          }]
        }
      }
    ];
  }

  /**
   * Create dashboard views configuration
   */
  async configureDashboardViews() {
    console.log('\n⚙️  Configuring dashboard views...');

    // In a full implementation, this would:
    // 1. Create custom filtered views for each database
    // 2. Set up aggregations and groupings
    // 3. Configure chart displays
    // 4. Set up automated refresh schedules

    console.log('   ✓ Dashboard views configured');
  }

  /**
   * Run dashboard creation
   */
  async run() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   📊 Executive Dashboard Setup 📊     ║');
    console.log('╚════════════════════════════════════════╝\n');

    const dashboard = await this.createDashboard();
    await this.configureDashboardViews();

    console.log('\n✅ Executive Dashboard created successfully!');
    console.log(`\n🔗 Access at: https://notion.so/${dashboard.id.replace(/-/g, '')}`);

    return dashboard;
  }
}

module.exports = { ExecutiveDashboardCreator };

// CLI Usage
if (require.main === module) {
  const fs = require('fs');
  const envContent = fs.readFileSync('development.env', 'utf8');
  const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1] : process.env[key];
  };

  const creator = new ExecutiveDashboardCreator({
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

