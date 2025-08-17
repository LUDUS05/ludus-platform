const express = require('express');
const { body, validationResult } = require('express-validator');
const emailService = require('../services/emailService');

const router = express.Router();

// Contact form validation
const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[\d\s\-\(\)]{8,20}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
  
  body('source')
    .optional()
    .isIn(['contact_form', 'support', 'partnership'])
    .withMessage('Invalid source specified')
];

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContactForm = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, phone, subject, message, source = 'contact_form' } = req.body;

    // Prepare email content
    const emailContent = {
      from: email,
      name: name,
      phone: phone || 'Not provided',
      subject: subject,
      message: message,
      source: source,
      timestamp: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress
    };

    // Send notification email to admin
    try {
      await emailService.sendContactFormNotification(emailContent);
      console.log(`✅ Contact form notification sent for: ${email}`);
    } catch (emailError) {
      console.error('Failed to send contact form notification:', emailError);
      // Don't fail the request if email fails, just log it
    }

    // Send confirmation email to user
    try {
      await emailService.sendContactConfirmation(email, name, subject);
      console.log(`✅ Contact confirmation sent to: ${email}`);
    } catch (emailError) {
      console.error('Failed to send contact confirmation:', emailError);
      // Don't fail the request if email fails
    }

    // Log contact form submission (you can save to database here)
    console.log('Contact form submission:', {
      name,
      email,
      subject,
      source,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
      data: {
        submittedAt: new Date().toISOString(),
        reference: `LUDUS-${Date.now()}` // Simple reference ID
      }
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form. Please try again later.'
    });
  }
};

// Submit contact form
router.post('/', contactValidation, submitContactForm);

// Health check for contact endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Contact service is operational',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;