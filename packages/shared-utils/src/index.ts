// Re-export types
export * from '@ludus/shared-types';

// Date utilities
export const formatDate = (date: Date, locale: 'ar' | 'en' = 'en'): string => {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const formatDateTime = (date: Date, locale: 'ar' | 'en' = 'en'): string => {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatTime = (date: Date, locale: 'ar' | 'en' = 'en'): string => {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Currency utilities
export const formatCurrency = (amount: number, currency: 'SAR' = 'SAR', locale: 'ar' | 'en' = 'en'): string => {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// String utilities
export const generateSlug = (text: string, locale: 'ar' | 'en' = 'en'): string => {
  if (locale === 'ar') {
    // For Arabic, transliterate to Latin characters
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');
  }
  
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  // Saudi phone number validation
  const saudiPhoneRegex = /^(\+966|966|0)?[5-9][0-9]{8}$/;
  return saudiPhoneRegex.test(phone.replace(/\s/g, ''));
};

export const isValidSaudiId = (id: string): boolean => {
  // Saudi National ID validation
  if (!/^\d{10}$/.test(id)) return false;
  
  const weights = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;
  
  for (let i = 0; i < 9; i++) {
    const digit = parseInt(id[i]);
    const weighted = digit * weights[i];
    sum += weighted > 9 ? weighted - 9 : weighted;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(id[9]);
};

// Booking utilities
export const generateBookingNumber = (): string => {
  const prefix = 'LDS';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export const calculateBookingTotal = (
  basePrice: number,
  quantity: number,
  discounts: Array<{ amount: number; percentage: number }> = [],
  platformFee: number = 0,
  vatPercentage: number = 15
): {
  subtotal: number;
  totalDiscount: number;
  platformFee: number;
  vatAmount: number;
  totalBeforeVat: number;
  totalAmount: number;
} => {
  const subtotal = basePrice * quantity;
  
  let totalDiscount = 0;
  discounts.forEach(discount => {
    if (discount.percentage) {
      totalDiscount += (subtotal * discount.percentage) / 100;
    } else {
      totalDiscount += discount.amount;
    }
  });
  
  const totalBeforeVat = subtotal - totalDiscount + platformFee;
  const vatAmount = (totalBeforeVat * vatPercentage) / 100;
  const totalAmount = totalBeforeVat + vatAmount;
  
  return {
    subtotal,
    totalDiscount,
    platformFee,
    vatAmount,
    totalBeforeVat,
    totalAmount,
  };
};

// Rating utilities
export const calculateAverageRating = (ratings: number[]): number => {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
};

export const getRatingDistribution = (ratings: number[]): Record<number, number> => {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
  ratings.forEach(rating => {
    const rounded = Math.round(rating);
    if (rounded >= 1 && rounded <= 5) {
      distribution[rounded as keyof typeof distribution]++;
    }
  });
  
  return distribution;
};

// Location utilities
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const isWithinRadius = (
  userLat: number,
  userLng: number,
  activityLat: number,
  activityLng: number,
  radiusKm: number
): boolean => {
  const distance = calculateDistance(userLat, userLng, activityLat, activityLng);
  return distance <= radiusKm;
};

// File utilities
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const isValidImageFile = (filename: string): boolean => {
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const extension = getFileExtension(filename);
  return validExtensions.includes(extension);
};

export const isValidVideoFile = (filename: string): boolean => {
  const validExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
  const extension = getFileExtension(filename);
  return validExtensions.includes(extension);
};

// Array utilities
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

export const groupBy = <T, K extends string | number>(
  array: T[],
  key: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = key(item);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<K, T[]>);
};

// Object utilities
export const pick = <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const omit = <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
};

// Error utilities
export const createApiError = (
  code: string,
  message: string,
  details?: Record<string, any>
) => ({
  code,
  message,
  details,
  timestamp: new Date(),
});

// Constants
export const LUDUS_CONSTANTS = {
  PLATFORM_FEE_PERCENTAGE: 15,
  VAT_PERCENTAGE: 15,
  CURRENCY: 'SAR',
  DEFAULT_LANGUAGE: 'ar',
  SUPPORTED_LANGUAGES: ['ar', 'en'],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/avi', 'video/mov', 'video/webm'],
  BOOKING_STATUSES: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
  USER_ROLES: ['user', 'partner', 'admin'],
  ACTIVITY_STATUSES: ['draft', 'pending_review', 'active', 'inactive', 'suspended'],
  PAYMENT_METHODS: ['credit_card', 'mada', 'apple_pay', 'stc_pay'],
} as const;
