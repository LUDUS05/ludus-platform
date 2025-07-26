import api from './api';

const vendorService = {
  // Get all vendors with filters
  getVendors: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/vendors?${queryParams}`);
    return response.data;
  },

  // Get vendor profile by ID or slug
  getVendorProfile: async (id) => {
    const response = await api.get(`/vendors/${id}`);
    return response.data;
  },

  // Get vendor activities
  getVendorActivities: async (id, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/vendors/${id}/activities?${queryParams}`);
    return response.data;
  },

  // Get vendor reviews
  getVendorReviews: async (id, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/vendors/${id}/reviews?${queryParams}`);
    return response.data;
  }
};

export { vendorService };