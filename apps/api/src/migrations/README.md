# LUDUS Database Migration System - LDS-007

## Overview

The LUDUS Database Migration System provides a comprehensive solution for managing database schema changes, data migrations, and version control across development, staging, and production environments.

## Features

- **Version Control**: Track schema versions and migration history
- **Rollback Support**: Safe rollback to previous versions
- **Environment Support**: Different migrations for different environments
- **Data Validation**: Verify migration success and data integrity
- **CLI Interface**: Command-line tools for migration management
- **Programmatic API**: Service-based access for application integration
- **Comprehensive Logging**: Detailed logging and error reporting
- **CI/CD Integration**: Automated migration support

## Quick Start

### 1. Run Migrations

```bash
# Run all pending migrations
npm run migrate:up

# Run migrations up to specific version
npm run migrate:up 20250127000002.0.0

# Check migration status
npm run migrate:status
```

### 2. Rollback Migrations

```bash
# Rollback one migration
npm run migrate:down

# Rollback to specific version
npm run migrate:down 20250127000001.0.0
```

### 3. Create New Migration

```bash
# Create new migration
npm run migrate:create add_user_preferences

# This creates a new migration file in src/migrations/versions/
```

### 4. Validate Migrations

```bash
# Validate all migration files
npm run migrate:validate
```

## Architecture

### Components

1. **MigrationRunner**: Core migration engine
2. **MigrationService**: High-level service API
3. **CLI Tool**: Command-line interface
4. **Migration Files**: Version-specific migration scripts

### File Structure

```
src/migrations/
├── MigrationRunner.js      # Core migration engine
├── MigrationService.js     # High-level service API
├── cli.js                  # Command-line interface
├── README.md              # This documentation
└── versions/              # Migration files
    ├── 20250127000001_initial_schema_setup.js
    ├── 20250127000002_add_text_indexes.js
    └── 20250127000003_add_compound_indexes.js
```

## Migration Files

### Structure

Each migration file must export an object with the following structure:

```javascript
module.exports = {
  version: '20250127000001.0.0',        // Unique version identifier
  name: 'Migration Name',               // Human-readable name
  description: 'Migration description', // Detailed description
  environment: 'all',                   // Environment compatibility
  dependencies: [],                     // Required migration versions
  
  async up(db) {
    // Migration logic
  },
  
  async down(db) {
    // Rollback logic
  }
};
```

### Version Format

Versions use the format: `YYYYMMDDHHMMSS.0.0`

- **YYYYMMDDHHMMSS**: Timestamp when migration was created
- **0.0**: Minor and patch versions for updates

### Environment Support

- `'all'`: Runs in all environments
- `'development'`: Development only
- `'production'`: Production only
- `'test'`: Test only

## CLI Commands

### Basic Commands

```bash
# Run migrations
node src/migrations/cli.js up [version]

# Rollback migrations
node src/migrations/cli.js down [version]

# Show status
node src/migrations/cli.js status

# Create migration
node src/migrations/cli.js create <name> [description]

# Validate migrations
node src/migrations/cli.js validate

# Show help
node src/migrations/cli.js help
```

### Advanced Usage

```bash
# Dry run (preview without executing)
MIGRATION_DRY_RUN=true node src/migrations/cli.js up

# Verbose logging
MIGRATION_VERBOSE=true node src/migrations/cli.js up

# Environment-specific
NODE_ENV=production node src/migrations/cli.js up
```

## Programmatic API

### MigrationService

```javascript
const MigrationService = require('./src/migrations/MigrationService');

const migrationService = new MigrationService({
  migrationsPath: './src/migrations/versions',
  verbose: true
});

// Initialize
await migrationService.initialize();

// Run migrations
const result = await migrationService.runMigrations();

// Rollback
await migrationService.rollbackMigrations();

// Get status
const status = await migrationService.getStatus();

// Check if migrations needed
const needed = await migrationService.needsMigration();

// Run if needed
await migrationService.runMigrationsIfNeeded();
```

### MigrationRunner

