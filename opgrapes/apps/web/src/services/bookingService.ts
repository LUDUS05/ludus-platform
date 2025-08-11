import { getAuthToken } from '@/utils/auth';

export interface Participant {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  age?: number;
  specialRequirements?: string;
}

export interface CreateBookingRequest {
  activityId: string;
  participants: Participant[];
  date: string;
  timeSlot?: string;
  specialRequests?: string;
  groupSize: number;
  totalAmount: number;
  paymentMethod?: 'credit_card' | 'debit_card' | 'paypal' | 'stripe';
}

export interface Booking {
  _id: string;
  activityId: {
    _id: string;
    title: string;
    vendorId: {
      _id: string;
      businessName: string;
      contactInfo: any;
      location: any;
    };
    pricing: any;
    images: string[];
    availability: any;
  };
  participants: Participant[];
  date: string;
  timeSlot?: string;
  specialRequests?: string;
  groupSize: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface BookingStats {
  totalBookings: number;
  totalSpent: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class BookingService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/bookings${endpoint}`, {
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

  async createBooking(bookingData: CreateBookingRequest): Promise<{ message: string; booking: Booking }> {
    return this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getMyBookings(status?: string, page: number = 1, limit: number = 10): Promise<{
    bookings: Booking[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    return this.makeRequest(`/my-bookings?${params.toString()}`);
  }

  async getBooking(id: string): Promise<{ booking: Booking }> {
    return this.makeRequest(`/${id}`);
  }

  async updateBooking(id: string, updates: Partial<CreateBookingRequest>): Promise<{ message: string; booking: Booking }> {
    return this.makeRequest(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async cancelBooking(id: string): Promise<{ message: string; booking: Booking }> {
    return this.makeRequest(`/${id}/cancel`, {
      method: 'PATCH',
    });
  }

  async confirmBooking(id: string): Promise<{ message: string; booking: Booking }> {
    return this.makeRequest(`/${id}/confirm`, {
      method: 'PATCH',
    });
  }

  async completeBooking(id: string): Promise<{ message: string; booking: Booking }> {
    return this.makeRequest(`/${id}/complete`, {
      method: 'PATCH',
    });
  }

  async getBookingStats(): Promise<{ stats: BookingStats }> {
    return this.makeRequest('/stats/overview');
  }
}

export const bookingService = new BookingService();
