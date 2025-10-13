/**
 * @fileoverview Review Management Component for LUDUS Platform - LDS-015 Implementation
 * @module components/review/ReviewManagement
 * 
 * This component provides comprehensive review management functionality including:
 * - Review display and filtering
 * - Review moderation and approval
 * - Partner response management
 * - Review analytics and reporting
 * - RTL support for Arabic users
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Badge } from '../../ui/Badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../ui/Dialog';
import { Label } from '../../ui/Label';
import { Textarea } from '../../ui/Textarea';
import { reviewService } from '../../services/reviewService';
import { toast } from 'react-toastify';

const ReviewManagement = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    rating: '',
    verified: '',
    hasImages: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [analytics, setAnalytics] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [moderationData, setModerationData] = useState({
    status: 'approved',
    notes: ''
  });

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await reviewService.getUserReviews({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });
      setReviews(response.data.reviews);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages
      }));
    } catch (error) {
      toast.error(t('reviews.fetchError'));
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, t]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await reviewService.getReviewAnalytics({ period: '30d' });
      setAnalytics(response.data);
    } catch (error) {
      toast.error(t('reviews.fetchAnalyticsError'));
      console.error('Failed to fetch analytics:', error);
    }
  }, [t]);

  useEffect(() => {
    fetchReviews();
    fetchAnalytics();
  }, [fetchReviews, fetchAnalytics]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleModerateReview = async () => {
    if (!selectedReview) return;

    try {
      await reviewService.moderateReview(selectedReview._id, moderationData);
      toast.success(t('reviews.moderatedSuccessfully'));
      setShowModerationModal(false);
      setSelectedReview(null);
      fetchReviews();
    } catch (error) {
      toast.error(t('reviews.moderateError'));
      console.error('Failed to moderate review:', error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm(t('reviews.confirmDelete'))) return;

    try {
      await reviewService.deleteReview(reviewId);
      toast.success(t('reviews.deletedSuccessfully'));
      fetchReviews();
    } catch (error) {
      toast.error(t('reviews.deleteError'));
      console.error('Failed to delete review:', error);
    }
  };

  const handleAddHelpfulVote = async (reviewId) => {
    try {
      await reviewService.addHelpfulVote(reviewId);
      toast.success(t('reviews.helpfulVoteAdded'));
      fetchReviews();
    } catch (error) {
      toast.error(t('reviews.helpfulVoteError'));
      console.error('Failed to add helpful vote:', error);
    }
  };

  const handleRemoveHelpfulVote = async (reviewId) => {
    try {
      await reviewService.removeHelpfulVote(reviewId);
      toast.success(t('reviews.helpfulVoteRemoved'));
      fetchReviews();
    } catch (error) {
      toast.error(t('reviews.helpfulVoteError'));
      console.error('Failed to remove helpful vote:', error);
    }
  };

  const getRatingStars = (rating) => {
    return reviewService.getRatingStars(rating);
  };

  const getStatusColor = (status) => {
    return reviewService.getReviewStatusColor(status);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderRatingStars = (rating) => {
    const stars = getRatingStars(rating);
    return (
      <div className="flex items-center space-x-1">
        {stars.map((star, index) => (
          <span key={index} className="text-lg">
            {star.type === 'full' && '★'}
            {star.type === 'half' && '☆'}
            {star.type === 'empty' && '☆'}
          </span>
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const renderReviewCard = (review) => (
    <Card key={review._id} className="p-6 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-ludus-orange rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {review.user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
            <p className="text-sm text-gray-600">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(review.status)}>
            {t(`reviews.status.${review.status}`)}
          </Badge>
          {review.isVerified && (
            <Badge className="text-blue-600 bg-blue-100">
              {t('reviews.verified')}
            </Badge>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h5 className="font-medium text-gray-900 mb-2">{review.activity.title}</h5>
        {renderRatingStars(review.rating.overall)}
      </div>

      {review.comment && (
        <div className="mb-4">
          <p className="text-gray-700">{review.comment}</p>
          {review.commentAr && (
            <p className="text-gray-600 mt-2" dir="rtl">{review.commentAr}</p>
          )}
        </div>
      )}

      {review.images && review.images.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {review.images.map((image, index) => (
              <img
                key={index}
                src={image.url}
                alt={image.caption || 'Review image'}
                className="w-full h-24 object-cover rounded-lg"
              />
            ))}
          </div>
        </div>
      )}

      {review.response && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-medium text-gray-900">{review.response.partner.name}</span>
            <span className="text-sm text-gray-600">
              {formatDate(review.response.respondedAt)}
            </span>
          </div>
          <p className="text-gray-700">{review.response.comment}</p>
          {review.response.commentAr && (
            <p className="text-gray-600 mt-2" dir="rtl">{review.response.commentAr}</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleAddHelpfulVote(review._id)}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-ludus-orange"
          >
            <span>👍</span>
            <span>{review.helpful?.count || 0}</span>
          </button>
          <span className="text-sm text-gray-600">
            {review.views || 0} {t('reviews.views')}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedReview(review);
              setShowModerationModal(true);
            }}
          >
            {t('reviews.moderate')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteReview(review._id)}
            className="text-red-600 hover:text-red-700"
          >
            {t('reviews.delete')}
          </Button>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-ludus-orange border-t-transparent"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{t('reviews.management')}</h2>
        {analytics && (
          <div className="text-sm text-gray-600">
            {t('reviews.totalReviews')}: {analytics.statistics.totalReviews}
          </div>
        )}
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('reviews.analytics')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-ludus-orange">
                {analytics.statistics.averageRating}
              </div>
              <div className="text-sm text-gray-600">{t('reviews.averageRating')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analytics.statistics.verifiedReviews}
              </div>
              <div className="text-sm text-gray-600">{t('reviews.verifiedReviews')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.statistics.reviewsWithImages}
              </div>
              <div className="text-sm text-gray-600">{t('reviews.withImages')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analytics.statistics.totalHelpfulVotes}
              </div>
              <div className="text-sm text-gray-600">{t('reviews.helpfulVotes')}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Label htmlFor="status">{t('reviews.status')}</Label>
            <Select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="all">{t('reviews.allStatuses')}</option>
              <option value="pending">{t('reviews.status.pending')}</option>
              <option value="approved">{t('reviews.status.approved')}</option>
              <option value="rejected">{t('reviews.status.rejected')}</option>
              <option value="hidden">{t('reviews.status.hidden')}</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="rating">{t('reviews.rating')}</Label>
            <Select
              id="rating"
              name="rating"
              value={filters.rating}
              onChange={handleFilterChange}
            >
              <option value="">{t('reviews.allRatings')}</option>
              <option value="5">5 {t('reviews.stars')}</option>
              <option value="4">4 {t('reviews.stars')}</option>
              <option value="3">3 {t('reviews.stars')}</option>
              <option value="2">2 {t('reviews.stars')}</option>
              <option value="1">1 {t('reviews.star')}</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="verified">{t('reviews.verified')}</Label>
            <Select
              id="verified"
              name="verified"
              value={filters.verified}
              onChange={handleFilterChange}
            >
              <option value="">{t('reviews.all')}</option>
              <option value="true">{t('reviews.yes')}</option>
              <option value="false">{t('reviews.no')}</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="hasImages">{t('reviews.withImages')}</Label>
            <Select
              id="hasImages"
              name="hasImages"
              value={filters.hasImages}
              onChange={handleFilterChange}
            >
              <option value="">{t('reviews.all')}</option>
              <option value="true">{t('reviews.yes')}</option>
              <option value="false">{t('reviews.no')}</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="search">{t('reviews.search')}</Label>
            <Input
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder={t('reviews.searchPlaceholder')}
            />
          </div>
        </div>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map(renderReviewCard)
        ) : (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-4">📝</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {t('reviews.noReviews')}
            </h4>
            <p className="text-gray-600">
              {t('reviews.noReviewsDescription')}
            </p>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {t('reviews.showing')} {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} {t('reviews.of')} {pagination.total}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                {t('reviews.previous')}
              </Button>
              <span className="text-sm text-gray-600">
                {pagination.page} {t('reviews.of')} {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                {t('reviews.next')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Moderation Modal */}
      <Dialog open={showModerationModal} onOpenChange={setShowModerationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('reviews.moderateReview')}</DialogTitle>
            <DialogDescription>
              {t('reviews.moderateReviewDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="moderationStatus">{t('reviews.status')}</Label>
              <Select
                id="moderationStatus"
                value={moderationData.status}
                onChange={(e) => setModerationData(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="pending">{t('reviews.status.pending')}</option>
                <option value="approved">{t('reviews.status.approved')}</option>
                <option value="rejected">{t('reviews.status.rejected')}</option>
                <option value="hidden">{t('reviews.status.hidden')}</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="moderationNotes">{t('reviews.notes')}</Label>
              <Textarea
                id="moderationNotes"
                value={moderationData.notes}
                onChange={(e) => setModerationData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={t('reviews.notesPlaceholder')}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModerationModal(false)}
            >
              {t('reviews.cancel')}
            </Button>
            <Button onClick={handleModerateReview}>
              {t('reviews.moderate')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewManagement;
