import React from 'react';
import { cn, createVariant, createSize } from '../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const textareaVariants = createVariant({
  default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
  error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
  success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
}, 'default');

const textareaSizes = createSize({
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-sm',
  lg: 'px-4 py-4 text-base',
}, 'md');

const textareaRows = {
  sm: 3,
  md: 4,
  lg: 5,
};

const resizeClasses = {
  none: 'resize-none',
  vertical: 'resize-y',
  horizontal: 'resize-x',
  both: 'resize',
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    variant, 
    size = 'md', 
    label,
    helperText,
    error,
    fullWidth = false,
    resize = 'vertical',
    id,
    rows,
    ...props 
  }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = error || variant === 'error';
    const currentVariant = hasError ? 'error' : variant;
    const defaultRows = rows || textareaRows[size];

    const baseClasses = [
      'block rounded-lg border transition-colors duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'placeholder-gray-400',
      textareaVariants(currentVariant),
      textareaSizes(size),
      resizeClasses[resize],
      fullWidth && 'w-full',
      className
    ];

    return (
      <div className={fullWidth ? 'w-full' : 'inline-block'}>
        {label && (
          <label 
            htmlFor={textareaId} 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(baseClasses)}
          ref={ref}
          rows={defaultRows}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
