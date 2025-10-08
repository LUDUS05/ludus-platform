#!/usr/bin/env node

/**
 * @fileoverview Migration CLI Tool - LDS-007 Implementation
 * 
 * Command-line interface for managing database migrations in the LUDUS platform.
 * Provides commands for running migrations, rollbacks, status checking, and more.
 * 
 * Usage:
 *   node cli.js up [version]           - Run migrations up to version
 *   node cli.js down [version]         - Rollback migrations to version
 *   node cli.js status                 - Show migration status
 *   node cli.js create <name>          - Create new migration
 *   node cli.js validate               - Validate migration files
 *   node cli.js reset                  - Reset all migrations (dangerous)
 * 
 * @version 1.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const MigrationRunner = require('./MigrationRunner');
const path = require('path');
const fs = require('fs').promises;

/**
 * CLI Command Handler
 */
class MigrationCLI {
  constructor() {
    this.runner = new MigrationRunner({
      migrationsPath: path.join(__dirname, 'versions'),
      verbose: true
    });
  }

  /**
   * Main CLI entry point
   */
  async run() {
    try {
      const command = process.argv[2];
      const args = process.argv.slice(3);

      if (!command) {
        this.showHelp();
        return;
      }

      await this.runner.initialize();

      switch (command) {
        case 'up':
          await this.runUp(args[0]);
          break;
        case 'down':
          await this.runDown(args[0]);
          break;
        case 'status':
          await this.runStatus();
          break;
        case 'create':
          await this.runCreate(args[0], args[1]);
          break;
        case 'validate':
          await this.runValidate();
          break;
        case 'reset':
          await this.runReset();
          break;
        case 'help':
          this.showHelp();
          break;
        default:
          console.log(`Unknown command: ${command}`);
          this.showHelp();
      }

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    } finally {
      await this.runner.cleanup();
    }
  }

  /**
   * Run migrations up
   */
  async runUp(targetVersion) {
    console.log('🚀 Running migrations up...');
    
    const result = await this.runner.up(targetVersion);
    
    if (result.success) {
      console.log(`✅ Successfully ran ${result.migrationsRun} migrations`);
      
      if (result.migrations.length > 0) {
        console.log('\nMigrations executed:');
        result.migrations.forEach(migration => {
          console.log(`  ✓ ${migration.version} - ${migration.name}`);
        });
      }
    } else {
      console.log('❌ Migration failed');
      
      if (result.errors.length > 0) {
        console.log('\nErrors:');
        result.errors.forEach(error => {
          console.log(`  ✗ ${error.version} - ${error.name}: ${error.error}`);
        });
      }
      
      process.exit(1);
    }
  }

  /**
   * Run migrations down (rollback)
   */
  async runDown(targetVersion) {
    console.log('🔄 Rolling back migrations...');
    
    const result = await this.runner.down(targetVersion);
    
    if (result.success) {
      console.log(`✅ Successfully rolled back ${result.migrationsRolledBack} migrations`);
      
      if (result.migrations.length > 0) {
        console.log('\nMigrations rolled back:');
        result.migrations.forEach(migration => {
          console.log(`  ✓ ${migration.version} - ${migration.name}`);
        });
      }
    } else {
      console.log('❌ Rollback failed');
      
      if (result.errors.length > 0) {
        console.log('\nErrors:');
        result.errors.forEach(error => {
          console.log(`  ✗ ${error.version} - ${error.name}: ${error.error}`);
        });
      }
      
      process.exit(1);
    }
  }

  /**
   * Show migration status
   */
  async runStatus() {
    console.log('📊 Migration Status\n');
    
    const status = await this.runner.status();
    
    console.log(`Current Version: ${status.currentVersion}`);
    console.log(`Latest Version: ${status.latestVersion}`);
    console.log(`Executed Migrations: ${status.executedMigrations}`);
    console.log(`Total Migrations: ${status.totalMigrations}`);
    console.log(`Pending Migrations: ${status.pendingMigrations}`);
    
    if (status.migrations.length > 0) {
      console.log('\nMigration Details:');
      console.log('┌─────────────┬─────────────────────────────┬─────────────┬─────────────────────┐');
      console.log('│ Version     │ Name                        │ Status      │ Executed At         │');
      console.log('├─────────────┼─────────────────────────────┼─────────────┼─────────────────────┤');
      
      status.migrations.forEach(migration => {
        const version = migration.version.padEnd(11);
        const name = migration.name.substring(0, 27).padEnd(27);
        const status = migration.executed ? '✓ Executed'.padEnd(11) : '○ Pending'.padEnd(11);
        const executedAt = migration.executed ? 
          migration.executedAt.toISOString().split('T')[0] : 
          'N/A'.padEnd(19);
        
        console.log(`│ ${version} │ ${name} │ ${status} │ ${executedAt} │`);
      });
      
      console.log('└─────────────┴─────────────────────────────┴─────────────┴─────────────────────┘');
    }
  }

