const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth'); // Import protect

// Public Routes
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// Private Routes
router.get('/profile', protect, authController.getUserProfile);

module.exports = router;
