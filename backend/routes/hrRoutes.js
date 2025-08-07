const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hrController');
const { protect, hrProtect, adminProtect } = require('../middleware/auth');

router.get('/', hrController.getAllHR);
router.get('/:id', hrController.getHRById);
router.put('/:id', protect, hrProtect, hrController.updateHR);

module.exports = router;