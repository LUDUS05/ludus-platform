'use client';

import { useState } from 'react';
import { Modal } from '@opgrapes/ui/Modal';
import { Button } from '@opgrapes/ui/Button';
import { Text } from '@opgrapes/ui/Text';
import { Stack } from '@opgrapes/ui/Stack';
import { Form } from '@opgrapes/ui/Form';
import { FormField } from '@opgrapes/ui/FormField';
import { Input } from '@opgrapes/ui/Input';
import { Select } from '@opgrapes/ui/Select';
import { Card } from '@opgrapes/ui/Card';
import { Badge } from '@opgrapes/ui/Badge';
import { Calendar, Clock, Users, MapPin, Star } from 'lucide-react';

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
  onBook: (bookingData: BookingData) => void;
}

interface Participant {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  age?: number;
  specialRequirements?: string;
}

interface BookingData {
  date: string;
  time: string;
  participants: Participant[];
  specialRequests?: string;
  groupSize: number;
  totalAmount: number;
}

export function ActivityBookingModal({ 
  activity, 
  isOpen, 
  onClose, 
  onBook 
}: ActivityBookingModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([
    { firstName: '', lastName: '', email: '', phone: '' }
  ]);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock available dates and times - replace with API data
  const availableDates = [
    '2024-01-20', '2024-01-21', '2024-01-22', '2024-01-25', 
    '2024-01-26', '2024-01-27', '2024-01-28', '2024-01-29'
  ];
  
  const availableTimes = ['9:00 AM', '1:00 PM', '5:00 PM'];

  const totalPrice = activity.price.amount * participants.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || participants.length === 0) {
      return;
    }

    // Validate that all participants have required fields
    const isValid = participants.every(p => p.firstName && p.lastName);
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const bookingData: BookingData = {
        date: selectedDate,
        time: selectedTime,
        participants,
        specialRequests: specialRequests || undefined,
        groupSize: participants.length,
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

  const addParticipant = () => {
    if (participants.length < activity.maxParticipants) {
      setParticipants([...participants, { firstName: '', lastName: '', email: '', phone: '' }]);
    }
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    setParticipants(updated);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header>
        <Text as="h2" size="xl" weight="bold">
          Book {activity.title}
        </Text>
      </Modal.Header>

      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <Stack gap="6">
            {/* Activity Summary */}
            <Card>
              <Card.Body>
                <Stack gap="4">
                  <div className="flex items-start justify-between">
                    <div>
                      <Text as="h3" size="lg" weight="semibold">
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
                          <Badge variant="success" size="xs" className="ml-2">
                            Verified
                          </Badge>
                        )}
                      </Text>
                    </div>
                  </div>
                </Stack>
              </Card.Body>
            </Card>

            {/* Booking Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date and Time Selection */}
              <div className="space-y-4">
                <FormField label="Select Date" required>
                  <Select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    placeholder="Choose a date"
                  >
                    {availableDates.map((date) => (
                      <option key={date} value={date}>
                        {formatDate(date)}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField label="Select Time" required>
                  <Select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    placeholder="Choose a time"
                  >
                    {availableTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField label="Participants" required>
                  <div className="space-y-3">
                    {participants.map((participant, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Text size="sm" weight="medium">Participant {index + 1}</Text>
                          {participants.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="xs"
                              onClick={() => removeParticipant(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="text"
                            placeholder="First Name"
                            value={participant.firstName}
                            onChange={(e) => updateParticipant(index, 'firstName', e.target.value)}
                            required
                          />
                          <Input
                            type="text"
                            placeholder="Last Name"
                            value={participant.lastName}
                            onChange={(e) => updateParticipant(index, 'lastName', e.target.value)}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <Input
                            type="email"
                            placeholder="Email (optional)"
                            value={participant.email || ''}
                            onChange={(e) => updateParticipant(index, 'email', e.target.value)}
                          />
                          <Input
                            type="tel"
                            placeholder="Phone (optional)"
                            value={participant.phone || ''}
                            onChange={(e) => updateParticipant(index, 'phone', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                    {participants.length < activity.maxParticipants && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addParticipant}
                        className="w-full"
                      >
                        + Add Participant
                      </Button>
                    )}
                  </div>
                  <Text size="sm" color="gray" className="mt-2">
                    Maximum {activity.maxParticipants} participants
                  </Text>
                </FormField>
              </div>


            </div>

            {/* Special Requests */}
            <FormField label="Special Requests (Optional)">
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Any special requirements or requests?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </FormField>

            {/* Price Summary */}
            <Card>
              <Card.Body>
                <Stack gap="3">
                  <Text as="h4" size="lg" weight="semibold">
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
                      <Text>× {participants}</Text>
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
              </Card.Body>
            </Card>
          </Stack>
        </Modal.Body>

        <Modal.Footer>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!selectedDate || !selectedTime || participants.length === 0 || isSubmitting}
            >
              {isSubmitting ? 'Processing...' : `Book Now - ${totalPrice.toFixed(2)} ${activity.price.currency}`}
            </Button>
          </div>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
