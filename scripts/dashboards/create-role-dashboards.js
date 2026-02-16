/**
 * Role-Based Dashboard Creator - LUDUS Workspace
 * Creates role-specific dashboards for developers, designers, QA, operations
 */

const { NotionHelperExtended } = require('../lib/notion-helper-extended');
const { ConfigManager } = require('../lib/config-manager');

class RoleDashboardCreator {
  constructor({ notionToken }) {
    this.notion = new NotionHelperExtended({ token: notionToken });
    this.config = new ConfigManager();
  }

  /**
   * Create developer dashboard
   */
  async createDeveloperDashboard() {
    console.log('\n💻 Creating Developer Dashboard...');

    const parentPageId = this.config.getPageId('development');
    const tasksDbId = this.config.getDatabaseId('tasks');

    const content = [
      {
        type: 'heading_1',
        heading_1: {
          rich_text: [{ text: { content: '💻 Developer Dashboard' } }]
        }
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            text: {
              content: 'Your assigned tasks, code reviews, and technical work.'
            }
          }]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: '🎯 My Tasks' } }]
        }
      },
      {
        type: 'linked_database',
        linked_database: {
          database_id: tasksDbId
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: '🔍 Code Reviews' } }]
        }
      },
      {
        type: 'callout',
        callout: {
          rich_text: [{
            text: {
              content: 'Pull requests awaiting your review'
            }
          }],
          icon: { emoji: '🔍' },
          color: 'blue_background'
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: '📝 Technical Documentation' } }]
        }
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            text: {
              content: 'API docs, architecture decisions, and technical guides'
            }
          }]
        }
      }
    ];

    const page = await this.notion.createPage({
      title: '💻 Developer Dashboard',
      parentId: parentPageId,
      content: content,
      icon: { type: 'emoji', emoji: '💻' }
    });

    console.log(`   ✓ Developer Dashboard created: ${page.id}`);
    return page;
  }

  /**
   * Create designer dashboard
   */
  async createDesignerDashboard() {
    console.log('\n🎨 Creating Designer Dashboard...');

    const parentPageId = this.config.getPageId('development');
    const tasksDbId = this.config.getDatabaseId('tasks');

    const content = [
      {
        type: 'heading_1',
        heading_1: {
          rich_text: [{ text: { content: '🎨 Designer Dashboard' } }]
        }
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            text: {
              content: 'Design tasks, asset management, and UI/UX work.'
            }
          }]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: '🎯 Design Tasks' } }]
        }
      },
      {
        type: 'linked_database',
        linked_database: {
          database_id: tasksDbId
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: '🖼️ Design Assets' } }]
        }
      },
      {
        type: 'callout',
        callout: {
          rich_text: [{
            text: {
              content: 'Figma files, design systems, and brand assets'
            }
          }],
          icon: { emoji: '🖼️' },
          color: 'purple_background'
        }
      }
    ];

    const page = await this.notion.createPage({
      title: '🎨 Designer Dashboard',
      parentId: parentPageId,
      content: content,
      icon: { type: 'emoji', emoji: '🎨' }
    });

    console.log(`   ✓ Designer Dashboard created: ${page.id}`);
    return page;
  }

  /**
   * Create QA dashboard
   */
  async createQADashboard() {
    console.log('\n🧪 Creating QA Dashboard...');

    const parentPageId = this.config.getPageId('development');
    const tasksDbId = this.config.getDatabaseId('tasks');

    const content = [
      {
        type: 'heading_1',
        heading_1: {
          rich_text: [{ text: { content: '🧪 QA Dashboard' } }]
        }
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            text: {
              content: 'Testing tasks, bug tracking, and quality metrics.'
            }
          }]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: '🧪 Test Cases' } }]
        }
      },
      {
        type: 'linked_database',
        linked_database: {
          database_id: tasksDbId
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: '🐛 Bug Reports' } }]
        }
      },
      {
        type: 'callout',
        callout: {
          rich_text: [{
            text: {
              content: 'Active bugs and issues requiring validation'
            }
          }],
          icon: { emoji: '🐛' },
          color: 'red_background'
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: '📊 Quality Metrics' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{
            text: {
              content: 'Test coverage: % of features with automated tests'
            }
          }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{
            text: {
              content: 'Bug resolution rate: Time to fix and verify bugs'
            }
          }]
        }
      }
    ];

    const page = await this.notion.createPage({
      title: '🧪 QA Dashboard',
      parentId: parentPageId,
      content: content,
      icon: { type: 'emoji', emoji: '🧪' }
    });

    console.log(`   ✓ QA Dashboard created: ${page.id}`);
    return page;
  }

  /**
   * Create operations dashboard
   */
  async createOperationsDashboard() {
    console.log('\n⚙️  Creating Operations Dashboard...');

    const parentPageId = this.config.getPageId('main');
    const operationsDbId = this.config.getDatabaseId('operations');

    const content = [
      {
        type: 'heading_1',
        heading_1: {
          rich_text: [{ text: { content: '⚙️ Operations Dashboard' } }]
        }
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            text: {
              content: 'System health, processes, and operational tasks.'
            }
          }]
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: '🔧 Daily Operations' } }]
        }
      },
      {
        type: 'linked_database',
        linked_database: {
          database_id: operationsDbId
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: '🚀 System Health' } }]
        }
      },
      {
        type: 'callout',
        callout: {
          rich_text: [{
            text: {
              content: 'Server status, uptime, and deployment history'
            }
          }],
          icon: { emoji: '🚀' },
          color: 'green_background'
        }
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: '📈 Performance Metrics' } }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{
            text: {
              content: 'Uptime: System availability percentage'
            }
          }]
        }
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{
            text: {
              content: 'Response time: API latency metrics'
            }
          }]
        }
      }
    ];

    const page = await this.notion.createPage({
      title: '⚙️ Operations Dashboard',
      parentId: parentPageId,
      content: content,
      icon: { type: 'emoji', emoji: '⚙️' }
    });

    console.log(`   ✓ Operations Dashboard created: ${page.id}`);
    return page;
  }

  /**
   * Run role dashboard creation
   */
  async run() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║    👥 Role Dashboards Setup 👥        ║');
    console.log('╚════════════════════════════════════════╝\n');

    const dashboards = {
      developer: await this.createDeveloperDashboard(),
      designer: await this.createDesignerDashboard(),
      qa: await this.createQADashboard(),
      operations: await this.createOperationsDashboard()
    };

    // Save dashboard IDs
    Object.entries(dashboards).forEach(([role, page]) => {
      this.config.updatePage(`${role}_dashboard`, {
        id: page.id,
        name: `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`,
        created: new Date().toISOString()
      });
    });

    console.log('\n✅ All role dashboards created successfully!');
    console.log('\n📊 Created dashboards:');
    Object.entries(dashboards).forEach(([role, page]) => {
      console.log(`   ${role}: https://notion.so/${page.id.replace(/-/g, '')}`);
    });

    return dashboards;
  }
}

module.exports = { RoleDashboardCreator };

// CLI Usage
if (require.main === module) {
  const fs = require('fs');
  const envContent = fs.readFileSync('development.env', 'utf8');
  const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1] : process.env[key];
  };

  const creator = new RoleDashboardCreator({
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

