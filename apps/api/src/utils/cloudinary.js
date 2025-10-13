/**
 * @fileoverview Cloudinary utility functions for LUDUS platform
 * 
 * This module provides utility functions for uploading and deleting images
 * from Cloudinary cloud storage service. It's used for activity images,
 * user avatars, and other media assets.
 * 
 * @version 1.0.0
 * @author LUDUS Development Team
 * @since 2025-01-13
 */

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary (will use environment variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload an image to Cloudinary
 * @param {string} imagePath - Path to the image file
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
const uploadToCloudinary = async (imagePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'ludus',
      resource_type: 'auto',
      ...options
    });
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<Object>} Deletion result
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    throw error;
  }
};

/**
 * Get Cloudinary URL for an image
 * @param {string} publicId - Public ID of the image
 * @param {Object} options - Transformation options
 * @returns {string} Image URL
 */
const getCloudinaryUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, options);
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  getCloudinaryUrl
};
