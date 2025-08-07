const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hr: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HR',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  images: [{
    type: String
  }],
  videos: [{
    type: String
  }],
  audios: [{
    type: String
  }],
  pdf: {
    type: String
  },
  perpetratorName: {
    type: String,
    required: true
  },
  perpetratorDetails: {
    type: String,
    required: true
  },
  incidentDate: {
    type: Date,
    required: true
  },
  incidentLocation: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved', 'reported_to_ngo', 'flagged'],
    default: 'pending'
  },
  isFlagged: {
    type: Boolean,
    default: false
  },
  flagReason: {
    type: String
  },
  ngoReportDetails: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);