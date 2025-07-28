/**
 * LUDUS Platform - Unsplash Service
 * Professional image service for activities and content
 */

class UnsplashService {
  constructor(accessKey, secretKey) {
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.baseURL = 'https://api.unsplash.com';
    
    // Category mapping for LUDUS activities
    this.categoryMap = {
      sports: 'sports,fitness,outdoor,activity,exercise,athletic',
      music: 'music,concert,instrument,performance,band,musician',
      art: 'art,creative,painting,gallery,artwork,design',
      food: 'food,restaurant,cooking,dining,culinary,chef',
      technology: 'technology,coding,computer,innovation,digital',
      travel: 'travel,adventure,explore,journey,destination',
      wellness: 'wellness,yoga,meditation,health,spa,mindfulness',
      business: 'business,meeting,office,professional,corporate',
      education: 'education,learning,study,school,training',
      entertainment: 'entertainment,fun,gaming,cinema,theatre'
    };
  }

  // Get category-specific images for activities
  async getActivityImages(category, count = 20, orientation = 'landscape') {
    const query = this.categoryMap[category] || category;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const response = await fetch(
          `${this.baseURL}/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=${orientation}&client_id=${this.accessKey}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        return data.results.map(photo => ({
          id: photo.id,
          urls: {
            thumb: photo.urls.thumb,
            small: photo.urls.small,
            regular: photo.urls.regular,
            full: photo.urls.full
          },
          alt: photo.alt_description || photo.description || `${category} activity`,
          blurHash: photo.blur_hash,
          color: photo.color,
          width: photo.width,
          height: photo.height,
          user: {
            name: photo.user.name,
            username: photo.user.username,
            profileUrl: photo.user.links.html
          },
          downloadUrl: photo.links.download_location,
          unsplashUrl: photo.links.html
        }));
      } catch (error) {
        console.error(`Unsplash API error (attempt ${retryCount + 1}):`, error);
        retryCount++;
        
        if (retryCount >= maxRetries) {
          // Return empty array on final failure
          console.warn(`Failed to fetch ${category} images after ${maxRetries} attempts`);
          return [];
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
  }

  // Get specific image by ID
  async getImageById(imageId) {
    try {
      const response = await fetch(
        `${this.baseURL}/photos/${imageId}?client_id=${this.accessKey}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        id: data.id,
        urls: data.urls,
        alt: data.alt_description || data.description,
        blurHash: data.blur_hash,
        color: data.color,
        width: data.width,
        height: data.height,
        user: data.user,
        downloadUrl: data.links.download_location
      };
    } catch (error) {
      console.error('Error fetching image by ID:', error);
      return null;
    }
  }

  // Search images with specific keywords
  async searchImages(query, options = {}) {
    const {
      page = 1,
      perPage = 20,
      orientation = 'landscape',
      color = null,
      orderBy = 'relevant'
    } = options;

    const params = new URLSearchParams({
      query: query,
      page: page.toString(),
      per_page: perPage.toString(),
      orientation,
      order_by: orderBy,
      client_id: this.accessKey
    });

    if (color) params.append('color', color);

    try {
      const response = await fetch(`${this.baseURL}/search/photos?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        results: data.results,
        total: data.total,
        totalPages: data.total_pages
      };
    } catch (error) {
      console.error('Search error:', error);
      return { results: [], total: 0, totalPages: 0 };
    }
  }

  // Track download for Unsplash API requirements
  async trackDownload(downloadUrl) {
    if (!downloadUrl) return;
    
    try {
      await fetch(`${downloadUrl}?client_id=${this.accessKey}`);
    } catch (error) {
      console.error('Download tracking error:', error);
    }
  }

  // Generate optimized URL for specific dimensions
  getOptimizedUrl(imageUrl, width, height, quality = 80) {
    if (!imageUrl) return '';
    
    const url = new URL(imageUrl);
    url.searchParams.set('w', width.toString());
    url.searchParams.set('h', height.toString());
    url.searchParams.set('q', quality.toString());
    url.searchParams.set('fit', 'crop');
    url.searchParams.set('crop', 'faces,center');
    
    return url.toString();
  }

  // Get random image from category (optimized for single requests)
  async getRandomCategoryImage(category, options = {}) {
    const { width = 800, height = 600, orientation = 'landscape' } = options;
    
    try {
      const images = await this.getActivityImages(category, 1, orientation);
      
      if (images.length > 0) {
        const image = images[0];
        return {
          ...image,
          optimizedUrl: this.getOptimizedUrl(image.urls.regular, width, height)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting random category image:', error);
      return null;
    }
  }

  // Prefetch images for better performance
  async prefetchImages(imageUrls) {
    const promises = imageUrls.map(url => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
    });
    
    return Promise.all(promises);
  }

  // Get available categories
  getAvailableCategories() {
    return Object.keys(this.categoryMap);
  }

  // Check if category is supported
  isCategorySupported(category) {
    return category in this.categoryMap;
  }
}

// Initialize service with LUDUS credentials
const accessKey = process.env.REACT_APP_UNSPLASH_ACCESS_KEY || 'T4QQB3TTgpU4fhw_-JzAaTaO6X4IAgkckPrkwXDjRw0';
const secretKey = process.env.REACT_APP_UNSPLASH_SECRET_KEY || 'HJDa9-_B3y0-giWPwJ6oOLtIdhq7UHdRugLGSSf8f6A';

export const unsplashService = new UnsplashService(accessKey, secretKey);
export default UnsplashService;