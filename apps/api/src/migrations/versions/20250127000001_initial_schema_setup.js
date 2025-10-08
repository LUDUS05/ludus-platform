/**
 * Migration: Initial Schema Setup
 * Version: 20250127000001.0.0
 * Description: Initial setup of enhanced database schemas with indexes and validation
 * 
 * @version 20250127000001.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

module.exports = {
  version: '20250127000001.0.0',
  name: 'Initial Schema Setup',
  description: 'Initial setup of enhanced database schemas with indexes and validation',
  environment: 'all',
  dependencies: [],
  
  /**
   * Run migration up
   * @param {Object} db - MongoDB connection
   */
  async up(db) {
    console.log('Running migration up: Initial Schema Setup');
    
    // Create enhanced collections with proper indexes
    const collections = [
      'users_enhanced',
      'activities_enhanced', 
      'bookings_enhanced',
      'reviews_enhanced',
      'partners_enhanced',
      'categories_enhanced',
      'payments_enhanced',
      'notifications_enhanced',
      'locations_enhanced'
    ];
    
    // Create collections if they don't exist
    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName);
        console.log(`Created collection: ${collectionName}`);
      } catch (error) {
        if (error.code !== 48) { // Collection already exists
          throw error;
        }
        console.log(`Collection already exists: ${collectionName}`);
      }
    }
    
    // Create basic indexes for performance
    await this.createBasicIndexes(db);
    
    // Create migration tracking collection
    await this.createMigrationTracking(db);
    
    console.log('Initial schema setup completed');
  },
  
  /**
   * Run migration down (rollback)
   * @param {Object} db - MongoDB connection
   */
  async down(db) {
    console.log('Running migration down: Initial Schema Setup');
    
    // Drop enhanced collections
    const collections = [
      'users_enhanced',
      'activities_enhanced', 
      'bookings_enhanced',
      'reviews_enhanced',
      'partners_enhanced',
      'categories_enhanced',
      'payments_enhanced',
      'notifications_enhanced',
      'locations_enhanced'
    ];
    
    for (const collectionName of collections) {
      try {
        await db.collection(collectionName).drop();
        console.log(`Dropped collection: ${collectionName}`);
      } catch (error) {
        console.log(`Collection not found: ${collectionName}`);
      }
    }
    
    // Drop migration tracking collection
    try {
      await db.collection('migrations').drop();
      console.log('Dropped migrations collection');
    } catch (error) {
      console.log('Migrations collection not found');
    }
    
    console.log('Initial schema rollback completed');
  },
  
  /**
   * Create basic indexes for performance
   */
  async createBasicIndexes(db) {
    console.log('Creating basic indexes...');
    
    // Users indexes
    await db.collection('users_enhanced').createIndex({ email: 1 }, { unique: true });
    await db.collection('users_enhanced').createIndex({ 'profile.phone': 1 }, { unique: true });
    await db.collection('users_enhanced').createIndex({ 'location.coordinates': '2dsphere' });
    
    // Activities indexes
    await db.collection('activities_enhanced').createIndex({ 'location.coordinates': '2dsphere' });
    await db.collection('activities_enhanced').createIndex({ 'category.id': 1, status: 1 });
    await db.collection('activities_enhanced').createIndex({ 'partner.id': 1, status: 1 });
    
    // Bookings indexes
    await db.collection('bookings_enhanced').createIndex({ bookingNumber: 1 }, { unique: true });
    await db.collection('bookings_enhanced').createIndex({ 'user.id': 1, status: 1 });
    await db.collection('bookings_enhanced').createIndex({ 'activity.id': 1, 'schedule.date': 1 });
    
    // Reviews indexes
    await db.collection('reviews_enhanced').createIndex({ 'user.id': 1 });
    await db.collection('reviews_enhanced').createIndex({ 'activity.id': 1 });
    await db.collection('reviews_enhanced').createIndex({ 'rating.overall': -1 });
    
    // Partners indexes
    await db.collection('partners_enhanced').createIndex({ 'contact.email': 1 }, { unique: true });
    await db.collection('partners_enhanced').createIndex({ 'location.coordinates': '2dsphere' });
    
    // Categories indexes
    await db.collection('categories_enhanced').createIndex({ name: 1 }, { unique: true });
    await db.collection('categories_enhanced').createIndex({ parent: 1, isActive: 1 });
    
    // Payments indexes
    await db.collection('payments_enhanced').createIndex({ paymentNumber: 1 }, { unique: true });
    await db.collection('payments_enhanced').createIndex({ 'booking.id': 1 });
    await db.collection('payments_enhanced').createIndex({ status: 1, createdAt: -1 });
    
    // Notifications indexes
    await db.collection('notifications_enhanced').createIndex({ user: 1, isRead: 1 });
    await db.collection('notifications_enhanced').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    
    // Locations indexes
    await db.collection('locations_enhanced').createIndex({ name: 1 });
    await db.collection('locations_enhanced').createIndex({ 'coordinates.coordinates': '2dsphere' });
    
    console.log('Basic indexes created successfully');
  },
  
  /**
   * Create migration tracking collection
   */
  async createMigrationTracking(db) {
    console.log('Creating migration tracking collection...');
    
    try {
      await db.createCollection('migrations');
      await db.collection('migrations').createIndex({ version: 1 }, { unique: true });
      await db.collection('migrations').createIndex({ executedAt: -1 });
      console.log('Migration tracking collection created');
    } catch (error) {
      console.log('Migration tracking collection already exists');
    }
  }
};
