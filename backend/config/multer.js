const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureUploadsDir = () => {
  const dirs = [
    'uploads/images',
    'uploads/videos',
    'uploads/audio',
    'uploads/pdfs',
    'uploads/others'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

ensureUploadsDir();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = '';
    
    if (file.mimetype.startsWith('image/')) {
      uploadPath = 'uploads/images/';
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath = 'uploads/videos/';
    } else if (file.mimetype.startsWith('audio/')) {
      uploadPath = 'uploads/audio/';
    } else if (file.mimetype === 'application/pdf') {
      uploadPath = 'uploads/pdfs/';
    } else {
      uploadPath = 'uploads/others/';
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/wav', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, audio, and PDFs are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 50 // 50MB limit
  }
});

module.exports = upload;