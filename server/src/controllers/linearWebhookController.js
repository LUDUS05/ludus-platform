/**
 * Linear Webhook Controller
 * Handles incoming webhooks from Linear
 */

const LinearNotionSyncService = require('../services/linearNotionSync');
const crypto = require('crypto');

class LinearWebhookController {
  constructor() {
    this.syncService = new LinearNotionSyncService();
  }

  /**
   * Verify Linear webhook signature
   * @param {string} signature - Webhook signature from header
   * @param {string} body - Raw request body
   */
  verifySignature(signature, body) {
    if (!process.env.LINEAR_WEBHOOK_SECRET) {
      console.warn('[Linear Webhook] No webhook secret configured, skipping verification');
      return true;
    }

    const hmac = crypto.createHmac('sha256', process.env.LINEAR_WEBHOOK_SECRET);
    hmac.update(body);
    const digest = hmac.digest('hex');

    return signature === digest;
  }

  /**
   * Handle Linear webhook
   */
  async handleWebhook(req, res) {
    try {
      const signature = req.headers['linear-signature'];
      const rawBody = JSON.stringify(req.body);

      // Verify webhook signature
      if (signature && !this.verifySignature(signature, rawBody)) {
        console.error('[Linear Webhook] Invalid signature');
        return res.status(401).json({
          success: false,
          error: 'Invalid webhook signature'
        });
      }

      const webhookData = req.body;

      console.log('[Linear Webhook] Received:', {
        type: webhookData.type,
        action: webhookData.action,
        issueId: webhookData.data?.id
      });

      // Process the webhook
      const result = await this.syncService.processWebhook(webhookData);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      console.error('[Linear Webhook] Error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Trigger manual sync of all issues
   */
  async syncAll(req, res) {
    try {
      const { teamId, status, limit } = req.query;

      console.log('[Linear Webhook] Manual sync triggered');

      const result = await this.syncService.syncAllIssues({
        teamId,
        status,
        limit: parseInt(limit) || 100
      });

      return res.status(200).json({
        success: true,
        message: 'Sync completed',
        data: result
      });
    } catch (error) {
      console.error('[Linear Webhook] Sync error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get sync status
   */
  async getStatus(req, res) {
    try {
      const linearConnected = !!process.env.LINEAR_API_KEY;
      const notionConnected = !!process.env.NOTION_API_KEY;
      const webhookConfigured = !!process.env.LINEAR_WEBHOOK_SECRET;

      return res.status(200).json({
        success: true,
        status: {
          linear: {
            connected: linearConnected,
            apiKey: linearConnected ? '****' + process.env.LINEAR_API_KEY.slice(-4) : null
          },
          notion: {
            connected: notionConnected,
            apiKey: notionConnected ? '****' + process.env.NOTION_API_KEY.slice(-4) : null,
            databaseId: process.env.NOTION_TASKS_DATABASE_ID
          },
          webhook: {
            configured: webhookConfigured,
            secret: webhookConfigured ? '****' + process.env.LINEAR_WEBHOOK_SECRET.slice(-4) : null
          }
        }
      });
    } catch (error) {
      console.error('[Linear Webhook] Status error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Test webhook endpoint
   */
  async test(req, res) {
    try {
      return res.status(200).json({
        success: true,
        message: 'Linear webhook endpoint is active',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new LinearWebhookController();

