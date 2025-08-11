import React from 'react';
import { cn, createVariant, createSize } from '../lib/utils';

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'default' | 'muted' | 'accent' | 'success' | 'warning' | 'danger';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  as?: 'p' | 'span' | 'div';
}

const textVariants = createVariant({
  default: 'text-gray-900',
  muted: 'text-gray-600',
  accent: 'text-blue-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  danger: 'text-red-600',
}, 'default');

const textSizes = createSize({
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
}, 'base');

const textWeights = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ 
    className, 
    variant, 
    size, 
    weight = 'normal',
    as = 'p',
    children,
    ...props 
  }, ref) => {
    const Component = as;
    
    const baseClasses = [
      'leading-relaxed',
      textSizes(size),
      textWeights[weight],
      textVariants(variant),
      className
    ];

    return (
      <Component
        className={cn(baseClasses)}
        ref={ref}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = 'Text';
