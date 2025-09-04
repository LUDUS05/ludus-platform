import api from './api';

const pagesService = {
  // Get pages by placement
  getPagesByPlacement: async (placement) => {
    try {
      const response = await api.get(`/pages/by-placement/${placement}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pages by placement:', error);
      return [];
    }
  },

  // Get all pages with placement filtering
  getPagesForMenu: async (placement) => {
    try {
      const response = await api.get(`/pages/menu/${placement}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching menu pages:', error);
      return [];
    }
  },

  // Get page by slug
  getPageBySlug: async (slug) => {
    try {
      const response = await api.get(`/pages/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching page by slug:', error);
      throw error;
    }
  },

  // Get page by URL
  getPageByUrl: async (url) => {
    try {
      const response = await api.get(`/pages/by-url${url}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching page by URL:', error);
      throw error;
    }
  }
};

export default pagesService;