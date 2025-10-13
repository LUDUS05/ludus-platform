/**
 * @fileoverview Enhanced Booking Form Component with RTL Support
 * @module components/booking/BookingForm
 * 
 * This component provides comprehensive booking functionality including:
 * - Activity selection and scheduling
 * - Participant management
 * - Contact information collection
 * - Payment integration
 * - RTL support for Arabic users
 * - Form validation and error handling
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useTranslationWithFallback from '../../hooks/useTranslationWithFallback';
import { bookingService } from '../../services/bookingService';
import { paymentService } from '../../services/paymentService';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Alert } from '../ui';
import { Calendar, Clock, Users, User, Phone, Mail, AlertCircle, CheckCircle, Plus, Minus } from 'lucide-react';

const BookingForm = ({ 
  activity, 
  onBookingSuccess, 
  onBookingError,
  initialData = null 
}) => {
  const { t } = useTranslationWithFallback();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    activityId: activity?._id || '',
    schedule: {
      date: '',
      timeSlot: ''
    },
    participants: [
      {
        type: 'adult',
        name: '',
        nameAr: '',
        age: 18,
        idNumber: '',
        specialRequests: ''
      }
    ],
    contactInfo: {
      phone: '',
      email: '',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      }
    },
    specialRequests: '',
    waiverSigned: false,
    paymentMethod: 'moyasar',
    savePaymentMethod: false
  });

  const steps = [
    { id: 1, title: t('booking.step1', 'Select Date & Time'), icon: Calendar },
    { id: 2, title: t('booking.step2', 'Add Participants'), icon: Users },
    { id: 3, title: t('booking.step3', 'Contact Information'), icon: User },
    { id: 4, title: t('booking.step4', 'Review & Pay'), icon: CheckCircle }
  ];

  useEffect(() => {
    if (activity) {
      setFormData(prev => ({
        ...prev,
        activityId: activity._id
      }));
    }
  }, [activity]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailability();
    }
  }, [selectedDate, activity]);

  const loadAvailability = async () => {
    if (!activity || !selectedDate) return;

    try {
      const response = await bookingService.getBookingAvailability(activity._id, selectedDate);
      setAvailableSlots(response.data.availableSlots);
    } catch (err) {
      setError(t('booking.availabilityError', 'Failed to load availability'));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleParticipantChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.map((participant, i) => 
        i === index ? { ...participant, [field]: value } : participant
      )
    }));
  };

  const addParticipant = () => {
    setFormData(prev => ({
      ...prev,
      participants: [
        ...prev.participants,
        {
          type: 'adult',
          name: '',
          nameAr: '',
          age: 18,
          idNumber: '',
          specialRequests: ''
        }
      ]
    }));
  };

  const removeParticipant = (index) => {
    if (formData.participants.length > 1) {
      setFormData(prev => ({
        ...prev,
        participants: prev.participants.filter((_, i) => i !== index)
      }));
    }
  };

  const validateStep = (step) => {
    const errors = {};

    switch (step) {
      case 1:
        if (!formData.schedule.date) {
          errors.date = t('booking.dateRequired', 'Please select a date');
        }
        if (!formData.schedule.timeSlot) {
          errors.timeSlot = t('booking.timeSlotRequired', 'Please select a time slot');
        }
        break;
      case 2:
        formData.participants.forEach((participant, index) => {
          if (!participant.name) {
            errors[`participant_${index}_name`] = t('booking.nameRequired', 'Name is required');
          }
          if (!participant.age || participant.age < 0 || participant.age > 120) {
            errors[`participant_${index}_age`] = t('booking.validAgeRequired', 'Valid age is required');
          }
          if (!participant.idNumber) {
            errors[`participant_${index}_idNumber`] = t('booking.idNumberRequired', 'ID number is required');
          }
        });
        break;
      case 3:
        if (!formData.contactInfo.phone) {
          errors.phone = t('booking.phoneRequired', 'Phone number is required');
        } else if (!/^\+966[0-9]{9}$/.test(formData.contactInfo.phone)) {
          errors.phone = t('booking.validPhoneRequired', 'Please enter a valid Saudi phone number');
        }
        if (!formData.contactInfo.email) {
          errors.email = t('booking.emailRequired', 'Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactInfo.email)) {
          errors.email = t('booking.validEmailRequired', 'Please enter a valid email');
        }
        if (!formData.contactInfo.emergencyContact.name) {
          errors.emergencyName = t('booking.emergencyNameRequired', 'Emergency contact name is required');
        }
        if (!formData.contactInfo.emergencyContact.phone) {
          errors.emergencyPhone = t('booking.emergencyPhoneRequired', 'Emergency contact phone is required');
        }
        if (!formData.contactInfo.emergencyContact.relationship) {
          errors.emergencyRelationship = t('booking.emergencyRelationshipRequired', 'Emergency contact relationship is required');
        }
        break;
      case 4:
        if (!formData.waiverSigned) {
          errors.waiver = t('booking.waiverRequired', 'You must agree to the terms and conditions');
        }
        break;
    }

    return errors;
  };

  const nextStep = () => {
    const errors = validateStep(currentStep);
    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors)[0]);
      return;
    }

    setError('');
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Validate all data
      const validation = bookingService.validateBookingData(formData);
      if (!validation.isValid) {
        setError(Object.values(validation.errors)[0]);
        setLoading(false);
        return;
      }

      // Create booking
      const response = await bookingService.createBooking(formData);
      
      setMessage(t('booking.success', 'Booking created successfully!'));
      onBookingSuccess?.(response.data);

      // Show success animation
      if (response.data.animationTriggers) {
        // Trigger success animation
        console.log('Success animation triggered');
      }

    } catch (err) {
      setError(err.message || t('booking.error', 'Failed to create booking'));
      onBookingError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!activity) return 0;

    const adultCount = formData.participants.filter(p => p.type === 'adult').length;
    const childCount = formData.participants.filter(p => p.type === 'child').length;
    const seniorCount = formData.participants.filter(p => p.type === 'senior').length;

    const adultPrice = activity.pricing?.adultPrice || activity.pricing?.basePrice || 0;
    const childPrice = activity.pricing?.childPrice || 0;
    const seniorPrice = activity.pricing?.seniorPrice || 0;

    const subtotal = (adultCount * adultPrice) + (childCount * childPrice) + (seniorCount * seniorPrice);
    const tax = subtotal * 0.15; // 15% VAT
    const total = subtotal + tax;

    return { subtotal, tax, total };
  };

  const pricing = calculateTotal();

  return (
    <div className="max-w-4xl mx-auto p-6" dir={t('common.direction') || 'ltr'}>
      {error && <Alert type="error" message={error} className="mb-6" />}
      {message && <Alert type="success" message={message} className="mb-6" />}

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isCompleted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : isActive 
                    ? 'bg-ludus-orange border-ludus-orange text-white'
                    : 'bg-gray-200 border-gray-300 text-gray-500'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="ml-3 rtl:ml-0 rtl:mr-3">
                  <p className={`text-sm font-medium ${
                    isActive ? 'text-ludus-orange' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5 mr-2" })}
            {steps[currentStep - 1].title}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && t('booking.step1Desc', 'Choose your preferred date and time slot')}
            {currentStep === 2 && t('booking.step2Desc', 'Add all participants for this activity')}
            {currentStep === 3 && t('booking.step3Desc', 'Provide your contact information')}
            {currentStep === 4 && t('booking.step4Desc', 'Review your booking and proceed to payment')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Date & Time Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('booking.selectDate', 'Select Date')}
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    handleNestedChange('schedule', 'date', e.target.value);
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full"
                />
              </div>

              {selectedDate && availableSlots.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('booking.selectTime', 'Select Time')}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.timeSlot}
                        onClick={() => {
                          setSelectedTimeSlot(slot.timeSlot);
                          handleNestedChange('schedule', 'timeSlot', slot.timeSlot);
                        }}
                        className={`p-3 border rounded-lg text-center transition-colors ${
                          selectedTimeSlot === slot.timeSlot
                            ? 'border-ludus-orange bg-ludus-orange text-white'
                            : slot.isAvailable
                            ? 'border-gray-300 hover:border-ludus-orange hover:bg-ludus-orange/10'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!slot.isAvailable}
                      >
                        <div className="font-medium">{slot.timeSlot}</div>
                        <div className="text-xs mt-1">{slot.spotsText}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedDate && availableSlots.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>{t('booking.noSlotsAvailable', 'No time slots available for this date')}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Participants */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{t('booking.participants', 'Participants')}</h3>
                <Button
                  type="button"
                  onClick={addParticipant}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('booking.addParticipant', 'Add Participant')}
                </Button>
              </div>

              {formData.participants.map((participant, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">{t('booking.participant', 'Participant')} {index + 1}</h4>
                    {formData.participants.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeParticipant(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('booking.participantType', 'Type')}
                      </label>
                      <select
                        value={participant.type}
                        onChange={(e) => handleParticipantChange(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
                      >
                        <option value="adult">{t('booking.adult', 'Adult')}</option>
                        <option value="child">{t('booking.child', 'Child')}</option>
                        <option value="senior">{t('booking.senior', 'Senior')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('booking.age', 'Age')}
                      </label>
                      <Input
                        type="number"
                        value={participant.age}
                        onChange={(e) => handleParticipantChange(index, 'age', parseInt(e.target.value))}
                        min="0"
                        max="120"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('booking.fullName', 'Full Name')}
                      </label>
                      <Input
                        value={participant.name}
                        onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                        placeholder={t('booking.namePlaceholder', 'Enter full name')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('booking.idNumber', 'ID Number')}
                      </label>
                      <Input
                        value={participant.idNumber}
                        onChange={(e) => handleParticipantChange(index, 'idNumber', e.target.value)}
                        placeholder={t('booking.idNumberPlaceholder', 'Enter ID number')}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('booking.specialRequests', 'Special Requests')}
                      </label>
                      <textarea
                        value={participant.specialRequests}
                        onChange={(e) => handleParticipantChange(index, 'specialRequests', e.target.value)}
                        placeholder={t('booking.specialRequestsPlaceholder', 'Any special requirements or requests')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
                        rows={2}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Step 3: Contact Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">{t('booking.contactInformation', 'Contact Information')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('booking.phone', 'Phone Number')} *
                    </label>
                    <Input
                      value={formData.contactInfo.phone}
                      onChange={(e) => handleNestedChange('contactInfo', 'phone', e.target.value)}
                      placeholder="+966XXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('booking.email', 'Email')} *
                    </label>
                    <Input
                      type="email"
                      value={formData.contactInfo.email}
                      onChange={(e) => handleNestedChange('contactInfo', 'email', e.target.value)}
                      placeholder={t('booking.emailPlaceholder', 'Enter your email')}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">{t('booking.emergencyContact', 'Emergency Contact')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('booking.emergencyName', 'Name')} *
                    </label>
                    <Input
                      value={formData.contactInfo.emergencyContact.name}
                      onChange={(e) => handleNestedChange('contactInfo.emergencyContact', 'name', e.target.value)}
                      placeholder={t('booking.emergencyNamePlaceholder', 'Enter emergency contact name')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('booking.emergencyPhone', 'Phone')} *
                    </label>
                    <Input
                      value={formData.contactInfo.emergencyContact.phone}
                      onChange={(e) => handleNestedChange('contactInfo.emergencyContact', 'phone', e.target.value)}
                      placeholder="+966XXXXXXXXX"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('booking.relationship', 'Relationship')} *
                    </label>
                    <select
                      value={formData.contactInfo.emergencyContact.relationship}
                      onChange={(e) => handleNestedChange('contactInfo.emergencyContact', 'relationship', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
                    >
                      <option value="">{t('booking.selectRelationship', 'Select relationship')}</option>
                      <option value="spouse">{t('booking.spouse', 'Spouse')}</option>
                      <option value="parent">{t('booking.parent', 'Parent')}</option>
                      <option value="sibling">{t('booking.sibling', 'Sibling')}</option>
                      <option value="friend">{t('booking.friend', 'Friend')}</option>
                      <option value="other">{t('booking.other', 'Other')}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('booking.specialRequests', 'Special Requests')}
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  placeholder={t('booking.specialRequestsPlaceholder', 'Any special requirements or requests')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 4: Review & Payment */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">{t('booking.bookingSummary', 'Booking Summary')}</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('booking.activity', 'Activity')}</span>
                    <span className="font-medium">{activity?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('booking.date', 'Date')}</span>
                    <span className="font-medium">
                      {new Date(formData.schedule.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('booking.time', 'Time')}</span>
                    <span className="font-medium">{formData.schedule.timeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('booking.participants', 'Participants')}</span>
                    <span className="font-medium">{formData.participants.length}</span>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('booking.subtotal', 'Subtotal')}</span>
                    <span className="font-medium">{bookingService.formatCurrency(pricing.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('booking.tax', 'Tax (15%)')}</span>
                    <span className="font-medium">{bookingService.formatCurrency(pricing.tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t('booking.total', 'Total')}</span>
                    <span className="text-ludus-orange">{bookingService.formatCurrency(pricing.total)}</span>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  id="waiver"
                  checked={formData.waiverSigned}
                  onChange={(e) => handleInputChange('waiverSigned', e.target.checked)}
                  className="mt-1 h-4 w-4 text-ludus-orange border-gray-300 rounded focus:ring-ludus-orange"
                />
                <label htmlFor="waiver" className="text-sm text-gray-700">
                  {t('booking.termsAgreement', 'I agree to the terms and conditions and understand the cancellation policy')}
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              onClick={prevStep}
              variant="outline"
              disabled={currentStep === 1}
            >
              {t('common.previous', 'Previous')}
            </Button>

            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-ludus-orange hover:bg-ludus-orange-dark"
              >
                {t('common.next', 'Next')}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-ludus-orange hover:bg-ludus-orange-dark"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('booking.creating', 'Creating Booking...')}
                  </div>
                ) : (
                  t('booking.createBooking', 'Create Booking')
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingForm;
