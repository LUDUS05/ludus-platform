/**
 * @fileoverview Enhanced Validation Utilities for LUDUS platform - LDS-006 Implementation
 * 
 * This file provides comprehensive validation utilities for the LUDUS social activity platform
 * based on the detailed database design specification. It includes validation functions,
 * custom validators, and error handling with cultural sensitivity for the Saudi Arabian market.
 * 
 * Key Features:
 * - Comprehensive validation functions
 * - Arabic/English text validation
 * - Saudi-specific validators (phone, ID, etc.)
 * - Geospatial validation
 * - Business logic validation
 * - Error message localization
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const mongoose = require('mongoose');

/**
 * Validation error class for custom validation errors
 */
class ValidationError extends Error {
  constructor(message, field, code) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.code = code;
  }
}

/**
 * Saudi phone number validation
 * Validates Saudi phone numbers in the format +966XXXXXXXXX
 * 
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid, false otherwise
 */
const validateSaudiPhone = (phone) => {
  const saudiPhoneRegex = /^\+966[0-9]{9}$/;
  return saudiPhoneRegex.test(phone);
};

/**
 * Saudi national ID validation
 * Validates Saudi national ID numbers
 * 
 * @param {string} idNumber - ID number to validate
 * @returns {boolean} True if valid, false otherwise
 */
const validateSaudiNationalId = (idNumber) => {
  if (!idNumber || idNumber.length !== 10) return false;
  
  // Saudi national ID validation algorithm
  const weights = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;
  
  for (let i = 0; i < 9; i++) {
    const digit = parseInt(idNumber[i]);
    const weighted = digit * weights[i];
    sum += weighted > 9 ? weighted - 9 : weighted;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(idNumber[9]);
};

/**
 * Email validation
 * Validates email addresses with comprehensive regex
 * 
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid, false otherwise
 */
const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
};

/**
 * Password strength validation
 * Validates password strength with multiple criteria
 * 
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with score and message
 */
const validatePasswordStrength = (password) => {
  const result = {
    isValid: false,
    score: 0,
    message: '',
    requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  };
  
  if (password.length >= 8) {
    result.requirements.length = true;
    result.score += 1;
  }
  
  if (/[A-Z]/.test(password)) {
    result.requirements.uppercase = true;
    result.score += 1;
  }
  
  if (/[a-z]/.test(password)) {
    result.requirements.lowercase = true;
    result.score += 1;
  }
  
  if (/[0-9]/.test(password)) {
    result.requirements.number = true;
    result.score += 1;
  }
  
  if (/[^A-Za-z0-9]/.test(password)) {
    result.requirements.special = true;
    result.score += 1;
  }
  
  result.isValid = result.score >= 3;
  
  if (!result.isValid) {
    const missing = Object.entries(result.requirements)
      .filter(([key, value]) => !value)
      .map(([key]) => key);
    result.message = `Password must include: ${missing.join(', ')}`;
  }
  
  return result;
};

/**
 * Geospatial coordinates validation
 * Validates longitude and latitude coordinates
 * 
 * @param {number} longitude - Longitude coordinate
 * @param {number} latitude - Latitude coordinate
 * @returns {boolean} True if valid, false otherwise
 */
const validateCoordinates = (longitude, latitude) => {
  return longitude >= -180 && longitude <= 180 && 
         latitude >= -90 && latitude <= 90;
};

/**
 * Saudi Arabia coordinates validation
 * Validates coordinates within Saudi Arabia boundaries
 * 
 * @param {number} longitude - Longitude coordinate
 * @param {number} latitude - Latitude coordinate
 * @returns {boolean} True if within Saudi Arabia, false otherwise
 */
const validateSaudiCoordinates = (longitude, latitude) => {
  // Saudi Arabia approximate boundaries
  const minLon = 34.5;
  const maxLon = 55.7;
  const minLat = 16.3;
  const maxLat = 32.2;
  
  return longitude >= minLon && longitude <= maxLon &&
         latitude >= minLat && latitude <= maxLat;
};

/**
 * Arabic text validation
 * Validates Arabic text content
 * 
 * @param {string} text - Text to validate
 * @returns {boolean} True if contains Arabic characters, false otherwise
 */
const validateArabicText = (text) => {
  const arabicRegex = /[\u0600-\u06FF]/;
  return arabicRegex.test(text);
};

/**
 * Mixed language text validation
 * Validates text that can contain both Arabic and English
 * 
 * @param {string} text - Text to validate
 * @returns {boolean} True if valid, false otherwise
 */
const validateMixedLanguageText = (text) => {
  const mixedLanguageRegex = /^[\u0600-\u06FFa-zA-Z0-9\s\-.,!?()]+$/;
  return mixedLanguageRegex.test(text);
};

/**
 * URL validation
 * Validates URL format
 * 
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid, false otherwise
 */
