const mongoose = require('mongoose');
const Page = require('../models/Page');
const User = require('../models/User');

const seedPages = async () => {
  try {
    // Get an admin user for the createdBy field
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found, skipping page seeding');
      return;
    }

    // Check if pages already exist
    const existingPages = await Page.countDocuments();
    if (existingPages > 0) {
      console.log('Pages already exist, skipping page seeding');
      return;
    }

    const defaultPages = [
      {
        title: {
          en: 'Privacy Policy',
          ar: 'سياسة الخصوصية'
        },
        slug: 'privacy-policy',
        content: [
          {
            id: 'privacy-1',
            type: 'heading',
            content: {
              en: 'Privacy Policy',
              ar: 'سياسة الخصوصية'
            },
            data: { level: 1 },
            order: 0
          },
          {
            id: 'privacy-2',
            type: 'paragraph',
            content: {
              en: `Last updated: ${new Date().toDateString()}`,
              ar: `آخر تحديث: ${new Date().toLocaleDateString('ar-SA')}`
            },
            order: 1
          },
          {
            id: 'privacy-3',
            type: 'heading',
            content: {
              en: 'Information We Collect',
              ar: 'المعلومات التي نجمعها'
            },
            data: { level: 2 },
            order: 2
          },
          {
            id: 'privacy-4',
            type: 'paragraph',
            content: {
              en: 'We collect information you provide directly to us, such as when you create an account, make a booking, or contact us for support.',
              ar: 'نحن نجمع المعلومات التي تقدمها لنا مباشرة، مثل عند إنشاء حساب، أو القيام بحجز، أو الاتصال بنا للحصول على الدعم.'
            },
            order: 3
          },
          {
            id: 'privacy-5',
            type: 'heading',
            content: {
              en: 'How We Use Your Information',
              ar: 'كيف نستخدم معلوماتك'
            },
            data: { level: 2 },
            order: 4
          },
          {
            id: 'privacy-6',
            type: 'paragraph',
            content: {
              en: 'We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.',
              ar: 'نحن نستخدم المعلومات التي نجمعها لتقديم وصيانة وتحسين خدماتنا، ومعالجة المعاملات، والتواصل معك.'
            },
            order: 5
          }
        ],
        template: 'basic',
        status: 'published',
        placement: 'footer',
        showInNavigation: true,
        navigationOrder: 1,
        isSystem: true,
        seo: {
          description: {
            en: 'Learn about how LUDUS protects your privacy and handles your personal information.',
            ar: 'تعرف على كيفية حماية LUDUS لخصوصيتك والتعامل مع معلوماتك الشخصية.'
          }
        },
        createdBy: adminUser._id
      },
      {
        title: {
          en: 'Terms of Service',
          ar: 'شروط الخدمة'
        },
        slug: 'terms-of-service',
        content: [
          {
            id: 'terms-1',
            type: 'heading',
            content: {
              en: 'Terms of Service',
              ar: 'شروط الخدمة'
            },
            data: { level: 1 },
            order: 0
          },
          {
            id: 'terms-2',
            type: 'paragraph',
            content: {
              en: `Last updated: ${new Date().toDateString()}`,
              ar: `آخر تحديث: ${new Date().toLocaleDateString('ar-SA')}`
            },
            order: 1
          },
          {
            id: 'terms-3',
            type: 'heading',
            content: {
              en: 'Acceptance of Terms',
              ar: 'قبول الشروط'
            },
            data: { level: 2 },
            order: 2
          },
          {
            id: 'terms-4',
            type: 'paragraph',
            content: {
              en: 'By accessing and using the LUDUS platform, you accept and agree to be bound by the terms and provision of this agreement.',
              ar: 'من خلال الوصول إلى منصة LUDUS واستخدامها، فإنك تقبل وتوافق على الالتزام بشروط وأحكام هذه الاتفاقية.'
            },
            order: 3
          },
          {
            id: 'terms-5',
            type: 'heading',
            content: {
              en: 'Use License',
              ar: 'ترخيص الاستخدام'
            },
            data: { level: 2 },
            order: 4
          },
          {
            id: 'terms-6',
            type: 'paragraph',
            content: {
              en: 'Permission is granted to temporarily use the LUDUS platform for personal, non-commercial transitory viewing only.',
              ar: 'يُمنح الإذن لاستخدام منصة LUDUS مؤقتاً للمشاهدة الشخصية وغير التجارية المؤقتة فقط.'
            },
            order: 5
          }
        ],
        template: 'basic',
        status: 'published',
        placement: 'footer',
        showInNavigation: true,
        navigationOrder: 2,
        isSystem: true,
        seo: {
          description: {
            en: 'Read the terms and conditions for using the LUDUS platform.',
            ar: 'اقرأ الشروط والأحكام لاستخدام منصة LUDUS.'
          }
        },
        createdBy: adminUser._id
      },
      {
        title: {
          en: 'About Us',
          ar: 'عنا'
        },
        slug: 'about-us',
        content: [
          {
            id: 'about-1',
            type: 'heading',
            content: {
              en: 'About LUDUS',
              ar: 'عن LUDUS'
            },
            data: { level: 1 },
            order: 0
          },
          {
            id: 'about-2',
            type: 'heading',
            content: {
              en: 'Our Mission',
              ar: 'مهمتنا'
            },
            data: { level: 2 },
            order: 1
          },
          {
            id: 'about-3',
            type: 'paragraph',
            content: {
              en: 'LUDUS connects people with amazing local experiences and activities. We believe that life is meant to be lived to the fullest, and we\'re here to help you discover and book incredible adventures in your city.',
              ar: 'تربط LUDUS الأشخاص بالتجارب والأنشطة المحلية المذهلة. نحن نؤمن أن الحياة يجب أن تُعاش على أكمل وجه، ونحن هنا لمساعدتك في اكتشاف وحجز المغامرات الرائعة في مدينتك.'
            },
            order: 2
          },
          {
            id: 'about-4',
            type: 'heading',
            content: {
              en: 'What We Do',
              ar: 'ما نفعله'
            },
            data: { level: 2 },
            order: 3
          },
          {
            id: 'about-5',
            type: 'paragraph',
            content: {
              en: 'We partner with local vendors and activity providers to offer you a curated selection of experiences, from fitness classes and workshops to outdoor adventures and cultural events.',
              ar: 'نتشارك مع البائعين المحليين ومقدمي الأنشطة لنقدم لك مجموعة منتقاة من التجارب، من دروس اللياقة البدنية وورش العمل إلى المغامرات الخارجية والفعاليات الثقافية.'
            },
            order: 4
          }
        ],
        template: 'about',
        status: 'published',
        placement: 'header',
        showInNavigation: true,
        navigationOrder: 1,
        isSystem: false,
        seo: {
          description: {
            en: 'Learn about LUDUS and our mission to connect you with amazing local experiences.',
            ar: 'تعرف على LUDUS ومهمتنا لربطك بالتجارب المحلية المذهلة.'
          }
        },
        createdBy: adminUser._id
      },
      {
        title: {
          en: 'Contact Us',
          ar: 'اتصل بنا'
        },
        slug: 'contact',
        content: [
          {
            id: 'contact-1',
            type: 'heading',
            content: {
              en: 'Contact Us',
              ar: 'اتصل بنا'
            },
            data: { level: 1 },
            order: 0
          },
          {
            id: 'contact-2',
            type: 'paragraph',
            content: {
              en: 'We\'d love to hear from you! Get in touch with us through any of the following ways:',
              ar: 'نحب أن نسمع منك! تواصل معنا من خلال أي من الطرق التالية:'
            },
            order: 1
          },
          {
            id: 'contact-3',
            type: 'heading',
            content: {
              en: 'Email',
              ar: 'البريد الإلكتروني'
            },
            data: { level: 2 },
            order: 2
          },
          {
            id: 'contact-4',
            type: 'paragraph',
            content: {
              en: 'For general inquiries: hi@letsludus.com',
              ar: 'للاستفسارات العامة: hi@letsludus.com'
            },
            order: 3
          },
          {
            id: 'contact-5',
            type: 'heading',
            content: {
              en: 'Business Hours',
              ar: 'ساعات العمل'
            },
            data: { level: 2 },
            order: 4
          },
          {
            id: 'contact-6',
            type: 'paragraph',
            content: {
              en: 'Sunday - Thursday: 9:00 AM - 6:00 PM (Riyadh Time)',
              ar: 'الأحد - الخميس: 9:00 صباحاً - 6:00 مساءً (توقيت الرياض)'
            },
            order: 5
          }
        ],
        template: 'contact',
        status: 'published',
        placement: 'footer',
        showInNavigation: true,
        navigationOrder: 3,
        isSystem: false,
        seo: {
          description: {
            en: 'Get in touch with LUDUS. Contact information and business hours.',
            ar: 'تواصل مع LUDUS. معلومات الاتصال وساعات العمل.'
          }
        },
        createdBy: adminUser._id
      },
      {
        title: {
          en: 'Partner Terms and Conditions',
          ar: 'شروط وأحكام الشركاء'
        },
        slug: 'partner-terms-and-conditions',
        content: [
          {
            id: 'partner-terms-1',
            type: 'heading',
            content: {
              en: 'Partner Terms and Conditions',
              ar: 'شروط وأحكام الشركاء'
            },
            data: { level: 1 },
            order: 0
          },
          {
            id: 'partner-terms-2',
            type: 'paragraph',
            content: {
              en: `Last updated: ${new Date().toDateString()}`,
              ar: `آخر تحديث: ${new Date().toLocaleDateString('ar-SA')}`
            },
            order: 1
          },
          {
            id: 'partner-terms-3',
            type: 'heading',
            content: {
              en: 'Partnership Agreement',
              ar: 'اتفاقية الشراكة'
            },
            data: { level: 2 },
            order: 2
          },
          {
            id: 'partner-terms-4',
            type: 'paragraph',
            content: {
              en: 'By registering as a partner with LUDUS, you agree to provide high-quality activities and experiences to our users. You will receive fair compensation for your services and access to our platform\'s marketing tools.',
              ar: 'من خلال التسجيل كشريك مع LUDUS، فإنك توافق على تقديم أنشطة وتجارب عالية الجودة لمستخدمينا. ستحصل على تعويض عادل لخدماتك والوصول إلى أدوات التسويق في منصتنا.'
            },
            order: 3
          },
          {
            id: 'partner-terms-5',
            type: 'heading',
            content: {
              en: 'Quality Standards',
              ar: 'معايير الجودة'
            },
            data: { level: 2 },
            order: 4
          },
          {
            id: 'partner-terms-6',
            type: 'paragraph',
            content: {
              en: 'All partners must maintain high standards of service delivery, safety, and customer satisfaction. We reserve the right to review and approve all activities before they are listed on our platform.',
              ar: 'يجب على جميع الشركاء الحفاظ على معايير عالية لتقديم الخدمة والسلامة ورضا العملاء. نحتفظ بالحق في مراجعة والموافقة على جميع الأنشطة قبل إدراجها في منصتنا.'
            },
            order: 5
          },
          {
            id: 'partner-terms-7',
            type: 'heading',
            content: {
              en: 'Payment Terms',
              ar: 'شروط الدفع'
            },
            data: { level: 2 },
            order: 6
          },
          {
            id: 'partner-terms-8',
            type: 'paragraph',
            content: {
              en: 'Payments will be processed within 7-14 business days after successful completion of activities. We use secure payment processing to ensure timely and accurate payments to all partners.',
              ar: 'سيتم معالجة المدفوعات خلال 7-14 يوم عمل بعد إكمال الأنشطة بنجاح. نستخدم معالجة دفع آمنة لضمان المدفوعات في الوقت المناسب والدقيقة لجميع الشركاء.'
            },
            order: 7
          },
          {
            id: 'partner-terms-9',
            type: 'heading',
            content: {
              en: 'Contact Information',
              ar: 'معلومات الاتصال'
            },
            data: { level: 2 },
            order: 8
          },
          {
            id: 'partner-terms-10',
            type: 'paragraph',
            content: {
              en: 'For questions about these terms or partnership opportunities, please contact us at partners@letsludus.com',
              ar: 'للأسئلة حول هذه الشروط أو فرص الشراكة، يرجى الاتصال بنا على partners@letsludus.com'
            },
            order: 9
          }
        ],
        template: 'basic',
        status: 'published',
        placement: 'none',
        showInNavigation: false,
        navigationOrder: 0,
        isSystem: true,
        seo: {
          description: {
            en: 'Terms and conditions for LUDUS partners and activity providers.',
            ar: 'شروط وأحكام شركاء LUDUS ومقدمي الأنشطة.'
          }
        },
        createdBy: adminUser._id
      }
    ];

    await Page.insertMany(defaultPages);
    console.log('✅ Default pages seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding pages:', error);
    throw error;
  }
};

module.exports = seedPages;