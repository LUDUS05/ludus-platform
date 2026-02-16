/**
 * @fileoverview Database Migration Runner - LDS-007 Implementation
 * 
 * This module provides a comprehensive database migration system for the LUDUS platform
 * with version control, rollback capabilities, and environment-specific handling.
 * 
 * Key Features:
 * - Version control and tracking
 * - Safe rollback functionality
 * - Environment-specific migrations
 * - Data validation and integrity checks
 * - Comprehensive logging and error handling
 * - CI/CD integration support
 * 
 * @version 1.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const { connectDB } = require('../config/database');

/**
 * Migration Runner Class
 * 
 * Handles all database migration operations including running migrations,
 * rollbacks, version tracking, and validation.
 */
class MigrationRunner {
  constructor(options = {}) {
    this.migrationsPath = options.migrationsPath || path.join(__dirname, 'versions');
    this.collectionName = options.collectionName || 'migrations';
    this.environment = process.env.NODE_ENV || 'development';
    this.verbose = options.verbose || false;
    this.dryRun = options.dryRun || false;
    
    this.migrations = [];
    this.currentVersion = null;
    this.targetVersion = null;
  }

  /**
   * Initialize the migration runner
   */
  async initialize() {
    try {
      // Connect to database
      const connected = await connectDB();
      if (!connected) {
        throw new Error('Failed to connect to database');
      }

      // Load migration files
      await this.loadMigrations();
      
      // Get current version
      this.currentVersion = await this.getCurrentVersion();
      
      this.log('Migration runner initialized successfully');
      this.log(`Current version: ${this.currentVersion}`);
      this.log(`Environment: ${this.environment}`);
      
      return true;
    } catch (error) {
      this.log(`Failed to initialize migration runner: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Load all migration files from the versions directory
   */
  async loadMigrations() {
    try {
      const files = await fs.readdir(this.migrationsPath);
      const migrationFiles = files
        .filter(file => file.endsWith('.js'))
        .sort();

      for (const file of migrationFiles) {
        const migrationPath = path.join(this.migrationsPath, file);
        const migration = require(migrationPath);
        
        if (this.validateMigration(migration)) {
          this.migrations.push({
            version: migration.version,
            name: migration.name,
            description: migration.description,
            up: migration.up,
            down: migration.down,
            environment: migration.environment || 'all',
            dependencies: migration.dependencies || [],
            file: file
          });
        }
      }

      this.log(`Loaded ${this.migrations.length} migration files`);
    } catch (error) {
      this.log(`Failed to load migrations: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Validate migration structure
   */
  validateMigration(migration) {
    const required = ['version', 'name', 'up', 'down'];
    const missing = required.filter(field => !migration[field]);
    
    if (missing.length > 0) {
      this.log(`Invalid migration: missing ${missing.join(', ')}`, 'error');
      return false;
    }

    if (typeof migration.up !== 'function' || typeof migration.down !== 'function') {
      this.log('Invalid migration: up and down must be functions', 'error');
      return false;
    }

    return true;
  }

  /**
   * Get current database version
   */
  async getCurrentVersion() {
    try {
      const db = mongoose.connection.db;
      const collection = db.collection(this.collectionName);
      
      const latest = await collection
        .findOne({}, { sort: { version: -1 } });
      
      return latest ? latest.version : '0.0.0';
    } catch (error) {
      this.log(`Failed to get current version: ${error.message}`, 'error');
      return '0.0.0';
    }
  }

  /**
   * Run migrations up to target version
   */
  async up(targetVersion = null) {
    try {
      this.targetVersion = targetVersion || this.getLatestVersion();
      
      this.log(`Running migrations from ${this.currentVersion} to ${this.targetVersion}`);
      
      const migrationsToRun = this.getMigrationsToRun('up');
      
      if (migrationsToRun.length === 0) {
        this.log('No migrations to run');
        return { success: true, migrationsRun: 0 };
      }

      const results = {
        success: true,
        migrationsRun: 0,
        migrations: [],
        errors: []
      };

      for (const migration of migrationsToRun) {
        try {
          this.log(`Running migration: ${migration.version} - ${migration.name}`);
          
          if (!this.dryRun) {
            await this.runMigration(migration, 'up');
            await this.recordMigration(migration, 'up');
          }
          
          results.migrations.push({
            version: migration.version,
            name: migration.name,
            status: 'success'
          });
          
          results.migrationsRun++;
          this.currentVersion = migration.version;
          
        } catch (error) {
          this.log(`Migration failed: ${migration.version} - ${error.message}`, 'error');
          results.errors.push({
            version: migration.version,
            name: migration.name,
            error: error.message
          });
          results.success = false;
          break;
        }
      }

      return results;
    } catch (error) {
      this.log(`Migration up failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Rollback migrations to target version
   */
  async down(targetVersion = null) {
    try {
      this.targetVersion = targetVersion || this.getPreviousVersion();
      
      this.log(`Rolling back migrations from ${this.currentVersion} to ${this.targetVersion}`);
      
      const migrationsToRollback = this.getMigrationsToRun('down');
      
      if (migrationsToRollback.length === 0) {
        this.log('No migrations to rollback');
        return { success: true, migrationsRolledBack: 0 };
      }

      const results = {
        success: true,
        migrationsRolledBack: 0,
        migrations: [],
        errors: []
      };

      for (const migration of migrationsToRollback) {
        try {
          this.log(`Rolling back migration: ${migration.version} - ${migration.name}`);
          
          if (!this.dryRun) {
            await this.runMigration(migration, 'down');
            await this.removeMigrationRecord(migration);
          }
          
          results.migrations.push({
            version: migration.version,
            name: migration.name,
            status: 'success'
          });
          
          results.migrationsRolledBack++;
          this.currentVersion = migration.version;
          
        } catch (error) {
          this.log(`Rollback failed: ${migration.version} - ${error.message}`, 'error');
          results.errors.push({
            version: migration.version,
            name: migration.name,
            error: error.message
          });
          results.success = false;
          break;
        }
      }

      return results;
    } catch (error) {
      this.log(`Migration down failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Get migrations that need to be run
   */
  getMigrationsToRun(direction) {
    const currentVersion = this.currentVersion;
    const targetVersion = this.targetVersion;
    
    let migrationsToRun = [];
    
    if (direction === 'up') {
      migrationsToRun = this.migrations.filter(migration => {
        return this.compareVersions(migration.version, currentVersion) > 0 &&
               this.compareVersions(migration.version, targetVersion) <= 0 &&
               this.isEnvironmentCompatible(migration);
      });
    } else {
      migrationsToRun = this.migrations.filter(migration => {
        return this.compareVersions(migration.version, currentVersion) <= 0 &&
               this.compareVersions(migration.version, targetVersion) > 0 &&
               this.isEnvironmentCompatible(migration);
      }).reverse();
    }
    
    return migrationsToRun;
  }

  /**
   * Check if migration is compatible with current environment
   */
  isEnvironmentCompatible(migration) {
    return migration.environment === 'all' || migration.environment === this.environment;
  }

  /**
   * Run a single migration
   */
  async runMigration(migration, direction) {
    const startTime = Date.now();
    
    try {
      this.log(`Executing ${direction} for migration ${migration.version}`);
      
      const migrationFunction = migration[direction];
      await migrationFunction(mongoose.connection);
      
      const duration = Date.now() - startTime;
      this.log(`Migration ${migration.version} ${direction} completed in ${duration}ms`);
      
    } catch (error) {
      this.log(`Migration ${migration.version} ${direction} failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Record migration in database
   */
  async recordMigration(migration, direction) {
    try {
      const db = mongoose.connection.db;
      const collection = db.collection(this.collectionName);
      
      const record = {
        version: migration.version,
        name: migration.name,
        description: migration.description,
        direction: direction,
        environment: this.environment,
        executedAt: new Date(),
        executedBy: process.env.USER || 'system'
      };
      
      await collection.insertOne(record);
      this.log(`Recorded migration ${migration.version} ${direction}`);
      
    } catch (error) {
      this.log(`Failed to record migration: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Remove migration record from database
   */
  async removeMigrationRecord(migration) {
    try {
      const db = mongoose.connection.db;
      const collection = db.collection(this.collectionName);
      
      await collection.deleteOne({ version: migration.version });
      this.log(`Removed migration record ${migration.version}`);
      
    } catch (error) {
      this.log(`Failed to remove migration record: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Get migration status
   */
  async status() {
    try {
      const db = mongoose.connection.db;
      const collection = db.collection(this.collectionName);
      
      const executedMigrations = await collection
        .find({})
        .sort({ version: 1 })
        .toArray();
      
      const status = {
        currentVersion: this.currentVersion,
        latestVersion: this.getLatestVersion(),
        executedMigrations: executedMigrations.length,
        totalMigrations: this.migrations.length,
        pendingMigrations: this.getMigrationsToRun('up').length,
        migrations: []
      };
      
      for (const migration of this.migrations) {
        const executed = executedMigrations.find(m => m.version === migration.version);
        status.migrations.push({
          version: migration.version,
          name: migration.name,
          description: migration.description,
          executed: !!executed,
          executedAt: executed ? executed.executedAt : null,
          environment: migration.environment
        });
      }
      
      return status;
    } catch (error) {
      this.log(`Failed to get migration status: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Get latest version from migrations
   */
  getLatestVersion() {
    if (this.migrations.length === 0) return '0.0.0';
    
    const latest = this.migrations.reduce((latest, current) => {
      return this.compareVersions(current.version, latest.version) > 0 ? current : latest;
    });
    
    return latest.version;
  }

  /**
   * Get previous version
   */
  getPreviousVersion() {
    const sortedMigrations = [...this.migrations].sort((a, b) => 
      this.compareVersions(a.version, b.version)
    );
    
    const currentIndex = sortedMigrations.findIndex(m => m.version === this.currentVersion);
    
    if (currentIndex <= 0) return '0.0.0';
    
    return sortedMigrations[currentIndex - 1].version;
  }

  /**
   * Compare two version strings
   */
  compareVersions(version1, version2) {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    const maxLength = Math.max(v1Parts.length, v2Parts.length);
    
    for (let i = 0; i < maxLength; i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return -1;
    }
    
    return 0;
  }

  /**
   * Create migration file
   */
  async createMigration(name, description) {
    try {
      const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
      const version = `${timestamp}.0.0`;
      const fileName = `${version}_${name.replace(/[^a-zA-Z0-9]/g, '_')}.js`;
      const filePath = path.join(this.migrationsPath, fileName);
      
      const template = this.getMigrationTemplate(version, name, description);
      
      await fs.writeFile(filePath, template);
      
      this.log(`Created migration file: ${fileName}`);
      return { version, fileName, filePath };
      
    } catch (error) {
      this.log(`Failed to create migration: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Get migration template
   */
  getMigrationTemplate(version, name, description) {
    return `/**
 * Migration: ${name}
 * Version: ${version}
 * Description: ${description}
 * 
 * @version ${version}
 * @author LUDUS Development Team
 * @since ${new Date().toISOString().split('T')[0]}
 */

module.exports = {
  version: '${version}',
  name: '${name}',
  description: '${description}',
  environment: 'all', // 'all', 'development', 'production', 'test'
  dependencies: [], // Array of migration versions this depends on
  
  /**
   * Run migration up
   * @param {Object} db - MongoDB connection
   */
  async up(db) {
    // TODO: Implement migration logic
    console.log('Running migration up: ${name}');
    
    // Example:
    // await db.collection('users').createIndex({ email: 1 }, { unique: true });
    // await db.collection('activities').updateMany({}, { $set: { newField: 'defaultValue' } });
  },
  
  /**
   * Run migration down (rollback)
   * @param {Object} db - MongoDB connection
   */
  async down(db) {
    // TODO: Implement rollback logic
    console.log('Running migration down: ${name}');
    
    // Example:
    // await db.collection('users').dropIndex({ email: 1 });
    // await db.collection('activities').updateMany({}, { $unset: { newField: 1 } });
  }
};
`;
  }

  /**
   * Log message
   */
  log(message, level = 'info') {
    if (!this.verbose && level === 'info') return;
    
    const timestamp = new Date().toISOString();
    const prefix = this.dryRun ? '[DRY RUN] ' : '';
    
    console.log(`${prefix}[${timestamp}] [${level.toUpperCase()}] ${message}`);
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    try {
      await mongoose.connection.close();
      this.log('Migration runner cleanup completed');
    } catch (error) {
      this.log(`Cleanup failed: ${error.message}`, 'error');
    }
  }
}

module.exports = MigrationRunner;
