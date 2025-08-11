import React from 'react';
import { cn } from '../lib/utils';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const dividerVariants = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted'
};

const dividerSizes = {
  sm: 'border-t',
  md: 'border-t-2',
  lg: 'border-t-4'
};

const verticalDividerSizes = {
  sm: 'border-l',
  md: 'border-l-2',
  lg: 'border-l-4'
};

export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ 
    orientation = 'horizontal', 
    variant = 'solid', 
    size = 'md', 
    className 
  }, ref) => {
    if (orientation === 'vertical') {
      return (
        <div
          ref={ref}
          className={cn(
            'self-stretch',
            verticalDividerSizes[size],
            dividerVariants[variant],
            'border-gray-200',
            className
          )}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'w-full',
          dividerSizes[size],
          dividerVariants[variant],
          'border-gray-200',
          className
        )}
      />
    );
  }
);

Divider.displayName = 'Divider';
