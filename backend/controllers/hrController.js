const HR = require('../models/HR');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get all HR/NGO profiles
// @route   GET /api/hr
// @access  Public
const getAllHR = asyncHandler(async (req, res) => {
  const hrs = await HR.find().populate('user', 'name email');
  res.json(hrs);
});

// @desc    Get HR/NGO profile by ID
// @route   GET /api/hr/:id
// @access  Public
const getHRById = asyncHandler(async (req, res) => {
  const hr = await HR.findById(req.params.id).populate('user', 'name email phone address');
  
  if (!hr) {
    res.status(404);
    throw new Error('HR/NGO not found');
  }
  
  res.json(hr);
});

// @desc    Update HR/NGO profile
// @route   PUT /api/hr/:id
// @access  Private (HR/Admin)
const updateHR = asyncHandler(async (req, res) => {
  const hr = await HR.findById(req.params.id);
  
  if (!hr) {
    res.status(404);
    throw new Error('HR/NGO not found');
  }
  
  // Check if the user is authorized to update this HR profile
  if (hr.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to update this HR profile');
  }
  
  const { organization, position, department, isNGO } = req.body;
  
  hr.organization = organization || hr.organization;
  hr.position = position || hr.position;
  hr.department = department || hr.department;
  hr.isNGO = isNGO !== undefined ? isNGO : hr.isNGO;
  
  const updatedHR = await hr.save();
  
  res.json(updatedHR);
});

module.exports = {
  getAllHR,
  getHRById,
  updateHR
};