```javascript
const MigrationRunner = require('./src/migrations/MigrationRunner');

const runner = new MigrationRunner({
  migrationsPath: './src/migrations/versions',
  collectionName: 'migrations',
  verbose: true
});

// Initialize
await runner.initialize();

// Run migrations
const result = await runner.up('20250127000002.0.0');

// Rollback
await runner.down('20250127000001.0.0');

// Get status
const status = await runner.status();
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development, production, test) | development |
| `MONGODB_URI` | MongoDB connection string | Required |
| `MIGRATION_VERBOSE` | Enable verbose logging | false |
| `MIGRATION_DRY_RUN` | Run in dry-run mode | false |

## Best Practices

### 1. Migration Design

- **Idempotent**: Migrations should be safe to run multiple times
- **Reversible**: Always provide rollback logic
- **Atomic**: Each migration should be a single logical unit
- **Tested**: Test migrations in development before production

### 2. Version Management

- Use timestamp-based versions for chronological ordering
- Never modify existing migration files
- Create new migrations for changes
- Document breaking changes clearly

### 3. Data Safety

- Always backup before major migrations
- Test rollback procedures
- Validate data integrity after migrations
- Use transactions for critical operations

### 4. Performance

- Create indexes in separate migrations
- Use background operations for large data changes
- Monitor migration performance
- Consider maintenance windows for large migrations

## Common Patterns

### 1. Schema Changes

```javascript
async up(db) {
  // Add new field
  await db.collection('users').updateMany(
    {},
    { $set: { newField: 'defaultValue' } }
  );
  
  // Create index
  await db.collection('users').createIndex({ newField: 1 });
},

async down(db) {
  // Drop index
  await db.collection('users').dropIndex({ newField: 1 });
  
  // Remove field
  await db.collection('users').updateMany(
    {},
    { $unset: { newField: 1 } }
  );
}
```

### 2. Data Transformations

```javascript
async up(db) {
  const cursor = db.collection('users').find({});
  
  while (await cursor.hasNext()) {
    const user = await cursor.next();
    
    // Transform data
    const transformed = {
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      updatedAt: new Date()
    };
    
    await db.collection('users').replaceOne(
      { _id: user._id },
      transformed
    );
  }
},

async down(db) {
  // Remove transformed fields
  await db.collection('users').updateMany(
    {},
    { $unset: { fullName: 1, updatedAt: 1 } }
  );
}
```

### 3. Collection Operations

```javascript
async up(db) {
  // Create new collection
  await db.createCollection('new_collection');
  
  // Copy data
  const data = await db.collection('old_collection').find({}).toArray();
  if (data.length > 0) {
    await db.collection('new_collection').insertMany(data);
  }
},

async down(db) {
  // Drop new collection
  await db.collection('new_collection').drop();
}
```

## Troubleshooting

### Common Issues

1. **Migration Fails**
   - Check MongoDB connection
   - Verify migration syntax
   - Check for conflicting operations
   - Review error logs

2. **Rollback Issues**
   - Ensure rollback logic is correct
   - Check for data dependencies
   - Verify migration state

3. **Performance Problems**
   - Use background operations
   - Create indexes separately
   - Consider data size

### Debug Mode

```bash
# Enable verbose logging
MIGRATION_VERBOSE=true npm run migrate:up

# Dry run to preview changes
MIGRATION_DRY_RUN=true npm run migrate:up
```

### Logs

Migration logs include:
- Execution timestamps
- Migration details
- Error messages
- Performance metrics

## CI/CD Integration

### GitHub Actions

```yaml
name: Database Migrations
on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run migrations
        run: npm run migrate:up
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
          NODE_ENV: production
```

### Docker

```dockerfile
# Add migration step to Dockerfile
COPY . .
RUN npm ci --production

# Run migrations during container startup
CMD ["sh", "-c", "npm run migrate:up && npm start"]
```

## Security Considerations

1. **Access Control**: Limit migration execution to authorized users
2. **Audit Logging**: Log all migration activities
3. **Backup Strategy**: Always backup before migrations
4. **Environment Isolation**: Separate migration environments
5. **Credential Management**: Use secure credential storage

## Monitoring

### Metrics to Track

- Migration execution time
- Success/failure rates
- Database performance impact
- Rollback frequency
- Error patterns

### Alerts

- Migration failures
- Long-running migrations
- Rollback events
- Database connectivity issues

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review migration logs
3. Test in development environment
4. Contact the development team

## Changelog

### Version 1.0.0 (2025-01-27)

- Initial migration system implementation
- CLI tool with full command set
- Programmatic API with MigrationService
- Comprehensive test suite
- Documentation and examples
- CI/CD integration support