const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Date validation
 * Validates date format and range
 * 
 * @param {Date|string} date - Date to validate
 * @param {Object} options - Validation options
 * @returns {boolean} True if valid, false otherwise
 */
const validateDate = (date, options = {}) => {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return false;
  }
  
  if (options.minDate && dateObj < new Date(options.minDate)) {
    return false;
  }
  
  if (options.maxDate && dateObj > new Date(options.maxDate)) {
    return false;
  }
  
  return true;
};

/**
 * Age validation
 * Validates age based on date of birth
 * 
 * @param {Date|string} dateOfBirth - Date of birth
 * @param {number} minAge - Minimum age required
 * @param {number} maxAge - Maximum age allowed
 * @returns {Object} Validation result with age and validity
 */
const validateAge = (dateOfBirth, minAge = 0, maxAge = 120) => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
    ? age - 1 
    : age;
  
  return {
    age: actualAge,
    isValid: actualAge >= minAge && actualAge <= maxAge,
    message: actualAge < minAge 
      ? `Age must be at least ${minAge} years`
      : actualAge > maxAge 
        ? `Age cannot exceed ${maxAge} years`
        : 'Valid age'
  };
};

/**
 * Price validation
 * Validates price values and currency
 * 
 * @param {number} price - Price to validate
 * @param {string} currency - Currency code
 * @returns {Object} Validation result
 */
const validatePrice = (price, currency = 'SAR') => {
  const result = {
    isValid: false,
    message: '',
    formattedPrice: ''
  };
  
  if (typeof price !== 'number' || isNaN(price)) {
    result.message = 'Price must be a valid number';
    return result;
  }
  
  if (price < 0) {
    result.message = 'Price cannot be negative';
    return result;
  }
  
  if (price > 1000000) {
    result.message = 'Price cannot exceed 1,000,000';
    return result;
  }
  
  result.isValid = true;
  result.formattedPrice = `${price.toFixed(2)} ${currency}`;
  
  return result;
};

/**
 * Capacity validation
 * Validates capacity values for activities
 * 
 * @param {number} minCapacity - Minimum capacity
 * @param {number} maxCapacity - Maximum capacity
 * @returns {Object} Validation result
 */
const validateCapacity = (minCapacity, maxCapacity) => {
  const result = {
    isValid: false,
    message: ''
  };
  
  if (minCapacity < 1) {
    result.message = 'Minimum capacity must be at least 1';
    return result;
  }
  
  if (maxCapacity < 1) {
    result.message = 'Maximum capacity must be at least 1';
    return result;
  }
  
  if (minCapacity > maxCapacity) {
    result.message = 'Minimum capacity cannot exceed maximum capacity';
    return result;
  }
  
  result.isValid = true;
  return result;
};

/**
 * Time slot validation
 * Validates time slot format and logic
 * 
 * @param {string} startTime - Start time (HH:MM format)
 * @param {string} endTime - End time (HH:MM format)
 * @returns {Object} Validation result
 */
const validateTimeSlot = (startTime, endTime) => {
  const result = {
    isValid: false,
    message: '',
    duration: 0
  };
  
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  
  if (!timeRegex.test(startTime)) {
    result.message = 'Invalid start time format (use HH:MM)';
    return result;
  }
  
  if (!timeRegex.test(endTime)) {
    result.message = 'Invalid end time format (use HH:MM)';
    return result;
  }
  
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  
  if (end <= start) {
    result.message = 'End time must be after start time';
    return result;
  }
  
  result.duration = (end - start) / (1000 * 60); // Duration in minutes
  result.isValid = true;
  
  return result;
};

/**
 * Booking validation
 * Validates booking data comprehensively
 * 
 * @param {Object} bookingData - Booking data to validate
 * @returns {Object} Validation result
 */
