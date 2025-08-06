const Page = require('../models/Page');

// Get all pages (admin)
const getPages = async (req, res) => {
  try {
    const { status, placement, search, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (placement && placement !== 'all') {
      filter.placement = placement;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } }
      ];
    }

    const totalPages = await Page.countDocuments(filter);
    const pages = await Page.find(filter)
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      pages,
      totalPages: Math.ceil(totalPages / limit),
      currentPage: parseInt(page),
      totalCount: totalPages
    });
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single page (admin)
const getPage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    res.json(page);
  } catch (error) {
    console.error('Get page error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create page
const createPage = async (req, res) => {
  try {
    const { title, content, url, placement, status, metaDescription, metaKeywords, order } = req.body;
    
    // Validate required fields
    if (!title || !content || !url) {
      return res.status(400).json({ message: 'Title, content, and URL are required' });
    }
    
    // Check if URL already exists
    const existingPage = await Page.findOne({ url });
    if (existingPage) {
      return res.status(400).json({ message: 'A page with this URL already exists' });
    }
    
    const page = new Page({
      title,
      content,
      url,
      placement: placement || 'none',
      status: status || 'draft',
      metaDescription,
      metaKeywords,
      order: order || 0,
      createdBy: req.user.id
    });
    
    await page.save();
    await page.populate('createdBy', 'firstName lastName');
    
    res.status(201).json(page);
  } catch (error) {
    console.error('Create page error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Page with this URL or slug already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update page
const updatePage = async (req, res) => {
  try {
    const { title, content, url, placement, status, metaDescription, metaKeywords, order } = req.body;
    
    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    // If URL is being changed, check if new URL already exists
    if (url && url !== page.url) {
      const existingPage = await Page.findOne({ url, _id: { $ne: page._id } });
      if (existingPage) {
        return res.status(400).json({ message: 'A page with this URL already exists' });
      }
    }
    
    // Update fields
    if (title) page.title = title;
    if (content) page.content = content;
    if (url) page.url = url;
    if (placement !== undefined) page.placement = placement;
    if (status) page.status = status;
    if (metaDescription !== undefined) page.metaDescription = metaDescription;
    if (metaKeywords !== undefined) page.metaKeywords = metaKeywords;
    if (order !== undefined) page.order = order;
    page.updatedBy = req.user.id;
    
    await page.save();
    await page.populate('updatedBy', 'firstName lastName');
    
    res.json(page);
  } catch (error) {
    console.error('Update page error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Page with this URL or slug already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete page
const deletePage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    // Prevent deletion of system pages
    if (page.isSystem) {
      return res.status(400).json({ message: 'System pages cannot be deleted' });
    }
    
    await Page.findByIdAndDelete(req.params.id);
    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Delete page error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getPages,
  getPage,
  createPage,
  updatePage,
  deletePage
};