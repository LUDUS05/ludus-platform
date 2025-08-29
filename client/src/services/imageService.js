import api from './api';

export const imageService = {
  /**
   * Uploads an image file to the server.
   * @param {File} file The image file to upload.
   * @returns {Promise<{secure_url: string}>} A promise that resolves with the secure URL of the uploaded image.
   */
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error.response?.data || error.message);
      // Re-throw a more structured error
      throw new Error(error.response?.data?.msg || 'Image upload failed. Please try again.');
    }
  },
};
