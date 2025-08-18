'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody } from '@opgrapes/ui/Card';
import { Button } from '@opgrapes/ui/Button';
import { Text } from '@opgrapes/ui/Text';
import { Badge } from '@opgrapes/ui/Badge';
import { Stack } from '@opgrapes/ui/Stack';
import { Avatar } from '@opgrapes/ui/Avatar';
import { Heart, MapPin, Clock, Users, Star } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  price: {
    amount: number;
    currency: string;
    perPerson: boolean;
  };
  location: string;
  duration: number; // in minutes
  maxParticipants: number;
  images: string[];
  rating: number;
  reviewCount: number;
  vendor: {
    id: string;
    name: string;
    logo?: string;
    verified: boolean;
  };
  tags: string[];
  featured: boolean;
}

interface ActivityCardProps {
  activity: Activity;
  variant?: 'default' | 'compact' | 'featured';
  onSave?: (activityId: string) => void;
  onBook?: (activityId: string) => void;
  saved?: boolean;
}

export function ActivityCard({ 
  activity, 
  variant = 'default',
  onSave,
  onBook,
  saved = false
}: ActivityCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
    setImageError(true);
  };

  const handleCardClick = () => {
    router.push(`/activities/${activity.id}`);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave?.(activity.id);
  };

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBook?.(activity.id);
  };

  const formatPrice = () => {
    const { amount, currency, perPerson } = activity.price;
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
    
    return `${formattedAmount}${perPerson ? ' per person' : ''}`;
  };

  const formatDuration = () => {
    if (activity.duration < 60) {
      return `${activity.duration}m`;
    }
    const hours = Math.floor(activity.duration / 60);
    const minutes = activity.duration % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'outdoor': 'green',
      'indoor': 'blue',
      'water-sports': 'cyan',
      'adventure': 'orange',
      'cultural': 'purple',
      'wellness': 'pink',
      'food-drink': 'amber',
      'art-craft': 'indigo',
      'music': 'rose',
      'technology': 'slate',
    };
    return colors[category] || 'gray';
  };

  if (variant === 'compact') {
    return (
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow duration-200"
        onClick={handleCardClick}
      >
        <div className="flex gap-4">
          <div className="relative w-24 h-24 flex-shrink-0">
            {!imageError ? (
              <img
                src={activity.images[0] || '/placeholder-activity.jpg'}
                alt={activity.title}
                className="w-full h-full object-cover rounded-lg"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                <Text size="sm" color="gray">No Image</Text>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <Text as="div" size="lg" weight="semibold" className="truncate text-lg font-semibold">
              {activity.title}
            </Text>
            <Text size="sm" color="gray" className="line-clamp-2 mb-2">
              {activity.description}
            </Text>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{activity.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{formatDuration()}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <Text size="lg" weight="bold" color="primary">
                {formatPrice()}
              </Text>
              <Button size="sm" variant="primary">
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${
        variant === 'featured' ? 'ring-2 ring-primary/20' : ''
      }`}
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative">
        {!imageError ? (
          <img
            src={activity.images[0] || '/placeholder-activity.jpg'}
            alt={activity.title}
            className="w-full h-48 object-cover rounded-t-lg"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
            <Text size="lg" color="gray">No Image Available</Text>
          </div>
        )}
        
        {/* Loading Overlay */}
        {isImageLoading && (
          <div className="absolute inset-0 bg-gray-200 rounded-t-lg flex items-center justify-center">
            <div className="animate-pulse bg-gray-300 w-full h-full rounded-t-lg" />
          </div>
        )}
        
        {/* Featured Badge */}
        {activity.featured && (
          <div className="absolute top-3 left-3">
            <Badge variant="primary" size="sm">
              Featured
            </Badge>
          </div>
        )}
        
        {/* Save Button */}
        {onSave && (
          <button
            onClick={handleSaveClick}
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors"
          >
            <Heart 
              size={18} 
              className={saved ? 'fill-red-500 text-red-500' : 'text-gray-600'} 
            />
          </button>
        )}
        
        {/* Category Badge */}
        <div className="absolute bottom-3 left-3">
          <Badge variant={getCategoryColor(activity.category) as 'primary' | 'secondary' | 'success' | 'warning' | 'danger'} size="sm">
            {activity.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <CardBody>
        <Stack spacing="sm">
          {/* Title and Rating */}
          <div className="flex items-start justify-between">
            <Text as="div" size="lg" weight="semibold" className="flex-1 pr-2 text-lg font-semibold">
              {activity.title}
            </Text>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              <Text size="sm" weight="medium">
                {activity.rating.toFixed(1)}
              </Text>
              <Text size="xs" color="gray">
                ({activity.reviewCount})
              </Text>
            </div>
          </div>

          {/* Description */}
          <Text size="sm" color="gray" className="line-clamp-2">
            {activity.description}
          </Text>

          {/* Vendor Info */}
          <div className="flex items-center gap-2">
            <Avatar
              size="sm"
              src={activity.vendor.logo}
              alt={activity.vendor.name}
            />
            <div className="flex-1 min-w-0">
              <Text size="sm" weight="medium" className="truncate">
                {activity.vendor.name}
              </Text>
              {activity.vendor.verified && (
                <Badge variant="success" size="sm">
                  Verified
                </Badge>
              )}
            </div>
          </div>

          {/* Activity Details */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{activity.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{formatDuration()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>Up to {activity.maxParticipants}</span>
            </div>
          </div>

          {/* Tags */}
          {activity.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {activity.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" size="sm">
                  {tag}
                </Badge>
              ))}
              {activity.tags.length > 3 && (
                <Badge variant="secondary" size="sm">
                  +{activity.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Price and Action */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <Text size="lg" weight="bold" color="primary">
                {formatPrice()}
              </Text>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={handleBookClick}
            >
              Book Now
            </Button>
          </div>
        </Stack>
      </CardBody>
    </Card>
  );
}
