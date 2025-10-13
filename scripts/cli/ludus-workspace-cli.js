#!/usr/bin/env node

/**
 * LUDUS Workspace CLI
 * Comprehensive command-line interface for workspace management
 */

const { WorkspaceOrchestrator } = require('../setup-complete-workspace');
const { LinearNotionSync } = require('../integrations/linear-notion-sync');
const { LinearProjectImporter } = require('../integrations/import-linear-projects');
const { GitHubRepoTracker } = require('../integrations/github-repo-tracker');
const { GitHubReviewDashboard } = require('../integrations/github-review-dashboard');
const { GitHubReleaseManager } = require('../integrations/github-release-manager');
const { DailySync } = require('../automation/daily-sync');
const { WeeklyReports } = require('../automation/weekly-reports');
const { BudgetMonitor } = require('../automation/budget-monitor');
const { ExecutiveDashboardCreator } = require('../dashboards/create-executive-dashboard');
const { PMDashboardCreator } = require('../dashboards/create-pm-dashboard');
const { RoleDashboardCreator } = require('../dashboards/create-role-dashboards');
const { ReportGenerator } = require('../reporting/report-generator');
const { TemplateManager } = require('../templates/template-manager');
const { WorkspaceMonitor } = require('../maintenance/workspace-monitor');
const { ConfigManager } = require('../lib/config-manager');
const { parseArgs, loadEnv } = require('../lib/utils');

class LudusWorkspaceCLI {
  constructor() {
    loadEnv('development.env');
    this.config = new ConfigManager();
    this.commands = {
      // Setup commands
      'setup:all': this.setupAll.bind(this),
      'setup:databases': this.setupDatabases.bind(this),
      'setup:integrations': this.setupIntegrations.bind(this),
      'setup:dashboards': this.setupDashboards.bind(this),
      'setup:templates': this.setupTemplates.bind(this),
      
      // Sync commands
      'sync:linear': this.syncLinear.bind(this),
      'sync:linear-to-notion': this.syncLinearToNotion.bind(this),
      'sync:notion-to-linear': this.syncNotionToLinear.bind(this),
      'sync:github': this.syncGitHub.bind(this),
      'sync:all': this.syncAll.bind(this),
      
      // Import commands
      'import:linear-projects': this.importLinearProjects.bind(this),
      'import:ludus-tasks': this.importLudusTasks.bind(this),
      
      // GitHub commands
      'github:track': this.githubTrack.bind(this),
      'github:reviews': this.githubReviews.bind(this),
      'github:releases': this.githubReleases.bind(this),
      
      // Automation commands
      'auto:daily': this.runDailySync.bind(this),
      'auto:weekly': this.runWeeklyReports.bind(this),
      'auto:budget': this.runBudgetMonitor.bind(this),
      
      // Dashboard commands
      'dashboard:executive': this.createExecutiveDashboard.bind(this),
      'dashboard:pm': this.createPMDashboard.bind(this),
      'dashboard:roles': this.createRoleDashboards.bind(this),
      
      // Report commands
      'report:weekly': this.generateWeeklyReport.bind(this),
      'report:monthly': this.generateMonthlyReport.bind(this),
      'report:quarterly': this.generateQuarterlyReport.bind(this),
      'report:budget': this.generateBudgetReport.bind(this),
      'report:team': this.generateTeamReport.bind(this),
      
      // Template commands
      'template:setup': this.setupTemplates.bind(this),
      'template:list': this.listTemplates.bind(this),
      'template:apply': this.applyTemplate.bind(this),
      
      // Maintenance commands
      'maintain:check': this.maintainCheck.bind(this),
      'maintain:cleanup': this.maintainCleanup.bind(this),
      'maintain:backup': this.maintainBackup.bind(this),
      'maintain:full': this.maintainFull.bind(this),
      
      // Status commands
      'status': this.showStatus.bind(this),
      'config': this.showConfig.bind(this),
      
      // Help
      'help': this.showHelp.bind(this),
      '--help': this.showHelp.bind(this),
      '-h': this.showHelp.bind(this)
    };
  }

