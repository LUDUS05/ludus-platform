#!/usr/bin/env node

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const Page = require('./src/models/Page');
const User = require('./src/models/User');

class ContentMigrationManager {
  constructor() {
    this.migrationResults = {
      timestamp: new Date().toISOString(),
      totalPages: 0,
      migratedPages: 0,
      failedPages: 0,
      errors: [],
      details: []
    };
    
    this.adminUser = null;
  }

  // Connect to database
  async connectToDatabase() {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ludus_mvp');
      console.log('✅ Connected to database');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  }

  // Get or create admin user for content ownership
  async getAdminUser() {
    try {
      // Try to find existing admin user
      this.adminUser = await User.findOne({ role: 'admin' });
      
      if (!this.adminUser) {
        console.log('⚠️  No admin user found, creating one...');
        this.adminUser = await User.create({
          email: 'admin@ludus.com',
          password: 'AdminPass123!',
          firstName: 'System',
          lastName: 'Administrator',
          role: 'admin',
          isVerified: true
        });
        console.log('✅ Created admin user for content ownership');
      }
      
      return this.adminUser;
    } catch (error) {
      console.error('❌ Error getting admin user:', error.message);
      return null;
    }
  }

  // Convert HTML content to rich content blocks
  convertHtmlToContentBlocks(htmlContent, language = 'en') {
    const blocks = [];
    let blockId = 1;
    
    // Split content by HTML tags and process
    const lines = htmlContent.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      let block = {
        id: `block_${blockId++}`,
        type: 'paragraph',
        content: { en: '', ar: '' },
        data: {},
        settings: {},
        order: blockId - 1
      };
      
      // Detect content type and convert
      if (trimmedLine.startsWith('<h1>')) {
        block.type = 'heading';
        block.content[language] = trimmedLine.replace(/<\/?h1>/g, '').trim();
        block.data = { level: 1 };
      } else if (trimmedLine.startsWith('<h2>')) {
        block.type = 'heading';
        block.content[language] = trimmedLine.replace(/<\/?h2>/g, '').trim();
        block.data = { level: 2 };
      } else if (trimmedLine.startsWith('<h3>')) {
        block.type = 'heading';
        block.content[language] = trimmedLine.replace(/<\/?h3>/g, '').trim();
        block.data = { level: 3 };
      } else if (trimmedLine.startsWith('<ul>')) {
        block.type = 'list';
        block.content[language] = trimmedLine.replace(/<\/?ul>/g, '').trim();
        block.data = { listType: 'unordered' };
      } else if (trimmedLine.startsWith('<ol>')) {
        block.type = 'list';
        block.content[language] = trimmedLine.replace(/<\/?ol>/g, '').trim();
        block.data = { listType: 'ordered' };
      } else if (trimmedLine.startsWith('<li>')) {
        block.type = 'list';
        block.content[language] = trimmedLine.replace(/<\/?li>/g, '').trim();
        block.data = { listType: 'list-item' };
      } else if (trimmedLine.startsWith('<p>')) {
        block.type = 'paragraph';
        block.content[language] = trimmedLine.replace(/<\/?p>/g, '').trim();
      } else if (trimmedLine.startsWith('<a ')) {
        block.type = 'button';
        const hrefMatch = trimmedLine.match(/href="([^"]+)"/);
        const textMatch = trimmedLine.match(/>([^<]+)</);
        block.content[language] = textMatch ? textMatch[1] : 'Link';
        block.data = { 
          url: hrefMatch ? hrefMatch[1] : '#',
          buttonStyle: 'link'
        };
      } else if (trimmedLine.startsWith('<hr') || trimmedLine.startsWith('<divider')) {
        block.type = 'divider';
        block.content[language] = '';
        block.data = { style: 'line' };
      } else {
        // Default to paragraph for any other content
        block.type = 'paragraph';
        block.content[language] = trimmedLine.replace(/<[^>]*>/g, '').trim();
      }
      
