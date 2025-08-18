const Page = require('../models/Page');
const { validationResult } = require('express-validator');

// Get all pages with advanced filtering and pagination
const getPages = async (req, res) => {
  try {
    const { 
      status, 
      template, 
      category,
      tag,
      search, 
      page = 1, 
      limit = 10,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      includeContent = false,
      language = 'en'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status && status !== 'all') {
      if (status === 'published') {
        filter.status = 'published';
        filter.publishDate = { $lte: new Date() };
        filter.$or = [
          { expiryDate: { $exists: false } },
          { expiryDate: { $gt: new Date() } }
        ];
      } else {
        filter.status = status;
      }
    }
    
    if (template && template !== 'all') {
      filter.template = template;
    }
    
    if (category) {
      filter.categories = { $in: [category] };
    }
    
    if (tag) {
      filter.tags = { $in: [tag] };
    }
    
    if (search) {
      filter.$or = [
        { [`title.${language}`]: { $regex: search, $options: 'i' } },
        { [`title.en`]: { $regex: search, $options: 'i' } },
        { [`title.ar`]: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { categories: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
      
      if (includeContent) {
        filter.$or.push(
          { 'content.content.en': { $regex: search, $options: 'i' } },
          { 'content.content.ar': { $regex: search, $options: 'i' } }
        );
      }
    }

    // Count total pages
    const totalCount = await Page.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    // Build sort object
    const sort = {};
    const validSortFields = ['createdAt', 'updatedAt', 'publishDate', 'title.en', 'title.ar', 'views', 'navigationOrder'];
    if (validSortFields.includes(sortBy)) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.updatedAt = -1;
    }

    // Build projection (exclude content for list views unless requested)
    let projection = {};
    if (!includeContent) {
      projection.content = 0;
      projection.previousVersions = 0;
      projection['settings.customCSS'] = 0;
      projection['settings.customJS'] = 0;
    }

    // Execute query
    const pages = await Page.find(filter, projection)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Add computed fields
    const pagesWithMetadata = pages.map(page => ({
      ...page,
      isPublished: page.status === 'published' && 
                   (!page.publishDate || page.publishDate <= new Date()) &&
                   (!page.expiryDate || page.expiryDate > new Date()),
      url: `/pages/${page.slug}`,
      wordCount: includeContent ? calculateWordCount(page.content || []) : 0
    }));

    res.json({
      success: true,
      data: pagesWithMetadata,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        status,
        template,
        category,
        tag,
        search,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving pages', 
      error: error.message 
    });
  }
};

// Get single page by ID with full content
const getPage = async (req, res) => {
  try {
    const { id } = req.params;
    const { includeVersions = false } = req.query;
    
    let projection = {};
    if (!includeVersions) {
      projection.previousVersions = 0;
    }
    
    const page = await Page.findById(id, projection)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .populate('previousVersions.updatedBy', 'firstName lastName email');
    
    if (!page) {
      return res.status(404).json({ 
        success: false, 
        message: 'Page not found' 
      });
    }
    
    // Add computed fields
    const pageWithMetadata = {
      ...page.toObject(),
      isPublished: page.isPublished,
      url: page.url,
      wordCount: page.wordCount
    };
    
    res.json({
      success: true,
      data: pageWithMetadata
    });
  } catch (error) {
    console.error('Get page error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid page ID format' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving page', 
      error: error.message 
    });
  }
};

// Get page by slug (public endpoint)
const getPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { preview = false } = req.query;
    
    const includeUnpublished = preview && req.user && req.user.role === 'admin';
    const page = await Page.findBySlug(slug, includeUnpublished)
      .populate('createdBy', 'firstName lastName');
    
    if (!page) {
      return res.status(404).json({ 
        success: false, 
        message: 'Page not found' 
      });
    }
    
    // Increment view count (only for published pages)
    if (page.isPublished && !preview) {
      await page.incrementViews();
    }
    
    const pageWithMetadata = {
      ...page.toObject(),
      isPublished: page.isPublished,
      url: page.url,
      wordCount: page.wordCount
    };
    
    res.json({
      success: true,
      data: pageWithMetadata
    });
  } catch (error) {
    console.error('Get page by slug error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving page', 
      error: error.message 
    });
  }
};

