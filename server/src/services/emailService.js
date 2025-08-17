const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Google Workspace SMTP Relay configuration
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp-relay.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        // Additional configuration for Google Workspace
        tls: {
          rejectUnauthorized: false
        }
      });

      // Skip verification during startup to prevent blocking server
      // Verification will happen when first email is sent
      console.log('📧 Email service configured (verification skipped during startup)');
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  async sendEmail(options) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const mailOptions = {
        from: `${process.env.FROM_NAME || 'LUDUS Platform'} <${process.env.FROM_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${options.to}`);
      return result;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  // Password reset email template
  async sendPasswordResetEmail(email, resetToken, resetUrl) {
    const subject = 'Password Reset - LUDUS Platform';
    const html = `
      <!DOCTYPE html>
      <html dir="ltr" lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - LUDUS Platform</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 30px;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 500;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 14px;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
          <p>LUDUS Platform</p>
        </div>
        <div class="content">
          <h2>Hello!</h2>
          <p>We received a request to reset your password for your LUDUS Platform account.</p>
          
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <ul>
              <li>This link expires in 1 hour for security</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Never share this link with anyone</li>
            </ul>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
        </div>
        <div class="footer">
          <p>© 2025 LUDUS Platform. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Password Reset - LUDUS Platform

Hello!

We received a request to reset your password for your LUDUS Platform account.

Please visit the following link to reset your password:
${resetUrl}

Security Notice:
- This link expires in 1 hour for security
- If you didn't request this reset, please ignore this email
- Never share this link with anyone

© 2025 LUDUS Platform. All rights reserved.
This is an automated message, please do not reply.
    `;

    return await this.sendEmail({
      to: email,
      subject,
      html,
      text
    });
  }

  // Booking confirmation email template
  async sendBookingConfirmationEmail(booking, activity, vendor) {
    const subject = `Booking Confirmed - ${activity.title}`;
    const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const html = `
      <!DOCTYPE html>
      <html dir="ltr" lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmed - LUDUS Platform</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            text-align: center;
            padding: 30px;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .booking-details {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #28a745;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 5px 0;
            border-bottom: 1px solid #eee;
          }
          .price {
            color: #28a745;
            font-weight: bold;
            font-size: 18px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✅ Booking Confirmed!</h1>
          <p>LUDUS Platform</p>
        </div>
        <div class="content">
          <h2>Hello ${booking.customerName}!</h2>
          <p>Great news! Your booking has been confirmed. Here are the details:</p>
          
          <div class="booking-details">
            <h3>${activity.title}</h3>
            <div class="detail-row">
              <span><strong>Booking ID:</strong></span>
              <span>${booking._id}</span>
            </div>
            <div class="detail-row">
              <span><strong>Date:</strong></span>
              <span>${bookingDate}</span>
            </div>
            <div class="detail-row">
              <span><strong>Participants:</strong></span>
              <span>${booking.participants}</span>
            </div>
            <div class="detail-row">
              <span><strong>Total Amount:</strong></span>
              <span class="price">${booking.totalAmount.toLocaleString()} SAR</span>
            </div>
            <div class="detail-row">
              <span><strong>Vendor:</strong></span>
              <span>${vendor.businessName}</span>
            </div>
            <div class="detail-row">
              <span><strong>Location:</strong></span>
              <span>${vendor.address?.city}, ${vendor.address?.governorate}</span>
            </div>
          </div>
          
          <h3>What's Next?</h3>
          <ul>
            <li>Save this email as your booking confirmation</li>
            <li>Contact the vendor if you have any questions: ${vendor.contactInfo?.phone}</li>
            <li>Arrive on time for the best experience</li>
            <li>Don't forget to rate your experience after the activity!</li>
          </ul>
        </div>
        <div class="footer">
          <p>© 2025 LUDUS Platform. All rights reserved.</p>
          <p>Need help? Contact us at support@ludusapp.com</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Booking Confirmed - LUDUS Platform

Hello ${booking.customerName}!

Great news! Your booking has been confirmed. Here are the details:

Activity: ${activity.title}
Booking ID: ${booking._id}
Date: ${bookingDate}
Participants: ${booking.participants}
Total Amount: ${booking.totalAmount.toLocaleString()} SAR
Vendor: ${vendor.businessName}
Location: ${vendor.address?.city}, ${vendor.address?.governorate}

What's Next?
- Save this email as your booking confirmation
- Contact the vendor if you have any questions: ${vendor.contactInfo?.phone}
- Arrive on time for the best experience
- Don't forget to rate your experience after the activity!

© 2025 LUDUS Platform. All rights reserved.
Need help? Contact us at support@ludusapp.com
    `;

    return await this.sendEmail({
      to: booking.customerEmail,
      subject,
      html,
      text
    });
  }

  // Welcome email template
  async sendWelcomeEmail(user) {
    const subject = 'Welcome to LUDUS Platform! 🎉';
    const html = `
      <!DOCTYPE html>
      <html dir="ltr" lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to LUDUS Platform</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 30px;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .feature {
            background: white;
            padding: 15px;
            margin: 10px 0;
            border-radius: 6px;
            border-left: 4px solid #667eea;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Welcome to LUDUS!</h1>
          <p>Discover Amazing Activities in Saudi Arabia</p>
        </div>
        <div class="content">
          <h2>Hello ${user.firstName}!</h2>
          <p>Welcome to LUDUS Platform! We're excited to have you join our community of adventure seekers and experience enthusiasts.</p>
          
          <h3>What You Can Do:</h3>
          <div class="feature">
            <strong>🔍 Discover Activities</strong><br>
            Browse hundreds of unique experiences across Saudi Arabia
          </div>
          <div class="feature">
            <strong>📅 Easy Booking</strong><br>
            Book activities instantly with secure payment processing
          </div>
          <div class="feature">
            <strong>⭐ Rate & Review</strong><br>
            Share your experiences and help others discover great activities
          </div>
          <div class="feature">
            <strong>📱 Manage Bookings</strong><br>
            Track your bookings and history in your personal dashboard
          </div>
          
          <p>Ready to start exploring? Visit your dashboard to discover amazing activities near you!</p>
        </div>
        <div class="footer">
          <p>© 2025 LUDUS Platform. All rights reserved.</p>
          <p>Follow us for the latest activities and updates!</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Welcome to LUDUS Platform! 🎉

Hello ${user.firstName}!

Welcome to LUDUS Platform! We're excited to have you join our community of adventure seekers and experience enthusiasts.

What You Can Do:
🔍 Discover Activities - Browse hundreds of unique experiences across Saudi Arabia
📅 Easy Booking - Book activities instantly with secure payment processing
⭐ Rate & Review - Share your experiences and help others discover great activities
📱 Manage Bookings - Track your bookings and history in your personal dashboard

Ready to start exploring? Visit your dashboard to discover amazing activities near you!

© 2025 LUDUS Platform. All rights reserved.
Follow us for the latest activities and updates!
    `;

    return await this.sendEmail({
      to: user.email,
      subject,
      html,
      text
    });
  },

  // Send contact form notification to admin
  async sendContactFormNotification(contactData) {
    try {
      const subject = `New Contact Form Submission - ${contactData.subject}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #FF6B35 0%, #FF8A50 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">New Contact Form Submission</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #2D3748; margin-bottom: 20px; font-size: 24px;">Contact Details</h2>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #4A5568;">Name:</strong> ${contactData.name}
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #4A5568;">Email:</strong> 
              <a href="mailto:${contactData.from}" style="color: #FF6B35;">${contactData.from}</a>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #4A5568;">Phone:</strong> ${contactData.phone}
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #4A5568;">Subject:</strong> ${contactData.subject}
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #4A5568;">Source:</strong> ${contactData.source}
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #4A5568;">Submitted:</strong> ${new Date(contactData.timestamp).toLocaleString()}
            </div>
            
            <div style="margin-top: 25px; padding: 20px; background-color: #F7FAFC; border-radius: 8px;">
              <strong style="color: #4A5568;">Message:</strong>
              <p style="margin-top: 10px; line-height: 1.6; color: #2D3748;">${contactData.message}</p>
            </div>
          </div>
        </div>
      `;

      const text = `
New Contact Form Submission

Name: ${contactData.name}
Email: ${contactData.from}
Phone: ${contactData.phone}
Subject: ${contactData.subject}
Source: ${contactData.source}
Submitted: ${new Date(contactData.timestamp).toLocaleString()}

Message:
${contactData.message}
      `;

      return await this.sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@letsludus.com',
        subject,
        html,
        text
      });
    } catch (error) {
      console.error('Send contact form notification error:', error);
      throw error;
    }
  },

  // Send contact confirmation to user
  async sendContactConfirmation(email, name, subject) {
    try {
      const emailSubject = 'Thank you for contacting LUDUS Platform';
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #FF6B35 0%, #FF8A50 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Thank You for Reaching Out!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #2D3748; margin-bottom: 20px;">Hi ${name},</h2>
            
            <p style="color: #4A5568; line-height: 1.6; margin-bottom: 20px;">
              Thank you for contacting LUDUS Platform! We have received your message regarding:
            </p>
            
            <div style="background-color: #F7FAFC; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <strong style="color: #2D3748;">"${subject}"</strong>
            </div>
            
            <p style="color: #4A5568; line-height: 1.6; margin-bottom: 20px;">
              Our team will review your message and get back to you within 24 hours during business days.
            </p>
            
            <div style="background-color: #FFF5F5; border-left: 4px solid #FF6B35; padding: 15px; margin-bottom: 20px;">
              <p style="color: #4A5568; margin: 0; font-size: 14px;">
                <strong>Need immediate assistance?</strong><br>
                Call us at +966 50 123 4567 or email hi@letsludus.com
              </p>
            </div>
            
            <p style="color: #4A5568; line-height: 1.6;">
              Best regards,<br>
              <strong style="color: #FF6B35;">The LUDUS Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #A0AEC0; font-size: 12px;">
            © 2025 LUDUS Platform. All rights reserved.<br>
            This is an automated message, please do not reply.
          </div>
        </div>
      `;

      const text = `
Thank You for Reaching Out!

Hi ${name},

Thank you for contacting LUDUS Platform! We have received your message regarding: "${subject}"

Our team will review your message and get back to you within 24 hours during business days.

Need immediate assistance?
Call us at +966 50 123 4567 or email hi@letsludus.com

Best regards,
The LUDUS Team

© 2025 LUDUS Platform. All rights reserved.
This is an automated message, please do not reply.
      `;

      return await this.sendEmail({
        to: email,
        subject: emailSubject,
        html,
        text
      });
    } catch (error) {
      console.error('Send contact confirmation error:', error);
      throw error;
    }
  }
}

// Export singleton instance
const emailService = new EmailService();
module.exports = emailService;