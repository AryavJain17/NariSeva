const User = require('../models/User');
const HR = require('../models/HR');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address, role, organization, position, department, isNGO } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
    address,
    role
  });

  if (user && (role === 'hr' || role === 'admin')) {
    await HR.create({
      user: user._id,
      organization,
      position,
      department,
      isNGO
    });
  }

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
    try {
      // More detailed validation
      if (!req.user) {
        console.error('No user object in request');
        return res.status(401).json({ 
          message: 'Not authorized, no user object found',
          receivedHeaders: req.headers // For debugging
        });
      }
  
      const user = await User.findById(req.user._id).select('-password');
      
      if (!user) {
        console.error('User not found in database despite valid token');
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt
      });
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

// Generate JWT
// Generate JWT
const generateToken = (id) => {
    if (!id) {
      throw new Error('Cannot generate token - no user ID provided');
    }
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });
  };

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};