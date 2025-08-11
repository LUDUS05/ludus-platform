import React from 'react';
import { cn } from '../lib/utils';

export interface ListProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'striped';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

export interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  action?: React.ReactNode;
}

const listVariants = {
  default: '',
  bordered: 'divide-y divide-gray-200 border border-gray-200 rounded-lg',
  striped: 'divide-y divide-gray-100'
};

const listSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
};

const itemSizes = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-6 py-4'
};

export const List = React.forwardRef<HTMLDivElement, ListProps>(
  ({ variant = 'default', size = 'md', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white',
          listVariants[variant],
          listSizes[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

List.displayName = 'List';

export const ListItem = React.forwardRef<HTMLDivElement, ListItemProps>(
  ({ className, children, leftIcon, rightIcon, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors',
          className
        )}
        {...props}
      >
        <div className="flex items-center flex-1 min-w-0">
          {leftIcon && (
            <div className="flex-shrink-0 mr-3 text-gray-400">
              {leftIcon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {children}
          </div>
          {rightIcon && (
            <div className="flex-shrink-0 ml-3 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0 ml-4">
            {action}
          </div>
        )}
      </div>
    );
  }
);

ListItem.displayName = 'ListItem';
