const fs = require('fs').promises;
const path = require('path');

// Translation Management
const getTranslations = async (req, res) => {
  try {
    const { language, namespace } = req.params;
    const filePath = path.join(__dirname, '../../', `../client/src/i18n/locales/${language}.json`);
    
    const fileContent = await fs.readFile(filePath, 'utf8');
    const translations = JSON.parse(fileContent);
    
    res.json({
      success: true,
      data: translations[namespace] || {}
    });
  } catch (error) {
    console.error('Get translations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load translations'
    });
  }
};

const updateTranslations = async (req, res) => {
  try {
    const { language, namespace } = req.params;
    const { translations } = req.body;
    
    const filePath = path.join(__dirname, '../../', `../client/src/i18n/locales/${language}.json`);
    
    // Read current file
    const fileContent = await fs.readFile(filePath, 'utf8');
    const currentTranslations = JSON.parse(fileContent);
    
    // Update the specific namespace
    currentTranslations[namespace] = translations;
    
    // Write back to file
    await fs.writeFile(filePath, JSON.stringify(currentTranslations, null, 2));
    
    res.json({
      success: true,
      message: 'Translations updated successfully'
    });
  } catch (error) {
    console.error('Update translations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update translations'
    });
  }
};

// Category Management (Mock implementation - you'll need a Category model)
const getCategories = async (req, res) => {
  try {
    // Mock data - replace with actual database queries
    const categories = [
      {
        _id: '1',
        name: { en: 'Adventure', ar: 'مغامرة' },
        description: { en: 'Exciting outdoor adventures', ar: 'مغامرات خارجية مثيرة' },
        icon: '🏔️',
        color: '#FF6B35',
        isActive: true,
        sortOrder: 1,
        parentId: null
      },
      {
        _id: '2',
        name: { en: 'Cultural', ar: 'ثقافي' },
        description: { en: 'Cultural experiences and heritage', ar: 'تجارب ثقافية وتراثية' },
        icon: '🎭',
        color: '#4ECDC4',
        isActive: true,
        sortOrder: 2,
        parentId: null
      }
    ];
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load categories'
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const categoryData = req.body;
    // Mock implementation - replace with actual database operations
    const newCategory = {
      _id: Date.now().toString(),
      ...categoryData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    res.status(201).json({
      success: true,
      data: newCategory,
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryData = req.body;
    
    // Mock implementation - replace with actual database operations
    const updatedCategory = {
      _id: id,
      ...categoryData,
      updatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: updatedCategory,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category'
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock implementation - replace with actual database operations
    // Check if category has activities first
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
};

const reorderCategories = async (req, res) => {
  try {
    const { draggedId, targetId } = req.body;
    
    // Mock implementation - replace with actual reordering logic
    
    res.json({
      success: true,
      message: 'Categories reordered successfully'
    });
  } catch (error) {
    console.error('Reorder categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder categories'
    });
  }
};

const updateCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    // Mock implementation - replace with actual database operations
    
    res.json({
      success: true,
      message: `Category ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Update category status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category status'
    });
  }
};

// Content Management (Mock implementation - you'll need a Page model)
const getPages = async (req, res) => {
  try {
    // Mock data - replace with actual database queries
    const pages = [
      {
        _id: '1',
        slug: 'about-us',
        title: { en: 'About Us', ar: 'من نحن' },
        content: { en: 'About LUDUS content', ar: 'محتوى حول لودوس' },
        metaDescription: { en: 'Learn about LUDUS', ar: 'تعرف على لودوس' },
        isPublished: true,
        publishDate: new Date(),
        sections: []
      },
      {
        _id: '2',
        slug: 'privacy-policy',
        title: { en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
        content: { en: 'Privacy policy content', ar: 'محتوى سياسة الخصوصية' },
        metaDescription: { en: 'LUDUS privacy policy', ar: 'سياسة خصوصية لودوس' },
        isPublished: true,
        publishDate: new Date(),
        sections: []
      }
    ];
    
    res.json({
      success: true,
      data: pages
    });
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load pages'
    });
  }
};

const createPage = async (req, res) => {
  try {
    const pageData = req.body;
    
    // Mock implementation - replace with actual database operations
    const newPage = {
      _id: Date.now().toString(),
      ...pageData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    res.status(201).json({
      success: true,
      data: newPage,
      message: 'Page created successfully'
    });
  } catch (error) {
    console.error('Create page error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create page'
    });
  }
};

const updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const pageData = req.body;
    
    // Mock implementation - replace with actual database operations
    const updatedPage = {
      _id: id,
      ...pageData,
      updatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: updatedPage,
      message: 'Page updated successfully'
    });
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update page'
    });
  }
};

const deletePage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock implementation - replace with actual database operations
    
    res.json({
      success: true,
      message: 'Page deleted successfully'
    });
  } catch (error) {
    console.error('Delete page error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete page'
    });
  }
};

// System Settings Management
const getSystemSettings = async (req, res) => {
  try {
    // Mock settings - replace with actual database queries
    const settings = {
      site: {
        name: { en: 'LUDUS Platform', ar: 'منصة لودوس' },
        description: { en: 'Discover amazing activities', ar: 'اكتشف أنشطة مذهلة' },
        logo: '/images/logo.png',
        favicon: '/images/favicon.ico',
        timezone: 'Asia/Riyadh',
        language: 'en',
        currency: 'SAR'
      },
      email: {
        fromName: 'LUDUS Platform',
        fromEmail: 'hi@letsludus.com',
        smtpHost: 'smtp-relay.gmail.com',
        smtpPort: 587
      },
      features: {
        userRegistration: true,
        guestBooking: false,
        multiLanguage: true,
        reviews: true,
        notifications: true
      },
      payment: {
        moyasarEnabled: true,
        testMode: true,
        supportedMethods: ['credit_card', 'mada', 'apple_pay', 'stc_pay']
      }
    };
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load system settings'
    });
  }
};

const updateSystemSettings = async (req, res) => {
  try {
    const settingsData = req.body;
    
    // Mock implementation - replace with actual database operations
    
    res.json({
      success: true,
      message: 'System settings updated successfully'
    });
  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update system settings'
    });
  }
};

module.exports = {
  // Translation Management
  getTranslations,
  updateTranslations,
  
  // Category Management
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  updateCategoryStatus,
  
  // Content Management
  getPages,
  createPage,
  updatePage,
  deletePage,
  
  // System Settings
  getSystemSettings,
  updateSystemSettings
};