  /**
   * Execute CLI command
   */
  async execute(args) {
    const command = args[0];
    const options = parseArgs(args.slice(1));
    
    if (!command || !this.commands[command]) {
      this.showHelp();
      return false;
    }
    
    try {
      await this.commands[command](options);
      return true;
    } catch (error) {
      console.error(`\n❌ Command failed: ${error.message}`);
      if (options.verbose || options.v) {
        console.error(error.stack);
      }
      return false;
    }
  }

  /**
   * Setup: All
   */
  async setupAll(options) {
    const orchestrator = new WorkspaceOrchestrator({
      dryRun: options['dry-run'] || false,
      force: options.force || false
    });
    
    await orchestrator.setup();
  }

  /**
   * Setup: Databases only
   */
  async setupDatabases(options) {
    console.log('📊 Setting up databases only...');
    console.log('   Use setup:all for complete workspace setup\n');
    
    const orchestrator = new WorkspaceOrchestrator({
      dryRun: options['dry-run'] || false,
      force: options.force || false
    });
    
    await orchestrator.createDatabases();
  }

  /**
   * Setup: Integrations
   */
  async setupIntegrations(options) {
    console.log('🔗 Setting up integrations...\n');
    
    // Import Linear projects
    await this.importLinearProjects(options);
    
    console.log('\n✅ Integrations setup complete!');
  }

  /**
   * Sync: Linear (bi-directional)
   */
  async syncLinear(options) {
    const sync = new LinearNotionSync({
      dryRun: options['dry-run'] || false,
      direction: 'both'
    });
    
    await sync.sync();
  }

  /**
   * Sync: Linear to Notion only
   */
  async syncLinearToNotion(options) {
    const sync = new LinearNotionSync({
      dryRun: options['dry-run'] || false,
      direction: 'linear-to-notion'
    });
    
    await sync.sync();
  }

  /**
   * Sync: Notion to Linear only
   */
  async syncNotionToLinear(options) {
    const sync = new LinearNotionSync({
      dryRun: options['dry-run'] || false,
      direction: 'notion-to-linear'
    });
    
    await sync.sync();
  }

  /**
   * Sync: All integrations
   */
  async syncAll(options) {
    console.log('\n🔄 Syncing all integrations...\n');
    
    await this.syncLinear(options);
    
    console.log('\n✅ All syncs complete!');
  }

  /**
   * Import: Linear Projects
   */
  async importLinearProjects(options) {
    const importer = new LinearProjectImporter({
      dryRun: options['dry-run'] || false,
      teamKey: options.team || 'LDS'
    });
    
    await importer.import();
  }

  /**
   * Import: LUDUS Development Tasks
   */
  async importLudusTasks(options) {
    const { LudusTaskImporter } = require('../integrations/import-ludus-tasks');
    const path = require('path');
    
    const planFile = options.file || path.join(__dirname, '../../../ludus_development_plan.md');
    
    const importer = new LudusTaskImporter({
      notionToken: process.env.NOTION_TOKEN,
      planFile: planFile
    });
    
    await importer.import();
  }

  /**
   * Report: Weekly
   */
  async generateWeeklyReport(options) {
    console.log('\n📊 Generating Weekly Report...\n');
    
    const projectsDbId = this.config.getDatabaseId('projects');
    const tasksDbId = this.config.getDatabaseId('tasks');
    
    if (!projectsDbId || !tasksDbId) {
      throw new Error('Databases not found. Run setup first.');
    }
    
    // Get week's data
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    console.log(`   Period: ${weekAgo.toISOString().split('T')[0]} to ${new Date().toISOString().split('T')[0]}`);
    console.log(`   Report generated: ${new Date().toISOString()}`);
    console.log('\n   ℹ️  Detailed reports coming soon...');
  }

  /**
   * Report: Budget
   */
  async generateBudgetReport(options) {
    console.log('\n💰 Generating Budget Report...\n');
    
    const budgetDbId = this.config.getDatabaseId('budget');
    
    if (!budgetDbId) {
      throw new Error('Budget database not found. Run setup first.');
    }
    
    console.log('   ℹ️  Budget analysis coming soon...');
  }

