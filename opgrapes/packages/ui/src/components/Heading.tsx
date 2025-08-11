import React from 'react';
import { cn, createVariant } from '../lib/utils';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: 'default' | 'muted' | 'accent';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

const headingVariants = createVariant({
  default: 'text-gray-900',
  muted: 'text-gray-600',
  accent: 'text-blue-600',
}, 'default');

const headingSizes = {
  1: 'text-4xl md:text-5xl',
  2: 'text-3xl md:text-4xl',
  3: 'text-2xl md:text-3xl',
  4: 'text-xl md:text-2xl',
  5: 'text-lg md:text-xl',
  6: 'text-base md:text-lg',
};

const headingWeights = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ 
    className, 
    level = 1, 
    variant, 
    weight = 'semibold',
    children,
    ...props 
  }, ref) => {
    const tagName = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    
    const baseClasses = [
      'tracking-tight',
      headingSizes[level],
      headingWeights[weight],
      headingVariants(variant),
      className
    ];

    return React.createElement(
      tagName,
      {
        className: cn(baseClasses),
        ref,
        ...props
      },
      children
    );
  }
);

Heading.displayName = 'Heading';
