import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import api from '../../services/api';

const ActivityForm = () => {
  const { t: _ } = useTranslation(); // eslint-disable-line no-unused-vars
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    vendor: '',
    duration: {
      value: 1,
      unit: 'hours'
    },
    pricing: {
      basePrice: 0,
      currency: 'SAR',
      priceType: 'per_person'
    },
    capacity: {
      min: 1,
      max: 10
    },
    location: {
      address: '',
      city: '',
      governorate: '',
      coordinates: {
        latitude: 0,
        longitude: 0
      }
    },
    images: [],
    requirements: [],
    includes: [],
    excludes: [],
    cancellationPolicy: '',
    isActive: true,
    featured: false,
    ageRestriction: {
      minAge: 0,
      maxAge: 100
    },
    difficulty: 'beginner',
    language: ['en', 'ar'],
    schedule: {
      type: 'flexible',
      availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      timeSlots: []
    }
  });

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const categories = [
    'adventure', 'cultural', 'educational', 'entertainment', 
    'sports', 'wellness', 'food', 'arts', 'technology', 'nature'
  ];

  const governorates = [
    'Riyadh', 'Mecca', 'Eastern Province', 'Asir', 'Jazan', 'Medina',
    'Al Qassim', 'Tabuk', 'Hail', 'Northern Border', 'Najran', 'Al Bahah', 'Al Jouf'
  ];

  const difficultyLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const durationUnits = ['minutes', 'hours', 'days'];

  useEffect(() => {
    fetchVendors();
    if (isEditing) {
      fetchActivity();
    }
  }, [id]);

  const fetchVendors = async () => {
    try {
      const response = await api.get('/admin/vendors?limit=100');
      setVendors(response.data.data.vendors || []);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    }
  };

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/activities/${id}`);
      setFormData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch activity:', error);
      setMessage({ type: 'error', text: 'Failed to load activity' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleArrayInputChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field, defaultValue = '') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], defaultValue]
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      if (isEditing) {
        await api.put(`/admin/activities/${id}`, formData);
        setMessage({ type: 'success', text: 'Activity updated successfully' });
      } else {
        await api.post('/admin/activities', formData);
        setMessage({ type: 'success', text: 'Activity created successfully' });
      }
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/admin/activities');
      }, 1500);
      
    } catch (error) {
      console.error('Failed to save activity:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save activity' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-ludus-orange border-t-transparent mx-auto"></div>
        <p className="text-ludus-gray-600 mt-4">Loading activity...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-display-sm font-bold text-ludus-dark">
            {isEditing ? 'Edit Activity' : 'Add New Activity'}
          </h1>
          <p className="text-body-sm text-ludus-gray-600">
            {isEditing ? 'Update activity information' : 'Create a new activity for the platform'}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/admin/activities')}
          className="text-ludus-dark border-ludus-gray-300"
        >
          ← Back to Activities
        </Button>
      </div>

      {message && (
        <Alert
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Activity Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Desert Safari Adventure"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the activity in detail..."
                className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md resize-none h-24"
                required
              />
            </div>

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Vendor *
              </label>
              <select
                value={formData.vendor}
                onChange={(e) => handleInputChange('vendor', e.target.value)}
                className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md"
                required
              >
                <option value="">Select Vendor</option>
                {vendors.map(vendor => (
                  <option key={vendor._id} value={vendor._id}>
                    {vendor.businessName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Difficulty Level
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md"
              >
                {difficultyLevels.map(level => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-ludus-dark">Active</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-ludus-dark">Featured</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Pricing & Duration */}
        <Card className="p-6">
          <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">Pricing & Duration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Base Price (SAR) *
              </label>
              <Input
                type="number"
                value={formData.pricing.basePrice}
                onChange={(e) => handleNestedInputChange('pricing', 'basePrice', parseFloat(e.target.value))}
                placeholder="250"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Duration Value *
              </label>
              <Input
                type="number"
                value={formData.duration.value}
                onChange={(e) => handleNestedInputChange('duration', 'value', parseInt(e.target.value))}
                placeholder="2"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Duration Unit
              </label>
              <select
                value={formData.duration.unit}
                onChange={(e) => handleNestedInputChange('duration', 'unit', e.target.value)}
                className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md"
              >
                {durationUnits.map(unit => (
                  <option key={unit} value={unit}>
                    {unit.charAt(0).toUpperCase() + unit.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Min Participants
              </label>
              <Input
                type="number"
                value={formData.capacity.min}
                onChange={(e) => handleNestedInputChange('capacity', 'min', parseInt(e.target.value))}
                placeholder="1"
                min="1"
              />
            </div>

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Max Participants
              </label>
              <Input
                type="number"
                value={formData.capacity.max}
                onChange={(e) => handleNestedInputChange('capacity', 'max', parseInt(e.target.value))}
                placeholder="10"
                min="1"
              />
            </div>
          </div>
        </Card>

        {/* Location */}
        <Card className="p-6">
          <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">Location</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Address *
              </label>
              <Input
                value={formData.location.address}
                onChange={(e) => handleNestedInputChange('location', 'address', e.target.value)}
                placeholder="123 Desert Road, Al Khobar"
                required
              />
            </div>

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                City *
              </label>
              <Input
                value={formData.location.city}
                onChange={(e) => handleNestedInputChange('location', 'city', e.target.value)}
                placeholder="Al Khobar"
                required
              />
            </div>

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Governorate *
              </label>
              <select
                value={formData.location.governorate}
                onChange={(e) => handleNestedInputChange('location', 'governorate', e.target.value)}
                className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md"
                required
              >
                <option value="">Select Governorate</option>
                {governorates.map(gov => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Activity Details */}
        <Card className="p-6">
          <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">Activity Details</h3>
          
          {/* What's Included */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-label-sm font-medium text-ludus-dark">
                What's Included
              </label>
              <Button
                type="button"
                size="sm"
                onClick={() => addArrayItem('includes')}
                className="bg-ludus-orange text-white"
              >
                + Add Item
              </Button>
            </div>
            <div className="space-y-2">
              {formData.includes.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => handleArrayInputChange('includes', index, e.target.value)}
                    placeholder="Equipment rental, Professional guide..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => removeArrayItem('includes', index)}
                    className="text-red-600 border-red-300"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-label-sm font-medium text-ludus-dark">
                Requirements
              </label>
              <Button
                type="button"
                size="sm"
                onClick={() => addArrayItem('requirements')}
                className="bg-ludus-orange text-white"
              >
                + Add Requirement
              </Button>
            </div>
            <div className="space-y-2">
              {formData.requirements.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => handleArrayInputChange('requirements', index, e.target.value)}
                    placeholder="Good physical condition, Swimming ability..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => removeArrayItem('requirements', index)}
                    className="text-red-600 border-red-300"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Cancellation Policy */}
          <div>
            <label className="block text-label-sm font-medium text-ludus-dark mb-2">
              Cancellation Policy
            </label>
            <textarea
              value={formData.cancellationPolicy}
              onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
              placeholder="Free cancellation up to 24 hours before the activity..."
              className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md resize-none h-20"
            />
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={saving}
            className="bg-ludus-orange text-white px-8"
          >
            {saving ? '💾 Saving...' : isEditing ? '📝 Update Activity' : '➕ Create Activity'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/activities')}
            className="text-ludus-dark border-ludus-gray-300"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ActivityForm;