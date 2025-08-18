'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container } from '@opgrapes/ui/Container';
import { Card } from '@opgrapes/ui/Card';
import { Button } from '@opgrapes/ui/Button';
import { Text } from '@opgrapes/ui/Text';
import { Stack } from '@opgrapes/ui/Stack';
import { bookingService, type Booking } from '@/services/bookingService';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const data = await bookingService.getBooking(params?.id as string);
        setBooking(data.booking);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    };
    if (params?.id) fetchBooking();
  }, [params?.id]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <div className="p-8"><Text color="danger">{error}</Text></div>;
  if (!booking) return null;

  return (
    <Container size="md" className="py-10">
      <Card>
        <div className="p-6">
          <Stack spacing="md">
            <Text as="div" size="xl" weight="bold">Checkout (Placeholder)</Text>
            <Text color="gray">Payment integration will be added here. Review your booking details below.</Text>
            <div className="space-y-2 text-sm text-gray-700">
              <div><strong>Activity:</strong> {booking.activityId.title}</div>
              <div><strong>Date:</strong> {new Date(booking.date).toLocaleString()}</div>
              {booking.timeSlot && (<div><strong>Time:</strong> {booking.timeSlot}</div>)}
              <div><strong>Participants:</strong> {booking.groupSize}</div>
              <div><strong>Total:</strong> ${booking.totalAmount.toFixed(2)}</div>
              <div><strong>Status:</strong> {booking.status}</div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="primary" onClick={() => router.push('/bookings')}>View My Bookings</Button>
              <Button variant="secondary" onClick={() => router.push(`/activities/${booking.activityId._id}`)}>Back to Activity</Button>
            </div>
          </Stack>
        </div>
      </Card>
    </Container>
  );
}


