import React from 'react';
import { cn, createVariant, createSize } from '../lib/utils';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
  error?: string;
}

const radioVariants = createVariant({
  default: 'text-blue-600 border-gray-300 focus:ring-blue-500',
  success: 'text-green-600 border-gray-300 focus:ring-green-500',
  warning: 'text-yellow-600 border-gray-300 focus:ring-yellow-500',
  danger: 'text-red-600 border-gray-300 focus:ring-red-500',
}, 'default');

const radioSizes = createSize({
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}, 'md');

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ 
    className, 
    variant, 
    size, 
    label,
    description,
    error,
    id,
    ...props 
  }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = error || variant === 'danger';
    const currentVariant = hasError ? 'danger' : variant;

    const baseClasses = [
      'border-2 transition-colors duration-200',
      'focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      radioVariants(currentVariant),
      radioSizes(size),
      className
    ];

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={radioId}
            type="radio"
            className={cn(baseClasses)}
            ref={ref}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <label 
                htmlFor={radioId} 
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

Radio.displayName = 'Radio';
