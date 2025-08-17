'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Container } from '@opgrapes/ui/Container';
import { Card } from '@opgrapes/ui/Card';
import { Button } from '@opgrapes/ui/Button';
import { Text } from '@opgrapes/ui/Text';
import { Stack } from '@opgrapes/ui/Stack';
import { Badge } from '@opgrapes/ui/Badge';
import { useRouter } from 'next/navigation';
import { bookingService, type Booking } from '@/services/bookingService';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  CreditCard,
  Download,
  Share2
} from 'lucide-react';

function BookingConfirmationContent() {
  const params = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const { booking: bookingData } = await bookingService.getBooking(params.id as string);
        setBooking(bookingData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch booking');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBooking();
    }
  }, [params.id]);

  if (!user) return null;

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !booking) {
    return (
      <Container>
        <div className="text-center py-12">
          <Text size="xl" color="danger">
            {error || 'Booking not found'}
          </Text>
          <Button 
            variant="primary" 
            className="mt-4"
            onClick={() => router.push('/bookings')}
          >
            Back to My Bookings
          </Button>
        </div>
      </Container>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'warning' as const, text: 'Pending' },
      confirmed: { variant: 'success' as const, text: 'Confirmed' },
      completed: { variant: 'success' as const, text: 'Completed' },
      cancelled: { variant: 'danger' as const, text: 'Cancelled' },
      refunded: { variant: 'danger' as const, text: 'Refunded' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  return (
    <Container>
      <div className="max-w-4xl mx-auto py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <Text as="h1" size="2xl" weight="bold" className="mb-2">
            Booking Confirmed!
          </Text>
          <Text size="lg" color="gray">
            Your booking has been successfully created. You'll receive a confirmation email shortly.
          </Text>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Details */}
            <Card>
              <Card.Body>
                <Stack gap="4">
                  <div className="flex items-start justify-between">
                    <div>
                      <Text as="h2" size="xl" weight="bold">
                        {booking.activityId.title}
                      </Text>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span>{booking.activityId.vendorId.businessName}</span>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </Stack>
              </Card.Body>
            </Card>

            {/* Booking Details */}
            <Card>
              <Card.Body>
                <Stack gap="4">
                  <Text as="h3" size="lg" weight="semibold">
                    Booking Details
                  </Text>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-gray-500" />
                      <div>
                        <Text size="sm" weight="medium">Date</Text>
                        <Text size="sm" color="gray">
                          {new Date(booking.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Text>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-gray-500" />
                      <div>
                        <Text size="sm" weight="medium">Time</Text>
                        <Text size="sm" color="gray">
                          {booking.timeSlot || 'TBD'}
                        </Text>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users size={16} className="text-gray-500" />
                      <div>
                        <Text size="sm" weight="medium">Participants</Text>
                        <Text size="sm" color="gray">
                          {booking.groupSize} people
                        </Text>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CreditCard size={16} className="text-gray-500" />
                      <div>
                        <Text size="sm" weight="medium">Total Amount</Text>
                        <Text size="sm" color="gray">
                          ${booking.totalAmount.toFixed(2)}
                        </Text>
                      </div>
                    </div>
                  </div>
                </Stack>
              </Card.Body>
            </Card>

            {/* Special Requests */}
            {booking.specialRequests && (
              <Card>
                <Card.Body>
                  <Stack gap="4">
                    <Text as="h3" size="lg" weight="semibold">
                      Special Requests
                    </Text>
                    <Text color="gray">{booking.specialRequests}</Text>
                  </Stack>
                </Card.Body>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <Card.Body>
                <Stack gap="4">
                  <Text as="h3" size="lg" weight="semibold">
                    Actions
                  </Text>
                  <div className="space-y-3">
                    <Button 
                      variant="primary" 
                      className="w-full"
                      onClick={() => router.push('/bookings')}
                    >
                      View All Bookings
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => router.push(`/activities/${booking.activityId._id}`)}
                    >
                      View Activity
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        // TODO: Implement download functionality
                        console.log('Download receipt');
                      }}
                    >
                      <Download size={16} className="mr-2" />
                      Download Receipt
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        // TODO: Implement share functionality
                        console.log('Share booking');
                      }}
                    >
                      <Share2 size={16} className="mr-2" />
                      Share
                    </Button>
                  </div>
                </Stack>
              </Card.Body>
            </Card>

            {/* Contact Info */}
            <Card>
              <Card.Body>
                <Stack gap="4">
                  <Text as="h3" size="lg" weight="semibold">
                    Need Help?
                  </Text>
                  <div className="space-y-2 text-sm">
                    <Text color="gray">
                      If you have any questions about your booking, please contact the vendor or our support team.
                    </Text>
                    <Text color="gray">
                      <strong>Vendor:</strong> {booking.activityId.vendorId.businessName}
                    </Text>
                  </div>
                </Stack>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default function BookingConfirmationPage() {
  return (
    <ProtectedRoute>
      <BookingConfirmationContent />
    </ProtectedRoute>
  );
}


