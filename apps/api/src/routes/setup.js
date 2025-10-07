/**
 * Setup Routes
 * Routes for initial setup and sample data creation
 */

const express = require('express');
const router = express.Router();
const Page = require('../models/Page');

// Create sample menu pages endpoint
router.post('/create-sample-menu-pages', async (req, res) => {
  try {
    console.log('🚀 Creating sample menu pages via API...');
    
    // Sample pages to create
    const samplePages = [
      {
        title: {
          en: 'About Us',
          ar: 'من نحن'
        },
        slug: 'about-us',
        content: [{
          id: 'about-1',
          type: 'heading',
          content: {
            en: 'About LUDUS',
            ar: 'حول لودس'
          },
          data: { level: 1 },
          order: 0
        }, {
          id: 'about-2',
          type: 'paragraph',
          content: {
            en: 'LUDUS connects people with amazing local experiences and activities. We believe that life is meant to be lived to the fullest, and we\'re here to help you discover and book incredible adventures in your city.',
            ar: 'لودس يربط الناس بتجارب وأنشطة محلية مذهلة. نؤمن أن الحياة يجب أن تُعاش بأقصى ما يمكن، ونحن هنا لمساعدتك في اكتشاف وحجز مغامرات لا تصدق في مدينتك.'
          },
          order: 1
        }],
        placement: 'header',
        showInNavigation: true,
        navigationOrder: 1,
        status: 'published',
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
          id: 'contact-1',
          type: 'heading',
          content: {
            en: 'Contact Us',
            ar: 'اتصل بنا'
          },
          data: { level: 1 },
          order: 0
        }, {
          id: 'contact-2',
          type: 'paragraph',
          content: {
            en: 'We\'d love to hear from you! Get in touch with us through any of the following ways.',
            ar: 'نود أن نسمع منك! تواصل معنا من خلال أي من الطرق التالية.'
          },
          order: 1
        }],
        placement: 'footer',
        showInNavigation: true,
        navigationOrder: 1,
        status: 'published',
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
          id: 'privacy-1',
          type: 'heading',
          content: {
            en: 'Privacy Policy',
            ar: 'سياسة الخصوصية'
          },
          data: { level: 1 },
          order: 0
        }, {
          id: 'privacy-2',
          type: 'paragraph',
          content: {
            en: 'Learn about how LUDUS protects your privacy and handles your personal information.',
            ar: 'تعرف على كيفية حماية لودس لخصوصيتك والتعامل مع معلوماتك الشخصية.'
          },
          order: 1
        }],
        placement: 'footer',
        showInNavigation: true,
        navigationOrder: 2,
        status: 'published',
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
          id: 'terms-1',
          type: 'heading',
          content: {
            en: 'Terms of Service',
            ar: 'شروط الخدمة'
          },
          data: { level: 1 },
          order: 0
        }, {
          id: 'terms-2',
          type: 'paragraph',
          content: {
            en: 'Read the terms and conditions for using the LUDUS platform.',
            ar: 'اقرأ الشروط والأحكام لاستخدام منصة لودس.'
          },
          order: 1
        }],
        placement: 'footer',
        showInNavigation: true,
        navigationOrder: 3,
        status: 'published',
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
      }
    ];

    // Clear existing pages with the same slugs
    const slugs = samplePages.map(page => page.slug);
    await Page.deleteMany({ slug: { $in: slugs } });
    console.log('🧹 Cleared existing pages with same slugs');

    // Create new pages
    const createdPages = [];
    for (const pageData of samplePages) {
      const page = new Page(pageData);
      await page.save();
      createdPages.push(page);
      console.log(`✅ Created page: ${pageData.title.en} (${pageData.slug}) - Placement: ${pageData.placement}`);
    }

    // Verify the pages were created
    const headerPages = await Page.find({ placement: 'header' });
    const footerPages = await Page.find({ placement: 'footer' });

    res.json({
      success: true,
      message: `Successfully created ${createdPages.length} sample menu pages!`,
      data: {
        created: createdPages.length,
        headerPages: headerPages.length,
        footerPages: footerPages.length,
        pages: createdPages.map(page => ({
          id: page._id,
          title: page.title,
          slug: page.slug,
          placement: page.placement
        }))
      }
    });

  } catch (error) {
    console.error('❌ Error creating sample menu pages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create sample menu pages',
      error: error.message
    });
  }
});

module.exports = router;
