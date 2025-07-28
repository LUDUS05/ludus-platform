import React from 'react';
import { cn } from '../../utils/cn';
import { 
  CheckIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const Alert = ({ 
  children, 
  variant = 'info', 
  dismissible = false,
  onDismiss,
  className,
  ...props 
}) => {
  const variants = {
    success: {
      container: 'bg-success-green/10 border-success-green/20 text-success-dark',
      icon: CheckIcon,
      iconColor: 'text-success-green',
    },
    warning: {
      container: 'bg-warning-orange/10 border-warning-orange/20 text-warning-dark',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-warning-orange',
    },
    error: {
      container: 'bg-error-red/10 border-error-red/20 text-error-dark',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-error-red',
    },
    info: {
      container: 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue-dark',
      icon: InformationCircleIcon,
      iconColor: 'text-accent-blue',
    },
  };

  const { container, icon: Icon, iconColor } = variants[variant];

  return (
    <div
      className={cn(
        'border rounded-xl p-4 flex items-start gap-3',
        container,
        className
      )}
      {...props}
    >
      <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', iconColor)} />
      <div className="flex-1">
        {children}
      </div>
      {dismissible && (
        <button
          onClick={onDismiss}
          className={cn('p-1 hover:bg-black/5 rounded-lg transition-colors', iconColor)}
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

const AlertTitle = ({ children, className, ...props }) => (
  <h4 className={cn('font-medium mb-1', className)} {...props}>
    {children}
  </h4>
);

const AlertDescription = ({ children, className, ...props }) => (
  <p className={cn('text-sm opacity-90', className)} {...props}>
    {children}
  </p>
);

Alert.Title = AlertTitle;
Alert.Description = AlertDescription;

export default Alert;