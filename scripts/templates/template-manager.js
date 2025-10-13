/**
 * Template Manager - LUDUS Workspace
 * Creates and manages templates for pages, tasks, documents
 */

const { NotionHelperExtended } = require('../lib/notion-helper-extended');
const { ConfigManager } = require('../lib/config-manager');
const fs = require('fs');
const path = require('path');

class TemplateManager {
  constructor({ notionToken }) {
    this.notion = new NotionHelperExtended({ token: notionToken });
    this.config = new ConfigManager();
    this.templatesDir = 'templates';
    
    // Create templates directory if it doesn't exist
    if (!fs.existsSync(this.templatesDir)) {
      fs.mkdirSync(this.templatesDir, { recursive: true });
    }
  }

  /**
   * Create project page template
   */
  async createProjectTemplate() {
    console.log('\n📄 Creating project page template...');
    
    const template = {
      name: 'Project Page Template',
      type: 'page',
      icon: { type: 'emoji', emoji: '📁' },
      content: [
        {
          type: 'heading_1',
          heading_1: {
            rich_text: [{ text: { content: '[Project Name]' } }]
          }
        },
        {
          type: 'callout',
          callout: {
            rich_text: [{
              text: {
                content: 'Project Overview - Replace with project description'
              }
            }],
            icon: { emoji: '📋' },
            color: 'blue_background'
          }
        },
        {
          type: 'heading_2',
          heading_2: {
            rich_text: [{ text: { content: '🎯 Objectives' } }]
          }
        },
        {
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ text: { content: 'Objective 1' } }]
          }
        },
        {
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ text: { content: 'Objective 2' } }]
          }
        },
        {
          type: 'heading_2',
          heading_2: {
            rich_text: [{ text: { content: '📅 Timeline' } }]
          }
        },
        {
          type: 'paragraph',
          paragraph: {
            rich_text: [{
              text: {
                content: 'Start Date: [Date] | End Date: [Date]'
              }
            }]
          }
        },
        {
          type: 'heading_2',
          heading_2: {
            rich_text: [{ text: { content: '👥 Team' } }]
          }
        },
        {
          type: 'paragraph',
          paragraph: {
            rich_text: [{
              text: {
                content: 'Project Lead: [Name]'
              }
            }]
          }
        },
        {
          type: 'heading_2',
          heading_2: {
            rich_text: [{ text: { content: '📊 Status Updates' } }]
          }
        },
        {
          type: 'paragraph',
          paragraph: {
            rich_text: [{
              text: {
                content: 'Latest update: [Date] - [Status]'
              }
            }]
          }
        }
      ]
    };

    this.saveTemplate('project-page', template);
    console.log('   ✓ Project template created');
    return template;
  }

  /**
   * Create meeting notes template
   */
  async createMeetingNotesTemplate() {
    console.log('\n📝 Creating meeting notes template...');
    
    const template = {
      name: 'Meeting Notes Template',
      type: 'page',
      icon: { type: 'emoji', emoji: '📝' },
      content: [
        {
          type: 'heading_1',
          heading_1: {
            rich_text: [{ text: { content: '[Meeting Title]' } }]
          }
        },
        {
          type: 'paragraph',
          paragraph: {
            rich_text: [{
              text: {
                content: '📅 Date: [Date] | ⏰ Time: [Time] | 📍 Location: [Location/Link]'
              }
            }]
          }
        },
        {
          type: 'heading_2',
          heading_2: {
            rich_text: [{ text: { content: '👥 Attendees' } }]
          }
        },
        {
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ text: { content: 'Attendee 1' } }]
          }
        },
        {
          type: 'heading_2',
          heading_2: {
            rich_text: [{ text: { content: '📋 Agenda' } }]
          }
        },
        {
          type: 'numbered_list_item',
          numbered_list_item: {
            rich_text: [{ text: { content: 'Agenda item 1' } }]
          }
        },
        {
          type: 'heading_2',
          heading_2: {
            rich_text: [{ text: { content: '💬 Discussion Notes' } }]
          }
        },
        {
          type: 'paragraph',
          paragraph: {
            rich_text: [{ text: { content: 'Meeting notes go here...' } }]
          }
        },
        {
          type: 'heading_2',
          heading_2: {
            rich_text: [{ text: { content: '✅ Action Items' } }]
          }
        },
        {
          type: 'to_do',
          to_do: {
            rich_text: [{ text: { content: 'Action item 1 - @assignee' } }],
            checked: false
          }
        },
        {
          type: 'heading_2',
          heading_2: {
            rich_text: [{ text: { content: '📌 Decisions' } }]
          }
        },
        {
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ text: { content: 'Decision 1' } }]
          }
        }
      ]
    };

    this.saveTemplate('meeting-notes', template);
    console.log('   ✓ Meeting notes template created');
    return template;
  }

  /**
   * Create weekly report template
   */
  async createWeeklyReportTemplate() {
    console.log('\n📊 Creating weekly report template...');
    
    const template = {
      name: 'Weekly Report Template',
      type: 'page',
      icon: { type: 'emoji', emoji: '📊' },
      content: [
        {
          type: 'heading_1',
          heading_1: {
            rich_text: [{ text: { content: 'Weekly Report - Week [Number]' } }]
          }
        },
        {
          type: 'paragraph',
          paragraph: {
            rich_text: [{
              text: {
                content: '📅 Period: [Start Date] - [End Date]'
              }
            }]
          }
        },
        {
          type: 'heading_2',
          heading_2: {
            rich_text: [{ text: { content: '✅ Completed This Week' } }]
          }
        },
        {
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ text: { content: 'Achievement 1' } }]
          }
        },
        {
          type: 'heading_2',
          heading_2: {
            rich_text: [{ text: { content: '🎯 In Progress' } }]
          }
        },
        {
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ text: { content: 'Task 1' } }]
          }
        },
        {
          type: 'heading_2',
          heading_2: {
            rich_text: [{ text: { content: '🚧 Blockers' } }]
          }
        },
        {
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ text: { content: 'Blocker 1 (if any)' } }]
          }
        },
        {
          type: 'heading_2',
          heading_2: {
            rich_text: [{ text: { content: '📅 Next Week Plan' } }]
          }
        },
        {
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ text: { content: 'Planned task 1' } }]
          }
        },
        {
          type: 'heading_2',
          heading_2: {
            rich_text: [{ text: { content: '📊 Metrics' } }]
          }
        },
        {
          type: 'paragraph',
          paragraph: {
            rich_text: [{
              text: {
                content: '• Tasks Completed: [Number]\n• Velocity: [Number] points\n• Budget Status: [Status]'
              }
            }]
          }
        }
      ]
    };

    this.saveTemplate('weekly-report', template);
    console.log('   ✓ Weekly report template created');
    return template;
  }

  /**
   * Create task templates by type
   */
  async createTaskTemplates() {
    console.log('\n✏️  Creating task templates...');
    
    const types = ['Feature', 'Bug Fix', 'Documentation', 'Testing', 'Research'];
    const templates = {};

    types.forEach(type => {
      templates[type.toLowerCase().replace(/\s+/g, '-')] = {
        name: `${type} Task Template`,
        type: 'database_entry',
        properties: {
          'Task Name': { title: `[${type}] Task Name` },
          'Type': { select: type },
          'Priority': { select: 'Medium' },
          'Status': { status: 'Not Started' },
          'Description': { 
            rich_text: `Template for ${type} tasks. Replace with actual description.` 
          }
        }
      };
    });

    Object.entries(templates).forEach(([key, template]) => {
      this.saveTemplate(`task-${key}`, template);
    });

    console.log(`   ✓ Created ${types.length} task templates`);
    return templates;
  }

  /**
   * Create document templates by category
   */
  async createDocumentTemplates() {
    console.log('\n📚 Creating document templates...');
    
    const categories = {
      'technical-spec': {
        name: 'Technical Specification',
        sections: [
          '# Technical Specification: [Feature Name]',
          '## Overview',
          '## Requirements',
          '## Architecture',
          '## Implementation Details',
          '## Testing Strategy',
          '## Deployment Plan'
        ]
      },
      'api-doc': {
        name: 'API Documentation',
        sections: [
          '# API Documentation: [API Name]',
          '## Endpoint Overview',
          '## Authentication',
          '## Request Format',
          '## Response Format',
          '## Error Codes',
          '## Examples'
        ]
      },
      'runbook': {
        name: 'Operations Runbook',
        sections: [
          '# Runbook: [Process Name]',
          '## Purpose',
          '## Prerequisites',
          '## Step-by-Step Instructions',
          '## Troubleshooting',
          '## Rollback Procedure',
          '## Contacts'
        ]
      }
    };

    const templates = {};
    Object.entries(categories).forEach(([key, category]) => {
      templates[key] = {
        name: category.name,
        type: 'document',
        content: category.sections.join('\n\n')
      };
      this.saveTemplate(`document-${key}`, templates[key]);
    });

    console.log(`   ✓ Created ${Object.keys(categories).length} document templates`);
    return templates;
  }

  /**
   * Load template by name
   */
  loadTemplate(templateName) {
    const filePath = path.join(this.templatesDir, `${templateName}.json`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Template not found: ${templateName}`);
    }

    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  /**
   * Save template
   */
  saveTemplate(name, template) {
    const filePath = path.join(this.templatesDir, `${name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(template, null, 2));
    console.log(`   💾 Saved template: ${name}`);
  }

  /**
   * List all templates
   */
  listTemplates() {
    console.log('\n📚 Available Templates:\n');
    
    if (!fs.existsSync(this.templatesDir)) {
      console.log('   No templates found');
      return [];
    }

    const files = fs.readdirSync(this.templatesDir)
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));

    files.forEach(name => {
      const template = this.loadTemplate(name);
      console.log(`   📄 ${name} - ${template.name}`);
    });

    return files;
  }

  /**
   * Create template from existing page
   */
  async createTemplateFromPage(pageId, templateName) {
    console.log(`\n📋 Creating template from page: ${pageId}...`);
    
    // In a full implementation, this would:
    // 1. Retrieve page content from Notion
    // 2. Extract structure and properties
    // 3. Anonymize/template-ize content
    // 4. Save as reusable template

    console.log('   ⚠️  Feature not yet fully implemented');
    return null;
  }

  /**
   * Apply template to create new page
   */
  async applyTemplate(templateName, parentId, replacements = {}) {
    console.log(`\n✨ Applying template: ${templateName}...`);
    
    const template = this.loadTemplate(templateName);
    
    // Replace placeholders in content
    const content = this.processPlaceholders(template.content, replacements);
    
    const page = await this.notion.createPage({
      title: replacements.title || template.name,
      parentId: parentId,
      content: content,
      icon: template.icon
    });

    console.log(`   ✓ Page created from template: ${page.id}`);
    return page;
  }

  /**
   * Process placeholders in template
   */
  processPlaceholders(content, replacements) {
    let processed = JSON.parse(JSON.stringify(content));
    
    const replaceInText = (text) => {
      let result = text;
      Object.entries(replacements).forEach(([key, value]) => {
        result = result.replace(new RegExp(`\\[${key}\\]`, 'gi'), value);
      });
      return result;
    };

    processed = processed.map(block => {
      // Process text in various block types
      for (const prop of Object.keys(block)) {
        if (block[prop] && block[prop].rich_text) {
          block[prop].rich_text = block[prop].rich_text.map(text => {
            if (text.text) {
              text.text.content = replaceInText(text.text.content);
            }
            return text;
          });
        }
      }
      return block;
    });

    return processed;
  }

  /**
   * Run template manager setup
   */
  async run() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║    📚 Template Manager Setup 📚       ║');
    console.log('╚════════════════════════════════════════╝\n');

    await this.createProjectTemplate();
    await this.createMeetingNotesTemplate();
    await this.createWeeklyReportTemplate();
    await this.createTaskTemplates();
    await this.createDocumentTemplates();

    console.log('\n✅ All templates created successfully!');
    this.listTemplates();
  }
}

module.exports = { TemplateManager };

// CLI Usage
if (require.main === module) {
  const envContent = fs.readFileSync('development.env', 'utf8');
  const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1] : process.env[key];
  };

  const manager = new TemplateManager({
    notionToken: getEnv('NOTION_TOKEN')
  });

  const command = process.argv[2];

  if (command === 'list') {
    manager.listTemplates();
    process.exit(0);
  } else if (command === 'setup') {
    manager.run()
      .then(() => {
        console.log('\n✅ Setup complete');
        process.exit(0);
      })
      .catch(error => {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
      });
  } else {
    console.log('Usage: node template-manager.js [setup|list]');
    process.exit(1);
  }
}

