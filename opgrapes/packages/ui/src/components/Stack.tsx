import React from 'react';
import { cn, createSize } from '../lib/utils';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  direction?: 'vertical' | 'horizontal';
  wrap?: boolean;
}

const stackSpacing = createSize({
  none: 'space-y-0',
  xs: 'space-y-1',
  sm: 'space-y-2',
  md: 'space-y-4',
  lg: 'space-y-6',
  xl: 'space-y-8',
}, 'md');

const horizontalSpacing = createSize({
  none: 'space-x-0',
  xs: 'space-x-1',
  sm: 'space-x-2',
  md: 'space-x-4',
  lg: 'space-x-6',
  xl: 'space-x-8',
}, 'md');

const stackAlign = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const stackJustify = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ 
    className, 
    spacing = 'md', 
    align = 'start',
    justify = 'start',
    direction = 'vertical',
    wrap = false,
    children,
    ...props 
  }, ref) => {
    const isHorizontal = direction === 'horizontal';
    
    const baseClasses = [
      'flex',
      isHorizontal ? 'flex-row' : 'flex-col',
      isHorizontal ? horizontalSpacing(spacing) : stackSpacing(spacing),
      stackAlign[align],
      stackJustify[justify],
      wrap && 'flex-wrap',
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

Stack.displayName = 'Stack';
