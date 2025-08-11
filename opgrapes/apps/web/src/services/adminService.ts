import { getAuthToken } from '@/utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Types
export interface DashboardOverview {
  totalUsers: number;
  totalActivities: number;
  totalVendors: number;
  totalBookings: number;
  pendingVendors: number;
  pendingActivities: number;
  totalRevenue: number;
  avgBookingValue: number;
}

export interface RecentUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export interface RecentBooking {
  _id: string;
  activityId: {
    _id: string;
    title: string;
  };
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface DashboardData {
  overview: DashboardOverview;
  recentUsers: RecentUser[];
  recentBookings: RecentBooking[];
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'user' | 'vendor' | 'admin';
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Activity {
  _id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  vendorId: {
    _id: string;
    businessName: string;
    email: string;
  };
  createdAt: string;
}

export interface Vendor {
  _id: string;
  businessName: string;
  status: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface UsersResponse {
  users: User[];
  pagination: PaginationData;
}

export interface ActivitiesResponse {
  activities: Activity[];
  pagination: PaginationData;
}

export interface VendorsResponse {
  vendors: Vendor[];
  pagination: PaginationData;
}

export interface UserAnalytics {
  newUsers: number;
  userGrowth: Array<{
    _id: string;
    count: number;
  }>;
  roleDistribution: Array<{
    _id: string;
    count: number;
  }>;
}

export interface BookingAnalytics {
  totalBookings: number;
  revenue: number;
  statusDistribution: Array<{
    _id: string;
    count: number;
  }>;
  dailyBookings: Array<{
    _id: string;
    count: number;
    revenue: number;
  }>;
}

class AdminService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/admin${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Dashboard Overview
  async getDashboardOverview(): Promise<DashboardData> {
    return this.makeRequest('/dashboard/overview');
  }

  // User Management
  async getUsers(params: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
    status?: string;
  } = {}): Promise<UsersResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.role) searchParams.append('role', params.role);
    if (params.search) searchParams.append('search', params.search);
    if (params.status) searchParams.append('status', params.status);

    return this.makeRequest(`/users?${searchParams.toString()}`);
  }

  async getUser(id: string): Promise<{ user: User }> {
    return this.makeRequest(`/users/${id}`);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<{ message: string; user: User }> {
    return this.makeRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deactivateUser(id: string): Promise<{ message: string }> {
    return this.makeRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Activity Moderation
  async getActivities(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}): Promise<ActivitiesResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.status) searchParams.append('status', params.status);
    if (params.search) searchParams.append('search', params.search);

    return this.makeRequest(`/activities?${searchParams.toString()}`);
  }

  async updateActivity(id: string, updates: {
    status?: 'pending' | 'approved' | 'rejected';
    isActive?: boolean;
    moderationNotes?: string;
  }): Promise<{ message: string; activity: Activity }> {
    return this.makeRequest(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Vendor Management
  async getVendors(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}): Promise<VendorsResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.status) searchParams.append('status', params.status);
    if (params.search) searchParams.append('search', params.search);

    return this.makeRequest(`/vendors?${searchParams.toString()}`);
  }

  async updateVendor(id: string, updates: {
    status?: 'pending' | 'approved' | 'rejected';
    isActive?: boolean;
    verificationNotes?: string;
  }): Promise<{ message: string; vendor: Vendor }> {
    return this.makeRequest(`/vendors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Analytics
  async getUserAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<UserAnalytics> {
    return this.makeRequest(`/analytics/users?period=${period}`);
  }

  async getBookingAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<BookingAnalytics> {
    return this.makeRequest(`/analytics/bookings?period=${period}`);
  }
}

export const adminService = new AdminService();
