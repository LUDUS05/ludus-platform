import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const PaymentSuccessPage = () => {
  const { paymentId } = useParams();
  const [searchParams] = useSearchParams();
  const [payment, setPayment] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (paymentId) {
      fetchPaymentDetails();
    } else {
      // Handle callback from Moyasar
      const moyasarPaymentId = searchParams.get('payment_id');
      const status = searchParams.get('status');
      
      if (moyasarPaymentId && status) {
        handlePaymentCallback(moyasarPaymentId, status);
      } else {
        setError('Invalid payment confirmation');
        setLoading(false);
      }
    }
  }, [paymentId, searchParams]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getPaymentStatus(paymentId);
      
      if (response.success) {
        setPayment(response.data.payment);
        setBooking(response.data.booking);
      } else {
        setError(response.message || 'Failed to fetch payment details');
      }
    } catch (error) {
      console.error('Failed to fetch payment details:', error);
      setError('Failed to load payment information');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentCallback = async (moyasarPaymentId, status) => {
    try {
      setLoading(true);
      
      if (status === 'paid') {
        const response = await paymentService.confirmPayment(moyasarPaymentId);
        
        if (response.success) {
          setPayment(response.data.payment);
          setBooking(response.data.booking);
        } else {
          setError(response.message || 'Payment confirmation failed');
        }
      } else {
        setError('Payment was not successful');
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      setError('Failed to confirm payment');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ludus-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
            <div className="text-red-400 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-x-4">
              <Link
                to="/activities"
                className="bg-ludus-orange text-white px-6 py-2 rounded-md hover:bg-ludus-orange-dark transition-colors"
              >
                Browse Activities
              </Link>
              <Link
                to="/dashboard"
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                My Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Your booking has been confirmed</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Details */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h2>
            
            {booking && (
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-2xl">
                      {getCategoryIcon(booking.activity?.category)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.activity?.title}
                    </h3>
                    <p className="text-gray-600">
                      by {booking.vendor?.businessName}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Booking ID</div>
                      <div className="font-medium text-gray-900">{booking.bookingId}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Date & Time</div>
                      <div className="font-medium text-gray-900">
                        {new Date(booking.bookingDate).toLocaleDateString()}<br />
                        {booking.timeSlot?.startTime} - {booking.timeSlot?.endTime}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Participants</div>
                      <div className="font-medium text-gray-900">
                        {booking.participants?.count} participant{booking.participants?.count > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Status</div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Confirmed
                      </span>
                    </div>
                  </div>
                </div>

                {booking.contactInfo && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="text-sm text-gray-500 mb-2">Contact Information</div>
                    <div className="text-gray-900">
                      <div>{booking.contactInfo.email}</div>
                      {booking.contactInfo.phone && (
                        <div>{booking.contactInfo.phone}</div>
                      )}
                    </div>
                  </div>
                )}

                {booking.specialRequests && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="text-sm text-gray-500 mb-2">Special Requests</div>
                    <div className="text-gray-900">{booking.specialRequests}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Summary</h2>
            
            {payment && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment ID</span>
                  <span className="font-medium text-gray-900">{payment.id}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Method</span>
                  <div className="text-right">
                    <div className="font-medium text-gray-900 capitalize">
                      {payment.method || 'Credit Card'}
                    </div>
                    {payment.last4 && (
                      <div className="text-sm text-gray-500">
                        •••• •••• •••• {payment.last4}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Transaction Date</span>
                  <span className="font-medium text-gray-900">
                    {new Date(payment.paidAt || payment.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  {booking && (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">
                          {formatCurrency(booking.pricing?.basePrice || 0)} × {booking.participants?.count || 1}
                        </span>
                        <span className="text-gray-900">
                          {formatCurrency((booking.pricing?.basePrice || 0) * (booking.participants?.count || 1))}
                        </span>
                      </div>

                      {booking.pricing?.discount?.amount > 0 && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Discount</span>
                          <span className="text-green-600">
                            -{formatCurrency(booking.pricing.discount.amount)}
                          </span>
                        </div>
                      )}

                      {booking.pricing?.taxes?.amount > 0 && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Tax</span>
                          <span className="text-gray-900">
                            {formatCurrency(booking.pricing.taxes.amount)}
                          </span>
                        </div>
                      )}

                      {(booking.pricing?.fees?.platform > 0 || booking.pricing?.fees?.processing > 0) && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Service Fee</span>
                          <span className="text-gray-900">
                            {formatCurrency((booking.pricing.fees?.platform || 0) + (booking.pricing.fees?.processing || 0))}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total Paid</span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(payment.amount ? paymentService.fromHalalas(payment.amount) : booking?.pricing?.totalPrice || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      ✅ Payment Successful
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 text-center space-x-4">
          <Link
            to="/dashboard"
            className="bg-ludus-orange text-white px-6 py-3 rounded-md hover:bg-ludus-orange-dark transition-colors font-medium"
          >
            View My Bookings
          </Link>
          <Link
            to="/activities"
            className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors font-medium"
          >
            Book Another Activity
          </Link>
        </div>

        {/* Next Steps */}
        <div className="mt-12 bg-ludus-orange/5 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-ludus-orange-dark mb-3">What's Next?</h3>
          <div className="space-y-2 text-ludus-orange">
            <div className="flex items-center">
              <span className="text-ludus-orange-dark mr-2">📧</span>
              <span>You'll receive a confirmation email shortly</span>
            </div>
            <div className="flex items-center">
              <span className="text-ludus-orange-dark mr-2">📱</span>
              <span>We'll send you a reminder 24 hours before your activity</span>
            </div>
            <div className="flex items-center">
              <span className="text-ludus-orange-dark mr-2">🎯</span>
              <span>Arrive 15 minutes early to your activity location</span>
            </div>
            <div className="flex items-center">
              <span className="text-ludus-orange-dark mr-2">💬</span>
              <span>Contact the vendor directly if you have any questions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;