  /**
   * Report: Team
   */
  async generateTeamReport(options) {
    console.log('\n👥 Generating Team Report...\n');
    
    const teamDbId = this.config.getDatabaseId('team');
    
    if (!teamDbId) {
      throw new Error('Team database not found. Run setup first.');
    }
    
    console.log('   ℹ️  Team capacity analysis coming soon...');
  }

  /**
   * Maintain: Check
   */
  async maintainCheck(options) {
    console.log('\n🔍 Checking workspace health...\n');
    
    const summary = this.config.getSummary();
    
    console.log(`   Workspace: ${summary.workspace}`);
    console.log(`   Databases: ${summary.databases} configured`);
    console.log(`   Pages: ${summary.pages} configured`);
    console.log(`   Integrations: ${summary.integrations} active`);
    
    // Check database accessibility
    const { NotionHelperExtended } = require('../lib/notion-helper-extended');
    const notion = new NotionHelperExtended({ token: process.env.NOTION_TOKEN });
    
    let accessible = 0;
    const dbIds = this.config.getAllDatabaseIds();
    
    for (const [key, id] of Object.entries(dbIds)) {
      try {
        await notion.getDatabase(id);
        accessible++;
        console.log(`   ✓ ${key} database accessible`);
      } catch (error) {
        console.log(`   ✗ ${key} database not accessible: ${error.message}`);
      }
    }
    
    console.log(`\n   Status: ${accessible}/${Object.keys(dbIds).length} databases accessible`);
    
    if (accessible === Object.keys(dbIds).length) {
      console.log('   ✅ Workspace health: Good');
    } else {
      console.log('   ⚠️  Workspace health: Issues detected');
    }
  }

  /**
   * Maintain: Cleanup
   */
  async maintainCleanup(options) {
    console.log('\n🧹 Cleaning up workspace...\n');
    console.log('   ℹ️  Cleanup functionality coming soon...');
    console.log('   This will remove orphaned entries and optimize databases');
  }

  /**
   * Maintain: Backup
   */
  async maintainBackup(options) {
    const monitor = new WorkspaceMonitor({ notionToken: process.env.NOTION_TOKEN });
    await monitor.backupConfiguration();
  }

  /**
   * Maintain: Full maintenance
   */
  async maintainFull(options) {
    const monitor = new WorkspaceMonitor({ notionToken: process.env.NOTION_TOKEN });
    await monitor.runMaintenance();
  }

  /**
   * Setup: Dashboards
   */
  async setupDashboards(options) {
    console.log('\n📊 Setting up dashboards...\n');
    
    const executive = new ExecutiveDashboardCreator({ notionToken: process.env.NOTION_TOKEN });
    const pm = new PMDashboardCreator({ notionToken: process.env.NOTION_TOKEN });
    const roles = new RoleDashboardCreator({ notionToken: process.env.NOTION_TOKEN });
    
    await executive.run();
    await pm.run();
    await roles.run();
    
    console.log('\n✅ All dashboards created successfully!');
  }

  /**
   * Setup: Templates
   */
  async setupTemplates(options) {
    const manager = new TemplateManager({ notionToken: process.env.NOTION_TOKEN });
    await manager.run();
  }

  /**
   * Sync: GitHub
   */
  async syncGitHub(options) {
    const tracker = new GitHubRepoTracker({
      githubToken: process.env.GITHUB_TOKEN,
      githubOwner: process.env.GITHUB_OWNER || 'your-org',
      githubRepo: process.env.GITHUB_REPO || 'ludus-platform',
      notionToken: process.env.NOTION_TOKEN
    });
    
    await tracker.generateReport();
  }

  /**
   * GitHub: Track activity
   */
  async githubTrack(options) {
    await this.syncGitHub(options);
  }

  /**
   * GitHub: Code reviews
   */
  async githubReviews(options) {
    const dashboard = new GitHubReviewDashboard({
      githubToken: process.env.GITHUB_TOKEN,
      githubOwner: process.env.GITHUB_OWNER || 'your-org',
      githubRepo: process.env.GITHUB_REPO || 'ludus-platform',
      notionToken: process.env.NOTION_TOKEN
    });
    
    await dashboard.generateDashboard();
  }

