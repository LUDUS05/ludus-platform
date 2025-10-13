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

// Vendor update validation (more flexible)
const validateVendorUpdate = [
  body('businessName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be 2-100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 50, max: 1000 })
    .withMessage('Description must be 50-1000 characters'),
  
  body('contactInfo.email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('contactInfo.phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('location.address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Address cannot be empty'),
  
  body('location.city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City cannot be empty'),
  
  body('location.state')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('State cannot be empty'),
  
  body('location.zipCode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Zip code cannot be empty'),
  
  body('categories')
    .optional()
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

// Enhanced booking validation rules
const validateEnhancedBooking = [
  body('activityId')
    .isMongoId()
    .withMessage('Valid activity ID is required'),
  body('schedule.date')
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
  body('schedule.timeSlot')
    .notEmpty()
    .withMessage('Time slot is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time slot must be in HH:MM format'),
  body('participants')
    .isArray({ min: 1 })
    .withMessage('At least one participant is required'),
  body('participants.*.type')
    .isIn(['adult', 'child', 'senior'])
    .withMessage('Participant type must be adult, child, or senior'),
  body('participants.*.name')
    .notEmpty()
    .withMessage('Participant name is required')
    .isLength({ max: 100 })
    .withMessage('Participant name cannot exceed 100 characters'),
  body('participants.*.age')
    .isInt({ min: 0, max: 120 })
    .withMessage('Participant age must be between 0 and 120'),
  body('participants.*.idNumber')
    .notEmpty()
    .withMessage('ID number is required')
    .isLength({ min: 10, max: 20 })
    .withMessage('ID number must be between 10 and 20 characters'),
  body('contactInfo.phone')
    .notEmpty()
    .withMessage('Contact phone is required')
    .matches(/^\+966[0-9]{9}$/)
    .withMessage('Phone must be a valid Saudi number (+966XXXXXXXXX)'),
  body('contactInfo.email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('contactInfo.emergencyContact.name')
    .notEmpty()
    .withMessage('Emergency contact name is required'),
  body('contactInfo.emergencyContact.phone')
    .notEmpty()
    .withMessage('Emergency contact phone is required')
    .matches(/^\+966[0-9]{9}$/)
    .withMessage('Emergency contact phone must be a valid Saudi number'),
  body('contactInfo.emergencyContact.relationship')
    .notEmpty()
    .withMessage('Emergency contact relationship is required'),
  body('specialRequests')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Special requests cannot exceed 1000 characters'),
  body('waiverSigned')
    .isBoolean()
    .withMessage('Waiver signed must be a boolean value'),
  handleValidationErrors
];

const validateBookingCancellation = [
  body('reason')
    .notEmpty()
    .withMessage('Cancellation reason is required')
    .isLength({ max: 500 })
    .withMessage('Cancellation reason cannot exceed 500 characters'),
  handleValidationErrors
];

const validateBookingReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Review comment cannot exceed 1000 characters'),
  handleValidationErrors
];

const validateCheckIn = [
  body('checkInBy')
    .optional()
    .isIn(['customer', 'vendor', 'admin'])
    .withMessage('Check-in by must be customer, vendor, or admin'),
  handleValidationErrors
];

// ObjectId validation
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} ID`),
  
  handleValidationErrors
];

// Notification validation rules
const validateEnhancedNotification = [
  body('user')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  
  body('type')
    .isIn([
      'booking_confirmed',
      'booking_cancelled',
      'booking_reminder',
      'payment_success',
      'payment_failed',
      'review_request',
      'review_received',
      'promotion',
      'system_announcement',
      'activity_updated',
      'activity_cancelled',
      'partner_response',
      'referral_reward',
      'welcome',
      'verification_required'
    ])
    .withMessage('Invalid notification type'),
  
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Notification title is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be 1-100 characters'),
  
  body('titleAr')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Arabic title must be 1-100 characters'),
  
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Notification message is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be 1-500 characters'),
  
  body('messageAr')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Arabic message must be 1-500 characters'),
  
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  
  body('isUrgent')
    .optional()
    .isBoolean()
    .withMessage('isUrgent must be a boolean'),
  
  body('actionUrl')
    .optional()
    .isURL()
    .withMessage('Action URL must be a valid URL'),
  
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  
  body('channels.email')
    .optional()
    .isBoolean()
    .withMessage('Email channel must be a boolean'),
  
  body('channels.sms')
    .optional()
    .isBoolean()
    .withMessage('SMS channel must be a boolean'),
  
  body('channels.push')
    .optional()
    .isBoolean()
    .withMessage('Push channel must be a boolean'),
  
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO 8601 date'),
  
  handleValidationErrors
];

const validateBulkNotification = [
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('User IDs array is required and must not be empty'),
  
  body('userIds.*')
    .isMongoId()
    .withMessage('Each user ID must be a valid MongoDB ObjectId'),
  
  body('type')
    .isIn([
      'booking_confirmed',
      'booking_cancelled',
      'booking_reminder',
      'payment_success',
      'payment_failed',
      'review_request',
      'review_received',
      'promotion',
      'system_announcement',
      'activity_updated',
      'activity_cancelled',
      'partner_response',
      'referral_reward',
      'welcome',
      'verification_required'
    ])
    .withMessage('Invalid notification type'),
  
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Notification title is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be 1-100 characters'),
  
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Notification message is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be 1-500 characters'),
  
  handleValidationErrors
];

const validateNotificationPreferences = [
  body('preferences')
    .isObject()
    .withMessage('Preferences must be an object'),
  
  body('preferences.email')
    .optional()
    .isObject()
    .withMessage('Email preferences must be an object'),
  
  body('preferences.sms')
    .optional()
    .isObject()
    .withMessage('SMS preferences must be an object'),
  
  body('preferences.push')
    .optional()
    .isObject()
    .withMessage('Push preferences must be an object'),
  
  body('preferences.frequency')
    .optional()
    .isIn(['immediate', 'hourly', 'daily', 'weekly'])
    .withMessage('Invalid frequency setting'),
  
  body('preferences.quietHours.enabled')
    .optional()
    .isBoolean()
    .withMessage('Quiet hours enabled must be a boolean'),
  
  body('preferences.quietHours.start')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Quiet hours start must be in HH:MM format'),
  
  body('preferences.quietHours.end')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Quiet hours end must be in HH:MM format'),
  
  handleValidationErrors
];

const validateDeliveryStatus = [
  body('channel')
    .isIn(['email', 'sms', 'push'])
    .withMessage('Channel must be email, sms, or push'),
  
  body('sent')
    .isBoolean()
    .withMessage('Sent status must be a boolean'),
  
  body('error')
    .optional()
    .isString()
    .withMessage('Error message must be a string'),
  
  handleValidationErrors
];

// Review validation rules
const validateReviewCreation = [
  body('activityId')
    .isMongoId()
    .withMessage('Valid activity ID is required'),
  
  body('bookingId')
    .isMongoId()
    .withMessage('Valid booking ID is required'),
  
  body('rating.overall')
    .isInt({ min: 1, max: 5 })
    .withMessage('Overall rating must be between 1 and 5'),
  
  body('rating.value')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Value rating must be between 1 and 5'),
  
  body('rating.service')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Service rating must be between 1 and 5'),
  
  body('rating.location')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Location rating must be between 1 and 5'),
  
  body('rating.communication')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Communication rating must be between 1 and 5'),
  
  body('comment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
  
  body('commentAr')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Arabic comment cannot exceed 1000 characters'),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  
  body('images.*.url')
    .optional()
    .isURL()
    .withMessage('Image URL must be valid'),
  
  body('images.*.caption')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Image caption cannot exceed 200 characters'),
  
  body('images.*.captionAr')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Arabic image caption cannot exceed 200 characters'),
  
  handleValidationErrors
];

const validateReviewUpdate = [
  body('rating.overall')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Overall rating must be between 1 and 5'),
  
  body('rating.value')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Value rating must be between 1 and 5'),
  
  body('rating.service')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Service rating must be between 1 and 5'),
  
  body('rating.location')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Location rating must be between 1 and 5'),
  
  body('rating.communication')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Communication rating must be between 1 and 5'),
  
  body('comment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
  
  body('commentAr')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Arabic comment cannot exceed 1000 characters'),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  
  body('images.*.url')
    .optional()
    .isURL()
    .withMessage('Image URL must be valid'),
  
  body('images.*.caption')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Image caption cannot exceed 200 characters'),
  
  body('images.*.captionAr')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Arabic image caption cannot exceed 200 characters'),
  
  handleValidationErrors
];

const validatePartnerResponse = [
  body('comment')
    .notEmpty()
    .withMessage('Response comment is required')
    .isLength({ max: 1000 })
    .withMessage('Response comment cannot exceed 1000 characters'),
  
  body('commentAr')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Arabic response comment cannot exceed 1000 characters'),
  
  handleValidationErrors
];

const validateReviewModeration = [
  body('status')
    .isIn(['pending', 'approved', 'rejected', 'hidden'])
    .withMessage('Invalid moderation status'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Moderation notes cannot exceed 500 characters'),
  
  handleValidationErrors
];

// Search validation rules
const validateSearchQuery = [
  query('query')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be 1-100 characters'),
  
  query('category')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be 1-50 characters'),
  
  query('location')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Location must be 1-100 characters'),
  
  query('priceMin')
    .optional()
    .isInt({ min: 0, max: 10000 })
    .withMessage('Minimum price must be between 0 and 10000'),
  
  query('priceMax')
    .optional()
    .isInt({ min: 0, max: 10000 })
    .withMessage('Maximum price must be between 0 and 10000'),
  
  query('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid ISO 8601 date'),
  
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid ISO 8601 date'),
  
  query('sortBy')
    .optional()
    .isIn(['relevance', 'price', 'rating', 'date', 'popularity', 'distance'])
    .withMessage('Invalid sort option'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  query('page')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Page must be between 1 and 100'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('radius')
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage('Radius must be between 1 and 500 km'),
  
  query('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  query('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  query('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  query('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),
  
  query('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid difficulty level'),
  
  query('duration')
    .optional()
    .isIn(['short', 'medium', 'long', 'full-day'])
    .withMessage('Invalid duration option'),
  
  query('groupSize')
    .optional()
    .isIn(['individual', 'small', 'medium', 'large'])
    .withMessage('Invalid group size option'),
  
  query('language')
    .optional()
    .isIn(['ar', 'en'])
    .withMessage('Language must be ar or en'),
  
  handleValidationErrors
];

const validateSearchFilters = [
  query('language')
    .optional()
    .isIn(['ar', 'en'])
    .withMessage('Language must be ar or en'),
  
  handleValidationErrors
];

const validateSearchAnalytics = [
  query('period')
    .optional()
    .isIn(['7d', '30d', '90d', '1y'])
    .withMessage('Period must be 7d, 30d, 90d, or 1y'),
  
  query('groupBy')
    .optional()
    .isIn(['category', 'location', 'difficulty', 'duration'])
    .withMessage('Group by must be category, location, difficulty, or duration'),
  
  handleValidationErrors
];

// Analytics validation rules
const validateAnalyticsQuery = [
  query('period')
    .optional()
    .isIn(['7d', '30d', '90d', '1y'])
    .withMessage('Period must be 7d, 30d, 90d, or 1y'),
  
  query('groupBy')
    .optional()
    .isIn(['day', 'week', 'month', 'year'])
    .withMessage('Group by must be day, week, month, or year'),
  
  query('segment')
    .optional()
    .isIn(['all', 'new', 'returning', 'active', 'inactive'])
    .withMessage('Invalid segment option'),
  
  query('vendorId')
    .optional()
    .isMongoId()
    .withMessage('Vendor ID must be a valid MongoDB ObjectId'),
  
  query('category')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be 1-50 characters'),
  
  query('location')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Location must be 1-100 characters'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
  
  handleValidationErrors
];

const validateAnalyticsPeriod = [
  query('period')
    .isIn(['7d', '30d', '90d', '1y'])
    .withMessage('Period must be 7d, 30d, 90d, or 1y'),
  
  handleValidationErrors
];

const validateAnalyticsGroupBy = [
  query('groupBy')
    .isIn(['day', 'week', 'month', 'year'])
    .withMessage('Group by must be day, week, month, or year'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateVendorCreation,
  validateVendorUpdate,
  validateActivityCreation,
  validateBookingCreation,
  validateEnhancedBooking,
  validateBookingCancellation,
  validateBookingReview,
  validateCheckIn,
  validatePayment,
  validateRefund,
  validateSavePaymentMethod,
  validateSearch,
  validateObjectId,
  validateEnhancedNotification,
  validateBulkNotification,
  validateNotificationPreferences,
  validateDeliveryStatus,
  validateReviewCreation,
  validateReviewUpdate,
  validatePartnerResponse,
  validateReviewModeration,
  validateSearchQuery,
  validateSearchFilters,
  validateSearchAnalytics,
  validateAnalyticsQuery,
  validateAnalyticsPeriod,
  validateAnalyticsGroupBy
};