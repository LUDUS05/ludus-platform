import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PaymentForm from '../components/payment/PaymentForm';

const BookingPage = () => {
  const { id } = useParams(); // activity ID
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Details, 2: Payment
  
  // Booking form data
  const [bookingData, setBookingData] = useState({
    date: searchParams.get('date') || '',
    timeSlot: searchParams.get('timeSlot') || '',
    participants: parseInt(searchParams.get('participants')) || 1,
    contactInfo: {
      email: user?.email || '',
      phone: user?.phone || '',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      }
    },
    participantDetails: [],
    specialRequests: '',
    waiverAccepted: false
  });

  const [createdBooking, setCreatedBooking] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/booking/${id}` } });
      return;
    }
    
    fetchActivityDetails();
  }, [id, isAuthenticated, navigate]);

  useEffect(() => {
    if (bookingData.date) {
      fetchAvailableSlots();
    }
  }, [bookingData.date]);

  useEffect(() => {
    // Initialize participant details based on participant count
    const currentDetails = bookingData.participantDetails;
    const newDetails = Array.from({ length: bookingData.participants }, (_, index) => 
      currentDetails[index] || {
        name: index === 0 ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() : '',
        age: '',
        email: index === 0 ? user?.email || '' : '',
        phone: index === 0 ? user?.phone || '' : '',
        specialRequirements: ''
      }
    );
    
    setBookingData(prev => ({
      ...prev,
      participantDetails: newDetails
    }));
  }, [bookingData.participants, user]);

  const fetchActivityDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/activities/${id}`);
      setActivity(response.data.data.activity);
    } catch (error) {
      console.error('Failed to fetch activity details:', error);
      setError('Failed to load activity information');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      // This would be an API call to get available time slots for the selected date
      // For now, we'll use mock data based on the activity's schedule
      const mockSlots = [
        { startTime: '09:00', endTime: '11:00', availableSpots: 5 },
        { startTime: '14:00', endTime: '16:00', availableSpots: 3 },
        { startTime: '18:00', endTime: '20:00', availableSpots: 8 }
      ];
      setAvailableSlots(mockSlots);
    } catch (error) {
      console.error('Failed to fetch available slots:', error);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setBookingData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setBookingData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleParticipantChange = (index, field, value) => {
    setBookingData(prev => ({
      ...prev,
      participantDetails: prev.participantDetails.map((participant, i) =>
        i === index ? { ...participant, [field]: value } : participant
      )
    }));
  };

  const handleEmergencyContactChange = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        emergencyContact: {
          ...prev.contactInfo.emergencyContact,
          [field]: value
        }
      }
    }));
  };

  const validateBookingData = () => {
    const errors = {};

    if (!bookingData.date) errors.date = 'Date is required';
    if (!bookingData.timeSlot) errors.timeSlot = 'Time slot is required';
    if (!bookingData.contactInfo.email) errors.email = 'Email is required';
    if (!bookingData.contactInfo.phone) errors.phone = 'Phone number is required';
    if (!bookingData.waiverAccepted) errors.waiver = 'You must accept the waiver';

    // Validate participant details
    bookingData.participantDetails.forEach((participant, index) => {
      if (!participant.name) {
        errors[`participant_${index}_name`] = `Participant ${index + 1} name is required`;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const handleCreateBooking = async () => {
    const validation = validateBookingData();
    if (!validation.isValid) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Calculate pricing
      const basePrice = activity.pricing?.basePrice || 0;
      const totalPrice = basePrice * bookingData.participants;
      
      const bookingPayload = {
        activity: activity._id,
        vendor: activity.vendor._id,
        bookingDate: bookingData.date,
        timeSlot: {
          startTime: bookingData.timeSlot.split(' - ')[0],
          endTime: bookingData.timeSlot.split(' - ')[1]
        },
        participants: {
          count: bookingData.participants,
          details: bookingData.participantDetails
        },
        pricing: {
          basePrice,
          totalPrice,
          discount: { amount: 0, reason: '' },
          taxes: { amount: 0, rate: 0 },
          fees: { platform: 0, processing: 0 }
        },
        contactInfo: bookingData.contactInfo,
        specialRequests: bookingData.specialRequests,
        waiverSigned: bookingData.waiverAccepted,
        waiverSignedAt: new Date()
      };

      const response = await api.post('/bookings', bookingPayload);
      
      if (response.data.success) {
        setCreatedBooking(response.data.data.booking);
        setStep(2); // Move to payment step
      } else {
        setError(response.data.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Failed to create booking:', error);
      setError(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    // Redirect to success page
    navigate(`/payment/success/${paymentData.payment.id}`);
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
    setError('Payment failed. Please try again.');
    // Could also offer to retry or go back to booking details
  };

  const calculateTotalPrice = () => {
    if (!activity?.pricing?.basePrice) return 0;
    return activity.pricing.basePrice * bookingData.participants;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      fitness: '💪',
      arts: '🎨',
      food: '🍽️',
      outdoor: '🏞️',
      unique: '✨',
      wellness: '🧘'
    };
    return icons[category] || '🎯';
  };

  if (loading && !activity) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !activity) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-8 text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">Booking Error</h2>
            <p className="text-red-700 mb-6">{error}</p>
            <button
              onClick={() => navigate(`/activities/${id}`)}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Activity
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Booking Details</span>
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="space-y-6">
                {/* Activity Summary */}
                <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Summary</h2>
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-2xl">
                        {getCategoryIcon(activity?.category)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{activity?.title}</h3>
                      <p className="text-gray-600">by {activity?.vendor?.businessName}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        📍 {activity?.location?.city}, {activity?.location?.state}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(activity?.pricing?.basePrice)}
                      </div>
                      <div className="text-sm text-gray-500">per person</div>
                    </div>
                  </div>
                </div>

                {/* Booking Form */}
                <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Details</h2>
                  
                  <div className="space-y-6">
                    {/* Date and Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date *
                        </label>
                        <input
                          type="date"
                          value={bookingData.date}
                          onChange={(e) => handleInputChange('date', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time Slot *
                        </label>
                        <select
                          value={bookingData.timeSlot}
                          onChange={(e) => handleInputChange('timeSlot', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select time slot</option>
                          {availableSlots.map((slot, index) => (
                            <option key={index} value={`${slot.startTime} - ${slot.endTime}`}>
                              {slot.startTime} - {slot.endTime} ({slot.availableSpots} spots available)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Number of Participants */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Participants *
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-md w-40">
                        <button
                          type="button"
                          onClick={() => handleInputChange('participants', Math.max(1, bookingData.participants - 1))}
                          className="px-3 py-2 text-gray-600 hover:text-gray-800"
                        >
                          -
                        </button>
                        <span className="flex-1 text-center py-2 border-x border-gray-300">
                          {bookingData.participants}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleInputChange('participants', 
                            activity?.capacity?.max 
                              ? Math.min(activity.capacity.max, bookingData.participants + 1)
                              : bookingData.participants + 1
                          )}
                          className="px-3 py-2 text-gray-600 hover:text-gray-800"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={bookingData.contactInfo.email}
                            onChange={(e) => handleInputChange('contactInfo.email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone *
                          </label>
                          <input
                            type="tel"
                            value={bookingData.contactInfo.phone}
                            onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name
                          </label>
                          <input
                            type="text"
                            value={bookingData.contactInfo.emergencyContact.name}
                            onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={bookingData.contactInfo.emergencyContact.phone}
                            onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Relationship
                          </label>
                          <input
                            type="text"
                            value={bookingData.contactInfo.emergencyContact.relationship}
                            onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                            placeholder="e.g., Spouse, Parent"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Participant Details */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Participant Details</h3>
                      <div className="space-y-4">
                        {bookingData.participantDetails.map((participant, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3">
                              Participant {index + 1}
                              {index === 0 && <span className="text-sm text-gray-500 ml-2">(Primary)</span>}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Full Name *
                                </label>
                                <input
                                  type="text"
                                  value={participant.name}
                                  onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Age
                                </label>
                                <input
                                  type="number"
                                  value={participant.age}
                                  onChange={(e) => handleParticipantChange(index, 'age', e.target.value)}
                                  min="1"
                                  max="120"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              {index > 0 && (
                                <>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Email
                                    </label>
                                    <input
                                      type="email"
                                      value={participant.email}
                                      onChange={(e) => handleParticipantChange(index, 'email', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Phone
                                    </label>
                                    <input
                                      type="tel"
                                      value={participant.phone}
                                      onChange={(e) => handleParticipantChange(index, 'phone', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>
                                </>
                              )}
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Special Requirements
                                </label>
                                <input
                                  type="text"
                                  value={participant.specialRequirements}
                                  onChange={(e) => handleParticipantChange(index, 'specialRequirements', e.target.value)}
                                  placeholder="Dietary restrictions, accessibility needs, etc."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Special Requests */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Requests
                      </label>
                      <textarea
                        value={bookingData.specialRequests}
                        onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                        rows="3"
                        placeholder="Any special requests or additional information..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Waiver Agreement */}
                    <div className="border-t border-gray-200 pt-6">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="waiver"
                          checked={bookingData.waiverAccepted}
                          onChange={(e) => handleInputChange('waiverAccepted', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                        />
                        <label htmlFor="waiver" className="ml-3 text-sm text-gray-700">
                          I understand and agree to the activity's terms and conditions, including cancellation policy and safety requirements. I acknowledge that participation in this activity may involve certain risks. *
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex">
                        <div className="text-red-400 text-xl mr-3">⚠️</div>
                        <div>
                          <h3 className="text-sm font-medium text-red-800">Booking Error</h3>
                          <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Continue Button */}
                  <div className="mt-6">
                    <button
                      onClick={handleCreateBooking}
                      disabled={loading}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Creating Booking...
                        </div>
                      ) : (
                        'Continue to Payment'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && createdBooking && (
              <PaymentForm
                amount={calculateTotalPrice()}
                description={`${activity?.title} - ${bookingData.participants} participant${bookingData.participants > 1 ? 's' : ''}`}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                metadata={{
                  booking_id: createdBooking._id,
                  activity_id: activity._id,
                  vendor_id: activity.vendor._id,
                  participant_count: bookingData.participants
                }}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
              
              {activity && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">
                        {getCategoryIcon(activity.category)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{activity.title}</h4>
                      <p className="text-sm text-gray-600">{activity.vendor?.businessName}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    {bookingData.date && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(bookingData.date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    {bookingData.timeSlot && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium text-gray-900">{bookingData.timeSlot}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Participants:</span>
                      <span className="font-medium text-gray-900">{bookingData.participants}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">
                        {formatCurrency(activity.pricing?.basePrice || 0)} × {bookingData.participants}
                      </span>
                      <span className="text-gray-900">
                        {formatCurrency(calculateTotalPrice())}
                      </span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="font-bold text-xl text-blue-600">
                          {formatCurrency(calculateTotalPrice())}
                        </span>
                      </div>
                    </div>
                  </div>

                  {step === 2 && (
                    <div className="border-t border-gray-200 pt-4">
                      <button
                        onClick={() => setStep(1)}
                        className="w-full text-blue-600 hover:text-blue-500 text-sm font-medium"
                      >
                        ← Back to Booking Details
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;