  /**
   * GitHub: Releases
   */
  async githubReleases(options) {
    const manager = new GitHubReleaseManager({
      githubToken: process.env.GITHUB_TOKEN,
      githubOwner: process.env.GITHUB_OWNER || 'your-org',
      githubRepo: process.env.GITHUB_REPO || 'ludus-platform',
      notionToken: process.env.NOTION_TOKEN
    });
    
    await manager.generateReport();
  }

  /**
   * Automation: Daily sync
   */
  async runDailySync(options) {
    const sync = new DailySync({
      linearToken: process.env.LINEAR_API_KEY,
      notionToken: process.env.NOTION_TOKEN,
      githubToken: process.env.GITHUB_TOKEN,
      githubOwner: process.env.GITHUB_OWNER || 'your-org',
      githubRepo: process.env.GITHUB_REPO || 'ludus-platform',
      teamKey: options.team || process.env.LINEAR_TEAM_KEY || 'LET'
    });
    
    await sync.run();
  }

  /**
   * Automation: Weekly reports
   */
  async runWeeklyReports(options) {
    const reports = new WeeklyReports({
      notionToken: process.env.NOTION_TOKEN,
      linearToken: process.env.LINEAR_API_KEY,
      teamKey: options.team || process.env.LINEAR_TEAM_KEY || 'LET'
    });
    
    await reports.run();
  }

  /**
   * Automation: Budget monitor
   */
  async runBudgetMonitor(options) {
    const monitor = new BudgetMonitor({
      notionToken: process.env.NOTION_TOKEN
    });
    
    await monitor.run();
  }

  /**
   * Dashboard: Executive
   */
  async createExecutiveDashboard(options) {
    const creator = new ExecutiveDashboardCreator({ notionToken: process.env.NOTION_TOKEN });
    await creator.run();
  }

  /**
   * Dashboard: PM
   */
  async createPMDashboard(options) {
    const creator = new PMDashboardCreator({ notionToken: process.env.NOTION_TOKEN });
    await creator.run();
  }

  /**
   * Dashboard: Roles
   */
  async createRoleDashboards(options) {
    const creator = new RoleDashboardCreator({ notionToken: process.env.NOTION_TOKEN });
    await creator.run();
  }

  /**
   * Report: Monthly
   */
  async generateMonthlyReport(options) {
    const generator = new ReportGenerator({ notionToken: process.env.NOTION_TOKEN });
    const report = await generator.generateMonthlyFinancialReport();
    generator.exportToMarkdown(report);
    generator.exportToJSON(report);
  }

  /**
   * Report: Quarterly
   */
  async generateQuarterlyReport(options) {
    const generator = new ReportGenerator({ notionToken: process.env.NOTION_TOKEN });
    const report = await generator.generateQuarterlyStakeholderReport();
    generator.exportToMarkdown(report);
    generator.exportToJSON(report);
  }

  /**
   * Template: List
   */
  async listTemplates(options) {
    const manager = new TemplateManager({ notionToken: process.env.NOTION_TOKEN });
    manager.listTemplates();
  }

  /**
   * Template: Apply
   */
  async applyTemplate(options) {
    if (!options.template || !options.parent) {
      throw new Error('Required options: --template <name> --parent <page-id>');
    }
    
    const manager = new TemplateManager({ notionToken: process.env.NOTION_TOKEN });
    await manager.applyTemplate(options.template, options.parent, options);
  }

  /**
   * Show workspace status
   */
  async showStatus(options) {
    console.log('\n📊 LUDUS Workspace Status');
    console.log('=========================\n');
    
    this.config.printSummary();
    
    // Check environment
    console.log('🔑 Environment:');
    console.log(`   NOTION_TOKEN: ${process.env.NOTION_TOKEN ? '✓ Set' : '✗ Not set'}`);
    console.log(`   LINEAR_API_KEY: ${process.env.LINEAR_API_KEY ? '✓ Set' : '✗ Not set'}`);
    console.log(`   GITHUB_TOKEN: ${process.env.GITHUB_TOKEN ? '✓ Set' : '✗ Not set'}`);
    console.log('');
  }

