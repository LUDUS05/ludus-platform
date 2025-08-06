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
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        url: '/privacy-policy',
        content: `<h1>Privacy Policy</h1>
<p>Last updated: ${new Date().toDateString()}</p>

<h2>Information We Collect</h2>
<p>We collect information you provide directly to us, such as when you create an account, make a booking, or contact us for support.</p>

<h2>How We Use Your Information</h2>
<p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>

<h2>Information Sharing</h2>
<p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>

<h2>Data Security</h2>
<p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

<h2>Contact Us</h2>
<p>If you have any questions about this Privacy Policy, please contact us at hi@letsludus.com</p>`,
        placement: 'footer',
        status: 'published',
        isSystem: true,
        order: 1,
        metaDescription: 'Learn about how LUDUS protects your privacy and handles your personal information.',
        createdBy: adminUser._id
      },
      {
        title: 'Terms of Service',
        slug: 'terms-of-service',
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

<h2>Cancellation Policy</h2>
<p>Cancellation policies vary by activity provider. Please review the specific cancellation policy before booking.</p>

<h2>Contact Information</h2>
<p>Questions about the Terms of Service should be sent to us at hi@letsludus.com</p>`,
        placement: 'footer',
        status: 'published',
        isSystem: true,
        order: 2,
        metaDescription: 'Read the terms and conditions for using the LUDUS platform.',
        createdBy: adminUser._id
      },
      {
        title: 'About Us',
        slug: 'about-us',
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
        isSystem: false,
        order: 1,
        metaDescription: 'Learn about LUDUS and our mission to connect you with amazing local experiences.',
        createdBy: adminUser._id
      },
      {
        title: 'Contact Us',
        slug: 'contact',
        url: '/contact',
        content: `<h1>Contact Us</h1>

<p>We'd love to hear from you! Get in touch with us through any of the following ways:</p>

<h2>Email</h2>
<p>For general inquiries: <a href="mailto:hi@letsludus.com">hi@letsludus.com</a></p>
<p>For support: <a href="mailto:support@letsludus.com">support@letsludus.com</a></p>

<h2>Business Hours</h2>
<p>Sunday - Thursday: 9:00 AM - 6:00 PM (Riyadh Time)<br>
Friday - Saturday: Closed</p>

<h2>Social Media</h2>
<p>Follow us on social media for the latest updates and featured activities.</p>

<h2>Location</h2>
<p>Riyadh, Saudi Arabia</p>`,
        placement: 'footer',
        status: 'published',
        isSystem: false,
        order: 3,
        metaDescription: 'Get in touch with LUDUS. Contact information and business hours.',
        createdBy: adminUser._id
      },
      {
        title: 'Let\'s Partner',
        slug: 'lets-partner',
        url: '/lets-partner',
        content: `<div id="partner-registration-page">
<style>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&display=swap');

#partner-registration-page {
    font-family: 'IBM Plex Mono', 'Courier New', monospace;
    max-width: 700px;
    margin: 0 auto;
    padding: 60px 40px;
    background: #fefefe;
    background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.02) 1px, transparent 0);
    background-size: 20px 20px;
    color: #2a2a2a;
    line-height: 1.6;
}

#partner-registration-page .form-header {
    margin-bottom: 50px;
}

#partner-registration-page .form-header h1 {
    font-size: 24px;
    font-weight: 400;
    margin-bottom: 10px;
    letter-spacing: 0.5px;
}

#partner-registration-page .form-header p {
    font-size: 14px;
    color: #666;
    font-weight: 300;
}

#partner-registration-page .form-group {
    margin-bottom: 40px;
    position: relative;
}

#partner-registration-page .input-container {
    position: relative;
    width: 100%;
}

#partner-registration-page .form-input {
    width: 100%;
    font-family: inherit;
    font-size: 16px;
    font-weight: 400;
    background: transparent;
    border: none;
    border-bottom: 2px solid #e0e0e0;
    padding: 12px 0 8px 0;
    outline: none;
    color: #2a2a2a;
    transition: border-color 0.3s ease;
    caret-color: #2a2a2a;
    caret-width: 2px;
}

#partner-registration-page .form-input:focus {
    border-bottom-color: #2a2a2a;
    animation: underline-glow 0.3s ease;
}

