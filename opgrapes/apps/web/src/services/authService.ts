import { getAuthToken, setAuthToken, removeAuthToken } from '@/utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'user' | 'vendor' | 'admin';
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface AuthResponse {
  message: string;
  user: {
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
    };
    createdAt: string;
  };
  token: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export interface LogoutResponse {
  message: string;
}

export interface UserProfile {
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

class AuthService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // User login
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store tokens in localStorage
    if (response.token) {
      setAuthToken(response.token);
    }

    return response;
  }

  // User registration
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Store tokens in localStorage
    if (response.token) {
      setAuthToken(response.token);
    }

    return response;
  }

  // User logout
  async logout(): Promise<LogoutResponse> {
    const token = getAuthToken();
    
    if (token) {
      try {
        await this.makeRequest('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        // Continue with logout even if API call fails
        console.warn('Logout API call failed, continuing with local logout:', error);
      }
    }

    // Remove tokens from localStorage
    removeAuthToken();

    return { message: 'Logged out successfully' };
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await this.makeRequest('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    // Update stored token
    if (response.token) {
      setAuthToken(response.token);
    }

    return response;
  }

  // Forgot password
  async forgotPassword(emailData: ForgotPasswordRequest): Promise<{ message: string }> {
    return this.makeRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  // Reset password
  async resetPassword(resetData: ResetPasswordRequest): Promise<{ message: string }> {
    return this.makeRequest('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(resetData),
    });
  }

  // Verify email
  async verifyEmail(verifyData: VerifyEmailRequest): Promise<{ message: string }> {
    return this.makeRequest('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(verifyData),
    });
  }

  // Get current user profile
  async getCurrentUser(): Promise<{ user: UserProfile }> {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = getAuthToken();
      if (!token) return false;

      await this.getCurrentUser();
      return true;
    } catch {
      // Token is invalid or expired
      removeAuthToken();
      return false;
    }
  }

  // Check if user has specific role
  async hasRole(role: 'user' | 'vendor' | 'admin'): Promise<boolean> {
    try {
      const { user } = await this.getCurrentUser();
      return user.role === role;
    } catch {
      return false;
    }
  }

  // Check if user is vendor
  async isVendor(): Promise<boolean> {
    return this.hasRole('vendor');
  }

  // Check if user is admin
  async isAdmin(): Promise<boolean> {
    return this.hasRole('admin');
  }

  // Get user permissions
  async getUserPermissions(): Promise<{
    canCreateActivities: boolean;
    canManageVendors: boolean;
    canManageUsers: boolean;
    canViewAnalytics: boolean;
  }> {
    try {
      const { user } = await this.getCurrentUser();
      
      return {
        canCreateActivities: user.role === 'vendor' || user.role === 'admin',
        canManageVendors: user.role === 'admin',
        canManageUsers: user.role === 'admin',
        canViewAnalytics: user.role === 'vendor' || user.role === 'admin',
      };
    } catch {
      return {
        canCreateActivities: false,
        canManageVendors: false,
        canManageUsers: false,
        canViewAnalytics: false,
      };
    }
  }

  // Validate token
  async validateToken(): Promise<{ valid: boolean; user?: UserProfile }> {
    try {
      const { user } = await this.getCurrentUser();
      return { valid: true, user };
    } catch {
      return { valid: false };
    }
  }

  // Auto-refresh token if needed
  async ensureValidToken(): Promise<string | null> {
    try {
      const token = getAuthToken();
      if (!token) return null;

      // Try to get current user to validate token
      await this.getCurrentUser();
      return token;
    } catch {
      // Token is invalid, try to refresh
      try {
        // Note: This would need the refresh token to be stored separately
        // For now, we'll just return null and let the user re-authenticate
        removeAuthToken();
        return null;
      } catch {
        removeAuthToken();
        return null;
      }
    }
  }
}

export const authService = new AuthService();
