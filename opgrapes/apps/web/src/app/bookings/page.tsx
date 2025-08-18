'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Container } from '@opgrapes/ui/Container';
import { Card } from '@opgrapes/ui/Card';
import { Button } from '@opgrapes/ui/Button';
import { Text } from '@opgrapes/ui/Text';
import { Stack } from '@opgrapes/ui/Stack';
import { Badge } from '@opgrapes/ui/Badge';
import { useRouter } from 'next/navigation';
import { bookingService, type Booking, type BookingStats } from '@/services/bookingService';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

function BookingsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const [bookingsData, statsData] = await Promise.all([
          bookingService.getMyBookings(),
          bookingService.getBookingStats()
        ]);
        setBookings(bookingsData.bookings);
        setStats(statsData.stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  if (!user) return null;

  const handleCancelBooking = async (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingService.cancelBooking(bookingId);
        // Refresh bookings
        const updatedBookings = await bookingService.getMyBookings();
        setBookings(updatedBookings.bookings);
        // Refresh stats
        const updatedStats = await bookingService.getBookingStats();
        setStats(updatedStats.stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to cancel booking');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'warning' as const, text: 'Pending' },
      confirmed: { variant: 'success' as const, text: 'Confirmed' },
      completed: { variant: 'success' as const, text: 'Completed' },
      cancelled: { variant: 'danger' as const, text: 'Cancelled' },
      refunded: { variant: 'secondary' as const, text: 'Refunded' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  return (
    <Container size="lg" className="py-8">
      <Stack spacing="lg">
        {/* Page Header */}
        <Card>
          <div className="p-6">
            <Stack spacing="md">
              <Text as="div" size="xl" weight="bold">
                My Bookings
              </Text>
              <Text size="lg" color="gray">
                Track your upcoming and past activity bookings
              </Text>
            </Stack>
          </div>
        </Card>

        {/* Stats Overview */}
        {stats && (
          <Card>
            <div className="p-6 border-b border-gray-200">
              <Text as="div" size="xl" weight="bold">
                Booking Overview
              </Text>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Text size="xl" weight="bold" color="primary">
                    {stats.totalBookings}
                  </Text>
                  <Text size="sm" color="gray">Total Bookings</Text>
                </div>
                <div className="text-center">
                  <Text size="xl" weight="bold" color="warning">
                    {stats.pendingBookings}
                  </Text>
                  <Text size="sm" color="gray">Pending</Text>
                </div>
                <div className="text-center">
                  <Text size="xl" weight="bold" color="success">
                    {stats.confirmedBookings}
                  </Text>
                  <Text size="sm" color="gray">Confirmed</Text>
                </div>
                <div className="text-center">
                  <Text size="xl" weight="bold" color="success">
                    {stats.completedBookings}
                  </Text>
                  <Text size="sm" color="gray">Completed</Text>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Upcoming Bookings */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <Text as="div" size="xl" weight="bold">
              Upcoming Bookings
            </Text>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <LoadingSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <Text color="danger" className="mb-4">{error}</Text>
                <Button variant="primary" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : bookings.filter(b => ['pending', 'confirmed'].includes(b.status)).length > 0 ? (
              <div className="space-y-4">
                {bookings
                  .filter(b => ['pending', 'confirmed'].includes(b.status))
                  .map((booking) => (
                    <div key={booking._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Text weight="semibold">{booking.activityId.title}</Text>
                            {getStatusBadge(booking.status)}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Date: {new Date(booking.date).toLocaleDateString()}</div>
                            <div>Participants: {booking.groupSize}</div>
                            <div>Total: ${booking.totalAmount.toFixed(2)}</div>
                            <div>Vendor: {booking.activityId.vendorId.businessName}</div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/activities/${booking.activityId._id}`)}
                          >
                            View Activity
                          </Button>
                          {booking.status === 'pending' && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleCancelBooking(booking._id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Text size="lg" color="gray">
                  No upcoming bookings yet
                </Text>
                <Text size="sm" color="gray" className="mt-2">
                  Start exploring activities to make your first booking
                </Text>
                <Button
                  variant="primary"
                  className="mt-4"
                  onClick={() => router.push('/activities')}
                >
                  Explore Activities
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Past Bookings */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <Text as="div" size="xl" weight="bold">
              Past Bookings
            </Text>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <LoadingSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <Text color="danger" className="mb-4">{error}</Text>
                <Button variant="primary" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : bookings.filter(b => ['completed', 'cancelled', 'refunded'].includes(b.status)).length > 0 ? (
              <div className="space-y-4">
                {bookings
                  .filter(b => ['completed', 'cancelled', 'refunded'].includes(b.status))
                  .map((booking) => (
                    <div key={booking._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Text weight="semibold">{booking.activityId.title}</Text>
                            {getStatusBadge(booking.status)}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Date: {new Date(booking.date).toLocaleDateString()}</div>
                            <div>Participants: {booking.groupSize}</div>
                            <div>Total: ${booking.totalAmount.toFixed(2)}</div>
                            <div>Vendor: {booking.activityId.vendorId.businessName}</div>
                            {booking.completedAt && (
                              <div>Completed: {new Date(booking.completedAt).toLocaleDateString()}</div>
                            )}
                            {booking.cancelledAt && (
                              <div>Cancelled: {new Date(booking.cancelledAt).toLocaleDateString()}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/activities/${booking.activityId._id}`)}
                          >
                            View Activity
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Text size="lg" color="gray">
                  No past bookings yet
                </Text>
                <Text size="sm" color="gray" className="mt-2">
                  Your completed activities will appear here
                </Text>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <Text as="div" size="xl" weight="bold">
              Quick Actions
            </Text>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="primary"
                size="lg"
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => router.push('/activities')}
              >
                <span className="text-xl">🔍</span>
                <Text weight="bold">Discover New Activities</Text>
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => router.push('/profile')}
              >
                <span className="text-xl">👤</span>
                <Text weight="bold">Update Preferences</Text>
              </Button>
            </div>
          </div>
        </Card>
      </Stack>
    </Container>
  );
}

export default function BookingsPage() {
  return (
    <ProtectedRoute>
      <BookingsContent />
    </ProtectedRoute>
  );
}