@keyframes underline-glow {
    0% { border-bottom-color: #e0e0e0; }
    50% { border-bottom-color: #666; }
    100% { border-bottom-color: #2a2a2a; }
}

#partner-registration-page .form-input::placeholder {
    color: transparent;
}

#partner-registration-page .form-label {
    position: absolute;
    left: 0;
    top: 12px;
    font-size: 16px;
    color: #999;
    transition: all 0.3s ease;
    pointer-events: none;
    font-weight: 300;
}

#partner-registration-page .form-input:focus + .form-label,
#partner-registration-page .form-input:not(:placeholder-shown) + .form-label,
#partner-registration-page .form-input.has-value + .form-label {
    top: -8px;
    font-size: 12px;
    color: #666;
    transform: translateY(-4px);
}

#partner-registration-page .form-textarea {
    width: 100%;
    font-family: inherit;
    font-size: 16px;
    font-weight: 400;
    background: transparent;
    border: none;
    border-bottom: 2px solid #e0e0e0;
    padding: 12px 0 8px 0;
    outline: none;
    color: #2a2a2a;
    resize: vertical;
    min-height: 80px;
    transition: border-color 0.3s ease;
    caret-color: #2a2a2a;
    caret-width: 2px;
}

#partner-registration-page .form-textarea:focus {
    border-bottom-color: #2a2a2a;
    animation: underline-glow 0.3s ease;
}

#partner-registration-page .form-textarea::placeholder {
    color: transparent;
}

#partner-registration-page .form-textarea:focus + .form-label,
#partner-registration-page .form-textarea:not(:placeholder-shown) + .form-label,
#partner-registration-page .form-textarea.has-value + .form-label {
    top: -8px;
    font-size: 12px;
    color: #666;
    transform: translateY(-4px);
}

#partner-registration-page .error-message {
    font-size: 12px;
    color: #d73a49;
    margin-top: 5px;
    font-weight: 300;
    opacity: 0;
    transition: opacity 0.3s ease;
}

#partner-registration-page .form-input.error,
#partner-registration-page .form-textarea.error {
    border-bottom-color: #d73a49;
    animation: error-shake 0.3s ease;
}

#partner-registration-page .form-input.error + .form-label,
#partner-registration-page .form-textarea.error + .form-label {
    color: #d73a49;
}

#partner-registration-page .form-group.error .error-message {
    opacity: 1;
}

@keyframes error-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px); }
    75% { transform: translateX(2px); }
}

#partner-registration-page .submit-container {
    margin-top: 60px;
}

#partner-registration-page .submit-btn {
    font-family: inherit;
    font-size: 16px;
    font-weight: 400;
    background: transparent;
    border: none;
    color: #2a2a2a;
    cursor: pointer;
    text-decoration: none;
    position: relative;
    padding: 0;
    transition: all 0.3s ease;
}

#partner-registration-page .submit-btn::before {
    content: '[';
    margin-right: 2px;
}

#partner-registration-page .submit-btn::after {
    content: ']';
    margin-left: 2px;
}

#partner-registration-page .submit-btn:hover {
    color: #666;
}

#partner-registration-page .submit-btn:hover::before,
#partner-registration-page .submit-btn:hover::after {
    animation: bracket-blink 0.5s ease;
}

@keyframes bracket-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
}

#partner-registration-page .submit-btn:active {
    transform: translateY(1px);
}

#partner-registration-page .submit-btn:disabled {
    color: #ccc;
    cursor: not-allowed;
}

#partner-registration-page .form-success {
    text-align: center;
    padding: 40px 0;
}

#partner-registration-page .form-success h2 {
    font-size: 18px;
    font-weight: 400;
    margin-bottom: 10px;
    color: #28a745;
}

#partner-registration-page .form-success p {
    font-size: 14px;
    color: #666;
    font-weight: 300;
}

#partner-registration-page .hidden {
    display: none;
}

@media (max-width: 768px) {
    #partner-registration-page {
        padding: 40px 20px;
    }
    
    #partner-registration-page .form-header h1 {
        font-size: 20px;
    }
    
    #partner-registration-page .form-input,
    #partner-registration-page .form-textarea,
    #partner-registration-page .form-label {
        font-size: 14px;
    }
    
    #partner-registration-page .form-input:focus + .form-label,
    #partner-registration-page .form-input:not(:placeholder-shown) + .form-label,
    #partner-registration-page .form-input.has-value + .form-label,
    #partner-registration-page .form-textarea:focus + .form-label,
    #partner-registration-page .form-textarea:not(:placeholder-shown) + .form-label,
    #partner-registration-page .form-textarea.has-value + .form-label {
        font-size: 11px;
    }
    
    #partner-registration-page .form-group {
        margin-bottom: 35px;
    }
    
    #partner-registration-page .submit-container {
        margin-top: 50px;
    }
}

