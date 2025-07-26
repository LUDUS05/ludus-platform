const moyasarService = require('../services/moyasarService');

const verifyMoyasarWebhook = (req, res, next) => {
  try {
    const signature = req.headers['x-moyasar-signature'];
    
    if (!signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing webhook signature'
      });
    }

    // Convert raw body to string for signature verification
    const payload = req.body.toString();
    
    // Verify signature
    const isValid = moyasarService.verifyWebhookSignature(payload, signature);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    // Parse the JSON body for controller use
    try {
      req.body = JSON.parse(payload);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON payload'
      });
    }

    next();
  } catch (error) {
    console.error('Webhook verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Webhook verification failed'
    });
  }
};

module.exports = {
  verifyMoyasarWebhook
};