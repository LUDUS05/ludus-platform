const axios = require('axios');

// Sample pages to create
const pages = [
  {
    title: 'Privacy Policy',
    url: '/privacy-policy',
    content: `<h1>Privacy Policy</h1>
<p>Last updated: ${new Date().toDateString()}</p>

<h2>Information We Collect</h2>
<p>We collect information you provide directly to us, such as when you create an account, make a booking, or contact us for support.</p>

<h2>How We Use Your Information</h2>
<p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>

<h2>Information Sharing</h2>
<p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>

<h2>Contact Us</h2>
<p>If you have any questions about this Privacy Policy, please contact us at hi@letsludus.com</p>`,
    placement: 'footer',
    status: 'published',
    metaDescription: 'Learn about how LUDUS protects your privacy and handles your personal information.',
    order: 1
  },
  {
    title: 'Terms of Service',
    url: '/terms-of-service',
    content: `<h1>Terms of Service</h1>
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
    placement: 'footer',
    status: 'published',
    metaDescription: 'Read the terms and conditions for using the LUDUS platform.',
    order: 2
  },
  {
    title: 'About Us',
    url: '/about',
    content: `<h1>About LUDUS</h1>

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
    placement: 'header',
    status: 'published',
    metaDescription: 'Learn about LUDUS and our mission to connect you with amazing local experiences.',
    order: 1
  },
  {
    title: 'Contact Us',
    url: '/contact',
    content: `<h1>Contact Us</h1>

<p>We'd love to hear from you! Get in touch with us through any of the following ways:</p>

<h2>Email</h2>
<p>For general inquiries: <a href="mailto:hi@letsludus.com">hi@letsludus.com</a></p>
<p>For support: <a href="mailto:support@letsludus.com">support@letsludus.com</a></p>

<h2>Business Hours</h2>
<p>Sunday - Thursday: 9:00 AM - 6:00 PM (Riyadh Time)<br>
Friday - Saturday: Closed</p>

<h2>Location</h2>
<p>Riyadh, Saudi Arabia</p>`,
    placement: 'footer',
    status: 'published',
    metaDescription: 'Get in touch with LUDUS. Contact information and business hours.',
    order: 3
  }
];

const createPages = async () => {
  try {
    console.log('🚀 Creating pages via API...');
    
    // You'll need to get an admin token first
    console.log('⚠️  Please run this with proper admin authentication token');
    console.log('📋 Pages to create:');
    pages.forEach((page, i) => {
      console.log(`   ${i + 1}. ${page.title} (${page.url})`);
    });
    
    // Example API call (commented out - needs admin token)
    /*
    for (const page of pages) {
      const response = await axios.post('http://localhost:5000/api/admin/pages', page, {
        headers: {
          'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE',
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ Created: ${page.title}`);
    }
    */
    
  } catch (error) {
    console.error('❌ Error creating pages:', error.response?.data || error.message);
  }
};

createPages();