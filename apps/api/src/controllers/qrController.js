/**
 * @fileoverview Controller for generating QR codes.
 * @module controllers/qrController
 */

const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs').promises;

/**
 * Generate a QR code for a referral link.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const generateQRCode = async (req, res) => {
  try {
    const { referralCode } = req.params;
    const { size = 200, format = 'png' } = req.query;
    
    if (!referralCode) {
      return res.status(400).json({
        success: false,
        message: 'Referral code is required'
      });
    }

    // Generate referral link
    const baseUrl = process.env.FRONTEND_URL || 'https://ludus-frontend-og2d.onrender.com';
    const referralLink = `${baseUrl}/register?ref=${referralCode}`;
    
    let qrCodeData;
    
    if (format === 'svg') {
      // Generate SVG QR code
      qrCodeData = await QRCode.toString(referralLink, {
        type: 'svg',
        width: parseInt(size),
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Content-Disposition', `inline; filename="referral-qr-${referralCode}.svg"`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.send(qrCodeData);
    } else {
      // Generate PNG QR code
      qrCodeData = await QRCode.toBuffer(referralLink, {
        type: 'png',
        width: parseInt(size),
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `inline; filename="referral-qr-${referralCode}.png"`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.send(qrCodeData);
    }
    
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
      error: error.message
    });
  }
};

/**
 * Download a QR code as a file.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const downloadQRCode = async (req, res) => {
  try {
    const { referralCode } = req.params;
    const { size = 200, format = 'png' } = req.query;
    
    if (!referralCode) {
      return res.status(400).json({
        success: false,
        message: 'Referral code is required'
      });
    }

    // Generate referral link
    const baseUrl = process.env.FRONTEND_URL || 'https://ludus-frontend-og2d.onrender.com';
    const referralLink = `${baseUrl}/register?ref=${referralCode}`;
    
    let qrCodeData;
    let contentType;
    let filename;
    
    if (format === 'svg') {
      qrCodeData = await QRCode.toString(referralLink, {
        type: 'svg',
        width: parseInt(size),
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      contentType = 'image/svg+xml';
      filename = `referral-qr-${referralCode}.svg`;
    } else {
      qrCodeData = await QRCode.toBuffer(referralLink, {
        type: 'png',
        width: parseInt(size),
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      contentType = 'image/png';
      filename = `referral-qr-${referralCode}.png`;
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.send(qrCodeData);
    
  } catch (error) {
    console.error('Error downloading QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download QR code',
      error: error.message
    });
  }
};

module.exports = {
  generateQRCode,
  downloadQRCode
};
