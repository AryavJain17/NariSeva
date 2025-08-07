const express = require('express');
const router = express.Router();
const { protect, hrProtect } = require('../middleware/auth');
const complaintController = require('../controllers/complaintController');
const upload = require('../config/multer');

// POST: Create a new complaint (User only)
router.post(
  '/',
  protect,
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'videos', maxCount: 3 },
    { name: 'audios', maxCount: 3 },
    { name: 'pdf', maxCount: 1 }
  ]),
  complaintController.createComplaint
);

// GET: Get all complaints of logged-in user
router.get('/user', protect, complaintController.getUserComplaints);

// ✅ HR-specific routes (put BEFORE dynamic :id route)
router.get('/hr', protect, hrProtect, complaintController.getHRComplaints);
router.put('/:id/status', protect, hrProtect, complaintController.updateComplaintStatus);
router.put('/:id/report-to-ngo', protect, hrProtect, complaintController.reportToNGO);
router.get('/perpetrators', protect, hrProtect, complaintController.getPerpetrators);

// GET: Download file from complaint
router.get('/:id/download/:fileType/:filename', protect, complaintController.downloadFile);

// GET: Get complaint by ID (must come LAST)
router.get('/:id', protect, complaintController.getComplaintById);

module.exports = router;
