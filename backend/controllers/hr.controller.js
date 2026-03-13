const Application = require('../models/Application');

// @desc    Get sorted applications based on HR requirements
// @route   GET /api/hr/applications/sort
// @access  Private (HR only)
exports.getSortedApplications = async (req, res) => {
  try {
    const {
      skills,
      minExperience,
      department,
      position,
      education,
      status,
      minRating,
      sortBy,
      sortOrder,
    } = req.query;

    // Build query
    const query = {};

    // Filter by skills
    if (skills) {
      const skillsArray = skills.split(',').map((skill) => skill.trim());
      query.skills = { $in: skillsArray };
    }

    // Filter by minimum experience
    if (minExperience) {
      query.experience = { $gte: parseInt(minExperience) };
    }

    // Filter by department
    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }

    // Filter by position
    if (position) {
      query.position = { $regex: position, $options: 'i' };
    }

    // Filter by education
    if (education) {
      query['education.degree'] = { $regex: education, $options: 'i' };
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by minimum rating
    if (minRating) {
      query.hrRating = { $gte: parseInt(minRating) };
    }

    // Sort options
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1; // Default sort by date desc
    }

    console.log('Query:', query);
    console.log('Sort:', sort);

    // Execute query with populate
    const applications = await Application.find(query)
      .sort(sort)
      .populate({
        path: 'user',
        select: 'name email',
      })
      .populate({
        path: 'hiredBy',
        select: 'name email role',
      });

    console.log(`Found ${applications.length} applications`);

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error('Error getting sorted applications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update application status
// @route   PUT /api/hr/applications/:id/status
// @access  Private (HR only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    console.log('Updating application status:', { id: req.params.id, status, hrId: req.user.id });
    console.log('HR User details:', req.user);

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status',
      });
    }

    // Check if status is valid
    const validStatuses = [
      'pending',
      'reviewing',
      'shortlisted',
      'rejected',
      'hired',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    // First, find the application
    const currentApplication = await Application.findById(req.params.id)
      .populate({
        path: 'hiredBy',
        select: 'name email role department position',
      })
      .populate({
        path: 'hiringOffers.hr',
        select: 'name email role department position',
      })
      .populate({
        path: 'statusChanges.changedBy',
        select: 'name email role department position',
      });
      
    if (!currentApplication) {
      return res.status(404).json({
        success: false,
        message: `Application not found with id of ${req.params.id}`,
      });
    }

    // Prepare update data
    const updateData = { 
      statusUpdatedAt: Date.now()
    };
    
    // Update the global status
    updateData.status = status;
    
    // Create a new status change entry
    const newStatusChange = {
      status,
      changedBy: req.user.id,
      changedAt: Date.now(),
      notes: notes || ''
    };
    
    // Add to status changes array
    if (!currentApplication.statusChanges) {
      currentApplication.statusChanges = [];
    }
    currentApplication.statusChanges.push(newStatusChange);
    
    // If status is 'hired', add a hiring offer
    if (status === 'hired') {
      // Check if this HR has already made an offer
      const existingOffer = currentApplication.hiringOffers?.find(
        offer => offer.hr._id.toString() === req.user.id
      );

      if (existingOffer) {
        // Update existing offer
        existingOffer.offerDate = Date.now();
        existingOffer.status = 'pending';
        existingOffer.notes = notes || '';
      } else {
        // Create new offer
        const newOffer = {
          hr: req.user.id,
          offerDate: Date.now(),
          status: 'pending',
          notes: notes || ''
        };
        
        // Add to hiring offers array
        if (!currentApplication.hiringOffers) {
          currentApplication.hiringOffers = [];
        }
        currentApplication.hiringOffers.push(newOffer);
      }
      
      // Set hiredBy to the current HR
      updateData.hiredBy = req.user.id;
    }

    // Update the application
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      {
        ...updateData,
        hiringOffers: currentApplication.hiringOffers,
        statusChanges: currentApplication.statusChanges
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // Fetch the updated application with populated fields
    const populatedApplication = await Application.findById(application._id).populate([
      {
        path: 'user',
        select: 'name email',
      },
      {
        path: 'hiredBy',
        select: 'name email role department position',
      },
      {
        path: 'hiringOffers.hr',
        select: 'name email role department position',
      },
      {
        path: 'statusChanges.changedBy',
        select: 'name email role department position',
      }
    ]);

    console.log('Updated application:', populatedApplication);
    console.log('HiredBy field:', populatedApplication.hiredBy);
    console.log('Hiring offers:', populatedApplication.hiringOffers);
    console.log('Status changes:', populatedApplication.statusChanges);

    res.status(200).json({
      success: true,
      data: populatedApplication,
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Add HR notes and rating to application
// @route   PUT /api/hr/applications/:id/review
// @access  Private (HR only)
exports.reviewApplication = async (req, res) => {
  try {
    const { hrNotes, hrRating } = req.body;

    // Validate rating
    if (hrRating && (hrRating < 0 || hrRating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 0 and 5',
      });
    }

    const updateData = {};
    if (hrNotes) updateData.hrNotes = hrNotes;
    if (hrRating) updateData.hrRating = hrRating;

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: `Application not found with id of ${req.params.id}`,
      });
    }

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

// @desc    Get application statistics
// @route   GET /api/hr/stats
// @access  Private (HR only)
exports.getApplicationStats = async (req, res) => {
  try {
    // Get total applications
    const totalApplications = await Application.countDocuments();

    // Get applications by status
    const statusStats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get applications by department
    const departmentStats = await Application.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get applications by position
    const positionStats = await Application.aggregate([
      {
        $group: {
          _id: '$position',
          count: { $sum: 1 },
        },
      },
    ]);

    // Format status stats
    const formattedStatusStats = {};
    statusStats.forEach((stat) => {
      formattedStatusStats[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      data: {
        totalApplications,
        byStatus: formattedStatusStats,
        byDepartment: departmentStats,
        byPosition: positionStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Respond to hiring offer
// @route   PUT /api/hr/applications/:id/offer/:offerId
// @access  Private (Applicant only)
exports.respondToHiringOffer = async (req, res) => {
  try {
    const { response } = req.body; // 'accepted' or 'declined'
    
    if (!response || !['accepted', 'declined'].includes(response)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid response (accepted or declined)',
      });
    }
    
    // Find the application
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: `Application not found with id of ${req.params.id}`,
      });
    }
    
    // Check if user is the applicant
    if (application.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'You are not authorized to respond to this offer',
      });
    }
    
    // Find the offer
    const offerIndex = application.hiringOffers.findIndex(
      offer => offer._id.toString() === req.params.offerId
    );
    
    if (offerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Hiring offer not found',
      });
    }
    
    // Update the offer status
    application.hiringOffers[offerIndex].status = response;
    
    // If accepted, update the application status and hiredBy
    if (response === 'accepted') {
      application.status = 'hired';
      application.hiredBy = application.hiringOffers[offerIndex].hr;
      application.statusUpdatedAt = Date.now();
      
      // Mark all other offers as declined
      application.hiringOffers.forEach((offer, index) => {
        if (index !== offerIndex && offer.status === 'pending') {
          offer.status = 'declined';
        }
      });
    }
    
    await application.save();
    
    // Fetch the updated application with populated fields
    const populatedApplication = await Application.findById(application._id).populate([
      {
        path: 'user',
        select: 'name email',
      },
      {
        path: 'hiredBy',
        select: 'name email role department position',
      },
      {
        path: 'hiringOffers.hr',
        select: 'name email role department position',
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: populatedApplication,
    });
  } catch (error) {
    console.error('Error responding to hiring offer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
}; 