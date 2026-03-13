const express = require('express');
const {
  createApplication,
  getApplications,
  getApplication,
  updateApplication,
  deleteApplication,
  getUserApplications,
} = require('../controllers/application.controller');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get my applications
router.get('/me', protect, getUserApplications);

// Upload resume route
router.post(
  '/upload-resume',
  protect,
  upload.single('resume'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        fileName: req.file.filename,
        filePath: `/uploads/${req.file.filename}`,
      },
    });
  }
);

// Main routes
router
  .route('/')
  .get(protect, authorize('hr', 'admin'), getApplications)
  .post(protect, authorize('applicant'), createApplication);

router
  .route('/:id')
  .get(protect, getApplication)
  .put(protect, updateApplication)
  .delete(protect, deleteApplication);

module.exports = router; 