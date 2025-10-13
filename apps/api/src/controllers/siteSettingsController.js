/**
 * @fileoverview Controller for handling site settings.
 * @module controllers/siteSettingsController
 */

const SiteSettings = require('../models/SiteSettings');
const { validationResult } = require('express-validator');

/**
 * Get the current site settings.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
exports.getSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Failed to get site settings' });
  }
};

/**
 * Update the site settings (admin only).
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
exports.updateSettings = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const updates = req.body;
    const userId = req.user.id;

    const settings = await SiteSettings.updateSettings(updates, userId);

    res.json({
      message: 'Site settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Failed to update site settings' });
  }
};

/**
 * DISABLED: Toggle the "coming soon" mode for the site.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
exports.toggleComingSoon = async (req, res) => {
  res.status(410).json({
    message: 'Coming soon mode is disabled',
    error: 'LOCKDOWN_SYSTEM_DISABLED'
  });
};

/**
 * DISABLED: Toggle the maintenance mode for the site.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
exports.toggleMaintenance = async (req, res) => {
  res.status(410).json({
    message: 'Maintenance mode is disabled',
    error: 'LOCKDOWN_SYSTEM_DISABLED'
  });
};