// Create new page
const createPage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: errors.array() 
      });
    }

    const { 
      title, 
      slug,
      content = [], 
      template = 'basic',
      status = 'draft',
      publishDate,
      expiryDate,
      placement = 'none',
      showInNavigation = false,
      navigationOrder = 0,
      seo = {},
      settings = {},
      categories = [],
      tags = [],
      isFeatured = false
    } = req.body;

    // Check if slug already exists
    if (slug) {
      const existingPage = await Page.findOne({ slug });
      if (existingPage) {
        return res.status(400).json({ 
          success: false, 
          message: 'A page with this slug already exists',
          conflict: { field: 'slug', value: slug }
        });
      }
    }

    // Create page
    const page = new Page({
      title,
      slug,
      content: Array.isArray(content) ? content : [],
      template,
      status,
      publishDate: publishDate ? new Date(publishDate) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      placement,
      showInNavigation,
      navigationOrder,
      seo,
      settings,
      categories: Array.isArray(categories) ? categories : [],
      tags: Array.isArray(tags) ? tags : [],
      isFeatured,
      createdBy: req.user.id
    });

    await page.save();
    await page.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Page created successfully',
      data: {
        ...page.toObject(),
        isPublished: page.isPublished,
        url: page.url,
        wordCount: page.wordCount
      }
    });
  } catch (error) {
    console.error('Create page error:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ 
        success: false, 
        message: `Page with this ${field} already exists` 
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating page', 
      error: error.message 
    });
  }
};

// Update existing page
const updatePage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { changeLog } = req.body;
    
    const page = await Page.findById(id);
    if (!page) {
      return res.status(404).json({ 
        success: false, 
        message: 'Page not found' 
      });
    }

    // Prevent non-admin users from editing system pages
    if (page.isSystem && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'System pages can only be modified by administrators' 
      });
    }

    // Create backup before major changes
    const contentChanged = req.body.content && 
      JSON.stringify(req.body.content) !== JSON.stringify(page.content);
    
    if (contentChanged) {
      await page.createBackup(req.user.id, changeLog || 'Content updated');
    }

    // Check slug uniqueness if changing
    if (req.body.slug && req.body.slug !== page.slug) {
      const existingPage = await Page.findOne({ 
        slug: req.body.slug, 
        _id: { $ne: page._id } 
      });
      if (existingPage) {
        return res.status(400).json({ 
          success: false, 
          message: 'A page with this slug already exists' 
        });
      }
    }

    // Update fields
    const updateFields = [
      'title', 'slug', 'content', 'template', 'status', 'publishDate', 'expiryDate',
      'placement', 'showInNavigation', 'navigationOrder', 'seo', 'settings',
      'categories', 'tags', 'isFeatured'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'publishDate' || field === 'expiryDate') {
          page[field] = req.body[field] ? new Date(req.body[field]) : undefined;
        } else if (field === 'categories' || field === 'tags') {
          page[field] = Array.isArray(req.body[field]) ? req.body[field] : [];
        } else {
          page[field] = req.body[field];
        }
      }
    });

    page.updatedBy = req.user.id;
    await page.save();
    await page.populate('updatedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Page updated successfully',
      data: {
        ...page.toObject(),
        isPublished: page.isPublished,
        url: page.url,
        wordCount: page.wordCount
      }
    });
  } catch (error) {
    console.error('Update page error:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ 
        success: false, 
        message: `Page with this ${field} already exists` 
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating page', 
      error: error.message 
    });
  }
};

