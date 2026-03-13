const mongoose = require('mongoose');

// Create a schema for hiring offers
const HiringOfferSchema = new mongoose.Schema({
  hr: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  offerDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  notes: {
    type: String
  }
}, { _id: true });

// Create a schema for status changes
const StatusChangeSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'],
    required: true
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  }
}, { _id: true });

const ApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    position: {
      type: String,
      required: [true, 'Please add a position'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Please add a department'],
      trim: true,
    },
    experience: {
      type: Number,
      required: [true, 'Please add years of experience'],
    },
    skills: {
      type: [String],
      required: [true, 'Please add at least one skill'],
    },
    education: {
      degree: {
        type: String,
        required: [true, 'Please add your highest degree'],
      },
      institution: {
        type: String,
        required: [true, 'Please add your institution'],
      },
      year: {
        type: Number,
        required: [true, 'Please add your graduation year'],
      },
    },
    resumeUrl: {
      type: String,
      required: [true, 'Please upload your resume'],
    },
    coverLetter: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'],
      default: 'pending',
    },
    hrNotes: {
      type: String,
    },
    hrRating: {
      type: Number,
      min: 0,
      max: 5,
    },
    hiredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    statusUpdatedAt: {
      type: Date,
      default: Date.now
    },
    // Add hiring offers array to track multiple offers
    hiringOffers: [HiringOfferSchema],
    // Add status changes array to track status changes by HR
    statusChanges: [StatusChangeSchema]
  },
  {
    timestamps: true,
  }
);

// Create index for searching
ApplicationSchema.index({ position: 'text', department: 'text', skills: 'text' });

module.exports = mongoose.model('Application', ApplicationSchema); 