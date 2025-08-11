import React from 'react';
import { cn } from '../lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const breadcrumbSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
};

const defaultSeparator = (
  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
  </svg>
);

export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, separator = defaultSeparator, size = 'md', className }, ref) => {
    if (items.length === 0) return null;

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn('flex items-center space-x-2', className)}
      >
        <ol className="flex items-center space-x-2">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isFirst = index === 0;

            return (
              <li key={index} className="flex items-center">
                {!isFirst && (
                  <span className="mx-2 text-gray-400" aria-hidden="true">
                    {separator}
                  </span>
                )}
                
                {item.href && !isLast ? (
                  <a
                    href={item.href}
                    className={cn(
                      'flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors',
                      breadcrumbSizes[size]
                    )}
                  >
                    {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <span
                    className={cn(
                      'flex items-center gap-1',
                      isLast ? 'text-gray-900 font-medium' : 'text-gray-500',
                      breadcrumbSizes[size]
                    )}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                    <span>{item.label}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';
