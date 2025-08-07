const Draft = require('../models/Draft');
const Complaint = require('../models/Complaint');
const HR = require('../models/HR'); // ✅ FIXED: Added missing HR model import
const asyncHandler = require('express-async-handler');

// @desc    Create or update a draft
// @route   POST /api/drafts
// @access  Private (User)
const saveDraft = asyncHandler(async (req, res) => {
  const { 
    title, 
    description, 
    isAnonymous, 
    perpetratorName, 
    perpetratorDetails, 
    incidentDate, 
    incidentLocation,
    draftId // If updating existing draft
  } = req.body;

  // Get files from request
  const images = req.files['images'] ? req.files['images'].map(file => file.path) : [];
  const videos = req.files['videos'] ? req.files['videos'].map(file => file.path) : [];
  const audios = req.files['audios'] ? req.files['audios'].map(file => file.path) : [];
  const pdf = req.files['pdf'] ? req.files['pdf'][0].path : null;

  let draft;
  
  if (draftId) {
    // Update existing draft
    draft = await Draft.findById(draftId);
    
    if (!draft) {
      res.status(404);
      throw new Error('Draft not found');
    }
    
    if (draft.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this draft');
    }
    
    draft.title = title;
    draft.description = description;
    draft.isAnonymous = isAnonymous;
    draft.perpetratorName = perpetratorName;
    draft.perpetratorDetails = perpetratorDetails;
    draft.incidentDate = incidentDate;
    draft.incidentLocation = incidentLocation;
    draft.images = images.length > 0 ? images : draft.images;
    draft.videos = videos.length > 0 ? videos : draft.videos;
    draft.audios = audios.length > 0 ? audios : draft.audios;
    draft.pdf = pdf || draft.pdf;
    draft.updatedAt = Date.now();
    
    await draft.save();
  } else {
    // Create new draft
    draft = await Draft.create({
      user: req.user._id,
      title,
      description,
      isAnonymous,
      images,
      videos,
      audios,
      pdf,
      perpetratorName,
      perpetratorDetails,
      incidentDate,
      incidentLocation
    });
  }

  res.status(201).json(draft);
});

// @desc    Get all drafts for a user
// @route   GET /api/drafts
// @access  Private (User)
const getUserDrafts = asyncHandler(async (req, res) => {
  const drafts = await Draft.find({ user: req.user._id }).sort({ updatedAt: -1 });
  res.json(drafts);
});

// @desc    Get draft by ID
// @route   GET /api/drafts/:id
// @access  Private (User)
const getDraftById = asyncHandler(async (req, res) => {
  const draft = await Draft.findById(req.params.id);
  
  if (!draft) {
    res.status(404);
    throw new Error('Draft not found');
  }
  
  if (draft.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to access this draft');
  }
  
  res.json(draft);
});

// @desc    Delete draft
// @route   DELETE /api/drafts/:id
// @access  Private (User)
const deleteDraft = asyncHandler(async (req, res) => {
  const draft = await Draft.findById(req.params.id);
  
  if (!draft) {
    res.status(404);
    throw new Error('Draft not found');
  }
  
  if (draft.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this draft');
  }
  
  await draft.remove();
  res.json({ message: 'Draft removed' });
});

// @desc    Submit draft as complaint
// @route   POST /api/drafts/:id/submit
// @access  Private (User)
const submitDraft = asyncHandler(async (req, res) => {
  const { hrId } = req.body;
  
  const draft = await Draft.findById(req.params.id);
  
  if (!draft) {
    res.status(404);
    throw new Error('Draft not found');
  }
  
  if (draft.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to submit this draft');
  }
  
  // Check if HR exists
  const hr = await HR.findById(hrId);
  if (!hr) {
    res.status(404);
    throw new Error('HR/NGO not found');
  }
  
  // Create complaint from draft
  const complaint = await Complaint.create({
    user: req.user._id,
    hr: hrId,
    title: draft.title,
    description: draft.description,
    isAnonymous: draft.isAnonymous,
    images: draft.images,
    videos: draft.videos,
    audios: draft.audios,
    pdf: draft.pdf,
    perpetratorName: draft.perpetratorName,
    perpetratorDetails: draft.perpetratorDetails,
    incidentDate: draft.incidentDate,
    incidentLocation: draft.incidentLocation
  });
  
  // Delete the draft
  await draft.remove();
  
  res.status(201).json(complaint);
});

module.exports = {
  saveDraft,
  getUserDrafts,
  getDraftById,
  deleteDraft,
  submitDraft
};
