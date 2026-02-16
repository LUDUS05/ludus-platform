const mongoose = require('mongoose');
const Page = require('../src/models/Page');
const User = require('../src/models/User');
require('dotenv').config();

const seedPartnerTerms = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Get an admin user for the createdBy field
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found, creating partner terms with system user');
    }

    // Check if partner terms page already exists
    const existingPage = await Page.findOne({ slug: 'partner-terms-and-conditions' });
    if (existingPage) {
      console.log('Partner terms page already exists, updating...');
      
      // Update existing page
      existingPage.content = [
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
      ];
      
      await existingPage.save();
      console.log('✅ Partner terms page updated successfully');
    } else {
      // Create new partner terms page
      const partnerTermsPage = new Page({
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
        createdBy: adminUser ? adminUser._id : new mongoose.Types.ObjectId()
      });

      await partnerTermsPage.save();
      console.log('✅ Partner terms page created successfully');
    }

    console.log('✅ Partner terms seeding completed');
  } catch (error) {
    console.error('❌ Error seeding partner terms:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
};

// Run the script
if (require.main === module) {
  seedPartnerTerms()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = seedPartnerTerms;
