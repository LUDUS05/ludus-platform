import React from 'react';
import { cn, createVariant, createSize } from '../lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
  error?: string;
  indeterminate?: boolean;
}

const checkboxVariants = createVariant({
  default: 'text-blue-600 border-gray-300 focus:ring-blue-500',
  success: 'text-green-600 border-gray-300 focus:ring-green-500',
  warning: 'text-yellow-600 border-gray-300 focus:ring-yellow-500',
  danger: 'text-red-600 border-gray-300 focus:ring-red-500',
}, 'default');

const checkboxSizes = createSize({
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}, 'md');

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    className, 
    variant, 
    size, 
    label,
    description,
    error,
    indeterminate = false,
    id,
    ...props 
  }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = error || variant === 'danger';
    const currentVariant = hasError ? 'danger' : variant;

    const baseClasses = [
      'rounded border-2 transition-colors duration-200',
      'focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      checkboxVariants(currentVariant),
      checkboxSizes(size),
      className
    ];

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={checkboxId}
            type="checkbox"
            className={cn(baseClasses)}
            ref={ref}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <label 
                htmlFor={checkboxId} 
                className="font-medium text-gray-700 cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-gray-500 mt-1">{description}</p>
            )}
            {error && (
              <p className="text-red-600 mt-1">{error}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
