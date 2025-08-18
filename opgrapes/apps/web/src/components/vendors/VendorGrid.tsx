'use client';

import { useState } from 'react';
import { VendorCard } from './VendorCard';
import { Button } from '@opgrapes/ui/Button';
import { Text } from '@opgrapes/ui/Text';

import { Grid, List } from 'lucide-react';

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

interface VendorGridProps {
  vendors: Vendor[];
  loading?: boolean;
  className?: string;
}

type ViewMode = 'grid' | 'list' | 'compact';

export function VendorGrid({ vendors, loading = false, className }: VendorGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  if (loading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-32 rounded-t-lg mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
                <div className="h-8 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Grid size={32} className="text-gray-400" />
          </div>
          <Text as="div" size="lg" weight="semibold" className="mb-2 text-lg font-semibold">
            No vendors found
          </Text>
          <Text size="sm" color="gray">
            Try adjusting your search criteria or filters to find more vendors.
          </Text>
        </div>
      </div>
    );
  }

  const renderVendors = () => {
    switch (viewMode) {
      case 'list':
        return (
          <div className="space-y-4">
            {vendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} variant="compact" />
            ))}
          </div>
        );
      
      case 'compact':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {vendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} variant="compact" />
            ))}
          </div>
        );
      
      case 'grid':
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} variant="default" />
            ))}
          </div>
        );
    }
  };

  return (
    <div className={className}>
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Text size="sm" color="gray">
            Showing {vendors.length} vendor{vendors.length !== 1 ? 's' : ''}
          </Text>
        </div>
        
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <Button
            size="sm"
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            onClick={() => setViewMode('grid')}
            className="px-3 py-1"
          >
            <Grid size={16} />
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            onClick={() => setViewMode('list')}
            className="px-3 py-1"
          >
            <List size={16} />
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'compact' ? 'primary' : 'ghost'}
            onClick={() => setViewMode('compact')}
            className="px-3 py-1"
          >
            <Grid size={16} />
          </Button>
        </div>
      </div>

      {/* Vendors Display */}
      {renderVendors()}
    </div>
  );
}
