/**
 * Migration: Add Compound Indexes
 * Version: 20250127000003.0.0
 * Description: Add compound indexes for complex queries and performance optimization
 * 
 * @version 20250127000003.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

module.exports = {
  version: '20250127000003.0.0',
  name: 'Add Compound Indexes',
  description: 'Add compound indexes for complex queries and performance optimization',
  environment: 'all',
  dependencies: ['20250127000002.0.0'],
  
  /**
   * Run migration up
   * @param {Object} db - MongoDB connection
   */
  async up(db) {
    console.log('Running migration up: Add Compound Indexes');
    
    // Users compound indexes
    await db.collection('users_enhanced').createIndex({ 
      'location.city': 1, 
      'preferences.interests': 1, 
      status: 1 
    }, { name: 'users_location_interests_status' });
    
    await db.collection('users_enhanced').createIndex({ 
      role: 1, 
      status: 1,
      createdAt: -1 
    }, { name: 'users_role_status_created' });
    
    // Activities compound indexes
    await db.collection('activities_enhanced').createIndex({ 
      'category.id': 1, 
      'location.city': 1, 
      'features.isFeatured': 1, 
      status: 1 
    }, { name: 'activities_category_location_featured_status' });
    
    await db.collection('activities_enhanced').createIndex({ 
      'partner.id': 1, 
      status: 1,
      createdAt: -1 
    }, { name: 'activities_partner_status_created' });
    
    await db.collection('activities_enhanced').createIndex({ 
      'schedule.availableDates.date': 1, 
      status: 1,
      'capacity.maxParticipants': 1 
    }, { name: 'activities_date_status_capacity' });
    
    // Bookings compound indexes
    await db.collection('bookings_enhanced').createIndex({ 
      'user.id': 1, 
      'schedule.date': 1, 
      status: 1 
    }, { name: 'bookings_user_date_status' });
    
    await db.collection('bookings_enhanced').createIndex({ 
      'activity.id': 1, 
      'schedule.date': 1,
      status: 1 
    }, { name: 'bookings_activity_date_status' });
    
    await db.collection('bookings_enhanced').createIndex({ 
      'activity.partner.id': 1, 
      status: 1,
      createdAt: -1 
    }, { name: 'bookings_partner_status_created' });
    
    // Reviews compound indexes
    await db.collection('reviews_enhanced').createIndex({ 
      'activity.id': 1, 
      'rating.overall': -1, 
      status: 1 
    }, { name: 'reviews_activity_rating_status' });
    
    await db.collection('reviews_enhanced').createIndex({ 
      'user.id': 1, 
      status: 1,
      createdAt: -1 
    }, { name: 'reviews_user_status_created' });
    
    await db.collection('reviews_enhanced').createIndex({ 
      isVerified: 1, 
      status: 1,
      'rating.overall': -1 
    }, { name: 'reviews_verified_status_rating' });
    
    // Partners compound indexes
    await db.collection('partners_enhanced').createIndex({ 
      'location.city': 1, 
      'verification.isVerified': 1,
      status: 1 
    }, { name: 'partners_location_verified_status' });
    
    await db.collection('partners_enhanced').createIndex({ 
      'verification.verificationLevel': 1, 
      status: 1,
      createdAt: -1 
    }, { name: 'partners_verification_status_created' });
    
    // Categories compound indexes
    await db.collection('categories_enhanced').createIndex({ 
      parent: 1, 
      isActive: 1,
      sortOrder: 1 
    }, { name: 'categories_parent_active_sort' });
    
    await db.collection('categories_enhanced').createIndex({ 
      level: 1, 
      isActive: 1,
      sortOrder: 1 
    }, { name: 'categories_level_active_sort' });
    
    // Payments compound indexes
    await db.collection('payments_enhanced').createIndex({ 
      'gateway.provider': 1, 
      status: 1,
      createdAt: -1 
    }, { name: 'payments_gateway_status_created' });
    
    await db.collection('payments_enhanced').createIndex({ 
      'user.id': 1, 
      status: 1,
      processedAt: -1 
    }, { name: 'payments_user_status_processed' });
    
    // Notifications compound indexes
    await db.collection('notifications_enhanced').createIndex({ 
      user: 1, 
      isRead: 1,
      createdAt: -1 
    }, { name: 'notifications_user_read_created' });
    
    await db.collection('notifications_enhanced').createIndex({ 
      type: 1, 
      priority: 1,
      createdAt: -1 
    }, { name: 'notifications_type_priority_created' });
    
    // Locations compound indexes
    await db.collection('locations_enhanced').createIndex({ 
      type: 1, 
      isActive: 1,
      sortOrder: 1 
    }, { name: 'locations_type_active_sort' });
    
    await db.collection('locations_enhanced').createIndex({ 
      parent: 1, 
      isActive: 1,
      level: 1 
    }, { name: 'locations_parent_active_level' });
    
    console.log('Compound indexes added successfully');
  },
  
  /**
   * Run migration down (rollback)
   * @param {Object} db - MongoDB connection
   */
  async down(db) {
    console.log('Running migration down: Add Compound Indexes');
    
    // Drop compound indexes
    const compoundIndexes = [
      { collection: 'users_enhanced', index: 'users_location_interests_status' },
      { collection: 'users_enhanced', index: 'users_role_status_created' },
      { collection: 'activities_enhanced', index: 'activities_category_location_featured_status' },
      { collection: 'activities_enhanced', index: 'activities_partner_status_created' },
      { collection: 'activities_enhanced', index: 'activities_date_status_capacity' },
      { collection: 'bookings_enhanced', index: 'bookings_user_date_status' },
      { collection: 'bookings_enhanced', index: 'bookings_activity_date_status' },
      { collection: 'bookings_enhanced', index: 'bookings_partner_status_created' },
      { collection: 'reviews_enhanced', index: 'reviews_activity_rating_status' },
      { collection: 'reviews_enhanced', index: 'reviews_user_status_created' },
      { collection: 'reviews_enhanced', index: 'reviews_verified_status_rating' },
      { collection: 'partners_enhanced', index: 'partners_location_verified_status' },
      { collection: 'partners_enhanced', index: 'partners_verification_status_created' },
      { collection: 'categories_enhanced', index: 'categories_parent_active_sort' },
      { collection: 'categories_enhanced', index: 'categories_level_active_sort' },
      { collection: 'payments_enhanced', index: 'payments_gateway_status_created' },
      { collection: 'payments_enhanced', index: 'payments_user_status_processed' },
      { collection: 'notifications_enhanced', index: 'notifications_user_read_created' },
      { collection: 'notifications_enhanced', index: 'notifications_type_priority_created' },
      { collection: 'locations_enhanced', index: 'locations_type_active_sort' },
      { collection: 'locations_enhanced', index: 'locations_parent_active_level' }
    ];
    
    for (const { collection, index } of compoundIndexes) {
      try {
        await db.collection(collection).dropIndex(index);
        console.log(`Dropped compound index: ${index}`);
      } catch (error) {
        console.log(`Compound index not found: ${index}`);
      }
    }
    
    console.log('Compound indexes rollback completed');
  }
};
