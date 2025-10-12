const nodemailer = require('nodemailer');

function createTransportFromEnv() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function sendEmail({ to, subject, template, data, html, text, from }) {
  const transport = createTransportFromEnv();

  const fromAddress = from || process.env.FROM_EMAIL || 'noreply@letsludus.com';

  const resolvedText = text || `Message: ${subject}\n\n${JSON.stringify(data || {}, null, 2)}`;
  const resolvedHtml = html || `<p>${subject}</p><pre>${escapeHtml(JSON.stringify(data || {}, null, 2))}</pre>`;

  if (!transport) {
    // Fallback: log-only to avoid crashing in environments without SMTP
    console.log('[email:fallback] No SMTP configured. Email would be sent with:', {
      to,
      subject,
      template,
      data
    });
    return { success: true, fallback: true };
  }

  const info = await transport.sendMail({
    from: fromAddress,
    to,
    subject,
    text: resolvedText,
    html: resolvedHtml,
    headers: {
      'X-LUDUS-Template': template || 'generic'
    }
  });

  return { success: true, messageId: info.messageId };
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = { sendEmail };



