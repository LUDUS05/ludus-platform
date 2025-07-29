import React from 'react';
import { cn } from '../../utils/cn';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  className,
  ...props 
}) => {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-ludus-orange hover:bg-ludus-orange-dark dark:bg-dark-ludus-orange dark:hover:bg-dark-ludus-orange-dark text-white shadow-lg hover:shadow-xl active:scale-95 focus:ring-ludus-orange/20 dark:focus:ring-dark-ludus-orange/20',
    secondary: 'bg-white dark:dark-bg-secondary border-2 border-ludus-orange dark:border-dark-ludus-orange text-ludus-orange dark:text-dark-ludus-orange hover:bg-ludus-orange dark:hover:bg-dark-ludus-orange hover:text-white focus:ring-ludus-orange/20 dark:focus:ring-dark-ludus-orange/20',
    ghost: 'bg-transparent text-charcoal dark:dark-text-primary hover:bg-warm-light dark:dark-bg-tertiary focus:ring-warm/20 dark:focus:ring-dark-bg-quaternary/20',
    success: 'bg-success-green hover:bg-success-dark dark:bg-dark-success dark:hover:bg-dark-success/80 text-white shadow-lg hover:shadow-xl active:scale-95 focus:ring-success-green/20 dark:focus:ring-dark-success/20',
    warning: 'bg-warning-orange hover:bg-warning-dark dark:bg-dark-warning dark:hover:bg-dark-warning/80 text-white shadow-lg hover:shadow-xl active:scale-95 focus:ring-warning-orange/20 dark:focus:ring-dark-warning/20',
    error: 'bg-error-red hover:bg-error-dark dark:bg-dark-error dark:hover:bg-dark-error/80 text-white shadow-lg hover:shadow-xl active:scale-95 focus:ring-error-red/20 dark:focus:ring-dark-error/20',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
    xl: 'px-8 py-5 text-xl',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        loading && 'cursor-wait',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;