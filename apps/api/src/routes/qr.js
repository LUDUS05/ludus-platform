const express = require('express');
const router = express.Router();
const {
  generateQRCode,
  downloadQRCode
} = require('../controllers/qrController');

// Handle CORS preflight requests
router.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.status(200).end();
});

// @route   GET /api/qr/:referralCode
// @desc    Generate QR code for referral link
// @access  Public
router.get('/:referralCode', generateQRCode);

// @route   GET /api/qr/:referralCode/download
// @desc    Download QR code as file
// @access  Public
router.get('/:referralCode/download', downloadQRCode);

module.exports = router;