@media (max-width: 480px) {
    #partner-registration-page {
        padding: 30px 15px;
    }
    
    #partner-registration-page .form-header {
        margin-bottom: 40px;
    }
    
    #partner-registration-page .form-group {
        margin-bottom: 30px;
    }
    
    #partner-registration-page .submit-container {
        margin-top: 40px;
    }
}
</style>

<div class="form-header">
    <h1>Partner Registration</h1>
    <p>Join the LUDUS network and connect with our community</p>
</div>

<form id="partnerForm" class="partner-form" novalidate>
    <div class="form-group">
        <div class="input-container">
            <input 
                type="text" 
                id="companyName" 
                name="companyName" 
                class="form-input" 
                placeholder=" "
                required
                autocomplete="organization"
            >
            <label for="companyName" class="form-label">Company Name</label>
        </div>
        <div class="error-message" id="companyNameError"></div>
    </div>
    
    <div class="form-group">
        <div class="input-container">
            <input 
                type="text" 
                id="contactName" 
                name="contactName" 
                class="form-input" 
                placeholder=" "
                required
                autocomplete="name"
            >
            <label for="contactName" class="form-label">Contact Person Name</label>
        </div>
        <div class="error-message" id="contactNameError"></div>
    </div>
    
    <div class="form-group">
        <div class="input-container">
            <input 
                type="email" 
                id="email" 
                name="email" 
                class="form-input" 
                placeholder=" "
                required
                autocomplete="email"
            >
            <label for="email" class="form-label">Email Address</label>
        </div>
        <div class="error-message" id="emailError"></div>
    </div>
    
    <div class="form-group">
        <div class="input-container">
            <input 
                type="tel" 
                id="phone" 
                name="phone" 
                class="form-input" 
                placeholder=" "
                required
                autocomplete="tel"
            >
            <label for="phone" class="form-label">Phone Number</label>
        </div>
        <div class="error-message" id="phoneError"></div>
    </div>
    
    <div class="form-group">
        <div class="input-container">
            <input 
                type="url" 
                id="website" 
                name="website" 
                class="form-input" 
                placeholder=" "
                autocomplete="url"
            >
            <label for="website" class="form-label">Website URL (Optional)</label>
        </div>
        <div class="error-message" id="websiteError"></div>
    </div>
    
    <div class="form-group">
        <div class="input-container">
            <textarea 
                id="description" 
                name="description" 
                class="form-textarea" 
                placeholder=" "
                required
                rows="4"
            ></textarea>
            <label for="description" class="form-label">Company Description</label>
        </div>
        <div class="error-message" id="descriptionError"></div>
    </div>
    
    <div class="submit-container">
        <button type="submit" class="submit-btn">Submit</button>
    </div>
</form>

<div id="successMessage" class="form-success hidden">
    <h2>Registration Submitted</h2>
    <p>Thank you for your interest. We'll be in touch soon.</p>
</div>
</div>

