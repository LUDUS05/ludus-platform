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

      // Verify connection configuration
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('Email transporter verification failed:', error);
        } else {
          console.log('✅ Email service ready to send messages');
        }
      });
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
  }
}

// Export singleton instance
const emailService = new EmailService();
module.exports = emailService;