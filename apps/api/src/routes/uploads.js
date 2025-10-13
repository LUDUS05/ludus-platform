const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
const vendorDocsDir = path.join(uploadsDir, 'vendor-docs');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(vendorDocsDir)) {
  fs.mkdirSync(vendorDocsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, vendorDocsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const documentType = req.body.documentType || 'unknown';
    const vendorId = req.body.vendorId || 'unknown';
    
    cb(null, `${vendorId}_${documentType}_${uniqueSuffix}${fileExtension}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, JPG, and PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Upload vendor document
router.post('/vendor-document', auth, requireRole('admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    const { documentType, vendorId } = req.body;

    if (!documentType || !vendorId) {
      return res.status(400).json({
        status: 'error',
        message: 'Document type and vendor ID are required'
      });
    }

    // Generate file URL (in production, this would be a cloud storage URL)
    const fileUrl = `/uploads/vendor-docs/${req.file.filename}`;

    res.json({
      status: 'success',
      message: 'Document uploaded successfully',
      data: {
        fileName: req.file.originalname,
        fileUrl: fileUrl,
        fileSize: req.file.size,
        uploadDate: new Date().toISOString(),
        documentType: documentType,
        vendorId: vendorId
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload document'
    });
  }
});

// Serve uploaded files (in production, use cloud storage or CDN)
router.get('/vendor-docs/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(vendorDocsDir, filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      status: 'error',
      message: 'File not found'
    });
  }

  // Serve the file
  res.sendFile(filePath);
});

// Delete uploaded file
router.delete('/vendor-document/:filename', auth, requireRole('admin'), (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(vendorDocsDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({
        status: 'success',
        message: 'Document deleted successfully'
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'File not found'
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete document'
    });
  }
});

module.exports = router;