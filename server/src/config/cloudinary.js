const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer to use Cloudinary for storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ludus-platform', // A folder in Cloudinary to store images
    format: async (req, file) => 'png', // Forces files to be stored in png format
    public_id: (req, file) => {
      // Create a unique public_id
      const originalName = file.originalname.split('.').slice(0, -1).join('.');
      return `${originalName}-${Date.now()}`;
    },
  },
});

const upload = multer({ storage: storage });

module.exports = {
  cloudinary,
  upload,
};
