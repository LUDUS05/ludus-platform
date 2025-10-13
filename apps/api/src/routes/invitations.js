const express = require('express');
const { authenticate: protect } = require('../middleware/auth');
const {
  createInvitation,
  trackInvitationClick,
  recordInvitationConversion,
  getInvitationStats,
  getInvitationHistory,
  updateInvitationStatus,
  deleteInvitation,
  getInvitationAnalytics
} = require('../controllers/invitationController');

const router = express.Router();

// Public routes (no authentication required)
router.post('/:id/click', trackInvitationClick);

// Protected routes (authentication required)
router.use(protect);

// Create new invitation
router.post('/', createInvitation);

// Get invitation statistics
router.get('/stats', getInvitationStats);

// Get invitation history
router.get('/history', getInvitationHistory);

// Get invitation analytics
router.get('/analytics', getInvitationAnalytics);

// Record invitation conversion
router.post('/:id/conversion', recordInvitationConversion);

// Update invitation status
router.put('/:id/status', updateInvitationStatus);

// Delete invitation
router.delete('/:id', deleteInvitation);

module.exports = router;