  /**
   * Show configuration
   */
  async showConfig(options) {
    console.log('\n⚙️  Workspace Configuration');
    console.log('==========================\n');
    
    if (options.json) {
      console.log(JSON.stringify(this.config.config, null, 2));
    } else {
      this.config.printSummary();
      
      console.log('Databases:');
      const dbIds = this.config.getAllDatabaseIds();
      for (const [key, id] of Object.entries(dbIds)) {
        console.log(`   ${key}: ${id}`);
      }
      
      console.log('\nPages:');
      const pageIds = this.config.getAllPageIds();
      for (const [key, id] of Object.entries(pageIds)) {
        console.log(`   ${key}: ${id}`);
      }
    }
    console.log('');
  }

  /**
   * Show help
   */
  showHelp() {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║              LUDUS Workspace CLI - Help Guide                 ║
╚═══════════════════════════════════════════════════════════════╝

📖 USAGE:
   node scripts/cli/ludus-workspace-cli.js <command> [options]
   npm run workspace <command> [-- options]

🚀 SETUP COMMANDS:
   setup:all                Set up complete workspace (pages + databases)
   setup:databases          Set up databases only
   setup:integrations       Set up external integrations
   setup:dashboards         Set up all dashboards
   setup:templates          Set up all templates

🔄 SYNC COMMANDS:
   sync:linear              Bi-directional sync with Linear
   sync:linear-to-notion    Sync Linear → Notion only
   sync:notion-to-linear    Sync Notion → Linear only
   sync:github              Sync GitHub activity and PRs
   sync:all                 Sync all integrations

📥 IMPORT COMMANDS:
   import:linear-projects   Import Linear projects to Notion
   import:ludus-tasks       Import LUDUS development plan tasks (60 tasks)

🔧 GITHUB COMMANDS:
   github:track             Track GitHub commits and activity
   github:reviews           Generate code review dashboard
   github:releases          Track releases and deployments

🤖 AUTOMATION COMMANDS:
   auto:daily               Run daily sync (tasks, metrics, overdue)
   auto:weekly              Run weekly reports generation
   auto:budget              Run budget monitoring and alerts

📊 DASHBOARD COMMANDS:
   dashboard:executive      Create executive dashboard
   dashboard:pm             Create project manager dashboard
   dashboard:roles          Create role-based dashboards (dev, QA, etc.)

📈 REPORT COMMANDS:
   report:weekly            Generate weekly progress report
   report:monthly           Generate monthly financial report
   report:quarterly         Generate quarterly stakeholder report
   report:budget            Generate budget analysis report
   report:team              Generate team capacity report

📝 TEMPLATE COMMANDS:
   template:setup           Create all default templates
   template:list            List available templates
   template:apply           Apply template to create new page

🔧 MAINTENANCE COMMANDS:
   maintain:check           Check workspace health
   maintain:cleanup         Clean up workspace
   maintain:backup          Backup workspace configuration
   maintain:full            Run full maintenance (check + fix + backup)

📋 STATUS COMMANDS:
   status                   Show workspace status
   config                   Show workspace configuration

⚙️  OPTIONS:
   --dry-run, -d           Simulate without making changes
   --force, -f             Force operation (skip confirmations)
   --team <key>            Specify Linear team key (default: LET)
   --template <name>       Template name for template:apply
   --parent <id>           Parent page ID for template:apply
   --json                  Output in JSON format
   --verbose, -v           Verbose output

💡 EXAMPLES:
   # Complete workspace setup
   npm run workspace setup:all

   # Run daily automation
   npm run workspace auto:daily

   # Generate weekly report
   npm run workspace report:weekly

   # Create dashboards
   npm run workspace setup:dashboards

   # Check workspace health
   npm run workspace maintain:check

   # Track GitHub activity
   npm run workspace github:track

   # List available templates
   npm run workspace template:list

   # Show status
   npm run workspace status

📚 For more information, see: docs/workspace-automation-guide.md

═══════════════════════════════════════════════════════════════
`);
  }
}

// Main execution
async function main() {
  const cli = new LudusWorkspaceCLI();
  const success = await cli.execute(process.argv.slice(2));
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    console.error('CLI error:', error);
    process.exit(1);
  });
}

module.exports = { LudusWorkspaceCLI };

