const express = require('express');
const {
  getSortedApplications,
  updateApplicationStatus,
  reviewApplication,
  getApplicationStats,
  respondToHiringOffer,
} = require('../controllers/hr.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get sorted applications
router.get('/applications/sort', authorize('hr', 'admin'), getSortedApplications);

// Get application statistics
router.get('/stats', authorize('hr', 'admin'), getApplicationStats);

// Update application status
router.put('/applications/:id/status', authorize('hr', 'admin'), updateApplicationStatus);

// Add HR review
router.put('/applications/:id/review', authorize('hr', 'admin'), reviewApplication);

// Respond to hiring offer (for applicants)
router.put('/applications/:id/offer/:offerId', authorize('applicant'), respondToHiringOffer);

module.exports = router; 