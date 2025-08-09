const express = require('express');
const router = express.Router();
const { 
  getPageBySlug, 
  getPages 
} = require('../controllers/pageController');
const { validatePageSlug } = require('../middleware/pageValidation');
const auth = require('../middleware/auth');

// Get all published pages with filtering (public)
router.get('/', async (req, res) => {
  try {
    // Override status to only show published pages for public endpoint
    req.query.status = 'published';
    req.query.includeContent = 'true'; // Include content for public pages
    await getPages(req, res);
  } catch (error) {
    console.error('Get published pages error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving pages' 
    });
  }
});

// Get navigation pages (public)
router.get('/navigation', async (req, res) => {
  try {
    const Page = require('../models/Page');
    const pages = await Page.findPublished({ 
      showInNavigation: true 
    })
      .select('title slug placement navigationOrder')
      .sort({ placement: 1, navigationOrder: 1 })
      .lean();
    
    // Transform to include computed URL
    const pagesWithUrl = pages.map(page => ({
      ...page,
      url: `/pages/${page.slug}`
    }));
    
    res.json({
      success: true,
      data: pagesWithUrl
    });
  } catch (error) {
    console.error('Get navigation pages error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving navigation pages' 
    });
  }
});

// Get featured pages (public)
router.get('/featured', async (req, res) => {
  try {
    const Page = require('../models/Page');
    const pages = await Page.findPublished({ 
      isFeatured: true 
    })
      .select('title slug seo.description settings.featuredImage views')
      .sort({ views: -1, createdAt: -1 })
      .limit(6)
      .lean();
    
    // Transform to include computed URL and featured image
    const pagesWithMetadata = pages.map(page => ({
      ...page,
      url: `/pages/${page.slug}`,
      featuredImage: page.settings?.featuredImage,
      description: page.seo?.description
    }));
    
    res.json({
      success: true,
      data: pagesWithMetadata
    });
  } catch (error) {
    console.error('Get featured pages error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving featured pages' 
    });
  }
});

// Search pages (public)
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { language = 'en', limit = 10 } = req.query;
    
    // Set search parameters and override to published only
    req.query.search = query;
    req.query.status = 'published';
    req.query.language = language;
    req.query.limit = limit;
    req.query.includeContent = 'true';
    
    await getPages(req, res);
  } catch (error) {
    console.error('Search pages error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error searching pages' 
    });
  }
});

// Get single page by slug with preview support (public + preview)
router.get('/slug/:slug', validatePageSlug, async (req, res) => {
  try {
    await getPageBySlug(req, res);
  } catch (error) {
    console.error('Get page by slug error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving page' 
    });
  }
});

// Legacy route for backward compatibility - Get single page by URL
router.get('/by-url/*', async (req, res) => {
  try {
    const url = '/' + req.params[0];
    const Page = require('../models/Page');
    
    // Extract slug from URL (assumes format /pages/slug)
    const urlParts = url.split('/');
    const slug = urlParts[urlParts.length - 1];
    
    if (!slug) {
      return res.status(404).json({ 
        success: false, 
        message: 'Page not found' 
      });
    }
    
    // Redirect to new slug-based endpoint
    req.params.slug = slug;
    await getPageBySlug(req, res);
  } catch (error) {
    console.error('Get page by URL error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving page' 
    });
  }
});

module.exports = router;