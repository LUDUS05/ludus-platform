import React from 'react';
import { cn } from '../../utils/cn';

const Input = ({ 
  label, 
  error, 
  icon: Icon,
  className,
  ...props 
}) => {
  const inputClasses = cn(
    'w-full px-4 py-3 rounded-xl border-2 bg-white text-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ludus-orange/20 transition-colors duration-200',
    error 
      ? 'border-error-red focus:border-error-red focus:ring-error-red/20' 
      : 'border-warm focus:border-ludus-orange',
    Icon && 'pl-12',
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-charcoal">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
        <input
          className={inputClasses}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-error-red">{error}</p>
      )}
    </div>
  );
};

export default Input;