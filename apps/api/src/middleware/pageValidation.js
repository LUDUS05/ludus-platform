const { body, param } = require('express-validator');

// Validation for creating a new page
const validateCreatePage = [
  body('title.en')
    .trim()
    .notEmpty()
    .withMessage('English title is required')
    .isLength({ max: 200 })
    .withMessage('English title must be less than 200 characters'),
    
  body('title.ar')
    .trim()
    .notEmpty()
    .withMessage('Arabic title is required')
    .isLength({ max: 200 })
    .withMessage('Arabic title must be less than 200 characters'),
    
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and dashes')
    .isLength({ min: 1, max: 100 })
    .withMessage('Slug must be between 1 and 100 characters'),
    
  body('content')
    .optional()
    .isArray()
    .withMessage('Content must be an array of blocks'),
    
  body('content.*.type')
    .optional()
    .isIn(['paragraph', 'heading', 'image', 'video', 'quote', 'code', 'list', 'divider', 'button', 'embed'])
    .withMessage('Invalid content block type'),
    
  body('template')
    .optional()
    .isIn(['basic', 'landing', 'about', 'contact', 'custom'])
    .withMessage('Invalid page template'),
    
  body('status')
    .optional()
    .isIn(['published', 'draft', 'scheduled', 'archived'])
    .withMessage('Invalid page status'),
    
  body('publishDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid publish date format'),
    
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiry date format'),
    
  body('placement')
    .optional()
    .isIn(['header', 'footer', 'sidebar', 'none'])
    .withMessage('Invalid page placement'),
    
  body('showInNavigation')
    .optional()
    .isBoolean()
    .withMessage('Show in navigation must be a boolean'),
    
  body('navigationOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Navigation order must be a non-negative integer'),
    
  body('seo.title.en')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('SEO title (English) must be less than 60 characters'),
    
  body('seo.title.ar')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('SEO title (Arabic) must be less than 60 characters'),
    
  body('seo.description.en')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('SEO description (English) must be less than 160 characters'),
    
  body('seo.description.ar')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('SEO description (Arabic) must be less than 160 characters'),
    
  body('seo.ogImage')
    .optional()
    .isURL()
    .withMessage('OG image must be a valid URL'),
    
  body('categories')
    .optional()
    .isArray()
    .withMessage('Categories must be an array'),
    
  body('categories.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each category must be between 1 and 50 characters'),
    
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
    
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
    
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('Is featured must be a boolean'),
    
  body('settings.allowComments')
    .optional()
    .isBoolean()
    .withMessage('Allow comments must be a boolean'),
    
  body('settings.requireAuth')
    .optional()
    .isBoolean()
    .withMessage('Require auth must be a boolean'),
    
  body('settings.backgroundColor')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Background color must be a valid hex color'),
    
  body('settings.textColor')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Text color must be a valid hex color'),
];

// Validation for updating a page (similar to create but all fields optional)
const validateUpdatePage = [
  body('title.en')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('English title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('English title must be less than 200 characters'),
    
  body('title.ar')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Arabic title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Arabic title must be less than 200 characters'),
    
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and dashes')
    .isLength({ min: 1, max: 100 })
    .withMessage('Slug must be between 1 and 100 characters'),
    
  body('content')
    .optional()
    .isArray()
    .withMessage('Content must be an array of blocks'),
    
  body('content.*.type')
    .optional()
    .isIn(['paragraph', 'heading', 'image', 'video', 'quote', 'code', 'list', 'divider', 'button', 'embed'])
    .withMessage('Invalid content block type'),
    
  body('template')
    .optional()
    .isIn(['basic', 'landing', 'about', 'contact', 'custom'])
    .withMessage('Invalid page template'),
    
  body('status')
    .optional()
    .isIn(['published', 'draft', 'scheduled', 'archived'])
    .withMessage('Invalid page status'),
    
  body('publishDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid publish date format'),
    
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiry date format'),
    
  body('placement')
    .optional()
    .isIn(['header', 'footer', 'sidebar', 'none'])
    .withMessage('Invalid page placement'),
    
  body('showInNavigation')
    .optional()
    .isBoolean()
    .withMessage('Show in navigation must be a boolean'),
    
  body('navigationOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Navigation order must be a non-negative integer'),
    
  body('seo.title.en')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('SEO title (English) must be less than 60 characters'),
    
  body('seo.title.ar')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('SEO title (Arabic) must be less than 60 characters'),
    
  body('seo.description.en')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('SEO description (English) must be less than 160 characters'),
    
  body('seo.description.ar')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('SEO description (Arabic) must be less than 160 characters'),
    
  body('seo.ogImage')
    .optional()
    .isURL()
    .withMessage('OG image must be a valid URL'),
    
  body('categories')
    .optional()
    .isArray()
    .withMessage('Categories must be an array'),
    
  body('categories.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each category must be between 1 and 50 characters'),
    
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
    
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
    
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('Is featured must be a boolean'),
    
  body('settings.allowComments')
    .optional()
    .isBoolean()
    .withMessage('Allow comments must be a boolean'),
    
  body('settings.requireAuth')
    .optional()
    .isBoolean()
    .withMessage('Require auth must be a boolean'),
    
  body('settings.backgroundColor')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Background color must be a valid hex color'),
    
  body('settings.textColor')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Text color must be a valid hex color'),
    
  body('changeLog')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Change log must be less than 500 characters'),
];

// Validation for duplicate page
const validateDuplicatePage = [
  body('title.en')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('English title must be less than 200 characters'),
    
  body('title.ar')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Arabic title must be less than 200 characters'),
    
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and dashes')
    .isLength({ min: 1, max: 100 })
    .withMessage('Slug must be between 1 and 100 characters'),
];

// Validation for page ID parameter
const validatePageId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid page ID format'),
];

// Validation for page slug parameter
const validatePageSlug = [
  param('slug')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Invalid slug format')
    .isLength({ min: 1, max: 100 })
    .withMessage('Slug must be between 1 and 100 characters'),
];

module.exports = {
  validateCreatePage,
  validateUpdatePage,
  validateDuplicatePage,
  validatePageId,
  validatePageSlug
};