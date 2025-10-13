/**
 * Linear Webhook Routes
 * Routes for Linear to Notion sync automation
 */

const express = require('express');
const router = express.Router();
const linearWebhookController = require('../controllers/linearWebhookController');

/**
 * @route   POST /api/linear-webhook
 * @desc    Receive Linear webhook events
 * @access  Public (verified by signature)
 */
router.post('/', (req, res) => linearWebhookController.handleWebhook(req, res));

/**
 * @route   GET /api/linear-webhook/test
 * @desc    Test webhook endpoint
 * @access  Public
 */
router.get('/test', (req, res) => linearWebhookController.test(req, res));

/**
 * @route   GET /api/linear-webhook/status
 * @desc    Get sync status and configuration
 * @access  Private (should add auth middleware)
 */
router.get('/status', (req, res) => linearWebhookController.getStatus(req, res));

/**
 * @route   POST /api/linear-webhook/sync
 * @desc    Manually trigger full sync from Linear to Notion
 * @access  Private (should add auth middleware)
 * @query   teamId - Optional Linear team ID
 * @query   status - Optional status filter
 * @query   limit - Max number of issues to sync (default: 100)
 */
router.post('/sync', (req, res) => linearWebhookController.syncAll(req, res));

module.exports = router;

