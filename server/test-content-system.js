const mongoose = require('mongoose');
const Page = require('./src/models/Page');
const User = require('./src/models/User');

// Test the new content management system
async function testContentSystem() {
  try {
    console.log('🧪 Testing Content Management System...\n');

    // Connect to database (use test database)
    await mongoose.connect('mongodb://127.0.0.1:27017/ludus_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to test database\n');

    // Create a test user for page creation
    let testUser = await User.findOne({ email: 'test@admin.com' });
    if (!testUser) {
      testUser = new User({
        firstName: 'Test',
        lastName: 'Admin',
        email: 'test@admin.com',
        password: 'hashedpassword',
        role: 'admin',
        isVerified: true
      });
      await testUser.save();
      console.log('✅ Created test admin user\n');
    } else {
      console.log('✅ Using existing test admin user\n');
    }

    // Test 1: Create a basic page with rich content
    console.log('📝 Test 1: Creating a basic page with rich content...');
    
    const pageData = {
      title: {
        en: 'Welcome to LUDUS Platform',
        ar: 'مرحباً بكم في منصة لودوس'
      },
      slug: 'welcome-to-ludus',
      content: [
        {
          id: 'block-1',
          type: 'heading',
          content: {
            en: 'Welcome to the Future of Activity Discovery',
            ar: 'مرحباً بكم في مستقبل اكتشاف الأنشطة'
          },
          data: { level: 1 },
          settings: {},
          order: 0
        },
        {
          id: 'block-2',
          type: 'paragraph',
          content: {
            en: 'LUDUS Platform connects you with amazing local experiences and activities. Discover, book, and enjoy activities that match your interests and lifestyle.',
            ar: 'تربطكم منصة لودوس بتجارب وأنشطة محلية رائعة. اكتشفوا واحجزوا واستمتعوا بالأنشطة التي تتناسب مع اهتماماتكم ونمط حياتكم.'
          },
          data: {},
          settings: {},
          order: 1
        },
        {
          id: 'block-3',
          type: 'quote',
          content: {
            en: 'Life is either a daring adventure or nothing at all.',
            ar: 'الحياة إما أن تكون مغامرة جريئة أو لا شيء على الإطلاق.'
          },
          data: {
            author: 'Helen Keller',
            source: 'The Open Door'
          },
          settings: {},
          order: 2
        }
      ],
      template: 'landing',
      status: 'published',
      placement: 'header',
      showInNavigation: true,
      navigationOrder: 1,
      seo: {
        title: {
          en: 'Welcome to LUDUS - Discover Amazing Activities',
          ar: 'مرحباً بكم في لودوس - اكتشفوا أنشطة رائعة'
        },
        description: {
          en: 'Join LUDUS Platform and discover amazing local activities that match your interests. Book experiences and connect with your community.',
          ar: 'انضموا إلى منصة لودوس واكتشفوا أنشطة محلية رائعة تتناسب مع اهتماماتكم. احجزوا التجارب وتواصلوا مع مجتمعكم.'
        },
        keywords: {
          en: 'activities, experiences, booking, local, community, LUDUS',
          ar: 'أنشطة, تجارب, حجز, محلي, مجتمع, لودوس'
        }
      },
      settings: {
        allowComments: true,
        requireAuth: false,
        featuredImage: 'https://example.com/welcome-banner.jpg',
        backgroundColor: '#ffffff',
        textColor: '#000000'
      },
      categories: ['welcome', 'featured'],
      tags: ['introduction', 'platform', 'getting-started'],
      isFeatured: true,
      createdBy: testUser._id
    };

    const newPage = new Page(pageData);
    await newPage.save();
    
    console.log(`✅ Created page: "${newPage.title.en}" (${newPage.slug})`);
    console.log(`   URL: ${newPage.url}`);
    console.log(`   Status: ${newPage.status} (Published: ${newPage.isPublished})`);
    console.log(`   Word count: ${newPage.wordCount}`);
    console.log(`   Version: ${newPage.version}\n`);

    // Test 2: Create page with Arabic-first content
    console.log('📝 Test 2: Creating Arabic-focused page...');
    
    const arabicPage = new Page({
      title: {
        en: 'About Saudi Culture',
        ar: 'حول الثقافة السعودية'
      },
      slug: 'saudi-culture',
      content: [
        {
          id: 'block-ar-1',
          type: 'heading',
          content: {
            en: 'Exploring Saudi Arabian Heritage',
            ar: 'استكشاف التراث السعودي'
          },
          data: { level: 1 },
          settings: {},
          order: 0
        },
        {
          id: 'block-ar-2',
          type: 'paragraph',
          content: {
            en: 'Saudi Arabia has a rich cultural heritage spanning thousands of years, from ancient trade routes to modern innovation.',
            ar: 'تتمتع المملكة العربية السعودية بتراثثقافي غني يمتد لآلاف السنين، من الطرق التجارية القديمة إلى الابتكار الحديث.'
          },
          data: {},
          settings: {},
          order: 1
        }
      ],
      template: 'about',
      status: 'draft',
      seo: {
        title: {
          en: 'Saudi Culture - Rich Heritage and Traditions',
          ar: 'الثقافة السعودية - تراث غني وتقاليد عريقة'
        },
        description: {
          en: 'Discover the rich cultural heritage of Saudi Arabia, from ancient traditions to modern innovation.',
          ar: 'اكتشف التراث الثقافي الغني للمملكة العربية السعودية، من التقاليد القديمة إلى الابتكار الحديث.'
        }
      },
      categories: ['culture', 'heritage'],
      tags: ['saudi', 'culture', 'heritage', 'traditions'],
      createdBy: testUser._id
    });

    await arabicPage.save();
    console.log(`✅ Created page: "${arabicPage.title.ar}" (${arabicPage.slug})`);
    console.log(`   Status: ${arabicPage.status} (Published: ${arabicPage.isPublished})`);
    console.log(`   SEO optimized: ${!!arabicPage.seo.title.ar}\n`);

    // Test 3: Test static methods and queries
    console.log('🔍 Test 3: Testing query methods...');
    
    const publishedPages = await Page.findPublished();
    console.log(`✅ Found ${publishedPages.length} published pages`);
    
    const welcomePage = await Page.findBySlug('welcome-to-ludus');
    console.log(`✅ Found page by slug: ${welcomePage.title.en}`);
    
    // Test featured pages
    const featuredPages = await Page.find({ isFeatured: true });
    console.log(`✅ Found ${featuredPages.length} featured pages`);
    
    // Test navigation pages
    const navPages = await Page.find({ showInNavigation: true }).sort({ navigationOrder: 1 });
    console.log(`✅ Found ${navPages.length} navigation pages`);

    // Test 4: Test content search
    console.log('\n🔍 Test 4: Testing content search...');
    
    const searchResults = await Page.find({
      $or: [
        { 'title.en': { $regex: 'LUDUS', $options: 'i' } },
        { 'title.ar': { $regex: 'لودوس', $options: 'i' } },
        { 'content.content.en': { $regex: 'activity', $options: 'i' } }
      ]
    });
    console.log(`✅ Search found ${searchResults.length} pages containing search terms`);

    // Test 5: Test analytics aggregation
    console.log('\n📊 Test 5: Testing analytics...');
    
    const analytics = await Page.aggregate([
      {
        $facet: {
          statusStats: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          templateStats: [
            {
              $group: {
                _id: '$template',
                count: { $sum: 1 }
              }
            }
          ],
          totalStats: [
            {
              $group: {
                _id: null,
                totalPages: { $sum: 1 },
                totalViews: { $sum: '$views' },
                avgWordCount: { $avg: { $size: '$content' } }
              }
            }
          ]
        }
      }
    ]);
    
    console.log('✅ Analytics computed:');
    console.log(`   Total pages: ${analytics[0].totalStats[0]?.totalPages || 0}`);
    console.log(`   Status distribution:`, analytics[0].statusStats);
    console.log(`   Template distribution:`, analytics[0].templateStats);

    // Test 6: Test backup creation
    console.log('\n💾 Test 6: Testing version control...');
    
    // Update welcome page content
    welcomePage.content.push({
      id: 'block-4',
      type: 'paragraph',
      content: {
        en: 'This content was added after the initial creation.',
        ar: 'تم إضافة هذا المحتوى بعد الإنشاء الأولي.'
      },
      data: {},
      settings: {},
      order: 3
    });
    
    await welcomePage.createBackup(testUser._id, 'Added new paragraph content');
    await welcomePage.save();
    
    console.log(`✅ Created backup version ${welcomePage.version}`);
    console.log(`   Previous versions: ${welcomePage.previousVersions.length}`);

    // Final stats
    console.log('\n📊 Final Test Results:');
    const finalStats = await Page.countDocuments();
    const publishedCount = await Page.countDocuments({ status: 'published' });
    const draftCount = await Page.countDocuments({ status: 'draft' });
    
    console.log(`   Total pages created: ${finalStats}`);
    console.log(`   Published: ${publishedCount}`);
    console.log(`   Drafts: ${draftCount}`);
    
    console.log('\n🎉 Content Management System test completed successfully!');
    console.log('\n📋 Features tested:');
    console.log('   ✅ Multilingual content (English/Arabic)');
    console.log('   ✅ Rich content blocks (heading, paragraph, quote)');
    console.log('   ✅ SEO optimization');
    console.log('   ✅ Publication status management');
    console.log('   ✅ Navigation integration');
    console.log('   ✅ Content search and filtering');
    console.log('   ✅ Analytics and reporting');
    console.log('   ✅ Version control and backups');
    console.log('   ✅ URL generation and routing');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the test
testContentSystem();