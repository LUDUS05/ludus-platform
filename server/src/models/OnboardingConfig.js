const mongoose = require('mongoose');

const onboardingConfigSchema = new mongoose.Schema({
  // Global onboarding settings
  isEnabled: {
    type: Boolean,
    default: true
  },
  
  // Step configuration
  steps: [{
    stepId: {
      type: String,
      required: true,
      enum: ['welcome', 'auth', 'profile', 'referral', 'interests', 'preferences']
    },
    isEnabled: {
      type: Boolean,
      default: true
    },
    isRequired: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      required: true
    },
    // Step-specific configuration
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],

  // Welcome step configuration
  welcomeConfig: {
    title: {
      en: { type: String, default: 'Welcome to LUDUS' },
      ar: { type: String, default: 'مرحباً بك في لودوس' }
    },
    subtitle: {
      en: { type: String, default: 'Discover amazing activities and connect with like-minded people' },
      ar: { type: String, default: 'اكتشف أنشطة رائعة وتواصل مع أشخاص متشابهين في التفكير' }
    },
    valuePropositions: [{
      icon: { type: String, required: true },
      title: {
        en: { type: String, required: true },
        ar: { type: String, required: true }
      },
      description: {
        en: { type: String, required: true },
        ar: { type: String, required: true }
      }
    }],
    backgroundAnimation: {
      type: String,
      enum: ['particles', 'gradient', 'none'],
      default: 'gradient'
    }
  },

  // Authentication step configuration
  authConfig: {
    allowGoogleAuth: {
      type: Boolean,
      default: true
    },
    allowEmailAuth: {
      type: Boolean,
      default: true
    },
    requireEmailVerification: {
      type: Boolean,
      default: false
    },
    socialProof: {
      en: { type: String, default: 'Join 10,000+ users discovering activities' },
      ar: { type: String, default: 'انضم إلى أكثر من 10,000 مستخدم يكتشفون الأنشطة' }
    }
  },

  // Profile step configuration
  profileConfig: {
    fields: [{
      fieldId: {
        type: String,
        required: true,
        enum: ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth']
      },
      isEnabled: {
        type: Boolean,
        default: true
      },
      isRequired: {
        type: Boolean,
        default: true
      },
      order: {
        type: Number,
        required: true
      },
      label: {
        en: { type: String, required: true },
        ar: { type: String, required: true }
      },
      placeholder: {
        en: { type: String, required: true },
        ar: { type: String, required: true }
      },
      validation: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      }
    }]
  },

  // Referral step configuration
  referralConfig: {
    isEnabled: {
      type: Boolean,
      default: true
    },
    isRequired: {
      type: Boolean,
      default: false
    },
    title: {
      en: { type: String, default: 'Invite Friends & Earn Rewards!' },
      ar: { type: String, default: 'ادع الأصدقاء واكسب المكافآت!' }
    },
    description: {
      en: { type: String, default: 'Share your referral code and earn rewards when friends join' },
      ar: { type: String, default: 'شارك رمز الإحالة الخاص بك واكسب المكافآت عند انضمام الأصدقاء' }
    },
    sharingOptions: [{
      platform: {
        type: String,
        enum: ['whatsapp', 'twitter', 'instagram', 'copy'],
        required: true
      },
      isEnabled: {
        type: Boolean,
        default: true
      }
    }]
  },

  // Interests step configuration
  interestsConfig: {
    categories: [{
      categoryId: {
        type: String,
        required: true
      },
      name: {
        en: { type: String, required: true },
        ar: { type: String, required: true }
      },
      icon: {
        type: String,
        required: true
      },
      color: {
        type: String,
        default: '#6366f1'
      },
      isEnabled: {
        type: Boolean,
        default: true
      },
      order: {
        type: Number,
        required: true
      }
    }],
    minSelections: {
      type: Number,
      default: 3
    },
    maxSelections: {
      type: Number,
      default: 12
    },
    title: {
      en: { type: String, default: 'What activities interest you?' },
      ar: { type: String, default: 'ما الأنشطة التي تهمك؟' }
    }
  },

  // Preferences step configuration
  preferencesConfig: {
    preferences: [{
      preferenceId: {
        type: String,
        required: true,
        enum: ['language', 'theme', 'locationSharing', 'emailNotifications', 'pushNotifications', 'profileVisibility']
      },
      isEnabled: {
        type: Boolean,
        default: true
      },
      isRequired: {
        type: Boolean,
        default: false
      },
      order: {
        type: Number,
        required: true
      },
      label: {
        en: { type: String, required: true },
        ar: { type: String, required: true }
      },
      description: {
        en: { type: String, required: true },
        ar: { type: String, required: true }
      },
      defaultValue: {
        type: mongoose.Schema.Types.Mixed,
        default: null
      },
      options: [{
        value: { type: String, required: true },
        label: {
          en: { type: String, required: true },
          ar: { type: String, required: true }
        }
      }]
    }],
    title: {
      en: { type: String, default: "Let's personalize your experience" },
      ar: { type: String, default: 'دعنا نخصص تجربتك' }
    }
  },

  // Analytics and tracking
  analytics: {
    trackStepCompletion: {
      type: Boolean,
      default: true
    },
    trackDropOffPoints: {
      type: Boolean,
      default: true
    },
    trackTimeToCompletion: {
      type: Boolean,
      default: true
    }
  },

  // Admin metadata
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Ensure only one onboarding config exists
onboardingConfigSchema.statics.getConfig = async function() {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

onboardingConfigSchema.statics.updateConfig = async function(updates, userId) {
  let config = await this.getConfig();
  Object.assign(config, updates, { 
    lastUpdatedBy: userId,
    version: config.version + 1
  });
  return await config.save();
};

module.exports = mongoose.model('OnboardingConfig', onboardingConfigSchema);
