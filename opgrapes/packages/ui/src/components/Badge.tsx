import React from 'react';
import { cn, createVariant, createSize } from '../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'full' | 'lg' | 'md' | 'none';
  removable?: boolean;
  onRemove?: () => void;
}

const badgeVariants = createVariant({
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-blue-100 text-blue-800',
  secondary: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
}, 'default');

const badgeSizes = createSize({
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
}, 'md');

const badgeRounded = {
  full: 'rounded-full',
  lg: 'rounded-lg',
  md: 'rounded-md',
  none: 'rounded-none',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ 
    className, 
    variant, 
    size, 
    rounded = 'full',
    removable = false,
    onRemove,
    children,
    ...props 
  }, ref) => {
    const baseClasses = [
      'inline-flex items-center font-medium',
      'transition-colors duration-200',
      badgeVariants(variant),
      badgeSizes(size),
      badgeRounded[rounded],
      className
    ];

    return (
      <span
        className={cn(baseClasses)}
        ref={ref}
        {...props}
      >
        {children}
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1.5 -mr-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-current hover:bg-current hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-1"
          >
            <span className="sr-only">Remove</span>
            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
