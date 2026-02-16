#!/usr/bin/env node

/**
 * Linear Project Importer
 * Imports Linear projects into Notion Projects Master database
 */

const { LinearHelperExtended } = require('../lib/linear-helper-extended');
const { NotionHelperExtended } = require('../lib/notion-helper-extended');
const { ConfigManager } = require('../lib/config-manager');
const { parseArgs, loadEnv } = require('../lib/utils');

class LinearProjectImporter {
  constructor(options = {}) {
    loadEnv('development.env');
    
    this.linear = new LinearHelperExtended({ token: process.env.LINEAR_API_KEY });
    this.notion = new NotionHelperExtended({ token: process.env.NOTION_TOKEN });
    this.config = new ConfigManager();
    
    this.dryRun = options.dryRun || false;
    this.teamKey = options.teamKey || 'LDS';
  }

  /**
   * Import all Linear projects
   */
  async import() {
    console.log('\n📥 Importing Linear Projects to Notion');
    console.log('======================================\n');
    
    const projectsDbId = this.config.getDatabaseId('projects');
    if (!projectsDbId) {
      throw new Error('Projects database not found. Run workspace setup first.');
    }
    
    try {
      // Get Linear projects
      const linearProjects = await this.linear.getProjects(this.teamKey);
      console.log(`Found ${linearProjects.length} projects in Linear\n`);
      
      let imported = 0;
      let skipped = 0;
      
      for (const project of linearProjects) {
        try {
          // Check if project already exists in Notion
          const exists = await this.projectExistsInNotion(projectsDbId, project.name);
          
          if (exists && !this.dryRun) {
            console.log(`   ⊘ Skipped (exists): ${project.name}`);
            skipped++;
            continue;
          }
          
          // Create project in Notion
          if (!this.dryRun) {
            await this.createNotionProject(projectsDbId, project);
          }
          
          console.log(`   ✓ Imported: ${project.name}`);
          imported++;
          
        } catch (error) {
          console.log(`   ✗ Error importing ${project.name}: ${error.message}`);
        }
      }
      
      console.log(`\n✅ Import completed!`);
      console.log(`   Imported: ${imported} projects`);
      console.log(`   Skipped: ${skipped} projects`);
      
    } catch (error) {
      console.error('\n❌ Import failed:', error.message);
      throw error;
    }
  }

  /**
   * Check if project exists in Notion
   */
  async projectExistsInNotion(databaseId, projectName) {
    try {
      const results = await this.notion.queryDatabase(databaseId, {
        filter: {
          property: 'Project Name',
          title: {
            equals: projectName
          }
        }
      });
      
      return results.length > 0;
    } catch (error) {
      // If query fails, assume doesn't exist to allow import
      console.log(`   ⚠️  Could not check if project exists: ${error.message}`);
      return false;
    }
  }

  /**
   * Create project in Notion
   */
  async createNotionProject(databaseId, linearProject) {
    const properties = {
      'Project Name': {
        title: [
          {
            text: {
              content: linearProject.name
            }
          }
        ]
      },
      'Description': {
        rich_text: [
          {
            text: {
              content: linearProject.description || ''
            }
          }
        ]
      },
      'Phase': {
        select: {
          name: this.mapLinearStateToPhase(linearProject.state)
        }
      },
      'Priority': {
        select: {
          name: this.mapLinearPriorityToNotionPriority(linearProject.priority)
        }
      },
      'Progress': {
        number: linearProject.progress * 100 || 0
      },
      'Status': {
        status: {
          name: this.mapLinearStateToStatus(linearProject.state)
        }
      }
    };
    
    if (linearProject.startDate) {
      properties['Start Date'] = {
        date: {
          start: linearProject.startDate
        }
      };
    }
    
    if (linearProject.targetDate) {
      properties['End Date'] = {
        date: {
          start: linearProject.targetDate
        }
      };
    }
    
    await this.notion.createDatabaseEntry(databaseId, properties);
  }

  /**
   * Map Linear project state to Notion phase
   */
  mapLinearStateToPhase(state) {
    const stateMap = {
      'planned': 'Planning',
      'started': 'Development',
      'paused': 'Operations',
      'completed': 'Complete',
      'canceled': 'Complete'
    };
    
    return stateMap[state] || 'Planning';
  }

  /**
   * Map Linear project state to Notion status
   */
  mapLinearStateToStatus(state) {
    const stateMap = {
      'planned': 'Not Started',
      'started': 'In Progress',
      'paused': 'Blocked',
      'completed': 'Done',
      'canceled': 'Done'
    };
    
    return stateMap[state] || 'Not Started';
  }

  /**
   * Map Linear priority to Notion priority
   */
  mapLinearPriorityToNotionPriority(priority) {
    if (priority >= 3) return 'P0 - Critical';
    if (priority === 2) return 'P1 - High';
    if (priority === 1) return 'P2 - Medium';
    return 'P3 - Low';
  }
}

// Main execution
async function main() {
  const args = parseArgs(process.argv.slice(2));
  
  const importer = new LinearProjectImporter({
    dryRun: args['dry-run'] || false,
    teamKey: args.team || 'LDS'
  });
  
  await importer.import();
}

if (require.main === module) {
  main().catch(error => {
    console.error('Import failed:', error);
    process.exit(1);
  });
}

module.exports = { LinearProjectImporter };

