const SiteSettings = require('../models/SiteSettings');
const { validationResult } = require('express-validator');

// Get site settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Failed to get site settings' });
  }
};

// Update site settings (Admin only)
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

// Toggle coming soon mode
exports.toggleComingSoon = async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();
    settings.comingSoonMode = !settings.comingSoonMode;
    settings.lastUpdatedBy = req.user.id;
    await settings.save();

    res.json({ 
      message: `Coming soon mode ${settings.comingSoonMode ? 'enabled' : 'disabled'}`,
      comingSoonMode: settings.comingSoonMode 
    });
  } catch (error) {
    console.error('Toggle coming soon error:', error);
    res.status(500).json({ message: 'Failed to toggle coming soon mode' });
  }
};

// Toggle maintenance mode
exports.toggleMaintenance = async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();
    settings.maintenanceMode = !settings.maintenanceMode;
    settings.lastUpdatedBy = req.user.id;
    await settings.save();

    res.json({ 
      message: `Maintenance mode ${settings.maintenanceMode ? 'enabled' : 'disabled'}`,
      maintenanceMode: settings.maintenanceMode 
    });
  } catch (error) {
    console.error('Toggle maintenance error:', error);
    res.status(500).json({ message: 'Failed to toggle maintenance mode' });
  }
};