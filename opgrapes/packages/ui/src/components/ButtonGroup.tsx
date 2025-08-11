import React from 'react';
import { cn, createSize } from '../lib/utils';

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  orientation?: 'horizontal' | 'vertical';
  attached?: boolean;
}

const buttonGroupSizes = createSize({
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
}, 'md');

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ 
    className, 
    size = 'md', 
    orientation = 'horizontal',
    attached = false,
    children,
    ...props 
  }, ref) => {
    const baseClasses = [
      'inline-flex',
      orientation === 'vertical' ? 'flex-col' : 'flex-row',
      buttonGroupSizes(size),
      attached && orientation === 'horizontal' && '[&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none [&>*:not(:first-child)]:border-l-0',
      attached && orientation === 'vertical' && '[&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none [&>*:not(:first-child)]:border-t-0',
      !attached && orientation === 'horizontal' && 'gap-1',
      !attached && orientation === 'vertical' && 'gap-1',
      className
    ];

    return (
      <div
        className={cn(baseClasses)}
        ref={ref}
        role="group"
        {...props}
      >
        {children}
      </div>
    );
  }
);

ButtonGroup.displayName = 'ButtonGroup';
