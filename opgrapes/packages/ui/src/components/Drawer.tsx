import React, { useEffect } from 'react';
import { cn } from '../lib/utils';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

export interface DrawerHeaderProps {
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export interface DrawerBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface DrawerFooterProps {
  children: React.ReactNode;
  className?: string;
}

const drawerPositions = {
  left: 'left-0 top-0 h-full',
  right: 'right-0 top-0 h-full',
  top: 'top-0 left-0 w-full',
  bottom: 'bottom-0 left-0 w-full'
};

const drawerSizes = {
  sm: 'w-80',
  md: 'w-96',
  lg: 'w-[32rem]',
  xl: 'w-[40rem]',
  full: 'w-full'
};

const verticalDrawerSizes = {
  sm: 'h-80',
  md: 'h-96',
  lg: 'h-[32rem]',
  xl: 'h-[40rem]',
  full: 'h-full'
};

const transformClasses = {
  left: 'transform transition-transform duration-300 ease-in-out',
  right: 'transform transition-transform duration-300 ease-in-out',
  top: 'transform transition-transform duration-300 ease-in-out',
  bottom: 'transform transition-transform duration-300 ease-in-out'
};

const getTransformValue = (position: string, isOpen: boolean) => {
  if (!isOpen) {
    switch (position) {
      case 'left':
        return '-translate-x-full';
      case 'right':
        return 'translate-x-full';
      case 'top':
        return '-translate-y-full';
      case 'bottom':
        return 'translate-y-full';
      default:
        return '';
    }
  }
  return '';
};

export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  ({ 
    isOpen, 
    onClose, 
    children, 
    position = 'right',
    size = 'md',
    closeOnOverlayClick = true,
    closeOnEscape = true,
    className 
  }, ref) => {
    useEffect(() => {
      if (!closeOnEscape) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }, [isOpen, onClose, closeOnEscape]);

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose();
      }
    };

    const isVertical = position === 'left' || position === 'right';
    const sizeClass = isVertical ? drawerSizes[size] : verticalDrawerSizes[size];

    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleOverlayClick}
        />
        
        {/* Drawer */}
        <div
          ref={ref}
          className={cn(
            'absolute bg-white shadow-xl',
            drawerPositions[position],
            sizeClass,
            transformClasses[position],
            getTransformValue(position, isOpen),
            className
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);

Drawer.displayName = 'Drawer';

export const DrawerHeader = React.forwardRef<HTMLDivElement, DrawerHeaderProps>(
  ({ children, onClose, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between p-6 border-b border-gray-200',
          className
        )}
      >
        {children}
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close drawer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

DrawerHeader.displayName = 'DrawerHeader';

export const DrawerBody = React.forwardRef<HTMLDivElement, DrawerBodyProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex-1 overflow-y-auto p-6', className)}
      >
        {children}
      </div>
    );
  }
);

DrawerBody.displayName = 'DrawerBody';

export const DrawerFooter = React.forwardRef<HTMLDivElement, DrawerFooterProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50',
          className
        )}
      >
        {children}
      </div>
    );
  }
);

DrawerFooter.displayName = 'DrawerFooter';