<script>
(function() {
    class PartnerRegistrationForm {
        constructor() {
            this.form = document.getElementById('partnerForm');
            if (!this.form) return;
            
            this.inputs = this.form.querySelectorAll('.form-input, .form-textarea');
            this.submitBtn = this.form.querySelector('.submit-btn');
            this.successMessage = document.getElementById('successMessage');
            
            this.init();
        }
        
        init() {
            this.bindEvents();
            this.setupInputHandlers();
        }
        
        bindEvents() {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
            
            this.inputs.forEach(input => {
                input.addEventListener('input', this.handleInputChange.bind(this));
                input.addEventListener('blur', this.handleInputBlur.bind(this));
                input.addEventListener('focus', this.handleInputFocus.bind(this));
            });
        }
        
        setupInputHandlers() {
            this.inputs.forEach(input => {
                if (input.value.trim() !== '') {
                    input.classList.add('has-value');
                }
            });
        }
        
        handleInputChange(e) {
            const input = e.target;
            const formGroup = input.closest('.form-group');
            
            if (input.value.trim() !== '') {
                input.classList.add('has-value');
            } else {
                input.classList.remove('has-value');
            }
            
            if (formGroup.classList.contains('error')) {
                this.clearFieldError(input);
            }
        }
        
        handleInputBlur(e) {
            const input = e.target;
            this.validateField(input);
        }
        
        handleInputFocus(e) {
            const input = e.target;
            const formGroup = input.closest('.form-group');
            
            if (formGroup.classList.contains('error')) {
                this.clearFieldError(input);
            }
        }
        
        validateField(input) {
            const value = input.value.trim();
            const fieldName = input.name;
            let isValid = true;
            let errorMessage = '';
            
            if (input.hasAttribute('required') && !value) {
                isValid = false;
                errorMessage = this.getFieldLabel(fieldName) + ' is required';
            }
            
            if (value && fieldName === 'email') {
                const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
            }
            
            if (value && fieldName === 'website') {
                const urlRegex = /^https?:\\/\\/.+\\..+/;
                if (!urlRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid URL (include http:// or https://)';
                }
            }
            
            if (value && fieldName === 'phone') {
                const phoneRegex = /^[\\+]?[1-9][\\d]{0,15}$/;
                if (!phoneRegex.test(value.replace(/[\\s\\-\\(\\)]/g, ''))) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number';
                }
            }
            
            if (fieldName === 'description' && value && value.length < 10) {
                isValid = false;
                errorMessage = 'Company description must be at least 10 characters';
            }
            
            if (!isValid) {
                this.showFieldError(input, errorMessage);
            } else {
                this.clearFieldError(input);
            }
            
            return isValid;
        }
        
        validateForm() {
            let isFormValid = true;
            
            this.inputs.forEach(input => {
                if (!this.validateField(input)) {
                    isFormValid = false;
                }
            });
            
            return isFormValid;
        }
        
        showFieldError(input, message) {
            const formGroup = input.closest('.form-group');
            const errorElement = formGroup.querySelector('.error-message');
            
            input.classList.add('error');
            formGroup.classList.add('error');
            errorElement.textContent = message;
        }
        
        clearFieldError(input) {
            const formGroup = input.closest('.form-group');
            const errorElement = formGroup.querySelector('.error-message');
            
            input.classList.remove('error');
            formGroup.classList.remove('error');
            errorElement.textContent = '';
        }
        
        getFieldLabel(fieldName) {
            const labels = {
                companyName: 'Company Name',
                contactName: 'Contact Person Name',
                email: 'Email Address',
                phone: 'Phone Number',
                website: 'Website URL',
                description: 'Company Description'
            };
            return labels[fieldName] || fieldName;
        }
        
        async handleSubmit(e) {
            e.preventDefault();
            
            if (!this.validateForm()) {
                return;
            }
            
            this.submitBtn.disabled = true;
            this.submitBtn.textContent = 'Submitting...';
            
            await this.simulateSubmission();
            this.showSuccess();
        }
        
        async simulateSubmission() {
            return new Promise(resolve => {
                setTimeout(resolve, 1500);
            });
        }
        
        showSuccess() {
            this.form.classList.add('hidden');
            this.successMessage.classList.remove('hidden');
            
            setTimeout(() => {
                this.resetForm();
            }, 3000);
        }
        
        resetForm() {
            this.form.reset();
            this.inputs.forEach(input => {
                input.classList.remove('has-value', 'error');
                this.clearFieldError(input);
            });
            
            this.submitBtn.disabled = false;
            this.submitBtn.textContent = 'Submit';
            
            this.form.classList.remove('hidden');
            this.successMessage.classList.add('hidden');
        }
    }
    
    // Initialize when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new PartnerRegistrationForm();
        });
    } else {
        new PartnerRegistrationForm();
    }
})();
</script>`,
        placement: 'header',
        status: 'published',
        isSystem: false,
        order: 2,
        metaDescription: 'Partner with LUDUS and join our network of amazing local experience providers. Register your business today.',
        metaKeywords: 'partner registration, business partnership, LUDUS network, vendor registration',
        createdBy: adminUser._id
      },
      {
        title: 'Partner Terms and Conditions',
        slug: 'partner-terms-and-conditions',
        url: '/partner-terms-and-conditions',
        content: `<h1>Partner Terms and Conditions</h1>
<p><strong>Last updated: ${new Date().toDateString()}</strong></p>

