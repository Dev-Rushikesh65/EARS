const Application = require('../models/Application');
const User = require('../models/User');

// @desc    Create new application
// @route   POST /api/applications
// @access  Private (Applicants only)
exports.createApplication = async (req, res) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    // Check if user has already applied for this position
    const existingApplication = await Application.findOne({
      user: req.user.id,
      position: req.body.position,
      department: req.body.department,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this position',
      });
    }

    // Create application
    const application = await Application.create(req.body);

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private (HR and Admin only)
exports.getApplications = async (req, res) => {
  try {
    // For HR and admin, get all applications
    let applications;
    
    if (req.user.role === 'hr' || req.user.role === 'admin') {
      applications = await Application.find()
        .populate({
          path: 'user',
          select: 'name email',
        })
        .populate({
          path: 'hiredBy',
          select: 'name email role',
        });
    } else {
      // For applicants, get only their applications
      applications = await Application.find({ user: req.user.id })
        .populate({
          path: 'user',
          select: 'name email',
        })
        .populate({
          path: 'hiredBy',
          select: 'name email role',
        });
    }

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error('Error getting applications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name email',
      })
      .populate({
        path: 'hiredBy',
        select: 'name email role department position',
      })
      .populate({
        path: 'hiringOffers.hr',
        select: 'name email role department position',
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: `Application not found with id of ${req.params.id}`,
      });
    }

    // Make sure user is application owner or HR/admin
    if (
      application.user._id.toString() !== req.user.id &&
      req.user.role !== 'hr' &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to access this application`,
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error('Error getting application:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update application
// @route   PUT /api/applications/:id
// @access  Private
exports.updateApplication = async (req, res) => {
  try {
    let application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: `Application not found with id of ${req.params.id}`,
      });
    }

    // Make sure user is application owner or HR/admin
    if (
      application.user.toString() !== req.user.id &&
      req.user.role !== 'hr' &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this application`,
      });
    }

    // If user is applicant, they can only update certain fields
    if (req.user.role === 'applicant') {
      // Only allow applicants to update these fields
      const allowedFields = [
        'position',
        'department',
        'experience',
        'skills',
        'education',
        'coverLetter',
      ];

      // Filter out fields that are not allowed
      Object.keys(req.body).forEach((key) => {
        if (!allowedFields.includes(key)) {
          delete req.body[key];
        }
      });
    }

    application = await Application.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: `Application not found with id of ${req.params.id}`,
      });
    }

    // Make sure user is application owner or admin
    if (
      application.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this application`,
      });
    }

    // Use findByIdAndDelete instead of remove()
    await Application.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get applications for current user
// @route   GET /api/applications/me
// @access  Private
exports.getUserApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user.id })
      .populate({
        path: 'user',
        select: 'name email',
      })
      .populate({
        path: 'hiredBy',
        select: 'name email role department position',
      })
      .populate({
        path: 'hiringOffers.hr',
        select: 'name email role department position',
      });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error('Error getting user applications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
}; 