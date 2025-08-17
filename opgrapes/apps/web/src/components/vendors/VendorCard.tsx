'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@opgrapes/ui/Card';
import { Button } from '@opgrapes/ui/Button';
import { Text } from '@opgrapes/ui/Text';
import { Badge } from '@opgrapes/ui/Badge';
import { Stack } from '@opgrapes/ui/Stack';

import { MapPin, Star, Calendar, Phone, Mail, Globe, Users } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  description: string;
  logo?: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  location: string;
  established: string;
  activityCount: number;
  categories: string[];
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  featured: boolean;
}

interface VendorCardProps {
  vendor: Vendor;
  variant?: 'default' | 'compact' | 'featured';
}

export function VendorCard({ vendor, variant = 'default' }: VendorCardProps) {
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
    router.push(`/vendors/${vendor.id}`);
  };

  const handleContactClick = (e: React.MouseEvent, type: 'phone' | 'email' | 'website') => {
    e.stopPropagation();
    
    switch (type) {
      case 'phone':
        window.open(`tel:${vendor.contact.phone}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:${vendor.contact.email}`, '_blank');
        break;
      case 'website':
        window.open(`https://${vendor.contact.website}`, '_blank');
        break;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'outdoor': 'green',
      'adventure': 'orange',
      'water-sports': 'cyan',
      'food-drink': 'amber',
      'cultural': 'purple',
      'wellness': 'pink',
      'education': 'blue',
      'art-craft': 'indigo',
      'entertainment': 'rose',
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
          <div className="relative w-20 h-20 flex-shrink-0">
            {!imageError ? (
              <img
                src={vendor.logo || '/placeholder-vendor.jpg'}
                alt={vendor.name}
                className="w-full h-full object-cover rounded-lg"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                <Text size="sm" color="gray">{vendor.name.charAt(0)}</Text>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Text as="h3" size="lg" weight="semibold" className="truncate">
                {vendor.name}
              </Text>
              {vendor.verified && (
                <Badge variant="success" size="xs">Verified</Badge>
              )}
            </div>
            
            <Text size="sm" color="gray" className="line-clamp-2 mb-2">
              {vendor.description}
            </Text>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{vendor.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-400" />
                <span>{vendor.rating}</span>
              </div>
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
      {/* Header Section */}
      <div className="relative">
        {!imageError ? (
          <img
            src={vendor.logo || '/placeholder-vendor.jpg'}
            alt={vendor.name}
            className="w-full h-32 object-cover rounded-t-lg"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-32 bg-gray-200 rounded-t-lg flex items-center justify-center">
            <Text size="xl" color="gray" weight="bold">{vendor.name.charAt(0)}</Text>
          </div>
        )}
        
        {/* Loading Overlay */}
        {isImageLoading && (
          <div className="absolute inset-0 bg-gray-200 rounded-t-lg flex items-center justify-center">
            <div className="animate-pulse bg-gray-300 w-full h-full rounded-t-lg" />
          </div>
        )}
        
        {/* Featured Badge */}
        {vendor.featured && (
          <div className="absolute top-3 left-3">
            <Badge variant="primary" size="sm">
              Featured
            </Badge>
          </div>
        )}
        
        {/* Verified Badge */}
        {vendor.verified && (
          <div className="absolute top-3 right-3">
            <Badge variant="success" size="sm">
              ✓ Verified
            </Badge>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        <Stack gap="3">
          {/* Name and Rating */}
          <div className="flex items-start justify-between">
            <Text as="h3" size="lg" weight="semibold" className="flex-1 pr-2">
              {vendor.name}
            </Text>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              <Text size="sm" weight="medium">
                {vendor.rating.toFixed(1)}
              </Text>
              <Text size="xs" color="gray">
                ({vendor.reviewCount})
              </Text>
            </div>
          </div>

          {/* Description */}
          <Text size="sm" color="gray" className="line-clamp-2">
            {vendor.description}
          </Text>

          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users size={14} className="text-gray-500" />
              </div>
              <Text size="sm" weight="semibold">{vendor.activityCount}</Text>
              <Text size="xs" color="gray">Activities</Text>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <MapPin size={14} className="text-gray-500" />
              </div>
              <Text size="sm" weight="semibold">{vendor.location.split(',')[0]}</Text>
              <Text size="xs" color="gray">Location</Text>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar size={14} className="text-gray-500" />
              </div>
              <Text size="sm" weight="semibold">{vendor.established}</Text>
              <Text size="xs" color="gray">Est.</Text>
            </div>
          </div>

          {/* Categories */}
          {vendor.categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {vendor.categories.slice(0, 3).map((category) => (
                <Badge key={category} variant={getCategoryColor(category) as 'primary' | 'secondary' | 'success' | 'warning' | 'danger'} size="xs">
                  {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              ))}
              {vendor.categories.length > 3 && (
                <Badge variant="secondary" size="xs">
                  +{vendor.categories.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Contact Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => handleContactClick(e, 'phone')}
              className="flex-1"
            >
              <Phone size={14} className="mr-1" />
              Call
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => handleContactClick(e, 'email')}
              className="flex-1"
            >
              <Mail size={14} className="mr-1" />
              Email
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => handleContactClick(e, 'website')}
              className="flex-1"
            >
              <Globe size={14} className="mr-1" />
              Website
            </Button>
          </div>

          {/* View Profile Button */}
          <Button
            size="sm"
            variant="primary"
            className="w-full"
          >
            View Profile
          </Button>
        </Stack>
      </div>
    </Card>
  );
}
