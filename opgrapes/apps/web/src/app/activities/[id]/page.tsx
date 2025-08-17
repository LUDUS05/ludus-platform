'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@opgrapes/ui/Card';
import { Button } from '@opgrapes/ui/Button';
import { Text } from '@opgrapes/ui/Text';
import { Badge } from '@opgrapes/ui/Badge';
import { Stack } from '@opgrapes/ui/Stack';
import { Tabs } from '@opgrapes/ui/Tabs';
import { ActivityCard } from '@/components/activities/ActivityCard';
import { ActivityBookingModal } from '@/components/activities/ActivityBookingModal';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { 
  MapPin, 
  Star, 
  Calendar, 
  Clock, 
  Users, 
  Award,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { bookingService, type CreateBookingRequest } from '@/services/bookingService';
import { useToast } from '@/contexts/ToastContext';

// Mock data - replace with API calls
const mockActivity = {
  id: '1',
  title: 'Rock Climbing Adventure',
  description: 'Experience the thrill of rock climbing in the beautiful mountains. This adventure is perfect for both beginners and experienced climbers. Our certified instructors will guide you through the basics of climbing, safety procedures, and help you conquer challenging routes. The experience includes all necessary equipment, safety gear, and professional instruction.',
  longDescription: `Join us for an unforgettable rock climbing adventure in the stunning mountain ranges! This comprehensive experience is designed to cater to all skill levels, from complete beginners to seasoned climbers.

Our expert instructors will provide personalized guidance, ensuring you feel confident and safe throughout your climbing journey. We'll cover essential climbing techniques, safety protocols, and help you develop the skills needed to tackle various climbing challenges.

The adventure includes:
• Professional climbing equipment and safety gear
• Certified instructor guidance
• Multiple climbing routes for different skill levels
• Safety briefing and training
• Beautiful scenic views and photo opportunities
• Refreshments and snacks

Whether you're looking for a thrilling outdoor activity, want to challenge yourself, or simply enjoy the beauty of nature from a unique perspective, this rock climbing adventure is perfect for you!`,
  price: 89.99,
  duration: '3 hours',
  category: 'Adventure',
  location: 'Mountain View, CA',
  rating: 4.8,
  reviewCount: 127,
  imageUrl: '/images/rock-climbing.jpg',
  images: [
    '/images/rock-climbing-1.jpg',
    '/images/rock-climbing-2.jpg',
    '/images/rock-climbing-3.jpg',
    '/images/rock-climbing-4.jpg'
  ],
  vendor: {
    id: '1',
    name: 'Adventure Co.',
    rating: 4.9,
    reviewCount: 342,
    description: 'Leading adventure company with over 10 years of experience in outdoor activities and extreme sports.',
    contact: {
      phone: '+1 (555) 123-4567',
      email: 'info@adventureco.com',
      website: 'www.adventureco.com'
    },
    location: 'Mountain View, CA',
    established: '2014'
  },
  availableDates: [
    '2024-01-20',
    '2024-01-21',
    '2024-01-22',
    '2024-01-25',
    '2024-01-26',
    '2024-01-27',
    '2024-01-28',
    '2024-01-29'
  ],
  timeSlots: ['9:00 AM', '1:00 PM', '5:00 PM'],
  maxParticipants: 8,
  minAge: 12,
  difficulty: 'Intermediate',
  included: [
    'Professional climbing equipment',
    'Safety gear and harness',
    'Certified instructor',
    'Safety briefing',
    'Refreshments',
    'Photos of your climb'
  ],
  requirements: [
    'Comfortable athletic clothing',
    'Closed-toe shoes',
    'Water bottle',
    'Positive attitude!'
  ],
  cancellation: 'Free cancellation up to 24 hours before the activity',
  reviews: [
    {
      id: '1',
      user: 'Sarah M.',
      rating: 5,
      date: '2024-01-15',
      comment: 'Amazing experience! The instructors were professional and made me feel safe throughout the entire climb. The views were breathtaking!'
    },
    {
      id: '2',
      user: 'Mike R.',
      rating: 4,
      date: '2024-01-12',
      comment: 'Great adventure for beginners. The equipment was top-notch and the safety measures were thorough. Highly recommend!'
    },
    {
      id: '3',
      user: 'Jessica L.',
      rating: 5,
      date: '2024-01-10',
      comment: 'Incredible experience! The guides were knowledgeable and the location was perfect. Can\'t wait to come back!'
    }
  ],
  relatedActivities: [
    {
      id: '2',
      title: 'Mountain Biking Trail',
      description: 'Explore scenic mountain trails on two wheels',
      price: 75.00,
      duration: '4 hours',
      location: 'Mountain View, CA',
      rating: 4.6,
      reviewCount: 89,
      imageUrl: '/images/mountain-biking.jpg',
      category: 'Adventure'
    },
    {
      id: '3',
      title: 'Hiking Adventure',
      description: 'Discover hidden trails and stunning vistas',
      price: 45.00,
      duration: '5 hours',
      location: 'Mountain View, CA',
      rating: 4.7,
      reviewCount: 156,
      imageUrl: '/images/hiking.jpg',
      category: 'Outdoor'
    }
  ]
};

// Image Gallery Component
function ImageGallery({ images, title }: { images: string[], title: string }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative group">
        <img
          src={images[currentImageIndex]}
          alt={`${title} - Image ${currentImageIndex + 1}`}
          className="w-full h-96 object-cover rounded-lg cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        />
        
        {/* Navigation Arrows */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentImageIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      <div className="flex space-x-2 overflow-x-auto">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => goToImage(index)}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
              index === currentImageIndex 
                ? 'border-blue-500 scale-105' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <img
              src={image}
              alt={`${title} thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Full Screen Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-full p-4">
            <img
              src={images[currentImageIndex]}
              alt={`${title} - Full size`}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Review Component
function ReviewCard({ review }: { review: any }) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card className="p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold">
              {review.user.charAt(0)}
            </span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Text variant="subtitle" className="font-semibold">
              {review.user}
            </Text>
            <div className="flex items-center space-x-1">
              {renderStars(review.rating)}
            </div>
            <Text variant="caption" className="text-gray-500">
              {new Date(review.date).toLocaleDateString()}
            </Text>
          </div>
          <Text variant="body">{review.comment}</Text>
        </div>
      </div>
    </Card>
  );
}

// Related Activities Component
function RelatedActivities({ activities }: { activities: any[] }) {
  return (
    <div className="space-y-4">
      <Text variant="h3" className="text-xl font-semibold">
        Related Activities
      </Text>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={{
              id: activity.id,
              title: activity.title,
              description: activity.description,
              category: activity.category,
              price: {
                amount: activity.price,
                currency: 'USD',
                perPerson: true
              },
              location: activity.location,
              duration: parseInt(activity.duration) * 60,
              maxParticipants: 10,
              images: [activity.imageUrl],
              rating: activity.rating,
              reviewCount: activity.reviewCount,
              vendor: {
                id: '1',
                name: 'Adventure Co.',
                verified: true
              },
              tags: [activity.category],
              featured: false
            }}
            variant="compact"
          />
        ))}
      </div>
    </div>
  );
}

export default function ActivityDetailPage() {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleBook = async (bookingData: {
    date: string;
    timeSlot: string;
    participants: { adults: number; children: number; seniors: number; total: number };
    specialRequests?: string;
    totalAmount: number;
  }) => {
    try {
      const payload: CreateBookingRequest = {
        activityId: mockActivity.id,
        date: bookingData.date,
        timeSlot: bookingData.timeSlot,
        participants: bookingData.participants,
        specialRequests: bookingData.specialRequests,
        // map UI total to backend; server recalculates authoritative totals
        // additional optional fields omitted here
      };
      const { booking } = await bookingService.createBooking(payload);
      toast.success('Booking created successfully', 'Success');
      // Navigate to confirmation page
      window.location.href = `/bookings/${booking._id}`;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create booking';
      toast.error(message, 'Booking Failed');
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    // You would typically make an API call here
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: mockActivity.title,
        text: mockActivity.description,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <a href="/activities" className="hover:text-blue-600">
                Activities
              </a>
            </li>
            <li>/</li>
            <li className="text-gray-900">{mockActivity.category}</li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{mockActivity.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <ImageGallery images={mockActivity.images} title={mockActivity.title} />

            {/* Activity Info */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Text variant="h1" className="text-3xl font-bold mb-2">
                    {mockActivity.title}
                  </Text>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{mockActivity.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{mockActivity.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>Max {mockActivity.maxParticipants} people</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSave}
                    className={`p-2 rounded-full transition-colors ${
                      isSaved 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < mockActivity.rating 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-gray-600">
                    {mockActivity.rating} ({mockActivity.reviewCount} reviews)
                  </span>
                </div>
                <Badge variant="outline">{mockActivity.category}</Badge>
                <Badge variant="outline">{mockActivity.difficulty}</Badge>
              </div>

              <Text variant="body" className="text-gray-700 mb-6">
                {mockActivity.longDescription}
              </Text>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  onClick={() => setIsBookingModalOpen(true)}
                  className="flex-1"
                >
                  Book Now - ${mockActivity.price}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.open(`/vendors/${mockActivity.vendor.id}`, '_blank')}
                >
                  View Vendor
                </Button>
              </div>
            </Card>

            {/* Tabs */}
            <Card className="p-6">
              <Tabs
                tabs={[
                  {
                    label: 'What\'s Included',
                    content: (
                      <div className="space-y-3">
                        {mockActivity.included.map((item, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Award className="w-5 h-5 text-green-600" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    )
                  },
                  {
                    label: 'Requirements',
                    content: (
                      <div className="space-y-3">
                        {mockActivity.requirements.map((item, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Award className="w-5 h-5 text-blue-600" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    )
                  },
                  {
                    label: 'Cancellation Policy',
                    content: (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <Text variant="body">{mockActivity.cancellation}</Text>
                      </div>
                    )
                  }
                ]}
              />
            </Card>

            {/* Reviews */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <Text variant="h3" className="text-xl font-semibold">
                  Reviews ({mockActivity.reviewCount})
                </Text>
                <Button variant="outline" size="sm">
                  Write a Review
                </Button>
              </div>
              <div className="space-y-4">
                {mockActivity.reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </Card>

            {/* Related Activities */}
            <RelatedActivities activities={mockActivity.relatedActivities} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vendor Info */}
            <Card className="p-6">
              <Text variant="h3" className="text-lg font-semibold mb-4">
                About the Vendor
              </Text>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {mockActivity.vendor.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <Text variant="subtitle" className="font-semibold">
                      {mockActivity.vendor.name}
                    </Text>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < mockActivity.vendor.rating 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-sm text-gray-600">
                        {mockActivity.vendor.rating} ({mockActivity.vendor.reviewCount})
                      </span>
                    </div>
                  </div>
                </div>
                <Text variant="body" className="text-gray-600">
                  {mockActivity.vendor.description}
                </Text>
                <div className="pt-3 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Location:</span>
                      <p className="font-medium">{mockActivity.vendor.location}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Established:</span>
                      <p className="font-medium">{mockActivity.vendor.established}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Info */}
            <Card className="p-6">
              <Text variant="h3" className="text-lg font-semibold mb-4">
                Quick Info
              </Text>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{mockActivity.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Group Size:</span>
                  <span className="font-medium">{mockActivity.maxParticipants} people</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Minimum Age:</span>
                  <span className="font-medium">{mockActivity.minAge}+ years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className="font-medium">{mockActivity.difficulty}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <ActivityBookingModal
        activity={{
          id: mockActivity.id,
          title: mockActivity.title,
          description: mockActivity.description,
          price: {
            amount: mockActivity.price,
            currency: 'USD',
            perPerson: true
          },
          location: mockActivity.location,
          duration: parseInt(mockActivity.duration) * 60,
          maxParticipants: mockActivity.maxParticipants,
          rating: mockActivity.rating,
          reviewCount: mockActivity.reviewCount,
          vendor: {
            name: mockActivity.vendor.name,
            verified: true
          }
        }}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBook={handleBook}
        availableDates={mockActivity.availableDates}
        availableTimes={mockActivity.timeSlots}
      />
    </div>
  );
}
