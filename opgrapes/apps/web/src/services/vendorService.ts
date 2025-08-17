import { getAuthToken } from '@/utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Types
export interface Vendor {
  _id: string;
  businessName: string;
  description: string;
  businessType: 'individual' | 'company' | 'nonprofit';
  contactInfo: {
    phone: string;
    website?: string;
    email: string;
  };
  location: {
    coordinates: [number, number];
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  specialties: string[];
  certifications?: string[];
  insurance: boolean;
  yearsInBusiness?: number;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  isActive: boolean;
  isVerified: boolean;
  rating?: number;
  reviewCount?: number;
  totalActivities?: number;
  logo?: string;
  banner?: string;
  businessHours?: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  policies?: {
    cancellation: string;
    insurance: string;
    equipment: string;
    groupSize: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorRequest {
  businessName: string;
  description: string;
  businessType: 'individual' | 'company' | 'nonprofit';
  contactInfo: {
    phone: string;
    website?: string;
    email: string;
  };
  location: {
    coordinates: [number, number];
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  specialties: string[];
  certifications?: string[];
  insurance: boolean;
  yearsInBusiness?: number;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export interface UpdateVendorRequest extends Partial<CreateVendorRequest> {
  businessHours?: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  policies?: {
    cancellation: string;
    insurance: string;
    equipment: string;
    groupSize: string;
  };
  logo?: string;
  banner?: string;
}

export interface VendorFilters {
  page?: number;
  limit?: number;
  city?: string;
  specialty?: string;
  verified?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface VendorsResponse {
  vendors: Vendor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface VendorStats {
  totalActivities: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  monthlyGrowth: number;
  customerSatisfaction: number;
}

export interface VendorDashboardData {
  overview: VendorStats;
  recentActivity: Array<{
    id: string;
    type: 'booking' | 'review' | 'activity';
    title: string;
    description: string;
    timestamp: string;
    status: string;
  }>;
  topActivities: Array<{
    id: string;
    title: string;
    bookings: number;
    revenue: number;
    rating: number;
    growth: number;
  }>;
}

class VendorService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/vendors${endpoint}`, {
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

  // Get all vendors with filtering and search
  async getVendors(filters: VendorFilters = {}): Promise<VendorsResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    return this.makeRequest(`?${searchParams.toString()}`);
  }

  // Get vendor by ID
  async getVendor(id: string): Promise<{ vendor: Vendor }> {
    return this.makeRequest(`/${id}`);
  }

  // Get current vendor profile (authenticated vendor)
  async getMyVendorProfile(): Promise<{ vendor: Vendor }> {
    return this.makeRequest('/profile');
  }

  // Create new vendor profile
  async createVendorProfile(vendorData: CreateVendorRequest): Promise<{ message: string; vendor: Vendor }> {
    return this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify(vendorData),
    });
  }

  // Update vendor profile
  async updateVendorProfile(updates: UpdateVendorRequest): Promise<{ message: string; vendor: Vendor }> {
    return this.makeRequest('/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Update vendor profile (admin only)
  async updateVendor(id: string, updates: {
    status?: 'pending' | 'approved' | 'rejected';
    isActive?: boolean;
    verificationNotes?: string;
  }): Promise<{ message: string; vendor: Vendor }> {
    return this.makeRequest(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Upload vendor logo
  async uploadLogo(file: File): Promise<{ message: string; logoUrl: string }> {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await fetch(`${API_BASE_URL}/api/vendors/profile/logo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Upload vendor banner
  async uploadBanner(file: File): Promise<{ message: string; bannerUrl: string }> {
    const formData = new FormData();
    formData.append('banner', file);

    const response = await fetch(`${API_BASE_URL}/api/vendors/profile/banner`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get vendor dashboard data
  async getVendorDashboard(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<VendorDashboardData> {
    return this.makeRequest(`/dashboard?period=${period}`);
  }

  // Get vendor statistics
  async getVendorStats(): Promise<{ stats: VendorStats }> {
    return this.makeRequest('/stats');
  }

  // Search vendors
  async searchVendors(query: string, filters: Omit<VendorFilters, 'search'> = {}): Promise<VendorsResponse> {
    return this.getVendors({ ...filters, search: query });
  }

  // Get vendors by location
  async getVendorsByLocation(city: string, filters: Omit<VendorFilters, 'city'> = {}): Promise<VendorsResponse> {
    return this.getVendors({ ...filters, city });
  }

  // Get vendors by specialty
  async getVendorsBySpecialty(specialty: string, filters: Omit<VendorFilters, 'specialty'> = {}): Promise<VendorsResponse> {
    return this.getVendors({ ...filters, specialty });
  }

  // Get verified vendors only
  async getVerifiedVendors(filters: Omit<VendorFilters, 'verified'> = {}): Promise<VendorsResponse> {
    return this.getVendors({ ...filters, verified: true });
  }

  // Get vendor specialties
  async getSpecialties(): Promise<{ specialties: string[] }> {
    return this.makeRequest('/specialties');
  }

  // Get vendor categories
  async getCategories(): Promise<{ categories: string[] }> {
    return this.makeRequest('/categories');
  }
}

export const vendorService = new VendorService();
