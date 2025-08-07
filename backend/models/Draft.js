const mongoose = require('mongoose');

const DraftSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Draft', DraftSchema);