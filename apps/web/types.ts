
export type Language = 'ar' | 'en';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string;
  role: 'user' | 'vendor' | 'admin';
}

export interface Vendor {
  _id: string;
  businessName: string;
  contactInfo: {
    email: string;
    phone: string;
    website: string;
  };
}

export interface Activity {
  _id: string;
  title: { ar: string; en: string }; // Bilingual support for UI
  description: { ar: string; en: string };
  category: string;
  subCategory?: string;
  tags: string[];
  images: string[];
  price: {
    amount: number;
    currency: string;
    discounts?: {
      type: string;
      amount: number;
      description: string;
    }[];
  };
  location: {
    type: 'Point';
    coordinates: [number, number];
    address: {
      street?: string;
      city: string;
      state?: string;
      country: string;
    };
  };
  rating: {
    average: number;
    count: number;
  };
  vendor: Vendor;
  availability: {
    nextSlot: string;
    capacity: number;
    booked: number;
  };
}

export interface Booking {
  _id: string;
  activity: Activity;
  user: string; // User ID
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  participants: number;
  totalAmount: number;
  currency: string;
}

export interface StatMetric {
  label: { ar: string; en: string };
  value: string | number;
  change: number; // percentage
  trend: 'up' | 'down' | 'neutral';
}

export interface NavItem {
  id: string;
  label: { ar: string; en: string };
  icon: any;
  path: string;
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: number;
  type?: 'text' | 'action';
}

export interface Badge {
  id: string;
  label: { ar: string; en: string };
  description: { ar: string; en: string };
  icon: string; 
  color: string;
}

export interface SocialAccount {
  platform: 'instagram' | 'tiktok' | 'snapchat' | 'twitter';
  username: string;
  url: string;
}

export interface ExtendedUserProfile extends User {
  bio: string;
  rating: {
    average: number;
    count: number;
  };
  socials: SocialAccount[];
  badges: Badge[];
  stats: {
    activitiesParticipated: number;
    friendsCount: number;
  };
}
