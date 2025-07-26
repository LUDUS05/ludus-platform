const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be 2-50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be 2-50 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

const validateUserUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be 2-50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be 2-50 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  handleValidationErrors
];

// Vendor validation rules
const validateVendorCreation = [
  body('businessName')
    .trim()
    .notEmpty()
    .withMessage('Business name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be 2-100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 50, max: 1000 })
    .withMessage('Description must be 50-1000 characters'),
  
  body('contactInfo.email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('contactInfo.phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  
  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('location.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  
  body('location.zipCode')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required'),
  
  body('categories')
    .isArray({ min: 1 })
    .withMessage('At least one category is required'),
  
  handleValidationErrors
];

// Activity validation rules
const validateActivityCreation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be 5-100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 100, max: 2000 })
    .withMessage('Description must be 100-2000 characters'),
  
  body('shortDescription')
    .trim()
    .notEmpty()
    .withMessage('Short description is required')
    .isLength({ min: 50, max: 300 })
    .withMessage('Short description must be 50-300 characters'),
  
  body('vendor')
    .isMongoId()
    .withMessage('Valid vendor ID is required'),
  
  body('category')
    .isIn(['fitness', 'arts', 'food', 'outdoor', 'unique', 'wellness'])
    .withMessage('Valid category is required'),
  
  body('pricing.basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  
  body('capacity.max')
    .isInt({ min: 1 })
    .withMessage('Maximum capacity must be at least 1'),
  
  handleValidationErrors
];

// Booking validation rules
const validateBookingCreation = [
  body('activity')
    .isMongoId()
    .withMessage('Valid activity ID is required'),
  
  body('bookingDate')
    .isISO8601()
    .withMessage('Valid booking date is required')
    .custom((value) => {
      const bookingDate = new Date(value);
      const now = new Date();
      if (bookingDate <= now) {
        throw new Error('Booking date must be in the future');
      }
      return true;
    }),
  
  body('timeSlot.startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid start time is required (HH:MM format)'),
  
  body('timeSlot.endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid end time is required (HH:MM format)'),
  
  body('participants.count')
    .isInt({ min: 1 })
    .withMessage('Participant count must be at least 1'),
  
  body('contactInfo.email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  handleValidationErrors
];

// Search validation rules
const validateSearch = [
  query('query')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be 2-100 characters'),
  
  query('category')
    .optional()
    .isIn(['fitness', 'arts', 'food', 'outdoor', 'unique', 'wellness'])
    .withMessage('Invalid category'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  
  query('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  
  query('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  
  query('radius')
    .optional()
    .isFloat({ min: 1, max: 500 })
    .withMessage('Radius must be between 1 and 500 miles'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  
  handleValidationErrors
];

// Payment validation rules
const validatePayment = [
  body('bookingId')
    .isMongoId()
    .withMessage('Valid booking ID is required'),
  
  body('paymentMethod')
    .isIn(['credit_card', 'mada', 'apple_pay', 'stc_pay', 'sadad'])
    .withMessage('Valid payment method is required'),
  
  body('cardData')
    .optional()
    .custom((value, { req }) => {
      if (req.body.paymentMethod === 'credit_card' && !req.body.savedTokenId && !value) {
        throw new Error('Card data is required for credit card payments');
      }
      return true;
    }),
  
  body('cardData.name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Cardholder name must be 2-100 characters'),
  
  body('cardData.number')
    .optional()
    .isCreditCard()
    .withMessage('Valid card number is required'),
  
  body('cardData.cvc')
    .optional()
    .isLength({ min: 3, max: 4 })
    .isNumeric()
    .withMessage('Valid CVC is required'),
  
  body('cardData.month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Valid expiry month is required'),
  
  body('cardData.year')
    .optional()
    .isInt({ min: new Date().getFullYear() })
    .withMessage('Valid expiry year is required'),
  
  body('savedTokenId')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Valid token ID is required'),
  
  body('mobile')
    .optional()
    .custom((value, { req }) => {
      if (req.body.paymentMethod === 'stc_pay' && !value) {
        throw new Error('Mobile number is required for STC Pay');
      }
      return true;
    })
    .isMobilePhone('ar-SA')
    .withMessage('Valid Saudi mobile number is required'),
  
  handleValidationErrors
];

const validateRefund = [
  param('bookingId')
    .isMongoId()
    .withMessage('Valid booking ID is required'),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Refund reason must be 5-500 characters'),
  
  handleValidationErrors
];

const validateSavePaymentMethod = [
  body('cardData.name')
    .trim()
    .notEmpty()
    .withMessage('Cardholder name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Cardholder name must be 2-100 characters'),
  
  body('cardData.number')
    .isCreditCard()
    .withMessage('Valid card number is required'),
  
  body('cardData.cvc')
    .isLength({ min: 3, max: 4 })
    .isNumeric()
    .withMessage('Valid CVC is required'),
  
  body('cardData.month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Valid expiry month is required'),
  
  body('cardData.year')
    .isInt({ min: new Date().getFullYear() })
    .withMessage('Valid expiry year is required'),
  
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean'),
  
  handleValidationErrors
];

// ObjectId validation
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} ID`),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateVendorCreation,
  validateActivityCreation,
  validateBookingCreation,
  validatePayment,
  validateRefund,
  validateSavePaymentMethod,
  validateSearch,
  validateObjectId
};