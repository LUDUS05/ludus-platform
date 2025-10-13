/**
 * Create Menu Pages Script
 * Creates sample pages for header and footer navigation
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Page Schema (simplified version)
const pageSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  slug: { type: String, required: true, unique: true },
  content: [{
    type: { type: String, enum: ['paragraph', 'heading', 'image', 'video', 'quote', 'code', 'list', 'divider', 'button', 'embed'], required: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true }
  }],
  template: { type: String, default: 'basic' },
  status: { type: String, enum: ['published', 'draft', 'scheduled', 'archived'], default: 'published' },
  placement: { type: String, enum: ['header', 'footer', 'sidebar', 'none', 'both'], default: 'none' },
  showInNavigation: { type: Boolean, default: false },
  navigationOrder: { type: Number, default: 0 },
  seo: {
    title: { en: String, ar: String },
    description: { en: String, ar: String },
    keywords: { en: [String], ar: [String] }
  },
  settings: mongoose.Schema.Types.Mixed,
  categories: [String],
  tags: [String],
  isFeatured: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Page = mongoose.model('Page', pageSchema);

// Sample pages to create
const pages = [
  {
    title: {
      en: 'About Us',
      ar: 'من نحن'
    },
    slug: 'about-us',
    content: [{
      type: 'heading',
      data: {
        text: { en: 'About LUDUS', ar: 'حول لودس' },
        level: 1
      }
    }, {
      type: 'paragraph',
      data: {
        text: {
          en: 'LUDUS connects people with amazing local experiences and activities. We believe that life is meant to be lived to the fullest, and we\'re here to help you discover and book incredible adventures in your city.',
          ar: 'لودس يربط الناس بتجارب وأنشطة محلية مذهلة. نؤمن أن الحياة يجب أن تُعاش بأقصى ما يمكن، ونحن هنا لمساعدتك في اكتشاف وحجز مغامرات لا تصدق في مدينتك.'
        }
      }
    }],
    placement: 'header',
    showInNavigation: true,
    navigationOrder: 1,
    seo: {
      title: {
        en: 'About LUDUS - Discover Local Experiences',
        ar: 'حول لودس - اكتشف التجارب المحلية'
      },
      description: {
        en: 'Learn about LUDUS and our mission to connect you with amazing local experiences.',
        ar: 'تعرف على لودس ومهمتنا في ربطك بالتجارب المحلية المذهلة.'
      }
    }
  },
  {
    title: {
      en: 'Contact Us',
      ar: 'اتصل بنا'
    },
    slug: 'contact-us',
    content: [{
      type: 'heading',
      data: {
        text: { en: 'Contact Us', ar: 'اتصل بنا' },
        level: 1
      }
    }, {
      type: 'paragraph',
      data: {
        text: {
          en: 'We\'d love to hear from you! Get in touch with us through any of the following ways.',
          ar: 'نود أن نسمع منك! تواصل معنا من خلال أي من الطرق التالية.'
        }
      }
    }],
    placement: 'footer',
    showInNavigation: true,
    navigationOrder: 1,
    seo: {
      title: {
        en: 'Contact LUDUS - Get in Touch',
        ar: 'اتصل بلودس - تواصل معنا'
      },
      description: {
        en: 'Get in touch with LUDUS. Contact information and business hours.',
        ar: 'تواصل مع لودس. معلومات الاتصال وساعات العمل.'
      }
    }
  },
  {
    title: {
      en: 'Privacy Policy',
      ar: 'سياسة الخصوصية'
    },
    slug: 'privacy-policy',
    content: [{
      type: 'heading',
      data: {
        text: { en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
        level: 1
      }
    }, {
      type: 'paragraph',
      data: {
        text: {
          en: 'Learn about how LUDUS protects your privacy and handles your personal information.',
          ar: 'تعرف على كيفية حماية لودس لخصوصيتك والتعامل مع معلوماتك الشخصية.'
        }
      }
    }],
    placement: 'footer',
    showInNavigation: true,
    navigationOrder: 2,
    seo: {
      title: {
        en: 'Privacy Policy - LUDUS Platform',
        ar: 'سياسة الخصوصية - منصة لودس'
      },
      description: {
        en: 'Learn about how LUDUS protects your privacy and handles your personal information.',
        ar: 'تعرف على كيفية حماية لودس لخصوصيتك والتعامل مع معلوماتك الشخصية.'
      }
    }
  },
  {
    title: {
      en: 'Terms of Service',
      ar: 'شروط الخدمة'
    },
    slug: 'terms-of-service',
    content: [{
      type: 'heading',
      data: {
        text: { en: 'Terms of Service', ar: 'شروط الخدمة' },
        level: 1
      }
    }, {
      type: 'paragraph',
      data: {
        text: {
          en: 'Read the terms and conditions for using the LUDUS platform.',
          ar: 'اقرأ الشروط والأحكام لاستخدام منصة لودس.'
        }
      }
    }],
    placement: 'footer',
    showInNavigation: true,
    navigationOrder: 3,
    seo: {
      title: {
        en: 'Terms of Service - LUDUS Platform',
        ar: 'شروط الخدمة - منصة لودس'
      },
      description: {
        en: 'Read the terms and conditions for using the LUDUS platform.',
        ar: 'اقرأ الشروط والأحكام لاستخدام منصة لودس.'
      }
    }
  },
  {
    title: {
      en: 'Help Center',
      ar: 'مركز المساعدة'
    },
    slug: 'help-center',
    content: [{
      type: 'heading',
      data: {
        text: { en: 'Help Center', ar: 'مركز المساعدة' },
        level: 1
      }
    }, {
      type: 'paragraph',
      data: {
        text: {
          en: 'Find answers to common questions and get help with using the LUDUS platform.',
          ar: 'ابحث عن إجابات للأسئلة الشائعة واحصل على مساعدة في استخدام منصة لودس.'
        }
      }
    }],
    placement: 'footer',
    showInNavigation: true,
    navigationOrder: 4,
    seo: {
      title: {
        en: 'Help Center - LUDUS Support',
        ar: 'مركز المساعدة - دعم لودس'
      },
      description: {
        en: 'Find answers to common questions and get help with using the LUDUS platform.',
        ar: 'ابحث عن إجابات للأسئلة الشائعة واحصل على مساعدة في استخدام منصة لودس.'
      }
    }
  }
];

const createMenuPages = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ludus';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing pages with the same slugs
    const slugs = pages.map(page => page.slug);
    await Page.deleteMany({ slug: { $in: slugs } });
    console.log('🧹 Cleared existing pages with same slugs');

    // Create new pages
    const createdPages = [];
    for (const pageData of pages) {
      const page = new Page(pageData);
      await page.save();
      createdPages.push(page);
      console.log(`✅ Created page: ${pageData.title.en} (${pageData.slug}) - Placement: ${pageData.placement}`);
    }

    console.log(`\n🎉 Successfully created ${createdPages.length} menu pages!`);
    
    // Verify the pages were created
    const headerPages = await Page.find({ placement: 'header' });
    const footerPages = await Page.find({ placement: 'footer' });
    
    console.log(`\n📊 Summary:`);
    console.log(`   Header pages: ${headerPages.length}`);
    console.log(`   Footer pages: ${footerPages.length}`);
    
    // Test the API endpoints
    console.log(`\n🔗 Test these endpoints:`);
    console.log(`   GET /api/pages/menu/header`);
    console.log(`   GET /api/pages/menu/footer`);

  } catch (error) {
    console.error('❌ Error creating menu pages:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the script
createMenuPages();