const validateBooking = (bookingData) => {
  const errors = [];
  
  // Validate required fields
  if (!bookingData.user || !bookingData.user.id) {
    errors.push('User ID is required');
  }
  
  if (!bookingData.activity || !bookingData.activity.id) {
    errors.push('Activity ID is required');
  }
  
  if (!bookingData.schedule || !bookingData.schedule.date) {
    errors.push('Booking date is required');
  }
  
  if (!bookingData.participants || bookingData.participants.length === 0) {
    errors.push('At least one participant is required');
  }
  
  // Validate participants
  if (bookingData.participants) {
    bookingData.participants.forEach((participant, index) => {
      if (!participant.name) {
        errors.push(`Participant ${index + 1} name is required`);
      }
      if (!participant.type || !['adult', 'child', 'senior'].includes(participant.type)) {
        errors.push(`Participant ${index + 1} type is required and must be adult, child, or senior`);
      }
      if (!participant.age || participant.age < 0 || participant.age > 120) {
        errors.push(`Participant ${index + 1} age must be between 0 and 120`);
      }
    });
  }
  
  // Validate pricing
  if (bookingData.pricing) {
    const priceValidation = validatePrice(bookingData.pricing.total);
    if (!priceValidation.isValid) {
      errors.push(priceValidation.message);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

/**
 * Activity validation
 * Validates activity data comprehensively
 * 
 * @param {Object} activityData - Activity data to validate
 * @returns {Object} Validation result
 */
const validateActivity = (activityData) => {
  const errors = [];
  
  // Validate required fields
  if (!activityData.title) {
    errors.push('Activity title is required');
  }
  
  if (!activityData.description) {
    errors.push('Activity description is required');
  }
  
  if (!activityData.category || !activityData.category.id) {
    errors.push('Category is required');
  }
  
  if (!activityData.partner || !activityData.partner.id) {
    errors.push('Partner is required');
  }
  
  // Validate location
  if (activityData.location) {
    if (!activityData.location.city) {
      errors.push('City is required');
    }
    if (activityData.location.coordinates) {
      const coords = activityData.location.coordinates.coordinates;
      if (!validateCoordinates(coords[0], coords[1])) {
        errors.push('Invalid coordinates');
      }
    }
  }
  
  // Validate pricing
  if (activityData.pricing) {
    if (activityData.pricing.adult < 0) {
      errors.push('Adult price cannot be negative');
    }
    if (activityData.pricing.child < 0) {
      errors.push('Child price cannot be negative');
    }
  }
  
  // Validate capacity
  if (activityData.capacity) {
    const capacityValidation = validateCapacity(
      activityData.capacity.minParticipants,
      activityData.capacity.maxParticipants
    );
    if (!capacityValidation.isValid) {
      errors.push(capacityValidation.message);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

/**
 * User validation
 * Validates user data comprehensively
 * 
 * @param {Object} userData - User data to validate
 * @returns {Object} Validation result
 */
const validateUser = (userData) => {
  const errors = [];
  
  // Validate email
  if (!userData.email || !validateEmail(userData.email)) {
    errors.push('Valid email is required');
  }
  
  // Validate phone
  if (!userData.profile || !userData.profile.phone || !validateSaudiPhone(userData.profile.phone)) {
    errors.push('Valid Saudi phone number is required (+966XXXXXXXXX)');
  }
  
  // Validate password
  if (userData.password) {
    const passwordValidation = validatePasswordStrength(userData.password);
    if (!passwordValidation.isValid) {
      errors.push(passwordValidation.message);
    }
  }
  
  // Validate profile
  if (userData.profile) {
    if (!userData.profile.firstName) {
      errors.push('First name is required');
    }
    if (!userData.profile.lastName) {
      errors.push('Last name is required');
    }
    if (!userData.profile.dateOfBirth) {
      errors.push('Date of birth is required');
    } else {
      const ageValidation = validateAge(userData.profile.dateOfBirth, 13, 120);
      if (!ageValidation.isValid) {
        errors.push(ageValidation.message);
      }
    }
    if (!userData.profile.gender || !['male', 'female'].includes(userData.profile.gender)) {
      errors.push('Gender must be male or female');
    }
  }
  
  // Validate location
  if (userData.location) {
    if (!userData.location.city) {
      errors.push('City is required');
    }
    if (userData.location.coordinates) {
      const coords = userData.location.coordinates.coordinates;
      if (!validateCoordinates(coords[0], coords[1])) {
        errors.push('Invalid coordinates');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

/**
 * Custom Mongoose validators
 */
const customValidators = {
  saudiPhone: {
    validator: validateSaudiPhone,
    message: 'Please enter a valid Saudi phone number (+966XXXXXXXXX)'
  },
  saudiNationalId: {
    validator: validateSaudiNationalId,
    message: 'Please enter a valid Saudi national ID'
  },
  email: {
    validator: validateEmail,
    message: 'Please enter a valid email address'
  },
  coordinates: {
    validator: function(coords) {
      return validateCoordinates(coords[0], coords[1]);
    },
    message: 'Invalid coordinates format'
  },
  saudiCoordinates: {
    validator: function(coords) {
      return validateSaudiCoordinates(coords[0], coords[1]);
    },
    message: 'Coordinates must be within Saudi Arabia'
  },
  arabicText: {
    validator: validateArabicText,
    message: 'Text must contain Arabic characters'
  },
  mixedLanguageText: {
    validator: validateMixedLanguageText,
    message: 'Text can only contain Arabic, English, numbers, and basic punctuation'
  },
  url: {
    validator: validateUrl,
    message: 'Please enter a valid URL'
  }
};

module.exports = {
  ValidationError,
  validateSaudiPhone,
  validateSaudiNationalId,
  validateEmail,
  validatePasswordStrength,
  validateCoordinates,
  validateSaudiCoordinates,
  validateArabicText,
  validateMixedLanguageText,
  validateUrl,
  validateDate,
  validateAge,
  validatePrice,
  validateCapacity,
  validateTimeSlot,
  validateBooking,
  validateActivity,
  validateUser,
  customValidators
};

