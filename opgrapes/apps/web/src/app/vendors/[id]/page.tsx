'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card } from 'ui/Card';
import { Button } from 'ui/Button';
import { Text } from 'ui/Text';
import { Badge } from 'ui/Badge';
import { Stack } from 'ui/Stack';
import { Tabs } from 'ui/Tabs';
import { ActivityCard } from '@/components/activities/ActivityCard';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { 
  MapPin, 
  Star, 
  Calendar, 
  Phone, 
  Mail, 
  Globe, 
  Users, 
  Award,
  Clock,
  Shield,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

// Mock data for development - replace with API calls
const mockVendor = {
  id: '1',
  name: 'Adventure Co.',
  description: 'Leading adventure company with over 10 years of experience in outdoor activities and extreme sports. We specialize in creating unforgettable experiences that challenge and inspire.',
  logo: '/images/adventure-co-logo.jpg',
  banner: '/images/adventure-banner.jpg',
  verified: true,
  rating: 4.9,
  reviewCount: 342,
  location: 'Mountain View, CA',
  established: '2014',
  activityCount: 15,
  categories: ['adventure', 'outdoor', 'water-sports'],
  contact: {
    phone: '+1 (555) 123-4567',
    email: 'info@adventureco.com',
    website: 'adventureco.com',
  },
  featured: true,
  about: 'Adventure Co. was founded with a simple mission: to make outdoor adventure accessible to everyone. Our team of certified guides and instructors brings years of experience in rock climbing, whitewater rafting, mountain biking, and wilderness survival.',
  certifications: [
    'Wilderness First Responder Certified',
    'AMGA Certified Rock Guide',
    'ACA Whitewater Instructor',
    'Leave No Trace Master Educator'
  ],
  awards: [
    'Best Adventure Company 2023 - Outdoor Magazine',
    'Excellence in Safety 2022 - Adventure Safety Council',
    'Community Impact Award 2021 - Local Tourism Board'
  ],
  policies: {
    cancellation: 'Free cancellation up to 48 hours before activity',
    insurance: 'All activities include comprehensive insurance coverage',
    equipment: 'Professional-grade equipment provided for all activities',
    groupSize: 'Maximum 8 participants per guide for safety'
  }
};

const mockActivities = [
  {
    id: '1',
    title: 'Rock Climbing Adventure',
    description: 'Experience the thrill of rock climbing with our certified guides.',
    price: 89,
    duration: '4 hours',
    location: 'Mountain View, CA',
    rating: 4.9,
    reviewCount: 156,
    image: '/images/rock-climbing.jpg',
    category: 'adventure',
    difficulty: 'intermediate',
    maxParticipants: 6,
    included: ['Equipment', 'Guide', 'Safety Briefing', 'Photos'],
    requirements: ['Age 12+', 'Basic fitness level', 'Comfortable with heights']
  },
  {
    id: '2',
    title: 'Whitewater Rafting',
    description: 'Navigate exciting rapids on the scenic river with expert instruction.',
    price: 129,
    duration: '6 hours',
    location: 'Mountain View, CA',
    rating: 4.8,
    reviewCount: 98,
    image: '/images/whitewater-rafting.jpg',
    category: 'water-sports',
    difficulty: 'beginner',
    maxParticipants: 8,
    included: ['Raft', 'Life Jacket', 'Guide', 'Lunch', 'Transportation'],
    requirements: ['Age 8+', 'Swimming ability', 'Comfortable in water']
  },
  {
    id: '3',
    title: 'Mountain Biking Trail',
    description: 'Explore scenic mountain trails with our experienced mountain biking guides.',
    price: 69,
    duration: '3 hours',
    location: 'Mountain View, CA',
    rating: 4.7,
    reviewCount: 87,
    image: '/images/mountain-biking.jpg',
    category: 'outdoor',
    difficulty: 'intermediate',
    maxParticipants: 8,
    included: ['Mountain Bike', 'Helmet', 'Guide', 'Trail Map', 'Water'],
    requirements: ['Age 14+', 'Basic cycling skills', 'Good physical condition']
  }
];

const mockReviews = [
  {
    id: '1',
    user: 'Sarah M.',
    rating: 5,
    date: '2024-01-15',
    title: 'Amazing rock climbing experience!',
    content: 'The guides were incredibly knowledgeable and made me feel safe throughout the entire experience. The views were breathtaking and I learned so much about climbing techniques.',
    activity: 'Rock Climbing Adventure'
  },
  {
    id: '2',
    user: 'Mike R.',
    rating: 5,
    date: '2024-01-10',
    title: 'Professional and fun whitewater rafting',
    content: 'Great experience with Adventure Co.! The guides were professional, safety-conscious, and made the whole trip enjoyable. The rapids were exciting but never felt unsafe.',
    activity: 'Whitewater Rafting'
  },
  {
    id: '3',
    user: 'Lisa K.',
    rating: 4,
    date: '2024-01-05',
    title: 'Good mountain biking experience',
    content: 'The mountain biking trail was well-maintained and the guide was helpful. The equipment was in good condition. Would recommend for intermediate riders.',
    activity: 'Mountain Biking Trail'
  }
];

export default function VendorDetailPage() {
  const params = useParams();
  const [vendor, setVendor] = useState(mockVendor);
  const [activities, setActivities] = useState(mockActivities);
  const [reviews, setReviews] = useState(mockReviews);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // In production, fetch vendor data based on params.id
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [params.id]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  const handleContact = (type: 'phone' | 'email' | 'website') => {
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

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={`${
          i < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-6">
              {/* Logo */}
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Text size="3xl" weight="bold" className="text-primary">
                  {vendor.name.charAt(0)}
                </Text>
              </div>
              
              {/* Vendor Info */}
              <div className="text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Text as="h1" size="3xl" weight="bold">
                    {vendor.name}
                  </Text>
                  {vendor.verified && (
                    <Badge variant="success" size="sm">
                      <CheckCircle size={14} className="mr-1" />
                      Verified
                    </Badge>
                  )}
                  {vendor.featured && (
                    <Badge variant="primary" size="sm">
                      <Award size={14} className="mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-6 text-white/90">
                  <div className="flex items-center gap-1">
                    {renderStars(vendor.rating)}
                    <span className="ml-1">{vendor.rating} ({vendor.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span>{vendor.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>Est. {vendor.established}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <Tabs value={activeTab} onChange={setActiveTab}>
              <Tabs.List>
                <Tabs.Tab value="overview">Overview</Tabs.Tab>
                <Tabs.Tab value="activities">Activities ({activities.length})</Tabs.Tab>
                <Tabs.Tab value="reviews">Reviews ({reviews.length})</Tabs.Tab>
                <Tabs.Tab value="about">About</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="overview" className="mt-6">
                <Stack gap="6">
                  {/* Quick Stats */}
                  <Card>
                    <div className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                          <Text size="2xl" weight="bold" className="text-primary">
                            {vendor.activityCount}
                          </Text>
                          <Text size="sm" color="gray">Activities</Text>
                        </div>
                        <div>
                          <Text size="2xl" weight="bold" className="text-green-600">
                            {vendor.rating}
                          </Text>
                          <Text size="sm" color="gray">Rating</Text>
                        </div>
                        <div>
                          <Text size="2xl" weight="bold" className="text-blue-600">
                            {vendor.reviewCount}
                          </Text>
                          <Text size="sm" color="gray">Reviews</Text>
                        </div>
                        <div>
                          <Text size="2xl" weight="bold" className="text-purple-600">
                            {new Date().getFullYear() - parseInt(vendor.established)}
                          </Text>
                          <Text size="sm" color="gray">Years</Text>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Featured Activities */}
                  <Card>
                    <div className="px-6 py-4 border-b border-gray-200">
                      <Text as="h3" size="lg" weight="semibold">
                        Featured Activities
                      </Text>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activities.slice(0, 2).map((activity) => (
                          <ActivityCard key={activity.id} activity={activity} variant="compact" />
                        ))}
                      </div>
                      <div className="mt-4 text-center">
                        <Button variant="outline" onClick={() => setActiveTab('activities')}>
                          View All Activities
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Recent Reviews */}
                  <Card>
                    <div className="px-6 py-4 border-b border-gray-200">
                      <Text as="h3" size="lg" weight="semibold">
                        Recent Reviews
                      </Text>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {reviews.slice(0, 2).map((review) => (
                          <div key={review.id} className="border-b pb-4 last:border-b-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Text weight="medium">{review.user}</Text>
                                <Text size="sm" color="gray">{review.activity}</Text>
                              </div>
                              <div className="flex items-center gap-1">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                            <Text as="h4" size="sm" weight="medium" className="mb-1">
                              {review.title}
                            </Text>
                            <Text size="sm" color="gray">{review.content}</Text>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-center">
                        <Button variant="outline" onClick={() => setActiveTab('reviews')}>
                          View All Reviews
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="activities" className="mt-6">
                <Card>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {activities.map((activity) => (
                        <ActivityCard key={activity.id} activity={activity} />
                      ))}
                    </div>
                  </div>
                </Card>
              </Tabs.Panel>

              <Tabs.Panel value="reviews" className="mt-6">
                <Card>
                  <div className="p-6">
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-b-0">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <Text weight="semibold" className="text-primary">
                                  {review.user.charAt(0)}
                                </Text>
                              </div>
                              <div>
                                <Text weight="medium">{review.user}</Text>
                                <Text size="sm" color="gray">{review.activity}</Text>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          <Text as="h4" size="lg" weight="medium" className="mb-2">
                            {review.title}
                          </Text>
                          <Text color="gray">{review.content}</Text>
                          <Text size="sm" color="gray" className="mt-2">
                            {new Date(review.date).toLocaleDateString()}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </Tabs.Panel>

              <Tabs.Panel value="about" className="mt-6">
                <Stack gap="6">
                  <Card>
                    <div className="px-6 py-4 border-b border-gray-200">
                      <Text as="h3" size="lg" weight="semibold">
                        About {vendor.name}
                      </Text>
                    </div>
                    <div className="p-6">
                      <Text>{vendor.about}</Text>
                    </div>
                  </Card>

                  <Card>
                    <div className="px-6 py-4 border-b border-gray-200">
                      <Text as="h3" size="lg" weight="semibold">
                        Certifications & Awards
                      </Text>
                    </div>
                    <div className="p-6">
                      <Stack gap="4">
                        <div>
                          <Text weight="medium" className="mb-2">Certifications:</Text>
                          <ul className="space-y-1">
                            {vendor.certifications.map((cert, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-green-500" />
                                <Text size="sm">{cert}</Text>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <Text weight="medium" className="mb-2">Awards:</Text>
                          <ul className="space-y-1">
                            {vendor.awards.map((award, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <Award size={16} className="text-yellow-500" />
                                <Text size="sm">{award}</Text>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </Stack>
                    </div>
                  </Card>

                  <Card>
                    <div className="px-6 py-4 border-b border-gray-200">
                      <Text as="h3" size="lg" weight="semibold">
                        Policies & Information
                      </Text>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(vendor.policies).map(([key, value]) => (
                          <div key={key} className="p-3 bg-gray-50 rounded-lg">
                            <Text weight="medium" className="mb-1 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </Text>
                            <Text size="sm" color="gray">{value}</Text>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </Stack>
              </Tabs.Panel>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <Text as="h3" size="lg" weight="semibold">
                  Contact Information
                </Text>
              </div>
              <div className="p-6">
                <Stack gap="4">
                  <Button
                    variant="outline"
                    onClick={() => handleContact('phone')}
                    className="w-full justify-start"
                  >
                    <Phone size={16} className="mr-2" />
                    {vendor.contact.phone}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleContact('email')}
                    className="w-full justify-start"
                  >
                    <Mail size={16} className="mr-2" />
                    {vendor.contact.email}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleContact('website')}
                    className="w-full justify-start"
                  >
                    <Globe size={16} className="mr-2" />
                    {vendor.contact.website}
                    <ExternalLink size={14} className="ml-auto" />
                  </Button>
                </Stack>
              </div>
            </Card>

            {/* Categories */}
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <Text as="h3" size="lg" weight="semibold">
                  Categories
                </Text>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {vendor.categories.map((category) => (
                    <Badge key={category} variant="secondary" size="sm">
                      {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <Text as="h3" size="lg" weight="semibold">
                  Quick Actions
                </Text>
              </div>
              <div className="p-6">
                <Stack gap="3">
                  <Button variant="primary" className="w-full">
                    Book an Activity
                  </Button>
                  <Button variant="outline" className="w-full">
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full">
                    Follow Vendor
                  </Button>
                </Stack>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
