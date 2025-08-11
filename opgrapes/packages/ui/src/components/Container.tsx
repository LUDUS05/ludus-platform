import React from 'react';
import { cn, createSize } from '../lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  centered?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const containerSizes = createSize({
  sm: 'max-w-3xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-none',
}, 'lg');

const containerPadding = {
  none: '',
  sm: 'px-4',
  md: 'px-6',
  lg: 'px-8',
};

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ 
    className, 
    size, 
    centered = true,
    padding = 'md',
    children,
    ...props 
  }, ref) => {
    const baseClasses = [
      'w-full',
      containerSizes(size),
      centered && 'mx-auto',
      containerPadding[padding],
      className
    ];

    return (
      <div
        className={cn(baseClasses)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';