// Delete page
const deletePage = async (req, res) => {
  try {
    const { id } = req.params;
    const page = await Page.findById(id);
    
    if (!page) {
      return res.status(404).json({ 
        success: false, 
        message: 'Page not found' 
      });
    }
    
    // Prevent deletion of system pages
    if (page.isSystem) {
      return res.status(400).json({ 
        success: false, 
        message: 'System pages cannot be deleted' 
      });
    }
    
    await Page.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Page deleted successfully'
    });
  } catch (error) {
    console.error('Delete page error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid page ID format' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting page', 
      error: error.message 
    });
  }
};

// Duplicate page
const duplicatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug } = req.body;
    
    const originalPage = await Page.findById(id);
    if (!originalPage) {
      return res.status(404).json({ 
        success: false, 
        message: 'Page not found' 
      });
    }

    // Check if new slug exists
    if (slug) {
      const existingPage = await Page.findOne({ slug });
      if (existingPage) {
        return res.status(400).json({ 
          success: false, 
          message: 'A page with this slug already exists' 
        });
      }
    }

    // Create duplicated page
    const duplicatedPage = new Page({
      ...originalPage.toObject(),
      _id: undefined,
      title: title || {
        en: `${originalPage.title.en} (Copy)`,
        ar: `${originalPage.title.ar} (نسخة)`
      },
      slug: slug || `${originalPage.slug}-copy-${Date.now()}`,
      status: 'draft',
      views: 0,
      lastViewed: undefined,
      version: 1,
      previousVersions: [],
      createdBy: req.user.id,
      updatedBy: undefined
    });

    await duplicatedPage.save();
    await duplicatedPage.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Page duplicated successfully',
      data: {
        ...duplicatedPage.toObject(),
        isPublished: duplicatedPage.isPublished,
        url: duplicatedPage.url,
        wordCount: duplicatedPage.wordCount
      }
    });
  } catch (error) {
    console.error('Duplicate page error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error duplicating page', 
      error: error.message 
    });
  }
};

// Get page analytics
const getPageAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const analytics = await Page.aggregate([
      {
        $facet: {
          totalStats: [
            {
              $group: {
                _id: null,
                totalPages: { $sum: 1 },
                publishedPages: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'published'] }, 1, 0]
                  }
                },
                draftPages: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'draft'] }, 1, 0]
                  }
                },
                totalViews: { $sum: '$views' },
                avgViews: { $avg: '$views' }
              }
            }
          ],
          topPages: [
            { $match: { views: { $gt: 0 } } },
            { $sort: { views: -1 } },
            { $limit: 10 },
            {
              $project: {
                title: '$title.en',
                slug: 1,
                views: 1,
                lastViewed: 1
              }
            }
          ],
          statusDistribution: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          templateDistribution: [
            {
              $group: {
                _id: '$template',
                count: { $sum: 1 }
              }
            }
          ],
          recentlyUpdated: [
            { $sort: { updatedAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                title: '$title.en',
                slug: 1,
                updatedAt: 1,
                status: 1
              }
            }
          ]
        }
      }
    ]);

    const [stats] = analytics;
    
    res.json({
      success: true,
      data: {
        period,
        totalStats: stats.totalStats[0] || {
          totalPages: 0,
          publishedPages: 0,
          draftPages: 0,
          totalViews: 0,
          avgViews: 0
        },
        topPages: stats.topPages || [],
        statusDistribution: stats.statusDistribution || [],
        templateDistribution: stats.templateDistribution || [],
        recentlyUpdated: stats.recentlyUpdated || []
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving analytics', 
      error: error.message 
    });
  }
};

// Helper function to calculate word count
function calculateWordCount(content) {
  let totalWords = 0;
  if (Array.isArray(content)) {
    content.forEach(block => {
      if (block.content) {
        const enWords = (block.content.en || '').split(/\s+/).filter(word => word.length > 0).length;
        const arWords = (block.content.ar || '').split(/\s+/).filter(word => word.length > 0).length;
        totalWords += Math.max(enWords, arWords);
      }
    });
  }
  return totalWords;
}

module.exports = {
  getPages,
  getPage,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
  duplicatePage,
  getPageAnalytics
};