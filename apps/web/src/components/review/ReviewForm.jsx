/**
 * @fileoverview Review Form Component for LUDUS Platform - LDS-015 Implementation
 * @module components/review/ReviewForm
 * 
 * This component provides comprehensive review creation and editing functionality including:
 * - Multi-step review form
 * - Rating system with categories
 * - Image upload and management
 * - RTL support for Arabic users
 * - Real-time validation
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Textarea } from '../../ui/Textarea';
import { Checkbox } from '../../ui/Checkbox';
import { reviewService } from '../../services/reviewService';
import { toast } from 'react-toastify';

const ReviewForm = ({ activityId, bookingId, onSuccess, onCancel, editData = null }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    activityId: activityId || '',
    bookingId: bookingId || '',
    rating: {
      overall: 0,
      value: 0,
      service: 0,
      location: 0,
      communication: 0
    },
    comment: '',
    commentAr: '',
    images: [],
    helpful: false
  });
  const [errors, setErrors] = useState({});
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({
        activityId: editData.activity?.id || activityId || '',
        bookingId: editData.booking?.id || bookingId || '',
        rating: {
          overall: editData.rating?.overall || 0,
          value: editData.rating?.categories?.value || 0,
          service: editData.rating?.categories?.service || 0,
          location: editData.rating?.categories?.location || 0,
          communication: editData.rating?.categories?.communication || 0
        },
        comment: editData.comment || '',
        commentAr: editData.commentAr || '',
        images: editData.images || [],
        helpful: editData.helpful || false
      });
    }
  }, [editData, activityId, bookingId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('rating.')) {
      const ratingField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        rating: {
          ...prev.rating,
          [ratingField]: parseInt(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (files.length + formData.images.length > 10) {
      toast.error(t('reviews.maxImagesError'));
      return;
    }

    setUploadingImages(true);
    try {
      const uploadPromises = files.map(file => 
        reviewService.uploadReviewImage(file, { folder: 'reviews' })
      );
      
      const uploadResults = await Promise.all(uploadPromises);
      
      const newImages = uploadResults.map((result, index) => ({
        url: result.secure_url,
        caption: '',
        captionAr: '',
        uploadedAt: new Date()
      }));

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));

      toast.success(t('reviews.imagesUploaded'));
    } catch (error) {
      toast.error(t('reviews.imageUploadError'));
      console.error('Image upload error:', error);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleImageRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleImageCaptionChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, [field]: value } : img
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.rating.overall) {
      newErrors.overallRating = t('reviews.overallRatingRequired');
    }
    
    if (formData.comment && formData.comment.length > 1000) {
      newErrors.comment = t('reviews.commentTooLong');
    }
    
    if (formData.commentAr && formData.commentAr.length > 1000) {
      newErrors.commentAr = t('reviews.commentArTooLong');
    }
    
    if (formData.images.length > 10) {
      newErrors.images = t('reviews.tooManyImages');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error(t('reviews.validationError'));
      return;
    }

    setLoading(true);
    try {
      if (editData) {
        await reviewService.updateReview(editData._id, formData);
        toast.success(t('reviews.updatedSuccessfully'));
      } else {
        await reviewService.createReview(formData);
        toast.success(t('reviews.createdSuccessfully'));
      }
      
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(t('reviews.submitError'));
      console.error('Review submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderRatingInput = (field, label, required = false) => (
    <div className="space-y-2">
      <Label htmlFor={field}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="flex items-center space-x-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => handleInputChange({
              target: { name: `rating.${field}`, value: rating }
            })}
            className={`text-2xl ${
              formData.rating[field] >= rating
                ? 'text-yellow-400'
                : 'text-gray-300 hover:text-yellow-300'
            } transition-colors`}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {formData.rating[field] || 0}/5
        </span>
      </div>
      {errors[`${field}Rating`] && (
        <p className="text-sm text-red-600">{errors[`${field}Rating`]}</p>
      )}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('reviews.rateYourExperience')}
        </h3>
        <p className="text-gray-600">
          {t('reviews.rateYourExperienceDescription')}
        </p>
      </div>

      <div className="space-y-6">
        {renderRatingInput('overall', t('reviews.overallRating'), true)}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderRatingInput('value', t('reviews.valueForMoney'))}
          {renderRatingInput('service', t('reviews.serviceQuality'))}
          {renderRatingInput('location', t('reviews.location'))}
          {renderRatingInput('communication', t('reviews.communication'))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => setCurrentStep(2)}
          disabled={!formData.rating.overall}
        >
          {t('reviews.next')}
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('reviews.shareYourExperience')}
        </h3>
        <p className="text-gray-600">
          {t('reviews.shareYourExperienceDescription')}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="comment">{t('reviews.comment')}</Label>
          <Textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            placeholder={t('reviews.commentPlaceholder')}
            rows={4}
            maxLength={1000}
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {formData.comment.length}/1000
          </div>
          {errors.comment && (
            <p className="text-sm text-red-600">{errors.comment}</p>
          )}
        </div>

        <div>
          <Label htmlFor="commentAr">{t('reviews.commentAr')}</Label>
          <Textarea
            id="commentAr"
            name="commentAr"
            value={formData.commentAr}
            onChange={handleInputChange}
            placeholder={t('reviews.commentArPlaceholder')}
            rows={4}
            maxLength={1000}
            dir="rtl"
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {formData.commentAr.length}/1000
          </div>
          {errors.commentAr && (
            <p className="text-sm text-red-600">{errors.commentAr}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(1)}
        >
          {t('reviews.previous')}
        </Button>
        <Button
          type="button"
          onClick={() => setCurrentStep(3)}
        >
          {t('reviews.next')}
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('reviews.addPhotos')}
        </h3>
        <p className="text-gray-600">
          {t('reviews.addPhotosDescription')}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="images">{t('reviews.uploadImages')}</Label>
          <Input
            id="images"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploadingImages}
            className="mb-2"
          />
          <p className="text-sm text-gray-500">
            {t('reviews.imageUploadHint')}
          </p>
          {errors.images && (
            <p className="text-sm text-red-600">{errors.images}</p>
          )}
        </div>

        {formData.images.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">{t('reviews.uploadedImages')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <img
                    src={image.url}
                    alt={`Review image ${index + 1}`}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <div className="space-y-2">
                    <Input
                      placeholder={t('reviews.imageCaption')}
                      value={image.caption}
                      onChange={(e) => handleImageCaptionChange(index, 'caption', e.target.value)}
                      maxLength={200}
                    />
                    <Input
                      placeholder={t('reviews.imageCaptionAr')}
                      value={image.captionAr}
                      onChange={(e) => handleImageCaptionChange(index, 'captionAr', e.target.value)}
                      maxLength={200}
                      dir="rtl"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleImageRemove(index)}
                      className="w-full text-red-600 hover:text-red-700"
                    >
                      {t('reviews.removeImage')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(2)}
        >
          {t('reviews.previous')}
        </Button>
        <Button
          type="button"
          onClick={() => setCurrentStep(4)}
        >
          {t('reviews.next')}
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('reviews.reviewSummary')}
        </h3>
        <p className="text-gray-600">
          {t('reviews.reviewSummaryDescription')}
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">{t('reviews.ratings')}</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>{t('reviews.overallRating')}</span>
              <span>{formData.rating.overall}/5</span>
            </div>
            <div className="flex justify-between">
              <span>{t('reviews.valueForMoney')}</span>
              <span>{formData.rating.value}/5</span>
            </div>
            <div className="flex justify-between">
              <span>{t('reviews.serviceQuality')}</span>
              <span>{formData.rating.service}/5</span>
            </div>
            <div className="flex justify-between">
              <span>{t('reviews.location')}</span>
              <span>{formData.rating.location}/5</span>
            </div>
            <div className="flex justify-between">
              <span>{t('reviews.communication')}</span>
              <span>{formData.rating.communication}/5</span>
            </div>
          </div>
        </div>

        {formData.comment && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">{t('reviews.comment')}</h4>
            <p className="text-gray-700">{formData.comment}</p>
            {formData.commentAr && (
              <p className="text-gray-600 mt-2" dir="rtl">{formData.commentAr}</p>
            )}
          </div>
        )}

        {formData.images.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">
              {t('reviews.images')} ({formData.images.length})
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {formData.images.map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={`Review image ${index + 1}`}
                  className="w-full h-16 object-cover rounded"
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="helpful"
            name="helpful"
            checked={formData.helpful}
            onChange={handleInputChange}
          />
          <Label htmlFor="helpful">{t('reviews.markAsHelpful')}</Label>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(3)}
        >
          {t('reviews.previous')}
        </Button>
        <div className="space-x-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              {t('reviews.cancel')}
            </Button>
          )}
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
          >
            {editData ? t('reviews.updateReview') : t('reviews.submitReview')}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </form>
    </Card>
  );
};

export default ReviewForm;
