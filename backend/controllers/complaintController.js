const Complaint = require('../models/Complaint');
const User = require('../models/User');
const HR = require('../models/HR');
const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (User)
const createComplaint = asyncHandler(async (req, res) => {
    try {
      const { 
        title, 
        description, 
        isAnonymous, 
        perpetratorName, 
        perpetratorDetails, 
        incidentDate, 
        incidentLocation,
        hrId
      } = req.body;
  
      // Verify files were uploaded
      if (!req.files) {
        return res.status(400).json({ message: 'No files uploaded' });
      }
  
      // Process file paths - ensure they're relative to the uploads directory
      const processFiles = (files) => {
        if (!files) return [];
        return Array.isArray(files) 
          ? files.map(file => file.path.replace(/\\/g, '/').replace('uploads/', ''))
          : [files[0].path.replace(/\\/g, '/').replace('uploads/', '')];
      };
  
      const complaint = await Complaint.create({
        user: req.user._id,
        hr: hrId,
        title,
        description,
        isAnonymous,
        images: processFiles(req.files['images']),
        videos: processFiles(req.files['videos']),
        audios: processFiles(req.files['audios']),
        pdf: req.files['pdf'] ? req.files['pdf'][0].path.replace(/\\/g, '/').replace('uploads/', '') : null,
        perpetratorName,
        perpetratorDetails,
        incidentDate,
        incidentLocation
      });
  
      res.status(201).json(complaint);
    } catch (error) {
      console.error('Error creating complaint:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
// @desc    Get all complaints for a user
// @route   GET /api/complaints/user
// @access  Private (User)
const getUserComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ user: req.user._id })
    .populate('hr', 'organization position isNGO')
    .sort({ createdAt: -1 });

  res.json(complaints);
});

// @desc    Get all complaints for HR
// @route   GET /api/complaints/hr
// @access  Private (HR)
const getHRComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ hr: req.user._id })
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });

  res.json(complaints);
});

// @desc    Get complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('hr', 'organization position isNGO');

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  // Check if the user has access to this complaint
  if (req.user.role === 'user' && complaint.user._id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to access this complaint');
  }

  if (req.user.role === 'hr' && complaint.hr._id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to access this complaint');
  }

  res.json(complaint);
});

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private (HR)
const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  // Check if the HR has access to this complaint
  if (complaint.hr.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this complaint');
  }

  complaint.status = status;
  if (status === 'flagged') {
    complaint.isFlagged = true;
    complaint.flagReason = req.body.flagReason || '';
  }

  const updatedComplaint = await complaint.save();

  res.json(updatedComplaint);
});

// @desc    Report complaint to NGO
// @route   PUT /api/complaints/:id/report-to-ngo
// @access  Private (HR)
const reportToNGO = asyncHandler(async (req, res) => {
  const { ngoReportDetails } = req.body;

  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  // Check if the HR has access to this complaint
  if (complaint.hr.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this complaint');
  }

  complaint.status = 'reported_to_ngo';
  complaint.ngoReportDetails = ngoReportDetails;

  const updatedComplaint = await complaint.save();

  res.json(updatedComplaint);
});

// @desc    Get all perpetrators with complaint counts
// @route   GET /api/complaints/perpetrators
// @access  Private (HR)
const getPerpetrators = asyncHandler(async (req, res) => {
  const perpetrators = await Complaint.aggregate([
    {
        $match: { hr: new mongoose.Types.ObjectId(req.user._id) }

    },
    {
      $group: {
        _id: "$perpetratorName",
        count: { $sum: 1 },
        latestIncident: { $max: "$incidentDate" }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  res.json(perpetrators);
});

// @desc    Download complaint file
// @route   GET /api/complaints/:id/download/:fileType/:filename
// @access  Private
const downloadFile = asyncHandler(async (req, res) => {
    try {
      const complaint = await Complaint.findById(req.params.id);
  
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }
  
      // Authorization check
      if (req.user.role === 'user' && complaint.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to access this file' });
      }
  
      if (req.user.role === 'hr' && complaint.hr.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to access this file' });
      }
  
      let filePath;
      const fileType = req.params.fileType;
      const filename = req.params.filename;
  
      // Construct the correct file path
      const basePath = path.join(__dirname, '../uploads');
      
      if (fileType === 'image' && complaint.images.includes(filename)) {
        filePath = path.join(basePath, filename);
      } else if (fileType === 'video' && complaint.videos.includes(filename)) {
        filePath = path.join(basePath, filename);
      } else if (fileType === 'audio' && complaint.audios.includes(filename)) {
        filePath = path.join(basePath, filename);
      } else if (fileType === 'pdf' && complaint.pdf === filename) {
        filePath = path.join(basePath, filename);
      } else {
        return res.status(404).json({ message: 'File not found in complaint records' });
      }
  
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.error('File not found at path:', filePath);
        return res.status(404).json({ message: 'File not found on server' });
      }
  
      // Send the file
      res.download(filePath);
    } catch (error) {
      console.error('Error downloading file:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
module.exports = {
  createComplaint,
  getUserComplaints,
  getHRComplaints,
  getComplaintById,
  updateComplaintStatus,
  reportToNGO,
  getPerpetrators,
  downloadFile
};