const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  // DISABLED: Lockdown system fields removed
  // comingSoonMode, maintenanceMode, comingSoonTitle, comingSoonMessage,
  // maintenanceTitle, maintenanceMessage, estimatedReturnTime, allowedPaths
  // Wallet controls
  walletControls: {
    addFundsEnabled: {
      type: Boolean,
      default: true
    },
    withdrawFundsEnabled: {
      type: Boolean,
      default: true
    }
  },
  // Payment method controls
  paymentMethodControls: {
    creditCardEnabled: {
      type: Boolean,
      default: true
    },
    madaEnabled: {
      type: Boolean,
      default: true
    },
    applePayEnabled: {
      type: Boolean,
      default: true
    },
    stcPayEnabled: {
      type: Boolean,
      default: true
    },
    sadadEnabled: {
      type: Boolean,
      default: true
    }
  },
  // Feature controls
  featureControls: {
    bookingEnabled: {
      type: Boolean,
      default: true
    },
    walletEnabled: {
      type: Boolean,
      default: true
    },
    reviewsEnabled: {
      type: Boolean,
      default: true
    },
    notificationsEnabled: {
      type: Boolean,
      default: true
    },
    onboardingEnabled: {
      type: Boolean,
      default: true
    }
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
siteSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

siteSettingsSchema.statics.updateSettings = async function(updates, userId) {
  let settings = await this.getSettings();
  Object.assign(settings, updates, { lastUpdatedBy: userId });
  return await settings.save();
};

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
