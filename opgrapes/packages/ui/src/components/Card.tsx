import React from 'react';
import { cn, createVariant } from '../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  action?: React.ReactNode;
}

const cardVariants = createVariant({
  default: 'bg-white border border-gray-200',
  elevated: 'bg-white shadow-lg border-0',
  outlined: 'bg-transparent border-2 border-gray-200',
  filled: 'bg-gray-50 border border-gray-200',
}, 'default');

const cardPadding = {
  none: '',
  sm: 'p-3',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant, 
    padding = 'md', 
    hover = false,
    children,
    ...props 
  }, ref) => {
    const baseClasses = [
      'rounded-lg transition-all duration-200',
      cardVariants(variant),
      hover && 'hover:shadow-md hover:-translate-y-1',
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

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ 
    className, 
    title, 
    subtitle, 
    action,
    children,
    ...props 
  }, ref) => {
    const baseClasses = [
      'flex items-center justify-between p-6 border-b border-gray-200',
      className
    ];

    return (
      <div
        className={cn(baseClasses)}
        ref={ref}
        {...props}
      >
        {children || (
          <>
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
            {action && (
              <div className="flex-shrink-0">{action}</div>
            )}
          </>
        )}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ 
    className, 
    children,
    ...props 
  }, ref) => {
    const baseClasses = [
      'p-6',
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

CardBody.displayName = 'CardBody';

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ 
    className, 
    action,
    children,
    ...props 
  }, ref) => {
    const baseClasses = [
      'flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50',
      className
    ];

    return (
      <div
        className={cn(baseClasses)}
        ref={ref}
        {...props}
      >
        {children || (
          <>
            <div></div>
            {action && (
              <div className="flex-shrink-0">{action}</div>
            )}
          </>
        )}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';
