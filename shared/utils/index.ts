// LUDUS Multi-Platform Shared Utilities
// This file contains shared utility functions used across the LUDUS ecosystem

import { format, parseISO, isValid, differenceInDays, addDays, startOfDay, endOfDay } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates phone number format (Saudi Arabia)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+966|966|0)?5[0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validates password strength
 */
export const isValidPassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates Saudi ID number
 */
export const isValidSaudiId = (id: string): boolean => {
  const idRegex = /^[12]\d{9}$/;
  return idRegex.test(id);
};

/**
 * Validates file type
 */
export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * Validates file size
 */
export const isValidFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize;
};

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Formats currency (SAR)
 */
export const formatCurrency = (amount: number, currency: string = 'SAR'): string => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formats date
 */
export const formatDate = (date: Date | string, formatStr: string = 'dd/MM/yyyy', locale: 'en' | 'ar' = 'en'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) {
    return 'Invalid date';
  }
  
  const localeObj = locale === 'ar' ? ar : enUS;
  return format(dateObj, formatStr, { locale: localeObj });
};

/**
 * Formats date and time
 */
export const formatDateTime = (date: Date | string, locale: 'en' | 'ar' = 'en'): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm', locale);
};

/**
 * Formats relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date | string, locale: 'en' | 'ar' = 'en'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) {
    return 'Invalid date';
  }
  
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return locale === 'ar' ? 'الآن' : 'Just now';
  }
  
  if (diffInMinutes < 60) {
    return locale === 'ar' 
      ? `منذ ${diffInMinutes} دقيقة`
      : `${diffInMinutes} minutes ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return locale === 'ar'
      ? `منذ ${diffInHours} ساعة`
      : `${diffInHours} hours ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return locale === 'ar'
      ? `منذ ${diffInDays} يوم`
      : `${diffInDays} days ago`;
  }
  
  return formatDate(date, 'dd/MM/yyyy', locale);
};

/**
 * Formats phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('966')) {
    return `+966 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  
  if (cleaned.startsWith('0')) {
    return `+966 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
};

/**
 * Formats file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Truncates text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Gets start of day
 */
export const getStartOfDay = (date: Date): Date => {
  return startOfDay(date);
};

/**
 * Gets end of day
 */
export const getEndOfDay = (date: Date): Date => {
  return endOfDay(date);
};

/**
 * Adds days to date
 */
export const addDaysToDate = (date: Date, days: number): Date => {
  return addDays(date, days);
};

/**
 * Calculates difference in days
 */
export const getDaysDifference = (date1: Date, date2: Date): number => {
  return differenceInDays(date1, date2);
};

/**
 * Checks if date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Checks if date is in the past
 */
export const isPastDate = (date: Date): boolean => {
  return date < new Date();
};

/**
 * Checks if date is in the future
 */
export const isFutureDate = (date: Date): boolean => {
  return date > new Date();
};

/**
 * Gets date range for a week
 */
export const getWeekRange = (date: Date): { start: Date; end: Date } => {
  const start = startOfDay(date);
  const end = endOfDay(addDays(start, 6));
  return { start, end };
};

/**
 * Gets date range for a month
 */
export const getMonthRange = (date: Date): { start: Date; end: Date } => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
};

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Capitalizes first letter
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Converts to title case
 */
export const toTitleCase = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

/**
 * Generates random string
 */
export const generateRandomString = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generates booking number
 */
export const generateBookingNumber = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `LUD${timestamp}${random}`;
};

/**
 * Slugifies text
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Removes duplicates from array
 */
export const removeDuplicates = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

/**
 * Groups array by key
 */
export const groupBy = <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

/**
 * Sorts array by key
 */
