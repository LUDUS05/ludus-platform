#!/usr/bin/env node

/**
 * Complete Workspace Setup Orchestrator
 * Coordinates the creation of the entire LUDUS Platform Notion workspace
 */

const { NotionHelperExtended } = require('./lib/notion-helper-extended');
const { ConfigManager } = require('./lib/config-manager');
const { ViewCreator } = require('./workspace/view-creator');
const { ProjectsDatabaseCreator } = require('./workspace/create-projects-database');
const { TasksDatabaseCreator } = require('./workspace/enhance-tasks-database');
const { OperationsDatabaseCreator } = require('./workspace/create-operations-database');
const { BudgetDatabaseCreator } = require('./workspace/create-budget-database');
const { DocumentsDatabaseCreator } = require('./workspace/create-documents-database');
const { TeamDatabaseCreator } = require('./workspace/create-team-database');
const { parseArgs, validateEnv, loadEnv } = require('./lib/utils');

class WorkspaceOrchestrator {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.force = options.force || false;
    
    // Load environment variables
    loadEnv('development.env');
    loadEnv('.env');
    
    // Validate required env vars
    validateEnv(['NOTION_TOKEN']);
    
    // Initialize helpers
    this.notion = new NotionHelperExtended({ token: process.env.NOTION_TOKEN });
    this.config = new ConfigManager();
    this.viewCreator = new ViewCreator(this.notion);
    
