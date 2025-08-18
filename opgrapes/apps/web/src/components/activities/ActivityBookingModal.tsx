'use client';

import { useMemo, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@opgrapes/ui/Modal';
import { Button } from '@opgrapes/ui/Button';
import { Text } from '@opgrapes/ui/Text';
import { Stack } from '@opgrapes/ui/Stack';
import { FormField } from '@opgrapes/ui/FormField';
import { Input } from '@opgrapes/ui/Input';
import { Select } from '@opgrapes/ui/Select';
import { Card, CardBody } from '@opgrapes/ui/Card';
import { Badge } from '@opgrapes/ui/Badge';
import { Clock, Users, MapPin, Star } from 'lucide-react';
import { bookingService } from '@/services/bookingService';

interface Activity {
  id: string;
  title: string;
  description: string;
  price: {
    amount: number;
    currency: string;
    perPerson: boolean;
  };
  location: string;
  duration: number;
  maxParticipants: number;
  rating: number;
  reviewCount: number;
  vendor: {
    name: string;
    verified: boolean;
  };
}

interface ActivityBookingModalProps {
  activity: Activity;
  isOpen: boolean;
  onClose: () => void;
  onBook: (bookingData: BookingFormData) => void;
  availableDates?: string[];
  availableTimes?: string[];
}



interface BookingFormData {
  date: string; // ISO date string (no time) that backend can parse
  timeSlot: string;
  participants: {
    adults: number;
    children: number;
    seniors: number;
    total: number;
  };
  specialRequests?: string;
  totalAmount: number;
}

export function ActivityBookingModal({ 
  activity, 
  isOpen, 
  onClose, 
  onBook,
  availableDates: datesFromProps,
  availableTimes: timesFromProps
}: ActivityBookingModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [seniors, setSeniors] = useState(0);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slotAvailability, setSlotAvailability] = useState<Record<string, number>>({});
  const [remainingCapacity, setRemainingCapacity] = useState<number | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const availableDates = datesFromProps && datesFromProps.length > 0 ? datesFromProps : [
    '2024-01-20', '2024-01-21', '2024-01-22', '2024-01-25', 
    '2024-01-26', '2024-01-27', '2024-01-28', '2024-01-29'
  ];
  const availableTimes = timesFromProps && timesFromProps.length > 0 ? timesFromProps : ['9:00 AM', '1:00 PM', '5:00 PM'];

  const totalParticipants = useMemo(() => adults + children + seniors, [adults, children, seniors]);
  const totalPrice = activity.price.amount * totalParticipants;
  const remainingForSelectedSlot = selectedTime ? slotAvailability[selectedTime] : undefined;
  const exceedsSlot = remainingForSelectedSlot !== undefined && totalParticipants > remainingForSelectedSlot;
  const exceedsDate = remainingCapacity !== null && totalParticipants > remainingCapacity;
  const exceedsMax = totalParticipants > activity.maxParticipants;

  // Fetch availability when date changes
  const fetchAvailability = async (dateStr: string) => {
    setAvailabilityError(null);
    setSlotAvailability({});
    setRemainingCapacity(null);
    try {
      const { remainingCapacity, slotAvailability } = await bookingService.getAvailability(activity.id, new Date(dateStr).toISOString());
      setRemainingCapacity(remainingCapacity);
      setSlotAvailability(slotAvailability);
    } catch (e) {
      setAvailabilityError(e instanceof Error ? e.message : 'Failed to fetch availability');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || totalParticipants === 0) {
      return;
    }

    // Capacity validation
    if (exceedsMax || exceedsSlot || exceedsDate) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Backend expects ISO datetime string in date; we'll pass ISO date (midnight UTC) and a separate timeSlot
      const isoDate = new Date(selectedDate).toISOString();
      const bookingData: BookingFormData = {
        date: isoDate,
        timeSlot: selectedTime,
        participants: {
          adults,
          children,
          seniors,
          total: totalParticipants
        },
        specialRequests: specialRequests || undefined,
        totalAmount: totalPrice
      };

      await onBook(bookingData);
      onClose();
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const decrement = (setter: (n: number) => void, value: number, min: number = 0) => {
    if (value > min) setter(value - 1);
  };
  const increment = (setter: (n: number) => void, value: number, max: number) => {
    if (value < max) setter(value + 1);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <Text as="div" size="xl" weight="bold" className="text-xl font-bold">
          Book {activity.title}
        </Text>
      </ModalHeader>

              <form onSubmit={handleSubmit}>
          <ModalBody>
            <Stack spacing="lg">
            {/* Activity Summary */}
            <Card>
              <CardBody>
                <Stack spacing="md">
                  <div className="flex items-start justify-between">
                    <div>
                                              <Text as="div" size="lg" weight="semibold" className="text-lg font-semibold">
                          {activity.title}
                        </Text>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span>{activity.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{formatDuration(activity.duration)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>Up to {activity.maxParticipants}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Star size={16} className="fill-yellow-400 text-yellow-400" />
                        <Text size="sm" weight="medium">
                          {activity.rating.toFixed(1)}
                        </Text>
                        <Text size="xs" color="gray">
                          ({activity.reviewCount})
                        </Text>
                      </div>
                      <Text size="sm" color="gray" className="mt-1">
                        {activity.vendor.name}
                        {activity.vendor.verified && (
                          <Badge variant="success" size="sm" className="ml-2">
                            Verified
                          </Badge>
                        )}
                      </Text>
                    </div>
                  </div>
                </Stack>
              </CardBody>
            </Card>

            {/* Booking Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date and Time Selection */}
              <div className="space-y-4">
                <FormField label="Select Date" required>
                  <Select
                    value={selectedDate}
                    onChange={(e) => { setSelectedDate(e.target.value); fetchAvailability(e.target.value); }}
                    placeholder="Choose a date"
                    options={availableDates.map((date) => ({
                      value: date,
                      label: formatDate(date)
                    }))}
                  />
                </FormField>

                <FormField label="Select Time" required>
                  <Select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    placeholder="Choose a time"
                    options={availableTimes.map((time) => {
                      const remainingForSlot = slotAvailability[time];
                      const disabled = remainingForSlot !== undefined && remainingForSlot <= 0;
                      const label = remainingForSlot !== undefined ? `${time} ${disabled ? '(Full)' : `(Remaining: ${remainingForSlot})`}` : time;
                      return {
                        value: time,
                        label: label,
                        disabled: disabled
                      };
                    })}
                  />
                </FormField>
                {exceedsSlot && (
                  <Text size="sm" color="danger">Requested group exceeds remaining capacity for the selected time slot.</Text>
                )}

                {availabilityError && (
                  <div className="p-2 rounded border border-red-200 bg-red-50">
                    <Text size="sm" color="danger">{availabilityError}</Text>
                  </div>
                )}
                {remainingCapacity !== null && (
                  <Text size="sm" color="gray">Remaining capacity for selected date: {remainingCapacity}</Text>
                )}

                <FormField label="Participants" required>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                      <Text size="sm" weight="medium">Adults</Text>
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => decrement(setAdults, adults, 1)}>-</Button>
                        <Input type="number" value={adults} onChange={(e) => setAdults(Math.max(1, Math.min(activity.maxParticipants, Number(e.target.value) || 0)))} />
                        <Button type="button" variant="outline" size="sm" onClick={() => increment(setAdults, adults, activity.maxParticipants)}>+</Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                      <Text size="sm" weight="medium">Children</Text>
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => decrement(setChildren, children, 0)}>-</Button>
                        <Input type="number" value={children} onChange={(e) => setChildren(Math.max(0, Math.min(activity.maxParticipants, Number(e.target.value) || 0)))} />
                        <Button type="button" variant="outline" size="sm" onClick={() => increment(setChildren, children, activity.maxParticipants)}>+</Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                      <Text size="sm" weight="medium">Seniors</Text>
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => decrement(setSeniors, seniors, 0)}>-</Button>
                        <Input type="number" value={seniors} onChange={(e) => setSeniors(Math.max(0, Math.min(activity.maxParticipants, Number(e.target.value) || 0)))} />
                        <Button type="button" variant="outline" size="sm" onClick={() => increment(setSeniors, seniors, activity.maxParticipants)}>+</Button>
                      </div>
                    </div>
                  </div>
                  <Text size="sm" color="gray" className="mt-2">
                    Total: {totalParticipants} (Max {activity.maxParticipants})
                  </Text>
                  {exceedsDate && (
                    <Text size="sm" color="danger">Requested group exceeds remaining capacity for the selected date.</Text>
                  )}
                  {exceedsMax && (
                    <Text size="sm" color="danger">Group exceeds maximum allowed participants for this activity.</Text>
                  )}
                </FormField>
              </div>


            </div>

            {/* Special Requests & Payment */}
            <FormField label="Special Requests (Optional)">
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Any special requirements or requests?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </FormField>

            <FormField label="Payment Method (Placeholder)">
              <Select 
                value={"card"} 
                onChange={() => {}}
                options={[
                  { value: "card", label: "Credit/Debit Card" },
                  { value: "paypal", label: "PayPal" }
                ]}
              />
              <Text size="xs" color="gray">Payment collection will be integrated later.</Text>
            </FormField>

            {/* Price Summary */}
            <Card>
              <CardBody>
                <Stack spacing="sm">
                  <Text as="div" size="lg" weight="semibold" className="text-lg font-semibold">
                    Price Summary
                  </Text>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Text color="gray">
                        {activity.price.amount} {activity.price.currency} per person
                      </Text>
                      <Text>{activity.price.amount} {activity.price.currency}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text color="gray">Participants</Text>
                      <Text>× {totalParticipants}</Text>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between">
                        <Text size="lg" weight="semibold">Total</Text>
                        <Text size="xl" weight="bold" color="primary">
                          {totalPrice.toFixed(2)} {activity.price.currency}
                        </Text>
                      </div>
                    </div>
                  </div>
                </Stack>
              </CardBody>
            </Card>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!selectedDate || !selectedTime || totalParticipants === 0 || totalParticipants > activity.maxParticipants || isSubmitting}
            >
              {isSubmitting ? 'Processing...' : `Book Now - ${totalPrice.toFixed(2)} ${activity.price.currency}`}
            </Button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
}
