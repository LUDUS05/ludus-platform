/**
 * LUDUS Development Plan Importer
 * Imports all 60 tasks from the comprehensive development plan into Notion
 */

const { NotionHelperExtended } = require('../lib/notion-helper-extended');
const { ConfigManager } = require('../lib/config-manager');
const fs = require('fs');
const path = require('path');

class LudusTaskImporter {
  constructor({ notionToken, planFile }) {
    this.notion = new NotionHelperExtended({ token: notionToken });
    this.config = new ConfigManager();
    this.planFile = planFile;
    this.tasks = [];
  }

  /**
   * Parse the development plan markdown file
   */
  parsePlanFile() {
    console.log('\n📄 Parsing development plan...');
    
    const content = fs.readFileSync(this.planFile, 'utf8');
    const lines = content.split('\n');
    
    let currentTask = null;
    let inTaskSection = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detect task start
      if (line.match(/^#### T\d+\.\d+:/)) {
        // Save previous task if exists
        if (currentTask) {
          this.tasks.push(currentTask);
        }
        
        // Start new task
        const titleMatch = line.match(/^#### T(\d+)\.(\d+): (.+)$/);
        if (titleMatch) {
          currentTask = {
            phase: parseInt(titleMatch[1]),
            number: parseInt(titleMatch[2]),
            title: titleMatch[3],
            description: '',
            assignee: '',
            tool: '',
            priority: '',
            effort: '',
            acceptanceCriteria: []
          };
          inTaskSection = true;
        }
      }
      // Parse task properties
      else if (inTaskSection && currentTask) {
        if (line.startsWith('- **Task ID**:')) {
          currentTask.taskId = line.replace('- **Task ID**:', '').trim();
        }
        else if (line.startsWith('- **Description**:')) {
          currentTask.description = line.replace('- **Description**:', '').trim();
        }
        else if (line.startsWith('- **Assignee**:')) {
          currentTask.assignee = line.replace('- **Assignee**:', '').trim();
        }
        else if (line.startsWith('- **Tool**:')) {
          currentTask.tool = line.replace('- **Tool**:', '').trim();
        }
        else if (line.startsWith('- **Priority**:')) {
          const priorityMatch = line.match(/P(\d)/);
          if (priorityMatch) {
            currentTask.priority = `P${priorityMatch[1]}`;
          }
        }
        else if (line.startsWith('- **Effort**:')) {
          currentTask.effort = line.replace('- **Effort**:', '').trim();
        }
        else if (line.startsWith('  - ✅')) {
          currentTask.acceptanceCriteria.push(line.replace('  - ✅', '').trim());
        }
        else if (line.startsWith('###') && !line.startsWith('####')) {
          // End of current task section
          if (currentTask) {
            this.tasks.push(currentTask);
            currentTask = null;
          }
          inTaskSection = false;
        }
      }
    }
    
    // Add last task if exists
    if (currentTask) {
      this.tasks.push(currentTask);
    }
    
    console.log(`   ✓ Parsed ${this.tasks.length} tasks`);
    return this.tasks;
  }

  /**
   * Map task phase to project
   */
  getPhaseInfo(phase) {
    const phases = {
      1: { name: 'Phase 1: Foundation', months: 'Months 1-3' },
      2: { name: 'Phase 2: Core Features', months: 'Months 4-6' },
      3: { name: 'Phase 3: Advanced Features', months: 'Months 7-9' },
      4: { name: 'Phase 4: Testing & Launch', months: 'Months 10-12' }
    };
    return phases[phase] || { name: 'Unknown Phase', months: '' };
  }

  /**
   * Map priority to Notion format
   */
  mapPriority(priority) {
    const mapping = {
      'P0': 'Critical',
      'P1': 'High',
      'P2': 'Medium',
      'P3': 'Low'
    };
    return mapping[priority] || 'Medium';
  }

  /**
   * Parse effort to estimate days
   */
  parseEffort(effort) {
    const match = effort.match(/(\d+)/);
    return match ? parseInt(match[1]) : 3;
  }

  /**
   * Map assignee to team member
   */
  mapAssignee(assignee) {
    // Extract primary assignee
    const parts = assignee.split('+')[0].trim();
    return parts;
  }

  /**
   * Create task in Notion
   */
  async createTask(task) {
    const tasksDbId = this.config.getDatabaseId('tasks');
    if (!tasksDbId) {
      throw new Error('Tasks database not found. Run workspace setup first.');
    }

    const phaseInfo = this.getPhaseInfo(task.phase);
    
    try {
      const properties = {
        'Name': {
          title: [
            {
              text: {
                content: `${task.taskId}: ${task.title}`
              }
            }
          ]
        }
      };

      // Add optional properties if they exist in the database schema
      // Note: We'll add basic properties and let the user enhance as needed
      
      await this.notion.createDatabaseEntry(tasksDbId, properties);
      
      return true;
    } catch (error) {
      console.error(`   ✗ Error creating task ${task.taskId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Import all tasks
   */
  async import() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   📥 LUDUS Task Import to Notion 📥   ║');
    console.log('╚════════════════════════════════════════╝\n');

    // Parse the plan file
    this.parsePlanFile();

    // Group tasks by phase
    const tasksByPhase = {};
    this.tasks.forEach(task => {
      if (!tasksByPhase[task.phase]) {
        tasksByPhase[task.phase] = [];
      }
      tasksByPhase[task.phase].push(task);
    });

    console.log('\n📊 Task Summary:');
    Object.keys(tasksByPhase).sort().forEach(phase => {
      const phaseInfo = this.getPhaseInfo(parseInt(phase));
      console.log(`   Phase ${phase} (${phaseInfo.name}): ${tasksByPhase[phase].length} tasks`);
    });

    console.log('\n🚀 Starting import...\n');

    let imported = 0;
    let failed = 0;

    // Import tasks phase by phase
    for (const phase of Object.keys(tasksByPhase).sort()) {
      const phaseTasks = tasksByPhase[phase];
      const phaseInfo = this.getPhaseInfo(parseInt(phase));
      
      console.log(`\n📦 Importing ${phaseInfo.name} (${phaseTasks.length} tasks)...\n`);

      for (const task of phaseTasks) {
        process.stdout.write(`   ${task.taskId}: ${task.title.substring(0, 50)}...`);
        
        const success = await this.createTask(task);
        if (success) {
          imported++;
          console.log(' ✓');
        } else {
          failed++;
          console.log(' ✗');
        }
        
        // Rate limiting - wait a bit between requests
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    }

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║         ✅ Import Complete ✅          ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`\n📊 Results:`);
    console.log(`   ✅ Imported: ${imported} tasks`);
    console.log(`   ❌ Failed: ${failed} tasks`);
    console.log(`   📝 Total: ${this.tasks.length} tasks\n`);

    // Generate task summary file
    this.generateSummaryFile(tasksByPhase);
  }

  /**
   * Generate summary file with all tasks
   */
  generateSummaryFile(tasksByPhase) {
    let summary = '# LUDUS Development Plan - Task Summary\n\n';
    summary += `**Total Tasks**: ${this.tasks.length}\n`;
    summary += `**Generated**: ${new Date().toISOString()}\n\n`;
    
    Object.keys(tasksByPhase).sort().forEach(phase => {
      const phaseInfo = this.getPhaseInfo(parseInt(phase));
      const phaseTasks = tasksByPhase[phase];
      
      summary += `\n## ${phaseInfo.name} (${phaseInfo.months})\n\n`;
      summary += `**Task Count**: ${phaseTasks.length}\n\n`;
      
      phaseTasks.forEach(task => {
        summary += `### ${task.taskId}: ${task.title}\n\n`;
        summary += `- **Assignee**: ${task.assignee}\n`;
        summary += `- **Priority**: ${task.priority}\n`;
        summary += `- **Effort**: ${task.effort}\n`;
        summary += `- **Description**: ${task.description}\n\n`;
        
        if (task.acceptanceCriteria.length > 0) {
          summary += `**Acceptance Criteria**:\n`;
          task.acceptanceCriteria.forEach(criteria => {
            summary += `- ${criteria}\n`;
          });
          summary += '\n';
        }
      });
    });
    
    const summaryFile = 'LUDUS_TASKS_SUMMARY.md';
    fs.writeFileSync(summaryFile, summary);
    console.log(`📄 Summary saved to: ${summaryFile}\n`);
  }
}

module.exports = { LudusTaskImporter };

// CLI Usage
if (require.main === module) {
  const envContent = fs.readFileSync('development.env', 'utf8');
  const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1] : process.env[key];
  };

  // Get plan file path from args or use default
  const planFile = process.argv[2] || path.join(__dirname, '../../ludus_development_plan.md');

  if (!fs.existsSync(planFile)) {
    console.error(`\n❌ Error: Plan file not found at ${planFile}`);
    console.error('   Usage: node import-ludus-tasks.js [path/to/plan.md]\n');
    process.exit(1);
  }

  const importer = new LudusTaskImporter({
    notionToken: getEnv('NOTION_TOKEN'),
    planFile: planFile
  });

  importer.import()
    .then(() => {
      console.log('✅ Import completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Import failed:', error.message);
      console.error(error.stack);
      process.exit(1);
    });
}

