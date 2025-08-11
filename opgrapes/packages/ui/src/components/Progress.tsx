import React from 'react';
import { cn, createVariant, createSize } from '../lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  labelPosition?: 'top' | 'bottom' | 'inside';
  animated?: boolean;
  striped?: boolean;
}

const progressVariants = createVariant({
  default: 'bg-blue-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  danger: 'bg-red-600',
  info: 'bg-blue-600',
}, 'default');

const progressSizes = createSize({
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}, 'md');

const labelSizes = createSize({
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}, 'md');

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    value, 
    max = 100, 
    variant, 
    size = 'md',
    showLabel = false,
    labelPosition = 'top',
    animated = false,
    striped = false,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    const baseClasses = [
      'w-full bg-gray-200 rounded-full overflow-hidden',
      progressSizes(size),
      className
    ];

    const barClasses = [
      'h-full transition-all duration-300 ease-out',
      progressVariants(variant),
      animated && 'animate-pulse',
      striped && 'bg-gradient-to-r from-transparent via-white to-transparent bg-[length:20px_100%] animate-pulse',
    ];

    const labelClasses = [
      'font-medium text-gray-700',
      labelSizes(size),
    ];

    return (
      <div className="w-full" ref={ref} {...props}>
        {showLabel && labelPosition === 'top' && (
          <div className="flex justify-between items-center mb-2">
            <span className={cn(labelClasses)}>Progress</span>
            <span className={cn(labelClasses)}>{Math.round(percentage)}%</span>
          </div>
        )}
        
        <div className={cn(baseClasses)}>
          <div
            className={cn(barClasses)}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
          />
        </div>
        
        {showLabel && labelPosition === 'bottom' && (
          <div className="flex justify-between items-center mt-2">
            <span className={cn(labelClasses)}>Progress</span>
            <span className={cn(labelClasses)}>{Math.round(percentage)}%</span>
          </div>
        )}
        
        {showLabel && labelPosition === 'inside' && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {Math.round(percentage)}%
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

Progress.displayName = 'Progress';
