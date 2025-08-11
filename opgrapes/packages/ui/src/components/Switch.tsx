import React from 'react';
import { cn, createVariant, createSize } from '../lib/utils';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
  error?: string;
}

const switchVariants = createVariant({
  default: 'bg-gray-200 peer-checked:bg-blue-600',
  success: 'bg-gray-200 peer-checked:bg-green-600',
  warning: 'bg-gray-200 peer-checked:bg-yellow-600',
  danger: 'bg-gray-200 peer-checked:bg-red-600',
}, 'default');

const switchSizes = createSize({
  sm: 'h-5 w-9',
  md: 'h-6 w-11',
  lg: 'h-7 w-14',
}, 'md');

const switchThumbSizes = createSize({
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}, 'md');

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
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
    const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = error || variant === 'danger';
    const currentVariant = hasError ? 'danger' : variant;

    return (
      <div className="flex items-start">
        <div className="flex items-center h-6">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              id={switchId}
              type="checkbox"
              className="sr-only peer"
              ref={ref}
              {...props}
            />
            <div className={cn(
              'relative rounded-full transition-colors duration-200 ease-in-out',
              'peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2',
              'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
              switchVariants(currentVariant),
              switchSizes(size),
              className
            )}>
              <div className={cn(
                'absolute top-0.5 left-0.5 bg-white rounded-full transition-transform duration-200 ease-in-out',
                'peer-checked:translate-x-full',
                switchThumbSizes(size)
              )} />
            </div>
          </label>
        </div>
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <label 
                htmlFor={switchId} 
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

Switch.displayName = 'Switch';
