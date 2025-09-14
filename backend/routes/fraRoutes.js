const express = require('express');
const multer = require('multer');
const path = require('path');
const FRAController = require('../controllers/fraController');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'fra-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, JPEG, and PNG files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

// Routes

// Process document and get extracted data (without saving to DB)
router.post('/process', optionalAuth, upload.single('file'), FRAController.processDocument);

// Save processed document to database
router.post('/save', optionalAuth, FRAController.saveDocument);

// Upload and process FRA document (old endpoint - kept for compatibility)
router.post('/upload', optionalAuth, upload.single('file'), FRAController.uploadDocument);

// Get all FRA documents with filters (optional auth)
router.get('/fra-docs', optionalAuth, FRAController.getDocuments);

// Get statistics (public)
router.get('/fra-docs/statistics', FRAController.getStatistics);

// Get single FRA document (optional auth)
router.get('/fra-docs/:id', optionalAuth, FRAController.getDocumentById);

// Update FRA document (auth required)
router.put('/fra-docs/:id', authMiddleware, FRAController.updateDocument);

// Delete FRA document (auth required, admin only)
router.delete('/fra-docs/:id', authMiddleware, FRAController.deleteDocument);

// Reprocess document (auth required)
router.post('/fra-docs/:id/reprocess', authMiddleware, FRAController.reprocessDocument);

module.exports = router;