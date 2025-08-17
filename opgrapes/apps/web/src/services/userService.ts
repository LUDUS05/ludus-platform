import { getAuthToken } from '@/utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'user' | 'vendor' | 'admin';
  isActive: boolean;
  isVerified: boolean;
  profile?: {
    avatar?: string;
    bio?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    interests?: string[];
    emergencyContact?: {
      name: string;
      relationship: string;
      phone: string;
      email?: string;
    };
  };
  preferences?: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'friends' | 'private';
      showEmail: boolean;
      showPhone: boolean;
    };
    language: string;
    timezone: string;
  };
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'user' | 'vendor' | 'admin';
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profile?: {
    avatar?: string;
    bio?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    interests?: string[];
    emergencyContact?: {
      name: string;
      relationship: string;
      phone: string;
      email?: string;
    };
  };
  preferences?: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'friends' | 'private';
      showEmail: boolean;
      showPhone: boolean;
    };
    language?: string;
    timezone?: string;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  newUsersThisMonth: number;
  userGrowth: Array<{
    _id: string;
    count: number;
  }>;
  roleDistribution: Array<{
    _id: string;
    count: number;
  }>;
}

class UserService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/users${endpoint}`, {
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

  // Get current user profile
  async getMyProfile(): Promise<{ user: User }> {
    return this.makeRequest('/profile');
  }

  // Update current user profile
  async updateMyProfile(updates: UpdateUserRequest): Promise<{ message: string; user: User }> {
    return this.makeRequest('/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Change password
  async changePassword(passwordData: ChangePasswordRequest): Promise<{ message: string }> {
    return this.makeRequest('/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  // Upload avatar
  async uploadAvatar(file: File): Promise<{ message: string; avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_BASE_URL}/api/users/profile/avatar`, {
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

  // Get user by ID (admin only)
  async getUser(id: string): Promise<{ user: User }> {
    return this.makeRequest(`/${id}`);
  }

  // Get all users (admin only)
  async getUsers(filters: UserFilters = {}): Promise<UsersResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    return this.makeRequest(`?${searchParams.toString()}`);
  }

  // Create new user (admin only)
  async createUser(userData: CreateUserRequest): Promise<{ message: string; user: User }> {
    return this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Update user (admin only)
  async updateUser(id: string, updates: UpdateUserRequest): Promise<{ message: string; user: User }> {
    return this.makeRequest(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Deactivate user (admin only)
  async deactivateUser(id: string): Promise<{ message: string }> {
    return this.makeRequest(`/${id}`, {
      method: 'DELETE',
    });
  }

  // Reactivate user (admin only)
  async reactivateUser(id: string): Promise<{ message: string; user: User }> {
    return this.makeRequest(`/${id}/reactivate`, {
      method: 'PATCH',
    });
  }

  // Verify user (admin only)
  async verifyUser(id: string): Promise<{ message: string; user: User }> {
    return this.makeRequest(`/${id}/verify`, {
      method: 'PATCH',
    });
  }

  // Get user statistics (admin only)
  async getUserStats(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<UserStats> {
    return this.makeRequest(`/stats?period=${period}`);
  }

  // Search users (admin only)
  async searchUsers(query: string, filters: Omit<UserFilters, 'search'> = {}): Promise<UsersResponse> {
    return this.getUsers({ ...filters, search: query });
  }

  // Get users by role (admin only)
  async getUsersByRole(role: string, filters: Omit<UserFilters, 'role'> = {}): Promise<UsersResponse> {
    return this.getUsers({ ...filters, role });
  }

  // Get active users (admin only)
  async getActiveUsers(filters: Omit<UserFilters, 'status'> = {}): Promise<UsersResponse> {
    return this.getUsers({ ...filters, status: 'active' });
  }

  // Get verified users (admin only)
  async getVerifiedUsers(filters: Omit<UserFilters, 'status'> = {}): Promise<UsersResponse> {
    return this.getUsers({ ...filters, status: 'verified' });
  }

  // Delete user account (user can delete their own account)
  async deleteMyAccount(): Promise<{ message: string }> {
    return this.makeRequest('/profile', {
      method: 'DELETE',
    });
  }

  // Get user preferences
  async getUserPreferences(): Promise<{ preferences: User['preferences'] }> {
    return this.makeRequest('/preferences');
  }

  // Update user preferences
  async updateUserPreferences(preferences: User['preferences']): Promise<{ message: string; preferences: User['preferences'] }> {
    return this.makeRequest('/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }
}

export const userService = new UserService();