      // Only add blocks with actual content
      if (block.content[language] || block.type === 'divider') {
        blocks.push(block);
      }
    }
    
    return blocks;
  }

  // Create Arabic translations for content
  createArabicTranslations(blocks) {
    const arabicTranslations = {
      'Privacy Policy': 'سياسة الخصوصية',
      'Terms of Service': 'شروط الخدمة',
      'About Us': 'من نحن',
      'Contact Us': 'اتصل بنا',
      'Information We Collect': 'المعلومات التي نجمعها',
      'How We Use Your Information': 'كيفية استخدام معلوماتك',
      'Information Sharing': 'مشاركة المعلومات',
      'Contact Us': 'اتصل بنا',
      'Acceptance of Terms': 'قبول الشروط',
      'Use License': 'ترخيص الاستخدام',
      'User Account': 'حساب المستخدم',
      'Booking and Payment': 'الحجز والدفع',
      'Our Mission': 'مهمتنا',
      'What We Do': 'ما نقوم به',
      'Why Choose LUDUS?': 'لماذا تختار لودس؟',
      'Get in Touch': 'تواصل معنا',
      'Business Hours': 'ساعات العمل',
      'Location': 'الموقع',
      'Last updated': 'آخر تحديث',
      'Questions about': 'أسئلة حول',
      'should be sent to us at': 'يرجى إرسالها إلينا على',
      'Learn about': 'تعرف على',
      'Read the': 'اقرأ',
      'Get in touch with': 'تواصل مع',
      'Contact information and': 'معلومات الاتصال و',
      'Carefully vetted local experiences': 'تجارب محلية مدروسة بعناية',
      'Easy booking and secure payments': 'حجز سهل ومدفوعات آمنة',
      '24/7 customer support': 'دعم العملاء على مدار الساعة',
      'Satisfaction guarantee': 'ضمان الرضا',
      'Have questions or suggestions?': 'هل لديك أسئلة أو اقتراحات؟',
      'We\'d love to hear from you!': 'نود أن نسمع منك!',
      'For general inquiries': 'للاستفسارات العامة',
      'For support': 'للدعم',
      'Sunday - Thursday': 'الأحد - الخميس',
      'Friday - Saturday': 'الجمعة - السبت',
      'Closed': 'مغلق',
      'Riyadh, Saudi Arabia': 'الرياض، المملكة العربية السعودية'
    };
    
    return blocks.map(block => {
      if (block.content.en) {
        // Try to find Arabic translation
        const arabicText = arabicTranslations[block.content.en] || 
                          this.generateArabicPlaceholder(block.content.en);
        block.content.ar = arabicText;
      }
      return block;
    });
  }

  // Generate placeholder Arabic text for untranslated content
  generateArabicPlaceholder(englishText) {
    // Simple placeholder generation - in production, use proper translation service
    if (englishText.length < 20) {
      return `[${englishText}] - ترجمة عربية`;
    }
    return `[محتوى باللغة العربية] - ${englishText.substring(0, 30)}...`;
  }

  // Create SEO data for pages
  createSeoData(pageData, language = 'en') {
    const seo = {
      title: { en: '', ar: '' },
      description: { en: '', ar: '' },
      keywords: { en: '', ar: '' },
      ogTitle: { en: '', ar: '' },
      ogDescription: { en: '', ar: '' }
    };
    
    // Set English content
    seo.title.en = pageData.title;
    seo.description.en = pageData.metaDescription || `Learn about ${pageData.title} on LUDUS platform`;
    seo.keywords.en = pageData.title.toLowerCase().replace(/\s+/g, ', ') + ', ludus, activities, saudi arabia';
    seo.ogTitle.en = pageData.title;
    seo.ogDescription.en = pageData.metaDescription || `Learn about ${pageData.title} on LUDUS platform`;
    
    // Set Arabic content
    const arabicTitle = this.createArabicTranslations([{ content: { en: pageData.title } }])[0].content.ar;
    seo.title.ar = arabicTitle;
    seo.description.ar = `تعرف على ${arabicTitle} على منصة لودس`;
    seo.keywords.ar = arabicTitle + ', لودس, أنشطة, السعودية';
    seo.ogTitle.ar = arabicTitle;
    seo.ogDescription.ar = `تعرف على ${arabicTitle} على منصة لودس`;
    
    return seo;
  }

  // Migrate existing content structure to new CMS
  async migrateExistingContent() {
    console.log('🔄 Starting content migration to new CMS...\n');
    
    // Define the content to migrate
    const contentToMigrate = [
      {
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        template: 'basic',
        placement: 'footer',
        status: 'published',
        order: 1,
        htmlContent: `<h1>Privacy Policy</h1>
<p>Last updated: ${new Date().toDateString()}</p>

<h2>Information We Collect</h2>
<p>We collect information you provide directly to us, such as when you create an account, make a booking, or contact us for support.</p>

<h2>How We Use Your Information</h2>
<p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>

<h2>Information Sharing</h2>
<p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>

<h2>Contact Us</h2>
<p>If you have any questions about this Privacy Policy, please contact us at hi@letsludus.com</p>`,
        metaDescription: 'Learn about how LUDUS protects your privacy and handles your personal information.',
        categories: ['legal', 'policy'],
        tags: ['privacy', 'data', 'legal']
      },
      {
        title: 'Terms of Service',
        slug: 'terms-of-service',
        template: 'basic',
        placement: 'footer',
        status: 'published',
        order: 2,
        htmlContent: `<h1>Terms of Service</h1>
<p>Last updated: ${new Date().toDateString()}</p>

<h2>Acceptance of Terms</h2>
<p>By accessing and using the LUDUS platform, you accept and agree to be bound by the terms and provision of this agreement.</p>

<h2>Use License</h2>
<p>Permission is granted to temporarily use the LUDUS platform for personal, non-commercial transitory viewing only.</p>

<h2>User Account</h2>
<p>When you create an account with us, you must provide information that is accurate, complete, and current at all times.</p>

<h2>Booking and Payment</h2>
<p>All bookings are subject to availability and confirmation. Payment is required to secure your booking.</p>

<h2>Contact Information</h2>
<p>Questions about the Terms of Service should be sent to us at hi@letsludus.com</p>`,
        metaDescription: 'Read the terms and conditions for using the LUDUS platform.',
        categories: ['legal', 'policy'],
        tags: ['terms', 'legal', 'agreement']
      },
      {
        title: 'About Us',
        slug: 'about',
        template: 'about',
        placement: 'header',
        status: 'published',
        order: 1,
        htmlContent: `<h1>About LUDUS</h1>

<h2>Our Mission</h2>
<p>LUDUS connects people with amazing local experiences and activities. We believe that life is meant to be lived to the fullest, and we're here to help you discover and book incredible adventures in your city.</p>

<h2>What We Do</h2>
<p>We partner with local vendors and activity providers to offer you a curated selection of experiences, from fitness classes and workshops to outdoor adventures and cultural events.</p>

<h2>Why Choose LUDUS?</h2>
<ul>
<li>Carefully vetted local experiences</li>
<li>Easy booking and secure payments</li>
<li>24/7 customer support</li>
<li>Satisfaction guarantee</li>
</ul>

<h2>Get in Touch</h2>
<p>Have questions or suggestions? We'd love to hear from you! Contact us at hi@letsludus.com</p>`,
        metaDescription: 'Learn about LUDUS and our mission to connect you with amazing local experiences.',
        categories: ['company', 'information'],
        tags: ['about', 'mission', 'company']
      },
      {
        title: 'Contact Us',
        slug: 'contact',
        template: 'contact',
        placement: 'footer',
        status: 'published',
        order: 3,
        htmlContent: `<h1>Contact Us</h1>

<p>We'd love to hear from you! Get in touch with us through any of the following ways:</p>

<h2>Email</h2>
<p>For general inquiries: <a href="mailto:hi@letsludus.com">hi@letsludus.com</a></p>
<p>For support: <a href="mailto:support@letsludus.com">support@letsludus.com</a></p>

<h2>Business Hours</h2>
<p>Sunday - Thursday: 9:00 AM - 6:00 PM (Riyadh Time)<br>
Friday - Saturday: Closed</p>

<h2>Location</h2>
<p>Riyadh, Saudi Arabia</p>`,
        metaDescription: 'Get in touch with LUDUS. Contact information and business hours.',
        categories: ['company', 'contact'],
        tags: ['contact', 'support', 'location']
      }
    ];

    this.migrationResults.totalPages = contentToMigrate.length;

    for (const content of contentToMigrate) {
      try {
        console.log(`🔄 Migrating: ${content.title}`);
        
        // Check if page already exists
        const existingPage = await Page.findOne({ slug: content.slug });
        if (existingPage) {
          console.log(`⚠️  Page ${content.title} already exists, updating...`);
          await this.updateExistingPage(existingPage, content);
        } else {
          await this.createNewPage(content);
        }
        
        this.migrationResults.migratedPages++;
        console.log(`✅ Successfully migrated: ${content.title}`);
        
      } catch (error) {
        console.error(`❌ Failed to migrate ${content.title}:`, error.message);
        this.migrationResults.failedPages++;
        this.migrationResults.errors.push({
          page: content.title,
          error: error.message
        });
      }
    }
  }

  // Create new page with new CMS structure
  async createNewPage(content) {
    // Convert HTML to content blocks
    const contentBlocks = this.convertHtmlToContentBlocks(content.htmlContent, 'en');
    
    // Add Arabic translations
    const blocksWithArabic = this.createArabicTranslations(contentBlocks);
    
    // Create SEO data
    const seo = this.createSeoData(content, 'en');
    
    // Create new page
    const newPage = new Page({
      title: {
        en: content.title,
        ar: this.createArabicTranslations([{ content: { en: content.title } }])[0].content.ar
      },
      slug: content.slug,
      url: content.slug,
      content: blocksWithArabic,
      template: content.template,
      status: content.status,
      publishDate: new Date(),
      placement: content.placement,
      showInNavigation: true,
      navigationOrder: content.order,
      seo: seo,
      categories: content.categories,
      tags: content.tags,
      createdBy: this.adminUser._id,
      updatedBy: this.adminUser._id
    });
    
    await newPage.save();
  }

  // Update existing page with new CMS structure
  async updateExistingPage(existingPage, content) {
    // Convert HTML to content blocks
    const contentBlocks = this.convertHtmlToContentBlocks(content.htmlContent, 'en');
    
    // Add Arabic translations
    const blocksWithArabic = this.createArabicTranslations(contentBlocks);
    
    // Create SEO data
    const seo = this.createSeoData(content, 'en');
    
    // Update page with new structure
    existingPage.title = {
      en: content.title,
      ar: this.createArabicTranslations([{ content: { en: content.title } }])[0].content.ar
    };
    existingPage.content = blocksWithArabic;
    existingPage.template = content.template;
    existingPage.placement = content.placement;
    existingPage.showInNavigation = true;
    existingPage.navigationOrder = content.order;
    existingPage.seo = seo;
    existingPage.categories = content.categories;
    existingPage.tags = content.tags;
    existingPage.updatedBy = this.adminUser._id;
    existingPage.version = (existingPage.version || 0) + 1;
    
    await existingPage.save();
  }

  // Generate migration report
  generateReport() {
    console.log('\n📊 CONTENT MIGRATION REPORT');
    console.log('=' .repeat(50));
    console.log(`Timestamp: ${this.migrationResults.timestamp}`);
    console.log(`Total Pages: ${this.migrationResults.totalPages}`);
    console.log(`✅ Migrated: ${this.migrationResults.migratedPages}`);
    console.log(`❌ Failed: ${this.migrationResults.failedPages}`);
    console.log(`📊 Success Rate: ${Math.round((this.migrationResults.migratedPages / this.migrationResults.totalPages) * 100)}%`);
    
    if (this.migrationResults.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.migrationResults.errors.forEach(error => {
        console.log(`   - ${error.page}: ${error.error}`);
      });
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('   1. Verify migrated content in admin panel');
    console.log('   2. Review Arabic translations');
    console.log('   3. Test page rendering on frontend');
    console.log('   4. Update navigation menus if needed');
    
    // Save detailed results
    this.saveMigrationResults();
  }

  // Save migration results to file
  saveMigrationResults() {
    const filename = `content-migration-results-${new Date().toISOString().split('T')[0]}.json`;
    try {
      fs.writeFileSync(filename, JSON.stringify(this.migrationResults, null, 2));
      console.log(`📁 Migration results saved to: ${filename}`);
    } catch (error) {
      console.error('❌ Failed to save migration results:', error.message);
    }
  }

  // Main migration process
  async runMigration() {
    console.log('🚀 LUDUS Content Migration to New CMS');
    console.log('=' .repeat(50));
    
    // Connect to database
    if (!(await this.connectToDatabase())) {
      return false;
    }
    
    // Get admin user
    if (!(await this.getAdminUser())) {
      return false;
    }
    
    // Run migration
    await this.migrateExistingContent();
    
    // Generate report
    this.generateReport();
    
    // Close database connection
    await mongoose.connection.close();
    console.log('\n✅ Migration completed!');
    
    return this.migrationResults.failedPages === 0;
  }
}

// Run migration if called directly
if (require.main === module) {
  const migrationManager = new ContentMigrationManager();
  
  migrationManager.runMigration()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = ContentMigrationManager;