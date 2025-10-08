/**
 * @fileoverview Migration Service - LDS-007 Implementation
 * 
 * High-level service for managing database migrations in the LUDUS platform.
 * Provides programmatic access to migration operations with error handling,
 * logging, and integration with the application lifecycle.
 * 
 * @version 1.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const MigrationRunner = require('./MigrationRunner');
const path = require('path');

/**
 * Migration Service Class
 * 
 * Provides high-level migration management with proper error handling,
 * logging, and integration with the LUDUS platform.
 */
class MigrationService {
  constructor(options = {}) {
    this.runner = new MigrationRunner({
      migrationsPath: options.migrationsPath || path.join(__dirname, 'versions'),
      collectionName: options.collectionName || 'migrations',
      verbose: options.verbose || false,
      dryRun: options.dryRun || false
    });
    
    this.isInitialized = false;
  }

  /**
   * Initialize the migration service
   */
  async initialize() {
    if (this.isInitialized) {
      return true;
    }

    try {
      await this.runner.initialize();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize migration service:', error.message);
      throw error;
    }
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(targetVersion = null) {
    await this.ensureInitialized();
    
    try {
      console.log('🚀 Starting migration process...');
      const result = await this.runner.up(targetVersion);
      
      if (result.success) {
        console.log(`✅ Migrations completed successfully. ${result.migrationsRun} migrations executed.`);
        return {
          success: true,
          migrationsRun: result.migrationsRun,
          migrations: result.migrations
        };
      } else {
        console.error('❌ Migration failed');
        throw new Error(`Migration failed: ${result.errors.map(e => e.error).join(', ')}`);
      }
    } catch (error) {
      console.error('Migration error:', error.message);
      throw error;
    }
  }

  /**
   * Rollback migrations
   */
  async rollbackMigrations(targetVersion = null) {
    await this.ensureInitialized();
    
    try {
      console.log('🔄 Starting rollback process...');
      const result = await this.runner.down(targetVersion);
      
      if (result.success) {
        console.log(`✅ Rollback completed successfully. ${result.migrationsRolledBack} migrations rolled back.`);
        return {
          success: true,
          migrationsRolledBack: result.migrationsRolledBack,
          migrations: result.migrations
        };
      } else {
        console.error('❌ Rollback failed');
        throw new Error(`Rollback failed: ${result.errors.map(e => e.error).join(', ')}`);
      }
    } catch (error) {
      console.error('Rollback error:', error.message);
      throw error;
    }
  }

  /**
   * Get migration status
   */
  async getStatus() {
    await this.ensureInitialized();
    
    try {
      const status = await this.runner.status();
      return {
        currentVersion: status.currentVersion,
        latestVersion: status.latestVersion,
        executedMigrations: status.executedMigrations,
        totalMigrations: status.totalMigrations,
        pendingMigrations: status.pendingMigrations,
        migrations: status.migrations
      };
    } catch (error) {
      console.error('Failed to get migration status:', error.message);
      throw error;
    }
  }

  /**
   * Create a new migration
   */
  async createMigration(name, description) {
    await this.ensureInitialized();
    
    try {
      const result = await this.runner.createMigration(name, description);
      console.log(`✅ Migration created: ${result.fileName}`);
      return result;
    } catch (error) {
      console.error('Failed to create migration:', error.message);
      throw error;
    }
  }

  /**
   * Validate all migration files
   */
  async validateMigrations() {
    await this.ensureInitialized();
    
    try {
      let validCount = 0;
      let invalidCount = 0;
      const errors = [];
      
      for (const migration of this.runner.migrations) {
        const isValid = this.runner.validateMigration(migration);
        
        if (isValid) {
          validCount++;
        } else {
          invalidCount++;
          errors.push({
            version: migration.version,
            name: migration.name,
            error: 'Invalid migration structure'
          });
        }
      }
      
      return {
        valid: validCount,
        invalid: invalidCount,
        errors: errors
      };
    } catch (error) {
      console.error('Failed to validate migrations:', error.message);
      throw error;
    }
  }

  /**
   * Check if migrations are needed
   */
  async needsMigration() {
    const status = await this.getStatus();
    return status.pendingMigrations > 0;
  }

  /**
   * Get pending migrations
   */
  async getPendingMigrations() {
    const status = await this.getStatus();
    return status.migrations.filter(m => !m.executed);
  }

  /**
   * Run migrations if needed
   */
  async runMigrationsIfNeeded() {
    const needsMigration = await this.needsMigration();
    
    if (needsMigration) {
      console.log('Pending migrations detected. Running migrations...');
      return await this.runMigrations();
    } else {
      console.log('No pending migrations. Database is up to date.');
      return {
        success: true,
        migrationsRun: 0,
        migrations: []
      };
    }
  }

  /**
   * Ensure service is initialized
   */
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    if (this.isInitialized) {
      await this.runner.cleanup();
      this.isInitialized = false;
    }
  }

  /**
   * Get migration runner instance (for advanced usage)
   */
  getRunner() {
    return this.runner;
  }
}

module.exports = MigrationService;
