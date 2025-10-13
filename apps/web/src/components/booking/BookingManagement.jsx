/**
 * @fileoverview Booking Management Component with RTL Support
 * @module components/booking/BookingManagement
 * 
 * This component provides comprehensive booking management functionality including:
 * - View all user bookings
 * - Filter and search bookings
 * - Cancel bookings
 * - Check in to bookings
 * - Add reviews
 * - View booking details
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useTranslationWithFallback from '../../hooks/useTranslationWithFallback';
import { bookingService } from '../../services/bookingService';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Alert } from '../ui';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  X, 
  CheckCircle, 
  Star, 
  Search,
  Filter,
  Eye,
  MessageSquare,
  QrCode
} from 'lucide-react';

const BookingManagement = () => {
  const { t } = useTranslationWithFallback();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    loadBookings();
  }, [filters, pagination.page]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await bookingService.getUserBookings(params);
      setBookings(response.data.bookings);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.totalBookings,
        totalPages: response.data.pagination.totalPages
      }));
    } catch (err) {
      setError(err.message || t('booking.loadError', 'Failed to load bookings'));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCancelBooking = async (bookingId, reason) => {
    if (!reason) {
      setError(t('booking.cancellationReasonRequired', 'Please provide a cancellation reason'));
      return;
    }

    try {
      await bookingService.cancelBooking(bookingId, reason);
      setMessage(t('booking.cancelled', 'Booking cancelled successfully'));
      loadBookings();
    } catch (err) {
      setError(err.message || t('booking.cancelError', 'Failed to cancel booking'));
    }
  };

  const handleCheckIn = async (bookingId) => {
    try {
      await bookingService.checkInBooking(bookingId);
      setMessage(t('booking.checkedIn', 'Check-in successful'));
      loadBookings();
    } catch (err) {
      setError(err.message || t('booking.checkInError', 'Failed to check in'));
    }
  };

  const handleAddReview = async () => {
    if (!selectedBooking) return;

    try {
      await bookingService.addBookingReview(selectedBooking._id, reviewData);
      setMessage(t('booking.reviewAdded', 'Review added successfully'));
      setShowReviewModal(false);
      setReviewData({ rating: 5, comment: '' });
      loadBookings();
    } catch (err) {
      setError(err.message || t('booking.reviewError', 'Failed to add review'));
    }
  };

  const getStatusInfo = (status) => {
    return bookingService.getBookingStatusInfo(status, t('common.language', 'ar'));
  };

  const formatBookingDate = (date) => {
    return new Date(date).toLocaleDateString(t('common.language', 'ar') === 'ar' ? 'ar-SA' : 'en-US');
  };

  const formatCurrency = (amount) => {
    return bookingService.formatCurrency(amount, 'SAR', t('common.language', 'ar'));
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={t('common.direction') || 'ltr'}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ludus-orange"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={t('common.direction') || 'ltr'}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('booking.myBookings', 'My Bookings')}
          </h1>
          <p className="text-gray-600">
            {t('booking.manageBookings', 'Manage your activity bookings')}
          </p>
        </div>

        {error && <Alert type="error" message={error} className="mb-6" />}
        {message && <Alert type="success" message={message} className="mb-6" />}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('booking.filterByStatus', 'Filter by Status')}
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
                >
                  <option value="">{t('booking.allStatuses', 'All Statuses')}</option>
                  <option value="pending_payment">{t('booking.pendingPayment', 'Pending Payment')}</option>
                  <option value="confirmed">{t('booking.confirmed', 'Confirmed')}</option>
                  <option value="cancelled">{t('booking.cancelled', 'Cancelled')}</option>
                  <option value="completed">{t('booking.completed', 'Completed')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('booking.search', 'Search')}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder={t('booking.searchPlaceholder', 'Search by activity name...')}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('booking.fromDate', 'From Date')}
                </label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('booking.toDate', 'To Date')}
                </label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('booking.noBookings', 'No bookings found')}
              </h3>
              <p className="text-gray-500 mb-6">
                {t('booking.noBookingsDesc', 'You haven\'t made any bookings yet')}
              </p>
              <Button className="bg-ludus-orange hover:bg-ludus-orange-dark">
                {t('booking.browseActivities', 'Browse Activities')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const statusInfo = getStatusInfo(booking.status);
              const canCancel = bookingService.canCancelBooking(booking);
              const canCheckIn = booking.status === 'confirmed' && !booking.checkIn?.checkedIn;
              const canReview = booking.status === 'completed' && !booking.review?.rating;

              return (
                <Card key={booking._id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      {/* Booking Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {booking.activity.title}
                            </h3>
                            <p className="text-gray-600 mb-2">{booking.activity.partner.name}</p>
                            <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatBookingDate(booking.schedule.date)}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {booking.schedule.timeSlot}
                              </div>
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {booking.participants.length} {t('booking.participants', 'participants')}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                              {statusInfo.text}
                            </span>
                            <p className="text-lg font-bold text-ludus-orange mt-1">
                              {formatCurrency(booking.pricing.total)}
                            </p>
                          </div>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2" />
                            {booking.contactInfo.phone}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2" />
                            {booking.contactInfo.email}
                          </div>
                        </div>

                        {/* Special Requests */}
                        {booking.specialRequests && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600">
                              <strong>{t('booking.specialRequests', 'Special Requests')}:</strong> {booking.specialRequests}
                            </p>
                          </div>
                        )}

                        {/* Check-in Status */}
                        {booking.checkIn?.checkedIn && (
                          <div className="flex items-center text-green-600 text-sm mb-4">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {t('booking.checkedIn', 'Checked in')} - {new Date(booking.checkIn.checkInTime).toLocaleString()}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 mt-4 lg:mt-0 lg:ml-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {t('common.view', 'View')}
                        </Button>

                        {canCheckIn && (
                          <Button
                            onClick={() => handleCheckIn(booking._id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {t('booking.checkIn', 'Check In')}
                          </Button>
                        )}

                        {canReview && (
                          <Button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowReviewModal(true);
                            }}
                            size="sm"
                            className="bg-yellow-600 hover:bg-yellow-700"
                          >
                            <Star className="w-4 h-4 mr-1" />
                            {t('booking.review', 'Review')}
                          </Button>
                        )}

                        {canCancel && (
                          <Button
                            onClick={() => {
                              const reason = prompt(t('booking.cancellationReason', 'Please provide a reason for cancellation:'));
                              if (reason) {
                                handleCancelBooking(booking._id, reason);
                              }
                            }}
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-1" />
                            {t('booking.cancel', 'Cancel')}
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const qrData = bookingService.generateQRCodeData(booking);
                            // Show QR code modal or navigate to QR code page
                            console.log('QR Code Data:', qrData);
                          }}
                        >
                          <QrCode className="w-4 h-4 mr-1" />
                          {t('booking.qrCode', 'QR Code')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 rtl:space-x-reverse mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  {t('common.previous', 'Previous')}
                </Button>
                
                <span className="text-sm text-gray-600">
                  {t('common.page', 'Page')} {pagination.page} {t('common.of', 'of')} {pagination.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  {t('common.next', 'Next')}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>{t('booking.addReview', 'Add Review')}</CardTitle>
                <CardDescription>
                  {t('booking.reviewDesc', 'Share your experience with this activity')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('booking.rating', 'Rating')}
                    </label>
                    <div className="flex space-x-1 rtl:space-x-reverse">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setReviewData(prev => ({ ...prev, rating }))}
                          className={`text-2xl ${
                            rating <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          <Star className="w-8 h-8 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('booking.comment', 'Comment')}
                    </label>
                    <textarea
                      value={reviewData.comment}
                      onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder={t('booking.commentPlaceholder', 'Share your thoughts about this activity...')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
                      rows={4}
                    />
                  </div>

                  <div className="flex justify-end space-x-3 rtl:space-x-reverse">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowReviewModal(false);
                        setReviewData({ rating: 5, comment: '' });
                      }}
                    >
                      {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button
                      onClick={handleAddReview}
                      className="bg-ludus-orange hover:bg-ludus-orange-dark"
                    >
                      {t('booking.submitReview', 'Submit Review')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingManagement;