  /**
   * Create new migration
   */
  async runCreate(name, description) {
    if (!name) {
      console.log('❌ Migration name is required');
      console.log('Usage: node cli.js create <name> [description]');
      return;
    }

    console.log(`📝 Creating migration: ${name}`);
    
    const result = await this.runner.createMigration(
      name, 
      description || `Migration: ${name}`
    );
    
    console.log(`✅ Created migration file: ${result.fileName}`);
    console.log(`   Version: ${result.version}`);
    console.log(`   Path: ${result.filePath}`);
    console.log('\nNext steps:');
    console.log('1. Edit the migration file to implement your changes');
    console.log('2. Test the migration with: node cli.js validate');
    console.log('3. Run the migration with: node cli.js up');
  }

  /**
   * Validate migration files
   */
  async runValidate() {
    console.log('🔍 Validating migration files...\n');
    
    let validCount = 0;
    let invalidCount = 0;
    
    for (const migration of this.runner.migrations) {
      const isValid = this.runner.validateMigration(migration);
      
      if (isValid) {
        console.log(`✓ ${migration.version} - ${migration.name}`);
        validCount++;
      } else {
        console.log(`✗ ${migration.version} - ${migration.name} (Invalid)`);
        invalidCount++;
      }
    }
    
    console.log(`\nValidation Results:`);
    console.log(`  Valid: ${validCount}`);
    console.log(`  Invalid: ${invalidCount}`);
    
    if (invalidCount > 0) {
      console.log('\n❌ Some migration files are invalid. Please fix them before running migrations.');
      process.exit(1);
    } else {
      console.log('\n✅ All migration files are valid.');
    }
  }

  /**
   * Reset all migrations (dangerous)
   */
  async runReset() {
    console.log('⚠️  WARNING: This will reset all migrations and may cause data loss!');
    console.log('Are you sure you want to continue? (yes/no)');
    
    // In a real implementation, you'd want to use readline for user input
    // For now, we'll just show a warning
    console.log('❌ Reset command requires interactive confirmation. Not implemented in this version.');
    console.log('To reset migrations manually:');
    console.log('1. Drop the migrations collection: db.migrations.drop()');
    console.log('2. Run migrations from scratch: node cli.js up');
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(`
🗄️  LUDUS Database Migration CLI

Usage: node cli.js <command> [options]

Commands:
  up [version]           Run migrations up to specified version (or latest)
  down [version]         Rollback migrations to specified version (or previous)
  status                 Show current migration status and details
  create <name> [desc]   Create a new migration file
  validate               Validate all migration files
  reset                  Reset all migrations (dangerous - requires confirmation)
  help                   Show this help message

Examples:
  node cli.js up                    # Run all pending migrations
  node cli.js up 1.2.0             # Run migrations up to version 1.2.0
  node cli.js down                  # Rollback one migration
  node cli.js down 1.1.0           # Rollback to version 1.1.0
  node cli.js status               # Show migration status
  node cli.js create add_users     # Create migration named "add_users"
  node cli.js validate             # Validate all migration files

Environment Variables:
  NODE_ENV              Environment (development, production, test)
  MONGODB_URI           MongoDB connection string
  MIGRATION_VERBOSE     Enable verbose logging (true/false)
  MIGRATION_DRY_RUN     Run in dry-run mode (true/false)

For more information, visit: https://github.com/LUDUS05/ludus-platform
`);
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new MigrationCLI();
  cli.run().catch(error => {
    console.error('❌ CLI Error:', error.message);
    process.exit(1);
  });
}

module.exports = MigrationCLI;
