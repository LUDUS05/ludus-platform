import React from 'react';
import { cn } from '../lib/utils';

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

const avatarSizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg'
};

const statusColors = {
  online: 'bg-green-400',
  offline: 'bg-gray-400',
  away: 'bg-yellow-400',
  busy: 'bg-red-400'
};

const statusSizes = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4'
};

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, size = 'md', fallback, className, status }, ref) => {
    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    const renderFallback = () => {
      if (fallback) {
        return (
          <div className="flex items-center justify-center w-full h-full bg-gray-300 text-gray-600 font-medium">
            {getInitials(fallback)}
          </div>
        );
      }
      return (
        <div className="flex items-center justify-center w-full h-full bg-gray-300 text-gray-600">
          <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      );
    };

    return (
      <div className="relative inline-block" ref={ref}>
        <div
          className={cn(
            'relative inline-block rounded-full overflow-hidden',
            avatarSizes[size],
            className
          )}
        >
          {src ? (
            <img
              src={src}
              alt={alt || 'Avatar'}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to initials if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={cn('absolute inset-0', src ? 'hidden' : '')}>
            {renderFallback()}
          </div>
        </div>
        
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 block rounded-full ring-2 ring-white',
              statusColors[status],
              statusSizes[size]
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
