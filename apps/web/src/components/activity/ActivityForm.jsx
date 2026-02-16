/**
 * @fileoverview Activity Form Component with RTL Support
 * @module components/activity/ActivityForm
 * 
 * This component provides comprehensive activity creation and editing functionality including:
 * - Multi-step form with validation
 * - RTL support for Arabic users
 * - Image and video upload
 * - Pricing and scheduling configuration
 * - Location and requirements management
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useTranslationWithFallback from '../../hooks/useTranslationWithFallback';
import { activityService } from '../../services/activityService';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Alert } from '../ui';
import { 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  MapPin, 
  Clock, 
  Users, 
  DollarSign,
  Image,
  Video,
  X,
  Plus,
  Save,
  Eye
} from 'lucide-react';

const ActivityForm = ({ activityId, onSuccess, onCancel }) => {
  const { t } = useTranslationWithFallback();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    fullDescription: '',
    fullDescriptionEn: '',
    category: { id: '', name: '', nameEn: '' },
    tags: [],
    
    // Pricing
    pricing: {
      basePrice: 0,
      currency: 'SAR',
      priceType: 'per_person',
      discounts: []
    },
    
    // Capacity
    capacity: {
      min: 1,
      max: 10
    },
    
    // Duration
    duration: {
      hours: 2,
      minutes: 0
    },
    
    // Location
    location: {
      city: '',
      cityEn: '',
      region: '',
      regionEn: '',
      address: '',
      addressEn: '',
      coordinates: {
        latitude: 0,
        longitude: 0
      },
      isOnline: false
    },
    
    // Media
    images: [],
    videos: [],
    
    // Requirements
    requirements: {
      ageMin: 0,
      ageMax: 100,
      skillLevel: 'beginner',
      equipment: [],
      specialRequirements: ''
    },
    
    // Policies
    policies: {
      cancellationPolicy: 'standard',
      refundPolicy: 'standard',
      weatherPolicy: 'standard'
    },
    
    // Scheduling
    scheduling: {
      type: 'fixed',
      availability: [],
      advanceBookingDays: 1,
      lastMinuteBooking: true
    },
    
    // Status
    status: 'draft',
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (activityId) {
      loadActivity();
    }
  }, [activityId]);

  const loadActivity = async () => {
    try {
      setLoading(true);
      const response = await activityService.getActivityById(activityId);
      const activity = response.data.activity;
      
      setFormData({
        title: activity.title || '',
        titleEn: activity.titleEn || '',
        description: activity.description || '',
        descriptionEn: activity.descriptionEn || '',
        fullDescription: activity.fullDescription || '',
        fullDescriptionEn: activity.fullDescriptionEn || '',
        category: activity.category || { id: '', name: '', nameEn: '' },
        tags: activity.tags || [],
        pricing: activity.pricing || { basePrice: 0, currency: 'SAR', priceType: 'per_person', discounts: [] },
        capacity: activity.capacity || { min: 1, max: 10 },
        duration: activity.duration || { hours: 2, minutes: 0 },
        location: activity.location || { city: '', cityEn: '', region: '', regionEn: '', address: '', addressEn: '', coordinates: { latitude: 0, longitude: 0 }, isOnline: false },
        images: activity.images || [],
        videos: activity.videos || [],
        requirements: activity.requirements || { ageMin: 0, ageMax: 100, skillLevel: 'beginner', equipment: [], specialRequirements: '' },
        policies: activity.policies || { cancellationPolicy: 'standard', refundPolicy: 'standard', weatherPolicy: 'standard' },
        scheduling: activity.scheduling || { type: 'fixed', availability: [], advanceBookingDays: 1, lastMinuteBooking: true },
        status: activity.status || 'draft',
        isActive: activity.isActive !== undefined ? activity.isActive : true
      });
    } catch (err) {
      setError(err.message || t('activity.loadError', 'Failed to load activity'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleArrayChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = async (file) => {
    try {
      setUploading(true);
      // Simulate upload - replace with actual upload logic
      const mockImage = {
        url: URL.createObjectURL(file),
        caption: '',
        captionEn: '',
        isPrimary: formData.images.length === 0,
        uploadedAt: new Date()
      };
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, mockImage]
      }));
    } catch (err) {
      setError(t('activity.uploadError', 'Failed to upload image'));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    switch (stepNumber) {
      case 1: // Basic Information
        if (!formData.title.trim()) newErrors.title = t('activity.titleRequired', 'Title is required');
        if (!formData.description.trim()) newErrors.description = t('activity.descriptionRequired', 'Description is required');
        if (!formData.fullDescription.trim()) newErrors.fullDescription = t('activity.fullDescriptionRequired', 'Full description is required');
        if (!formData.category.id) newErrors.category = t('activity.categoryRequired', 'Category is required');
        break;
        
      case 2: // Pricing & Capacity
        if (!formData.pricing.basePrice || formData.pricing.basePrice <= 0) {
          newErrors.basePrice = t('activity.basePriceRequired', 'Base price is required');
        }
        if (!formData.capacity.min || formData.capacity.min < 1) {
          newErrors.minCapacity = t('activity.minCapacityRequired', 'Minimum capacity is required');
        }
        if (!formData.capacity.max || formData.capacity.max < formData.capacity.min) {
          newErrors.maxCapacity = t('activity.maxCapacityRequired', 'Maximum capacity must be greater than minimum');
        }
        break;
        
      case 3: // Location & Duration
        if (!formData.location.city.trim()) newErrors.city = t('activity.cityRequired', 'City is required');
        if (!formData.location.region.trim()) newErrors.region = t('activity.regionRequired', 'Region is required');
        if (!formData.duration.hours || formData.duration.hours < 0.5) {
          newErrors.duration = t('activity.durationRequired', 'Duration must be at least 0.5 hours');
        }
        break;
        
      case 4: // Media & Requirements
        if (formData.images.length === 0) {
          newErrors.images = t('activity.imagesRequired', 'At least one image is required');
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Validate all steps
      const allValid = [1, 2, 3, 4].every(stepNumber => validateStep(stepNumber));
      if (!allValid) {
        setError(t('activity.validationError', 'Please fix all validation errors'));
        return;
      }
      
      // Submit form
      if (activityId) {
        await activityService.updateActivity(activityId, formData);
        setMessage(t('activity.updated', 'Activity updated successfully'));
      } else {
        await activityService.createActivity(formData);
        setMessage(t('activity.created', 'Activity created successfully'));
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || t('activity.submitError', 'Failed to save activity'));
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('activity.basicInformation', 'Basic Information')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('activity.title', 'Title')} *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder={t('activity.titlePlaceholder', 'Enter activity title')}
              error={errors.title}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('activity.titleEn', 'Title (English)')}
            </label>
            <Input
              value={formData.titleEn}
              onChange={(e) => handleInputChange('titleEn', e.target.value)}
              placeholder={t('activity.titleEnPlaceholder', 'Enter English title')}
            />
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('activity.description', 'Description')} *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder={t('activity.descriptionPlaceholder', 'Enter short description')}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('activity.fullDescription', 'Full Description')} *
          </label>
          <textarea
            value={formData.fullDescription}
            onChange={(e) => handleInputChange('fullDescription', e.target.value)}
            placeholder={t('activity.fullDescriptionPlaceholder', 'Enter detailed description')}
            rows={6}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent ${
              errors.fullDescription ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.fullDescription && <p className="text-red-500 text-sm mt-1">{errors.fullDescription}</p>}
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('activity.category', 'Category')} *
          </label>
          <select
            value={formData.category.id}
            onChange={(e) => {
              const category = activityService.getCategories().find(c => c.id === e.target.value);
              handleInputChange('category', category || { id: '', name: '', nameEn: '' });
            }}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">{t('activity.selectCategory', 'Select Category')}</option>
            {activityService.getCategories().map(category => (
              <option key={category.id} value={category.id}>
                {t('common.language', 'ar') === 'ar' ? category.nameAr : category.name}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('activity.tags', 'Tags')}
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-ludus-orange text-white"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-white hover:text-gray-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex">
            <Input
              placeholder={t('activity.addTag', 'Add tag')}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag(e.target.value.trim());
                  e.target.value = '';
                }
              }}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('activity.pricingAndCapacity', 'Pricing & Capacity')}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('activity.basePrice', 'Base Price')} *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="number"
              value={formData.pricing.basePrice}
              onChange={(e) => handleInputChange('pricing.basePrice', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="pl-10"
              error={errors.basePrice}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('activity.priceType', 'Price Type')}
          </label>
          <select
            value={formData.pricing.priceType}
            onChange={(e) => handleInputChange('pricing.priceType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
          >
            {activityService.getPriceTypes().map(type => (
              <option key={type.id} value={type.id}>
                {t('common.language', 'ar') === 'ar' ? type.nameAr : type.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('activity.minCapacity', 'Minimum Capacity')} *
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="number"
              value={formData.capacity.min}
              onChange={(e) => handleInputChange('capacity.min', parseInt(e.target.value) || 1)}
              placeholder="1"
              className="pl-10"
              error={errors.minCapacity}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('activity.maxCapacity', 'Maximum Capacity')} *
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="number"
              value={formData.capacity.max}
              onChange={(e) => handleInputChange('capacity.max', parseInt(e.target.value) || 10)}
              placeholder="10"
              className="pl-10"
              error={errors.maxCapacity}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('activity.locationAndDuration', 'Location & Duration')}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('activity.city', 'City')} *
          </label>
          <Input
            value={formData.location.city}
            onChange={(e) => handleInputChange('location.city', e.target.value)}
            placeholder={t('activity.cityPlaceholder', 'Enter city name')}
            error={errors.city}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('activity.region', 'Region')} *
          </label>
          <Input
            value={formData.location.region}
            onChange={(e) => handleInputChange('location.region', e.target.value)}
            placeholder={t('activity.regionPlaceholder', 'Enter region')}
            error={errors.region}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('activity.address', 'Address')}
        </label>
        <Input
          value={formData.location.address}
          onChange={(e) => handleInputChange('location.address', e.target.value)}
          placeholder={t('activity.addressPlaceholder', 'Enter full address')}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('activity.durationHours', 'Duration (Hours)')} *
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="number"
              step="0.5"
              min="0.5"
              value={formData.duration.hours}
              onChange={(e) => handleInputChange('duration.hours', parseFloat(e.target.value) || 0)}
              placeholder="2"
              className="pl-10"
              error={errors.duration}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('activity.durationMinutes', 'Duration (Minutes)')}
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="number"
              min="0"
              max="59"
              value={formData.duration.minutes}
              onChange={(e) => handleInputChange('duration.minutes', parseInt(e.target.value) || 0)}
              placeholder="0"
              className="pl-10"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('activity.mediaAndRequirements', 'Media & Requirements')}
      </h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('activity.images', 'Images')} *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {formData.images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image.url}
                alt={`Activity image ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            {t('activity.uploadImages', 'Upload images')}
          </p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              Array.from(e.target.files).forEach(file => handleImageUpload(file));
            }}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer bg-ludus-orange text-white px-4 py-2 rounded-md hover:bg-ludus-orange-dark"
          >
            {t('activity.selectImages', 'Select Images')}
          </label>
        </div>
        {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('activity.ageRange', 'Age Range')}
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              {t('activity.minAge', 'Minimum Age')}
            </label>
            <Input
              type="number"
              value={formData.requirements.ageMin}
              onChange={(e) => handleInputChange('requirements.ageMin', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              {t('activity.maxAge', 'Maximum Age')}
            </label>
            <Input
              type="number"
              value={formData.requirements.ageMax}
              onChange={(e) => handleInputChange('requirements.ageMax', parseInt(e.target.value) || 100)}
              placeholder="100"
            />
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('activity.skillLevel', 'Skill Level')}
        </label>
        <select
          value={formData.requirements.skillLevel}
          onChange={(e) => handleInputChange('requirements.skillLevel', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange focus:border-transparent"
        >
          <option value="beginner">{t('activity.beginner', 'Beginner')}</option>
          <option value="intermediate">{t('activity.intermediate', 'Intermediate')}</option>
          <option value="advanced">{t('activity.advanced', 'Advanced')}</option>
          <option value="expert">{t('activity.expert', 'Expert')}</option>
        </select>
      </div>
    </div>
  );

  if (loading && activityId) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={t('common.direction') || 'ltr'}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ludus-orange"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={t('common.direction') || 'ltr'}>
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {activityId ? t('activity.editActivity', 'Edit Activity') : t('activity.createActivity', 'Create Activity')}
            </CardTitle>
            <CardDescription>
              {t('activity.formDescription', 'Fill in the details to create your activity listing')}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && <Alert type="error" message={error} className="mb-6" />}
            {message && <Alert type="success" message={message} className="mb-6" />}
            
            {/* Progress Indicator */}
            <div className="flex items-center justify-between mb-8">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      stepNumber <= step
                        ? 'bg-ludus-orange text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <div
                      className={`w-16 h-1 mx-2 ${
                        stepNumber < step ? 'bg-ludus-orange' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            
            {/* Form Steps */}
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <div>
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={loading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('common.previous', 'Previous')}
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-4 rtl:space-x-reverse">
                {onCancel && (
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                  >
                    {t('common.cancel', 'Cancel')}
                  </Button>
                )}
                
                {step < 4 ? (
                  <Button
                    onClick={handleNext}
                    disabled={loading}
                    className="bg-ludus-orange hover:bg-ludus-orange-dark"
                  >
                    {t('common.next', 'Next')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-ludus-orange hover:bg-ludus-orange-dark"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('common.saving', 'Saving...')}
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {activityId ? t('common.update', 'Update') : t('common.create', 'Create')}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActivityForm;
