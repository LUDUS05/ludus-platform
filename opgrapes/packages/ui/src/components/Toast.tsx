import React, { useEffect, useState } from 'react';
import { cn } from '../lib/utils';

export interface ToastProps {
  id: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
  className?: string;
}

export interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

const toastTypes = {
  success: {
    icon: '✓',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-400'
  },
  error: {
    icon: '✕',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-400'
  },
  warning: {
    icon: '⚠',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-400'
  },
  info: {
    icon: 'ℹ',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-400'
  }
};

const toastPositions = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
};

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ id, type = 'info', title, message, duration = 5000, onClose, className }, ref) => {
    const [isVisible, setIsVisible] = useState(true);
    const toastConfig = toastTypes[type];

    useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => onClose(id), 300); // Wait for fade out animation
        }, duration);

        return () => clearTimeout(timer);
      }
    }, [duration, id, onClose]);

    const handleClose = () => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300);
    };

    if (!isVisible) return null;

    return (
      <div
        ref={ref}
        className={cn(
          'max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto',
          'border border-l-4',
          toastConfig.bgColor,
          toastConfig.borderColor,
          'transform transition-all duration-300 ease-in-out',
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
          className
        )}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className={cn('flex-shrink-0 text-lg', toastConfig.iconColor)}>
              {toastConfig.icon}
            </div>
            <div className="ml-3 flex-1">
              {title && (
                <p className={cn('text-sm font-medium', toastConfig.textColor)}>
                  {title}
                </p>
              )}
              <p className={cn('text-sm', toastConfig.textColor)}>
                {message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={handleClose}
                className={cn(
                  'inline-flex text-gray-400 hover:text-gray-600',
                  'focus:outline-none focus:text-gray-600 focus:ring-2 focus:ring-gray-500'
                )}
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

Toast.displayName = 'Toast';

export const ToastContainer = React.forwardRef<HTMLDivElement, ToastContainerProps>(
  ({ toasts, onClose, position = 'top-right', className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'fixed z-50 space-y-4',
          toastPositions[position],
          className
        )}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={onClose}
          />
        ))}
      </div>
    );
  }
);

ToastContainer.displayName = 'ToastContainer';