export const sortBy = <T, K extends keyof T>(array: T[], key: K, order: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Chunks array into smaller arrays
 */
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

/**
 * Deep clones object
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

/**
 * Removes undefined values from object
 */
export const removeUndefined = <T extends Record<string, any>>(obj: T): T => {
  const cleaned = {} as T;
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
};

/**
 * Picks specific keys from object
 */
export const pick = <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const picked = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      picked[key] = obj[key];
    }
  });
  return picked;
};

/**
 * Omits specific keys from object
 */
export const omit = <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const omitted = {} as Omit<T, K>;
  for (const key in obj) {
    if (!keys.includes(key as K)) {
      omitted[key] = obj[key];
    }
  }
  return omitted;
};

// ============================================================================
// API UTILITIES
// ============================================================================

/**
 * Handles API errors
 */
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

/**
 * Creates API headers
 */
export const createApiHeaders = (token?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Validates API response
 */
export const validateApiResponse = <T>(response: any): T => {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response format');
  }
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  return response.data || response;
};

// ============================================================================
// STORAGE UTILITIES
// ============================================================================

/**
 * Sets item in localStorage
 */
export const setLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting localStorage item:', error);
  }
};

/**
 * Gets item from localStorage
 */
export const getLocalStorage = <T>(key: string, defaultValue?: T): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue || null;
  } catch (error) {
    console.error('Error getting localStorage item:', error);
    return defaultValue || null;
  }
};

/**
 * Removes item from localStorage
 */
export const removeLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing localStorage item:', error);
  }
};

/**
 * Clears all localStorage
 */
export const clearLocalStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

// ============================================================================
// URL UTILITIES
// ============================================================================

/**
 * Builds query string from object
 */
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
};

/**
 * Parses query string to object
 */
export const parseQueryString = (queryString: string): Record<string, string> => {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
};

/**
 * Gets URL parameter
 */
export const getUrlParameter = (name: string): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
};

// ============================================================================
// DEVICE UTILITIES
// ============================================================================

/**
 * Checks if device is mobile
 */
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Checks if device is iOS
 */
export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

/**
 * Checks if device is Android
 */
export const isAndroid = (): boolean => {
  return /Android/.test(navigator.userAgent);
};

/**
 * Gets device pixel ratio
 */
export const getDevicePixelRatio = (): number => {
  return window.devicePixelRatio || 1;
};

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Converts hex to RGB
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Converts RGB to hex
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

/**
 * Lightens or darkens color
 */
export const adjustColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const adjust = (value: number) => {
    const newValue = Math.max(0, Math.min(255, value + (value * percent)));
    return Math.round(newValue);
  };
  
  const newRgb = {
    r: adjust(rgb.r),
    g: adjust(rgb.g),
    b: adjust(rgb.b)
  };
  
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
};

// ============================================================================
// EXPORT ALL UTILITIES
// ============================================================================

export {
  // Validation
  isValidEmail,
  isValidPhoneNumber,
  isValidPassword,
  isValidSaudiId,
  isValidFileType,
  isValidFileSize,
  
  // Formatting
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatPhoneNumber,
  formatFileSize,
  truncateText,
  
  // Date
  getStartOfDay,
  getEndOfDay,
  addDaysToDate,
  getDaysDifference,
  isToday,
  isPastDate,
  isFutureDate,
  getWeekRange,
  getMonthRange,
  
  // String
  capitalize,
  toTitleCase,
  generateRandomString,
  generateBookingNumber,
  slugify,
  
  // Array
  removeDuplicates,
  groupBy,
  sortBy,
  chunk,
  
  // Object
  deepClone,
  removeUndefined,
  pick,
  omit,
  
  // API
  handleApiError,
  createApiHeaders,
  validateApiResponse,
  
  // Storage
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
  clearLocalStorage,
  
  // URL
  buildQueryString,
  parseQueryString,
  getUrlParameter,
  
  // Device
  isMobile,
  isIOS,
  isAndroid,
  getDevicePixelRatio,
  
  // Color
  hexToRgb,
  rgbToHex,
  adjustColor,
};
