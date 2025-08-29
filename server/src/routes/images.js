const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const auth = require('../middleware/auth');

// @route   POST /api/images/upload
// @desc    Upload an image to Cloudinary
// @access  Private (requires authentication, e.g., admin)
router.post('/upload', auth, (req, res, next) => {
    const uploadMiddleware = upload.single('image');

    uploadMiddleware(req, res, function (err) {
        if (err) {
            console.error('Cloudinary upload error:', err);
            return res.status(500).json({ msg: 'Error uploading file.', error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded.' });
        }

        // File was uploaded successfully
        res.status(200).json({
            message: 'File uploaded successfully.',
            secure_url: req.file.path
        });
    });
});

module.exports = router;
