import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with proper precedence
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Utility function to create a variant-based class system
 */
export function createVariant<T extends Record<string, string>>(
  variants: T,
  defaultVariant?: keyof T
) {
  return (variant?: keyof T) => {
    const selectedVariant = variant || defaultVariant;
    return selectedVariant ? variants[selectedVariant] : '';
  };
}

/**
 * Utility function to create a size-based class system
 */
export function createSize<T extends Record<string, string>>(
  sizes: T,
  defaultSize?: keyof T
) {
  return (size?: keyof T) => {
    const selectedSize = size || defaultSize;
    return selectedSize ? sizes[selectedSize] : '';
  };
}
