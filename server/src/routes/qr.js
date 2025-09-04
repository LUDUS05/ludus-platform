const express = require('express');
const router = express.Router();
const {
  generateQRCode,
  downloadQRCode
} = require('../controllers/qrController');

// @route   GET /api/qr/:referralCode
// @desc    Generate QR code for referral link
// @access  Public
router.get('/:referralCode', generateQRCode);

// @route   GET /api/qr/:referralCode/download
// @desc    Download QR code as file
// @access  Public
router.get('/:referralCode/download', downloadQRCode);

module.exports = router;
