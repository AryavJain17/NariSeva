const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const complaintRoutes = require('./complaintRoutes');
const draftRoutes = require('./draftRoutes');
const hrRoutes = require('./hrRoutes');

router.use('/auth', authRoutes);
router.use('/complaints', complaintRoutes);
router.use('/drafts', draftRoutes);
router.use('/hr', hrRoutes);

module.exports = router;