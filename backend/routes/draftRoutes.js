const express = require('express');
const router = express.Router();
const draftController = require('../controllers/draftController');
const { protect } = require('../middleware/auth');
const upload = require('../config/multer');

router.post('/', protect, upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 3 },
  { name: 'audios', maxCount: 3 },
  { name: 'pdf', maxCount: 1 }
]), draftController.saveDraft);

router.get('/', protect, draftController.getUserDrafts);
router.get('/:id', protect, draftController.getDraftById);
router.delete('/:id', protect, draftController.deleteDraft);
router.post('/:id/submit', protect, draftController.submitDraft);

module.exports = router;