    // Track progress
    this.progress = {
      pages: 0,
      databases: 0,
      errors: []
    };
  }

  /**
   * Main setup workflow
   */
  async setup() {
    console.log('\n🚀 LUDUS Platform - Complete Workspace Setup');
    console.log('=============================================\n');
    
    const startTime = Date.now();
    
    try {
      // Check if workspace already exists
      if (!this.force && this.workspaceExists()) {
        console.log('⚠️  Workspace already exists!');
        console.log('   Use --force to recreate or update existing workspace.');
        return false;
      }
      
      // Get parent page ID
      const parentPageId = this.getParentPageId();
      if (!parentPageId) {
        console.log('⚠️  Parent page ID required!');
        console.log('');
        console.log('📝 To create the workspace, you need to:');
        console.log('');
        console.log('   1. Create a page in Notion (any name, e.g., "LUDUS Workspace")');
        console.log('   2. Share it with your integration: "LUDUS Workspace Automation"');
        console.log('   3. Copy the page URL or ID');
        console.log('   4. Set the environment variable:');
        console.log('');
        console.log('      export NOTION_PARENT_PAGE_ID=your-page-id');
        console.log('      # or add to development.env:');
        console.log('      echo "NOTION_PARENT_PAGE_ID=your-page-id" >> development.env');
        console.log('');
        console.log('   5. Run setup again: npm run workspace:setup');
        console.log('');
        console.log('📖 See NOTION_TOKEN_SETUP.md for detailed instructions');
        return false;
      }
      
      // Store parent page ID in config
      this.config.updatePage('parent', {
        id: parentPageId,
        name: 'Parent Container',
        created: new Date().toISOString()
      });
      
      // Phase 1: Create main workspace structure
      await this.createWorkspaceStructure(parentPageId);
      
      // Phase 2: Create databases
      await this.createDatabases();
      
      // Phase 3: Setup relations between databases
      await this.setupDatabaseRelations();
      
      // Phase 4: Generate view documentation
      await this.documentViews();
      
      // Phase 5: Create sample data (optional)
      if (process.env.CREATE_SAMPLE_DATA === 'true') {
        await this.createSampleData();
      }
      
      // Save configuration
      this.config.save();
      
      const duration = (Date.now() - startTime) / 1000;
      
      console.log('\n🎉 Workspace setup completed successfully!');
      console.log(`   Duration: ${duration.toFixed(2)}s`);
      console.log(`   Pages created: ${this.progress.pages}`);
      console.log(`   Databases created: ${this.progress.databases}`);
      
      if (this.progress.errors.length > 0) {
        console.log(`\n⚠️  ${this.progress.errors.length} errors occurred:`);
        this.progress.errors.forEach(error => console.log(`   • ${error}`));
      }
      
      this.config.printSummary();
      
      return true;
      
    } catch (error) {
      console.error('\n❌ Workspace setup failed:', error.message);
      console.error(error.stack);
      return false;
    }
  }

  /**
   * Check if workspace already exists
   */
  workspaceExists() {
    return this.config.getPageId('main') !== null;
  }

  /**
   * Get or prompt for parent page ID
   */
  getParentPageId() {
    // Check if parent page ID is set in environment
    const envParentId = process.env.NOTION_PARENT_PAGE_ID;
    if (envParentId) {
      console.log(`📍 Using parent page ID from environment: ${envParentId}`);
      return envParentId;
    }
    
    // Check config
    const configParentId = this.config.getPageId('parent');
    if (configParentId) {
      console.log(`📍 Using parent page ID from config: ${configParentId}`);
      return configParentId;
    }
    
    return null;
  }

  /**
   * Create main workspace structure (pages)
   */
  async createWorkspaceStructure(parentPageId) {
    console.log('📄 Phase 1: Creating workspace structure...');
    console.log('');
    
    // Create main workspace page
    const mainPage = await this.createMainPage(parentPageId);
    this.config.updatePage('main', {
      id: mainPage.id,
      name: 'LUDUS Platform - Social Activity Management',
      created: new Date().toISOString()
    });
    
    // Create sub-pages
    const projectManagementPage = await this.createProjectManagementPage(mainPage.id);
    this.config.updatePage('project_management', {
      id: projectManagementPage.id,
      name: 'Project Management',
      created: new Date().toISOString()
    });
    
    const featuresPage = await this.createFeaturesPage(mainPage.id);
    this.config.updatePage('features', {
      id: featuresPage.id,
      name: 'LUDUS Platform Features',
      created: new Date().toISOString()
    });
    
    const developmentPage = await this.createDevelopmentPage(mainPage.id);
    this.config.updatePage('development', {
      id: developmentPage.id,
      name: 'Development',
      created: new Date().toISOString()
    });
    
    const documentationPage = await this.createDocumentationPage(mainPage.id);
    this.config.updatePage('documentation', {
      id: documentationPage.id,
      name: 'Documentation',
      created: new Date().toISOString()
    });
    
    console.log(`\n✅ Phase 1 complete: ${this.progress.pages} pages created\n`);
  }

  /**
   * Create main workspace page
   */
  async createMainPage(parentPageId) {
    const content = this.notion.parseMarkdownToBlocks(`# LUDUS Platform - Social Activity Management

Welcome to the LUDUS platform workspace! This is your central hub for managing the social activity platform development.

## 🎯 Platform Overview
LUDUS is a comprehensive social activity platform designed for the Saudi Arabian market, enabling users to discover, organize, and participate in social activities.

## 📋 Quick Navigation
- **Project Management** - Track development progress and milestones
- **Features** - Manage platform features and functionality
- **Development** - Technical tasks and development tracking
- **Documentation** - Technical and user documentation
- **Team** - Team directory and capacity planning

## 🚀 Getting Started
1. Review the project roadmap in Project Management
2. Check current development status in Development
3. Access feature databases in Features section
4. Review team capacity in Team Directory

## 📊 Key Metrics
- Total Budget: 2,643,000 SAR
- Team Size: Growing
- Current Phase: Active Development
- Platform Version: 1.0.0-alpha

---
*Last updated: ${new Date().toISOString()}*
`);

    const page = await this.notion.createPage({
      title: 'LUDUS Platform - Social Activity Management',
      parentId: parentPageId,
      content: content,
      icon: { type: 'emoji', emoji: '🎯' },
      cover: null
    });
    
    this.progress.pages++;
    return page;
  }

  /**
   * Create Project Management page
   */
  async createProjectManagementPage(parentId) {
    const content = this.notion.parseMarkdownToBlocks(`# Project Management

Central hub for managing LUDUS platform development projects and tasks.

## 📈 Current Status
- **Phase:** Development
- **Version:** 1.0.0-alpha
- **Last Updated:** ${new Date().toISOString()}

## 🎯 Key Projects
All projects are tracked in the databases below. Use different views to see projects by phase, priority, or team.

## 📊 Progress Tracking
- Projects Master Database - All projects and milestones
- Development Tasks Database - Detailed task tracking with Linear integration
- Sprint Planning - Organized by sprints and cycles

## 🔄 Workflow
1. Create project in Projects Master Database
2. Break down into tasks in Development Tasks
3. Assign team members and set priorities
4. Track progress and update status
5. Review and iterate based on metrics
`);

    const page = await this.notion.createPage({
      title: 'Project Management',
      parentId: parentId,
      content: content,
      icon: { type: 'emoji', emoji: '📊' }
    });
    
    this.progress.pages++;
    return page;
  }

  /**
   * Create Features page
   */
  async createFeaturesPage(parentId) {
    const content = this.notion.parseMarkdownToBlocks(`# LUDUS Platform Features

Comprehensive management of all LUDUS platform features and functionality.

## 🏗️ Core Features
- User Management - Registration, authentication, profiles
- Activity Management - Create, browse, join activities
- Vendor Management - Vendor profiles and services
- Notification System - Real-time notifications
- Review System - Ratings and reviews
- Payment Processing - Secure payment integration
- Analytics & Reporting - Usage metrics and insights

## 📊 Feature Status
Track the development status of each feature using the databases below.

## 🔄 Development Process
1. Feature planning and specification
2. Technical design and architecture
3. Development and implementation
4. Testing and quality assurance
5. Deployment and monitoring
6. User feedback and iteration
`);

    const page = await this.notion.createPage({
      title: 'LUDUS Platform Features',
      parentId: parentId,
      content: content,
      icon: { type: 'emoji', emoji: '🎯' }
    });
    
    this.progress.pages++;
    return page;
  }

  /**
   * Create Development page
   */
  async createDevelopmentPage(parentId) {
    const content = this.notion.parseMarkdownToBlocks(`# Development

Technical development resources and documentation for the LUDUS platform.

## 🏗️ Architecture
- **Frontend:** React with TypeScript
- **Backend:** Node.js with Express
- **Database:** MongoDB
- **Authentication:** Firebase Auth
- **Deployment:** Render
- **Repository:** GitHub

## 📚 Technical Documentation
- API Documentation
- Database Schema
- Frontend Components
- Backend Services
- Deployment Guides
- Testing Strategies

## 🧪 Testing
- Unit Tests - Component and function testing
- Integration Tests - API and service testing
- End-to-End Tests - Full workflow testing
- Performance Tests - Load and stress testing

## 🔧 Development Tools
- Version Control: Git/GitHub
- Project Management: Linear + Notion
- Code Review: GitHub Pull Requests
- CI/CD: Render Auto-deploy
- Monitoring: Firebase Analytics
`);

    const page = await this.notion.createPage({
      title: 'Development',
      parentId: parentId,
      content: content,
      icon: { type: 'emoji', emoji: '💻' }
    });
    
    this.progress.pages++;
    return page;
  }

  /**
   * Create Documentation page
   */
  async createDocumentationPage(parentId) {
    const content = this.notion.parseMarkdownToBlocks(`# Documentation

Comprehensive documentation for the LUDUS platform.

## 📖 User Documentation
- User Guides - How to use the platform
- Feature Explanations - Detailed feature descriptions
- FAQ - Frequently asked questions
- Troubleshooting - Common issues and solutions

## 🔧 Technical Documentation
- API Reference - Complete API documentation
- Database Schema - Data model and relationships
- Architecture Overview - System design and patterns
- Deployment Guides - Setup and deployment instructions

## 📋 Project Documentation
- Requirements - Feature requirements and specifications
- Specifications - Technical specifications
- Design Documents - System and UI/UX design
- Meeting Notes - Important decisions and discussions

## 📥 Documents Hub
All documents are managed in the Documents Hub database with proper categorization, access control, and review schedules.
`);

    const page = await this.notion.createPage({
      title: 'Documentation',
      parentId: parentId,
      content: content,
      icon: { type: 'emoji', emoji: '📚' }
    });
    
    this.progress.pages++;
    return page;
  }

  /**
   * Create all databases
   */
  async createDatabases() {
    console.log('🗄️  Phase 2: Creating databases...');
    console.log('');
    
    // Get parent page IDs
    const projectManagementId = this.config.getPageId('project_management');
    const mainId = this.config.getPageId('main');
    const documentationId = this.config.getPageId('documentation');
    
    // Create Projects Master Database
    await this.createProjectsDatabase(projectManagementId);
    
    // Get projects database ID for relations
    const projectsDatabaseId = this.config.getDatabaseId('projects');
    
    // Create other databases with project relations
    await this.createTasksDatabase(projectManagementId, projectsDatabaseId);
    await this.createOperationsDatabase(mainId);
    await this.createBudgetDatabase(mainId, projectsDatabaseId);
    await this.createDocumentsDatabase(documentationId, projectsDatabaseId);
    await this.createTeamDatabase(mainId, projectsDatabaseId);
    
    console.log(`\n✅ Phase 2 complete: ${this.progress.databases} databases created\n`);
  }

  /**
   * Create Projects Master Database
   */
  async createProjectsDatabase(parentId) {
    try {
      const creator = new ProjectsDatabaseCreator(this.notion, { dryRun: this.dryRun });
      const database = await creator.create(parentId);
      
      this.config.updateDatabase('projects', {
        id: database.id,
        name: creator.databaseName,
        created: new Date().toISOString()
      });
      
      this.progress.databases++;
    } catch (error) {
      this.progress.errors.push(`Projects Database: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create Tasks Database
   */
  async createTasksDatabase(parentId, projectsDatabaseId) {
    try {
      const creator = new TasksDatabaseCreator(this.notion, { dryRun: this.dryRun });
      const database = await creator.create(parentId, projectsDatabaseId);
      
      this.config.updateDatabase('tasks', {
        id: database.id,
        name: creator.databaseName,
        created: new Date().toISOString()
      });
      
      this.progress.databases++;
    } catch (error) {
      this.progress.errors.push(`Tasks Database: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create Operations Database
   */
  async createOperationsDatabase(parentId) {
    try {
      const creator = new OperationsDatabaseCreator(this.notion, { dryRun: this.dryRun });
      const database = await creator.create(parentId);
      
      this.config.updateDatabase('operations', {
        id: database.id,
        name: creator.databaseName,
        created: new Date().toISOString()
      });
      
      this.progress.databases++;
    } catch (error) {
      this.progress.errors.push(`Operations Database: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create Budget Database
   */
  async createBudgetDatabase(parentId, projectsDatabaseId) {
    try {
      const creator = new BudgetDatabaseCreator(this.notion, { dryRun: this.dryRun });
      const database = await creator.create(parentId, projectsDatabaseId);
      
      this.config.updateDatabase('budget', {
        id: database.id,
        name: creator.databaseName,
        created: new Date().toISOString()
      });
      
      this.progress.databases++;
    } catch (error) {
      this.progress.errors.push(`Budget Database: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create Documents Database
   */
  async createDocumentsDatabase(parentId, projectsDatabaseId) {
    try {
      const creator = new DocumentsDatabaseCreator(this.notion, { dryRun: this.dryRun });
      const database = await creator.create(parentId, projectsDatabaseId);
      
      this.config.updateDatabase('documents', {
        id: database.id,
        name: creator.databaseName,
        created: new Date().toISOString()
      });
      
      this.progress.databases++;
    } catch (error) {
      this.progress.errors.push(`Documents Database: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create Team Database
   */
  async createTeamDatabase(parentId, projectsDatabaseId) {
    try {
      const creator = new TeamDatabaseCreator(this.notion, { dryRun: this.dryRun });
      const database = await creator.create(parentId, projectsDatabaseId);
      
      this.config.updateDatabase('team', {
        id: database.id,
        name: creator.databaseName,
        created: new Date().toISOString()
      });
      
      this.progress.databases++;
    } catch (error) {
      this.progress.errors.push(`Team Database: ${error.message}`);
      throw error;
    }
  }

  /**
   * Setup self-relations and dependencies
   */
  async setupDatabaseRelations() {
    console.log('🔗 Phase 3: Setting up database relations...');
    console.log('');
    
    try {
      // Add self-relation for Projects (Dependencies)
      const projectsId = this.config.getDatabaseId('projects');
      if (projectsId) {
        const projectsCreator = new ProjectsDatabaseCreator(this.notion);
        await projectsCreator.addDependenciesRelation(projectsId);
      }
      
      // Add self-relation for Team (Manager)
      const teamId = this.config.getDatabaseId('team');
      if (teamId) {
        const teamCreator = new TeamDatabaseCreator(this.notion);
        await teamCreator.addManagerRelation(teamId);
      }
      
      console.log('✅ Phase 3 complete: Relations configured\n');
    } catch (error) {
      this.progress.errors.push(`Relations setup: ${error.message}`);
      console.log(`⚠️  Phase 3 completed with errors\n`);
    }
  }

  /**
   * Document view configurations
   */
  async documentViews() {
    console.log('📋 Phase 4: Documenting view configurations...');
    console.log('');
    
    this.viewCreator.logViewConfigurations('Projects Master', this.viewCreator.getProjectsViews());
    this.viewCreator.logViewConfigurations('Development Tasks', this.viewCreator.getTasksViews());
    this.viewCreator.logViewConfigurations('Operations & Team Tasks', this.viewCreator.getOperationsViews());
    this.viewCreator.logViewConfigurations('Budget & Financial Tracking', this.viewCreator.getBudgetViews());
    this.viewCreator.logViewConfigurations('Documents Hub', this.viewCreator.getDocumentsViews());
    this.viewCreator.logViewConfigurations('Team Directory', this.viewCreator.getTeamViews());
    
    console.log('\n✅ Phase 4 complete: View configurations documented\n');
  }

  /**
   * Create sample data (optional)
   */
  async createSampleData() {
    console.log('📝 Phase 5: Creating sample data...');
    console.log('   (Skipping - implement as needed)');
    console.log('');
  }
}

// Main execution
async function main() {
  const args = parseArgs(process.argv.slice(2));
  
  const orchestrator = new WorkspaceOrchestrator({
    dryRun: args['dry-run'] || args.d || false,
    force: args.force || args.f || false
  });
  
  const success = await orchestrator.setup();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { WorkspaceOrchestrator };

