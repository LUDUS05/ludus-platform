import React from 'react';
import { cn } from '../lib/utils';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'underline' | 'button';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}

const linkVariants = {
  default: 'text-gray-600 hover:text-gray-900 transition-colors',
  primary: 'text-blue-600 hover:text-blue-800 transition-colors',
  secondary: 'text-gray-500 hover:text-gray-700 transition-colors',
  underline: 'text-blue-600 hover:text-blue-800 underline hover:no-underline transition-all',
  button: 'inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors'
};

const linkSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
};

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ 
    variant = 'default', 
    size = 'md', 
    children, 
    className, 
    external = false,
    href,
    target,
    rel,
    ...props 
  }, ref) => {
    const linkTarget = external ? '_blank' : target;
    const linkRel = external ? 'noopener noreferrer' : rel;

    return (
      <a
        ref={ref}
        href={href}
        target={linkTarget}
        rel={linkRel}
        className={cn(
          'inline-flex items-center gap-1',
          linkVariants[variant],
          linkSizes[size],
          className
        )}
        {...props}
      >
        {children}
        {external && (
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
            />
          </svg>
        )}
      </a>
    );
  }
);

Link.displayName = 'Link';
