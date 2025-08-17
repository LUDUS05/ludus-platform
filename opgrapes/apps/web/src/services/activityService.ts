import { getAuthToken } from '@/utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Types
export interface Activity {
  _id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  vendorId: {
    _id: string;
    businessName: string;
    contactInfo: any;
    location: any;
  };
  location: {
    coordinates: [number, number];
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  pricing: {
    basePrice: number;
    currency: string;
    perPerson: boolean;
    groupDiscounts?: Array<{
      minPeople: number;
      discountPercentage: number;
    }>;
    additionalFees?: Array<{
      name: string;
      amount: number;
      description?: string;
    }>;
  };
  availability: {
    startDate: string;
    endDate?: string;
    recurring: boolean;
    recurringPattern?: {
      daysOfWeek?: number[];
      interval?: number;
    };
    maxCapacity: number;
    minCapacity: number;
    timeSlots?: Array<{
      startTime: string;
      endTime: string;
      maxBookings: number;
    }>;
  };
  requirements?: {
    minAge?: number;
    maxAge?: number;
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
    equipment?: string[];
    physicalRequirements?: string[];
    certifications?: string[];
  };
  images: string[];
  tags?: string[];
  isActive: boolean;
  rating?: number;
  reviewCount?: number;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityRequest {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  vendorId: string;
  location: {
    coordinates: [number, number];
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  pricing: {
    basePrice: number;
    currency: string;
    perPerson: boolean;
    groupDiscounts?: Array<{
      minPeople: number;
      discountPercentage: number;
    }>;
    additionalFees?: Array<{
      name: string;
      amount: number;
      description?: string;
    }>;
  };
  availability: {
    startDate: string;
    endDate?: string;
    recurring: boolean;
    recurringPattern?: {
      daysOfWeek?: number[];
      interval?: number;
    };
    maxCapacity: number;
    minCapacity: number;
    timeSlots?: Array<{
      startTime: string;
      endTime: string;
      maxBookings: number;
    }>;
  };
  requirements?: {
    minAge?: number;
    maxAge?: number;
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
    equipment?: string[];
    physicalRequirements?: string[];
    certifications?: string[];
  };
  images: string[];
  tags?: string[];
}

export interface UpdateActivityRequest extends Partial<CreateActivityRequest> {
  isActive?: boolean;
}

export interface ActivityFilters {
  page?: number;
  limit?: number;
  category?: string;
  city?: string;
  priceMin?: number;
  priceMax?: number;
  date?: string;
  search?: string;
  skillLevel?: string;
  minAge?: number;
  maxAge?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ActivitiesResponse {
  activities: Activity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface VendorActivity {
  _id: string;
  title: string;
  description: string;
  category: string;
  pricing: {
    basePrice: number;
    currency: string;
  };
  location: {
    city: string;
    state: string;
  };
  rating?: number;
  reviewCount?: number;
  status: 'draft' | 'active' | 'paused' | 'archived';
  featured: boolean;
  createdAt: string;
}

class ActivityService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/activities${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get all activities with filtering and search
  async getActivities(filters: ActivityFilters = {}): Promise<ActivitiesResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    return this.makeRequest(`?${searchParams.toString()}`);
  }

  // Get activity by ID
  async getActivity(id: string): Promise<{ activity: Activity }> {
    return this.makeRequest(`/${id}`);
  }

  // Create new activity (vendor only)
  async createActivity(activityData: CreateActivityRequest): Promise<{ message: string; activity: Activity }> {
    return this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  }

  // Update activity (vendor only)
  async updateActivity(id: string, updates: UpdateActivityRequest): Promise<{ message: string; activity: Activity }> {
    return this.makeRequest(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Delete activity (vendor only)
  async deleteActivity(id: string): Promise<{ message: string }> {
    return this.makeRequest(`/${id}`, {
      method: 'DELETE',
    });
  }

  // Get vendor's activities
  async getVendorActivities(vendorId: string, filters: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}): Promise<{
    activities: VendorActivity[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    searchParams.append('vendorId', vendorId);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    return this.makeRequest(`/vendor?${searchParams.toString()}`);
  }

  // Toggle activity status
  async toggleActivityStatus(id: string, isActive: boolean): Promise<{ message: string; activity: Activity }> {
    return this.makeRequest(`/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  // Feature/unfeature activity
  async toggleFeatured(id: string, featured: boolean): Promise<{ message: string; activity: Activity }> {
    return this.makeRequest(`/${id}/feature`, {
      method: 'PATCH',
      body: JSON.stringify({ featured }),
    });
  }

  // Get activity categories
  async getCategories(): Promise<{ categories: string[] }> {
    return this.makeRequest('/categories');
  }

  // Search activities
  async searchActivities(query: string, filters: Omit<ActivityFilters, 'search'> = {}): Promise<ActivitiesResponse> {
    return this.getActivities({ ...filters, search: query });
  }

  // Get featured activities
  async getFeaturedActivities(limit: number = 6): Promise<{ activities: Activity[] }> {
    return this.makeRequest(`/featured?limit=${limit}`);
  }

  // Get activities by category
  async getActivitiesByCategory(category: string, filters: Omit<ActivityFilters, 'category'> = {}): Promise<ActivitiesResponse> {
    return this.getActivities({ ...filters, category });
  }

  // Get activities by location
  async getActivitiesByLocation(city: string, filters: Omit<ActivityFilters, 'city'> = {}): Promise<ActivitiesResponse> {
    return this.getActivities({ ...filters, city });
  }
}

export const activityService = new ActivityService();
