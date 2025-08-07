const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Middleware to protect routes and attach user to req
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Extract Bearer token from headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    console.error('No token provided');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (excluding password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      console.error('User not found in database');
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user;

    // Debug
    console.log('Authenticated user:', user.email);

    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
});

// Middleware for HR or Admin role
const hrProtect = asyncHandler((req, res, next) => {
  if (req.user.role !== 'hr' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized as HR' });
  }
  next();
});

// Middleware for Admin only
const adminProtect = asyncHandler((req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized as Admin' });
  }
  next();
});

module.exports = { protect, hrProtect, adminProtect };
