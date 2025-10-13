/**
 * Migration: Add Text Indexes
 * Version: 20250127000002.0.0
 * Description: Add comprehensive text indexes for search functionality
 * 
 * @version 20250127000002.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

module.exports = {
  version: '20250127000002.0.0',
  name: 'Add Text Indexes',
  description: 'Add comprehensive text indexes for search functionality',
  environment: 'all',
  dependencies: ['20250127000001.0.0'],
  
  /**
   * Run migration up
   * @param {Object} db - MongoDB connection
   */
  async up(db) {
    console.log('Running migration up: Add Text Indexes');
    
    // Users text indexes
    await db.collection('users_enhanced').createIndex({ 
      'profile.firstName': 'text', 
      'profile.lastName': 'text', 
      'profile.firstNameAr': 'text',
      'profile.lastNameAr': 'text',
      email: 'text' 
    }, { name: 'users_text_search' });
    
    // Activities text indexes
    await db.collection('activities_enhanced').createIndex({ 
      title: 'text', 
      titleEn: 'text',
      description: 'text', 
      descriptionEn: 'text',
      'features.tags': 'text',
      'features.tagsEn': 'text'
    }, { name: 'activities_text_search' });
    
    // Reviews text indexes
    await db.collection('reviews_enhanced').createIndex({ 
      comment: 'text', 
      commentAr: 'text'
    }, { name: 'reviews_text_search' });
    
    // Partners text indexes
    await db.collection('partners_enhanced').createIndex({ 
      'businessInfo.name': 'text', 
      'businessInfo.nameEn': 'text',
      'businessInfo.description': 'text',
      'businessInfo.descriptionEn': 'text'
    }, { name: 'partners_text_search' });
    
    // Categories text indexes
    await db.collection('categories_enhanced').createIndex({ 
      name: 'text', 
      nameEn: 'text',
      description: 'text',
      descriptionEn: 'text'
    }, { name: 'categories_text_search' });
    
    // Locations text indexes
    await db.collection('locations_enhanced').createIndex({ 
      name: 'text', 
      nameEn: 'text',
      description: 'text',
      descriptionEn: 'text'
    }, { name: 'locations_text_search' });
    
    console.log('Text indexes added successfully');
  },
  
  /**
   * Run migration down (rollback)
   * @param {Object} db - MongoDB connection
   */
  async down(db) {
    console.log('Running migration down: Add Text Indexes');
    
    // Drop text indexes
    const textIndexes = [
      'users_text_search',
      'activities_text_search',
      'reviews_text_search',
      'partners_text_search',
      'categories_text_search',
      'locations_text_search'
    ];
    
    for (const indexName of textIndexes) {
      try {
        await db.collection(indexName.split('_')[0] + '_enhanced').dropIndex(indexName);
        console.log(`Dropped text index: ${indexName}`);
      } catch (error) {
        console.log(`Text index not found: ${indexName}`);
      }
    }
    
    console.log('Text indexes rollback completed');
  }
};