<h2>1. Agreement to Terms</h2>
<p>By applying to become a LUDUS partner, you agree to be bound by these Terms and Conditions. These terms govern the partnership relationship between your business and LUDUS Platform.</p>

<h2>2. Eligibility Requirements</h2>
<ul>
<li>You must be a legitimate business entity authorized to provide services in Saudi Arabia</li>
<li>Your business must be properly licensed and registered with relevant Saudi authorities</li>
<li>You must maintain valid business insurance and any required professional certifications</li>
<li>Your services must comply with all applicable Saudi laws and regulations</li>
</ul>

<h2>3. Application and Approval Process</h2>
<p>LUDUS reserves the right to approve or reject any partnership application at our sole discretion. Factors considered include:</p>
<ul>
<li>Quality and uniqueness of services offered</li>
<li>Business reputation and customer reviews</li>
<li>Compliance with safety standards</li>
<li>Alignment with LUDUS brand values</li>
</ul>

<h2>4. Service Standards and Quality</h2>
<p>As a LUDUS partner, you agree to:</p>
<ul>
<li>Maintain high service standards and professionalism</li>
<li>Provide accurate descriptions and pricing information</li>
<li>Honor all bookings confirmed through the platform</li>
<li>Respond promptly to customer inquiries and concerns</li>
<li>Maintain appropriate facilities, equipment, and staff</li>
</ul>

<h2>5. Commission Structure and Payments</h2>
<p>Commission rates and payment terms will be discussed and agreed upon during the approval process. Standard terms include:</p>
<ul>
<li>Commission percentages based on service category and volume</li>
<li>Monthly payment cycles</li>
<li>Transparent fee structure with no hidden charges</li>
<li>Direct bank transfers to your registered business account</li>
</ul>

<h2>6. Customer Data and Privacy</h2>
<p>You agree to handle all customer data in accordance with:</p>
<ul>
<li>Saudi Personal Data Protection Law (PDPL)</li>
<li>LUDUS privacy policies and data protection standards</li>
<li>Industry best practices for data security</li>
<li>Customer consent requirements for marketing communications</li>
</ul>

<h2>7. Cancellation and Refund Policies</h2>
<p>Partners must clearly communicate their cancellation policies and work with LUDUS to ensure fair refund processes that protect both customers and partners.</p>

<h2>8. Marketing and Branding</h2>
<p>LUDUS may use your business information, photos, and customer reviews for marketing purposes. You grant LUDUS permission to feature your services across our platform and promotional materials.</p>

<h2>9. Liability and Insurance</h2>
<p>Partners are responsible for maintaining appropriate insurance coverage and assume liability for their services. LUDUS acts as a platform facilitator and is not liable for partner services.</p>

<h2>10. Termination</h2>
<p>Either party may terminate this partnership agreement with 30 days written notice. LUDUS reserves the right to immediately suspend partners who violate these terms or engage in harmful conduct.</p>

<h2>11. Support and Communication</h2>
<p>LUDUS provides dedicated partner support including:</p>
<ul>
<li>Onboarding assistance and training</li>
<li>Marketing and promotional support</li>
<li>Technical support for platform usage</li>
<li>Regular performance feedback and optimization suggestions</li>
</ul>

<h2>12. Modifications to Terms</h2>
<p>LUDUS may modify these terms with reasonable notice to partners. Continued use of the platform constitutes acceptance of updated terms.</p>

<h2>Contact Information</h2>
<p>For questions about these Partner Terms and Conditions, contact us at:</p>
<ul>
<li>Email: <a href="mailto:partners@letsludus.com">partners@letsludus.com</a></li>
<li>General Support: <a href="mailto:hi@letsludus.com">hi@letsludus.com</a></li>
</ul>

<p><em>These terms are designed to ensure a successful partnership that benefits our partners, customers, and the LUDUS platform. Thank you for your interest in joining the LUDUS network!</em></p>`,
        placement: 'none',
        status: 'published',
        isSystem: true,
        order: 0,
        metaDescription: 'Terms and conditions for LUDUS platform partners and service providers.',
        metaKeywords: 'partner terms, conditions, LUDUS partners, vendor agreement',
        createdBy: adminUser._id
      }
    ];

    await Page.insertMany(defaultPages);
    console.log('✅ Default pages seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding pages:', error);
  }
};

module.exports = seedPages;