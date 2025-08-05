import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import api from '../../services/api';

const VendorForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    category: '',
    contactInfo: {
      email: '',
      phone: '',
      website: '',
      whatsapp: ''
    },
    address: {
      street: '',
      city: '',
      governorate: '',
      postalCode: '',
      coordinates: {
        latitude: 0,
        longitude: 0
      }
    },
    businessHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '14:00', close: '22:00', closed: false },
      saturday: { open: '09:00', close: '22:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: false }
    },
    socialMedia: {
      instagram: '',
      twitter: '',
      facebook: '',
      youtube: '',
      snapchat: '',
      tiktok: ''
    },
    businessInfo: {
      licenseNumber: '',
      established: '',
      employeeCount: '',
      specialization: []
    },
    images: {
      logo: '',
      cover: '',
      gallery: []
    },
    settings: {
      featured: false,
      verified: false,
      acceptsOnlineBooking: true,
      requiresApproval: false,
      instantConfirmation: true
    },
    policies: {
      cancellationPolicy: '',
      refundPolicy: '',
      termsAndConditions: ''
    },
    isActive: true,
    rating: {
      average: 0,
      totalReviews: 0
    }
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const categories = [
    'Adventure & Outdoor', 'Cultural & Heritage', 'Educational', 'Entertainment',
    'Sports & Fitness', 'Wellness & Health', 'Food & Beverage', 'Arts & Crafts',
    'Technology', 'Nature & Wildlife', 'Marine Activities', 'Desert Activities'
  ];

  const governorates = [
    'Riyadh', 'Mecca', 'Eastern Province', 'Asir', 'Jazan', 'Medina',
    'Al Qassim', 'Tabuk', 'Hail', 'Northern Border', 'Najran', 'Al Bahah', 'Al Jouf'
  ];

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const specializations = [
    'Adventure Tours', 'Cultural Experiences', 'Educational Programs',
    'Family Activities', 'Corporate Events', 'Private Tours',
    'Group Activities', 'Water Sports', 'Desert Safari',
    'City Tours', 'Heritage Sites', 'Food Experiences'
  ];

  useEffect(() => {
    if (isEditing) {
      fetchVendor();
    }
  }, [id]);

  const fetchVendor = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/vendors/${id}`);
      setFormData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch vendor:', error);
      setMessage({ type: 'error', text: 'Failed to load vendor' });
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

  const handleBusinessHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleSpecializationToggle = (specialization) => {
    setFormData(prev => ({
      ...prev,
      businessInfo: {
        ...prev.businessInfo,
        specialization: prev.businessInfo.specialization.includes(specialization)
          ? prev.businessInfo.specialization.filter(s => s !== specialization)
          : [...prev.businessInfo.specialization, specialization]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      if (isEditing) {
        await api.put(`/admin/vendors/${id}`, formData);
        setMessage({ type: 'success', text: 'Vendor updated successfully' });
      } else {
        await api.post('/admin/vendors', formData);
        setMessage({ type: 'success', text: 'Vendor created successfully' });
      }
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/admin/vendors');
      }, 1500);
      
    } catch (error) {
      console.error('Failed to save vendor:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save vendor' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-ludus-orange border-t-transparent mx-auto"></div>
        <p className="text-ludus-gray-600 mt-4">Loading vendor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-display-sm font-bold text-ludus-dark">
            {isEditing ? 'Edit Vendor' : 'Add New Vendor'}
          </h1>
          <p className="text-body-sm text-ludus-gray-600">
            {isEditing ? 'Update vendor information' : 'Create a new vendor profile for the platform'}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/admin/vendors')}
          className="text-ludus-dark border-ludus-gray-300"
        >
          ← Back to Vendors
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
                Business Name *
              </label>
              <Input
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                placeholder="Adventure Tours Saudi"
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
                placeholder="Describe your business and what makes it unique..."
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
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                License Number
              </label>
              <Input
                value={formData.businessInfo.licenseNumber}
                onChange={(e) => handleNestedInputChange('businessInfo', 'licenseNumber', e.target.value)}
                placeholder="CR-123456789"
              />
            </div>

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Established Year
              </label>
              <Input
                type="number"
                value={formData.businessInfo.established}
                onChange={(e) => handleNestedInputChange('businessInfo', 'established', e.target.value)}
                placeholder="2020"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Employee Count
              </label>
              <select
                value={formData.businessInfo.employeeCount}
                onChange={(e) => handleNestedInputChange('businessInfo', 'employeeCount', e.target.value)}
                className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md"
              >
                <option value="">Select Range</option>
                <option value="1-5">1-5 employees</option>
                <option value="6-20">6-20 employees</option>
                <option value="21-50">21-50 employees</option>
                <option value="50+">50+ employees</option>
              </select>
            </div>

            <div className="md:col-span-2 flex items-center gap-4">
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
                  checked={formData.settings.featured}
                  onChange={(e) => handleNestedInputChange('settings', 'featured', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-ludus-dark">Featured</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.settings.verified}
                  onChange={(e) => handleNestedInputChange('settings', 'verified', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-ludus-dark">Verified</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-6">
          <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Email *
              </label>
              <Input
                type="email"
                value={formData.contactInfo.email}
                onChange={(e) => handleNestedInputChange('contactInfo', 'email', e.target.value)}
                placeholder="info@adventuretours.sa"
                required
              />
            </div>

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Phone *
              </label>
              <Input
                type="tel"
                value={formData.contactInfo.phone}
                onChange={(e) => handleNestedInputChange('contactInfo', 'phone', e.target.value)}
                placeholder="+966 50 123 4567"
                required
              />
            </div>

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Website
              </label>
              <Input
                type="url"
                value={formData.contactInfo.website}
                onChange={(e) => handleNestedInputChange('contactInfo', 'website', e.target.value)}
                placeholder="https://adventuretours.sa"
              />
            </div>

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                WhatsApp
              </label>
              <Input
                type="tel"
                value={formData.contactInfo.whatsapp}
                onChange={(e) => handleNestedInputChange('contactInfo', 'whatsapp', e.target.value)}
                placeholder="+966 50 123 4567"
              />
            </div>
          </div>
        </Card>

        {/* Address */}
        <Card className="p-6">
          <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">Address</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Street Address *
              </label>
              <Input
                value={formData.address.street}
                onChange={(e) => handleNestedInputChange('address', 'street', e.target.value)}
                placeholder="123 King Fahd Road, Al Khobar"
                required
              />
            </div>

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                City *
              </label>
              <Input
                value={formData.address.city}
                onChange={(e) => handleNestedInputChange('address', 'city', e.target.value)}
                placeholder="Al Khobar"
                required
              />
            </div>

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Governorate *
              </label>
              <select
                value={formData.address.governorate}
                onChange={(e) => handleNestedInputChange('address', 'governorate', e.target.value)}
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

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Postal Code
              </label>
              <Input
                value={formData.address.postalCode}
                onChange={(e) => handleNestedInputChange('address', 'postalCode', e.target.value)}
                placeholder="31952"
              />
            </div>
          </div>
        </Card>

        {/* Business Hours */}
        <Card className="p-6">
          <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">Business Hours</h3>
          
          <div className="space-y-3">
            {daysOfWeek.map(day => (
              <div key={day.key} className="grid grid-cols-4 gap-4 items-center">
                <div className="font-medium text-ludus-dark">
                  {day.label}
                </div>
                <div>
                  <Input
                    type="time"
                    value={formData.businessHours[day.key]?.open || '09:00'}
                    onChange={(e) => handleBusinessHoursChange(day.key, 'open', e.target.value)}
                    disabled={formData.businessHours[day.key]?.closed}
                  />
                </div>
                <div>
                  <Input
                    type="time"
                    value={formData.businessHours[day.key]?.close || '18:00'}
                    onChange={(e) => handleBusinessHoursChange(day.key, 'close', e.target.value)}
                    disabled={formData.businessHours[day.key]?.closed}
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.businessHours[day.key]?.closed || false}
                      onChange={(e) => handleBusinessHoursChange(day.key, 'closed', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-ludus-dark">Closed</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Specializations */}
        <Card className="p-6">
          <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">Specializations</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {specializations.map(specialization => (
              <label key={specialization} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.businessInfo.specialization.includes(specialization)}
                  onChange={() => handleSpecializationToggle(specialization)}
                  className="mr-2"
                />
                <span className="text-sm text-ludus-dark">{specialization}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Social Media */}
        <Card className="p-6">
          <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">Social Media</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Instagram
              </label>
              <Input
                value={formData.socialMedia.instagram}
                onChange={(e) => handleNestedInputChange('socialMedia', 'instagram', e.target.value)}
                placeholder="@adventuretours_sa"
              />
            </div>

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Twitter
              </label>
              <Input
                value={formData.socialMedia.twitter}
                onChange={(e) => handleNestedInputChange('socialMedia', 'twitter', e.target.value)}
                placeholder="@adventuretours"
              />
            </div>

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Facebook
              </label>
              <Input
                value={formData.socialMedia.facebook}
                onChange={(e) => handleNestedInputChange('socialMedia', 'facebook', e.target.value)}
                placeholder="facebook.com/adventuretours"
              />
            </div>

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Snapchat
              </label>
              <Input
                value={formData.socialMedia.snapchat}
                onChange={(e) => handleNestedInputChange('socialMedia', 'snapchat', e.target.value)}
                placeholder="adventuretours-sa"
              />
            </div>
          </div>
        </Card>

        {/* Business Settings */}
        <Card className="p-6">
          <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">Business Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.settings.acceptsOnlineBooking}
                onChange={(e) => handleNestedInputChange('settings', 'acceptsOnlineBooking', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-ludus-dark">Accepts Online Booking</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.settings.requiresApproval}
                onChange={(e) => handleNestedInputChange('settings', 'requiresApproval', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-ludus-dark">Requires Booking Approval</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.settings.instantConfirmation}
                onChange={(e) => handleNestedInputChange('settings', 'instantConfirmation', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-ludus-dark">Instant Confirmation</span>
            </label>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={saving}
            className="bg-ludus-orange text-white px-8"
          >
            {saving ? '💾 Saving...' : isEditing ? '📝 Update Vendor' : '➕ Create Vendor'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/vendors')}
            className="text-ludus-dark border-ludus-gray-300"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VendorForm;