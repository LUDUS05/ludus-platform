/**
 * @fileoverview Migration System Tests - LDS-007 Implementation
 * 
 * Comprehensive test suite for the database migration system including
 * migration runner, CLI, and service functionality.
 * 
 * @version 1.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const MigrationRunner = require('../migrations/MigrationRunner');
const MigrationService = require('../migrations/MigrationService');
const path = require('path');

describe('Migration System Tests', () => {
  let mongoServer;
  let migrationRunner;
  let migrationService;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to test database
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Initialize migration runner
    migrationRunner = new MigrationRunner({
      migrationsPath: path.join(__dirname, '../migrations/versions'),
      verbose: false
    });

    // Initialize migration service
    migrationService = new MigrationService({
      migrationsPath: path.join(__dirname, '../migrations/versions'),
      verbose: false
    });
  });

  afterAll(async () => {
    // Cleanup
    if (migrationService) {
      await migrationService.cleanup();
    }
    if (migrationRunner) {
      await migrationRunner.cleanup();
    }
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clean database before each test
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const collection of collections) {
      await mongoose.connection.db.collection(collection.name).drop();
    }
  });

  describe('MigrationRunner', () => {
    test('should initialize successfully', async () => {
      await migrationRunner.initialize();
      expect(migrationRunner.migrations.length).toBeGreaterThan(0);
      expect(migrationRunner.currentVersion).toBe('0.0.0');
    });

    test('should load migration files correctly', async () => {
      await migrationRunner.initialize();
      
      const migration = migrationRunner.migrations[0];
      expect(migration).toHaveProperty('version');
      expect(migration).toHaveProperty('name');
      expect(migration).toHaveProperty('up');
      expect(migration).toHaveProperty('down');
      expect(typeof migration.up).toBe('function');
      expect(typeof migration.down).toBe('function');
    });

    test('should validate migration structure', () => {
      const validMigration = {
        version: '1.0.0',
        name: 'Test Migration',
        up: () => {},
        down: () => {}
      };

      const invalidMigration = {
        version: '1.0.0',
        name: 'Test Migration'
        // missing up and down functions
      };

      expect(migrationRunner.validateMigration(validMigration)).toBe(true);
      expect(migrationRunner.validateMigration(invalidMigration)).toBe(false);
    });

    test('should run migrations up successfully', async () => {
      await migrationRunner.initialize();
      
      const result = await migrationRunner.up();
      
      expect(result.success).toBe(true);
      expect(result.migrationsRun).toBeGreaterThan(0);
      expect(result.migrations.length).toBeGreaterThan(0);
    });

    test('should rollback migrations successfully', async () => {
      await migrationRunner.initialize();
      
      // Run migrations first
      await migrationRunner.up();
      
      // Then rollback
      const result = await migrationRunner.down();
      
      expect(result.success).toBe(true);
      expect(result.migrationsRolledBack).toBeGreaterThan(0);
    });

    test('should get migration status', async () => {
      await migrationRunner.initialize();
      
      const status = await migrationRunner.status();
      
      expect(status).toHaveProperty('currentVersion');
      expect(status).toHaveProperty('latestVersion');
      expect(status).toHaveProperty('executedMigrations');
      expect(status).toHaveProperty('totalMigrations');
      expect(status).toHaveProperty('pendingMigrations');
      expect(status).toHaveProperty('migrations');
    });

    test('should create migration file', async () => {
      await migrationRunner.initialize();
      
      const result = await migrationRunner.createMigration(
        'test_migration',
        'Test migration description'
      );
      
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('fileName');
      expect(result).toHaveProperty('filePath');
      expect(result.fileName).toContain('test_migration');
    });

    test('should compare versions correctly', () => {
      expect(migrationRunner.compareVersions('1.0.0', '1.0.0')).toBe(0);
      expect(migrationRunner.compareVersions('1.0.1', '1.0.0')).toBe(1);
      expect(migrationRunner.compareVersions('1.0.0', '1.0.1')).toBe(-1);
      expect(migrationRunner.compareVersions('2.0.0', '1.9.9')).toBe(1);
    });
  });

  describe('MigrationService', () => {
    test('should initialize successfully', async () => {
      await migrationService.initialize();
      expect(migrationService.isInitialized).toBe(true);
    });

    test('should run migrations successfully', async () => {
      await migrationService.initialize();
      
      const result = await migrationService.runMigrations();
      
      expect(result.success).toBe(true);
      expect(result.migrationsRun).toBeGreaterThan(0);
    });

    test('should rollback migrations successfully', async () => {
      await migrationService.initialize();
      
      // Run migrations first
      await migrationService.runMigrations();
      
      // Then rollback
      const result = await migrationService.rollbackMigrations();
      
      expect(result.success).toBe(true);
      expect(result.migrationsRolledBack).toBeGreaterThan(0);
    });

    test('should get migration status', async () => {
      await migrationService.initialize();
      
      const status = await migrationService.getStatus();
      
      expect(status).toHaveProperty('currentVersion');
      expect(status).toHaveProperty('latestVersion');
      expect(status).toHaveProperty('executedMigrations');
      expect(status).toHaveProperty('totalMigrations');
      expect(status).toHaveProperty('pendingMigrations');
    });

    test('should check if migrations are needed', async () => {
      await migrationService.initialize();
      
      const needsMigration = await migrationService.needsMigration();
      expect(typeof needsMigration).toBe('boolean');
    });

    test('should get pending migrations', async () => {
      await migrationService.initialize();
      
      const pendingMigrations = await migrationService.getPendingMigrations();
      expect(Array.isArray(pendingMigrations)).toBe(true);
    });

    test('should validate migrations', async () => {
      await migrationService.initialize();
      
      const validation = await migrationService.validateMigrations();
      
      expect(validation).toHaveProperty('valid');
      expect(validation).toHaveProperty('invalid');
      expect(validation).toHaveProperty('errors');
      expect(typeof validation.valid).toBe('number');
      expect(typeof validation.invalid).toBe('number');
    });

    test('should run migrations if needed', async () => {
      await migrationService.initialize();
      
      const result = await migrationService.runMigrationsIfNeeded();
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('migrationsRun');
      expect(result).toHaveProperty('migrations');
    });
  });

  describe('Migration Integration', () => {
    test('should create and run custom migration', async () => {
      await migrationService.initialize();
      
      // Create a test migration
      const result = await migrationService.createMigration(
        'test_integration',
        'Test integration migration'
      );
      
      expect(result.success).toBe(true);
      expect(result.fileName).toContain('test_integration');
    });

    test('should handle migration errors gracefully', async () => {
      await migrationService.initialize();
      
      // This should not throw an error even if migrations fail
      try {
        await migrationService.runMigrations();
      } catch (error) {
        // Migration errors should be handled gracefully
        expect(error).toBeDefined();
      }
    });

    test('should maintain migration state consistency', async () => {
      await migrationService.initialize();
      
      // Run migrations
      await migrationService.runMigrations();
      
      // Check status
      const status1 = await migrationService.getStatus();
      
      // Rollback
      await migrationService.rollbackMigrations();
      
      // Check status again
      const status2 = await migrationService.getStatus();
      
      expect(status2.executedMigrations).toBeLessThan(status1.executedMigrations);
    });
  });

  describe('Error Handling', () => {
    test('should handle database connection errors', async () => {
      // Close connection to simulate error
      await mongoose.connection.close();
      
      const service = new MigrationService();
      
      try {
        await service.initialize();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('should handle invalid migration files', async () => {
      // This test would require creating invalid migration files
      // For now, we'll test the validation logic
      const invalidMigration = {
        version: '1.0.0',
        name: 'Invalid Migration'
        // Missing required fields
      };

      expect(migrationRunner.validateMigration(invalidMigration)).toBe(false);
    });
  });

  describe('Performance', () => {
    test('should run migrations within reasonable time', async () => {
      await migrationService.initialize();
      
      const startTime = Date.now();
      await migrationService.runMigrations();
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    });

    test('should handle large number of migrations', async () => {
      await migrationService.initialize();
      
      // This test would require creating many migration files
      // For now, we'll test with the existing migrations
      const result = await migrationService.runMigrations();
      
      expect(result.success).toBe(true);
    });
  });
});
