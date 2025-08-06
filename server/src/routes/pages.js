const express = require('express');
const router = express.Router();
const Page = require('../models/Page');
const { auth, requireAdmin } = require('../middleware/auth');

// Get all published pages (public)
router.get('/', async (req, res) => {
  try {
    const pages = await Page.find({ status: 'published' })
      .select('title slug url placement order')
      .sort({ placement: 1, order: 1 });
    
    res.json(pages);
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single page by URL (public)
router.get('/by-url/*', async (req, res) => {
  try {
    const url = '/' + req.params[0]; // Get everything after /by-url/
    const page = await Page.findOne({ url, status: 'published' })
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    res.json(page);
  } catch (error) {
    console.error('Get page by URL error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single page by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug, status: 'published' })
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    res.json(page);
  } catch (error) {
    console.error('Get page error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;