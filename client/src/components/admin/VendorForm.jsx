import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import api from '../../services/api';
import { imageService } from '../../services/imageService'; // Import the service

const VendorForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    category: '',
    contactInfo: { email: '', phone: '', website: '', whatsapp: '' },
    address: { street: '', city: '', governorate: '', postalCode: '', coordinates: { latitude: 0, longitude: 0 } },
    businessHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '14:00', close: '22:00', closed: false },
      saturday: { open: '09:00', close: '22:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: false }
    },
    socialMedia: { instagram: '', twitter: '', facebook: '', youtube: '', snapchat: '', tiktok: '' },
    businessInfo: { licenseNumber: '', established: '', employeeCount: '', specialization: [] },
    images: { logo: '', cover: '', gallery: [] },
    settings: { featured: false, verified: false, acceptsOnlineBooking: true, requiresApproval: false, instantConfirmation: true },
    policies: { cancellationPolicy: '', refundPolicy: '', termsAndConditions: '' },
    isActive: true,
    rating: { average: 0, totalReviews: 0 }
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

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
    { key: 'monday', label: 'Monday' }, { key: 'tuesday', label: 'Tuesday' }, { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' }, { key: 'friday', label: 'Friday' }, { key: 'saturday', label: 'Saturday' },
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
      // Ensure nested objects exist to prevent errors
      const fetchedData = response.data.data;
      const sanitizedData = {
        ...fetchedData,
        images: fetchedData.images || { logo: '', cover: '', gallery: [] },
      };
      setFormData(sanitizedData);
    } catch (error) {
      console.error('Failed to fetch vendor:', error);
      setMessage({ type: 'error', text: 'Failed to load vendor' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [field]: value } }));
  };

  const handleBusinessHoursChange = (day, field, value) => {
    setFormData(prev => ({ ...prev, businessHours: { ...prev.businessHours, [day]: { ...prev.businessHours[day], [field]: value } } }));
  };

  const handleSpecializationToggle = (specialization) => {
    setFormData(prev => ({ ...prev, businessInfo: { ...prev.businessInfo, specialization: prev.businessInfo.specialization.includes(specialization) ? prev.businessInfo.specialization.filter(s => s !== specialization) : [...prev.businessInfo.specialization, specialization] } }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const response = await imageService.uploadImage(file);
      handleNestedInputChange('images', 'logo', response.secure_url);
    } catch (error) {
      setUploadError(error.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Prepare data for submission, mapping frontend state to backend expectation
      const submissionData = { ...formData };
      if (formData.images?.logo) {
        submissionData.logoUrl = formData.images.logo;
      }

      if (isEditing) {
        await api.put(`/admin/vendors/${id}`, submissionData);
        setMessage({ type: 'success', text: 'Vendor updated successfully' });
      } else {
        await api.post('/admin/vendors', submissionData);
        setMessage({ type: 'success', text: 'Vendor created successfully' });
      }
      
      setTimeout(() => navigate('/admin/vendors'), 1500);
      
    } catch (error) {
      console.error('Failed to save vendor:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save vendor' });
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-display-sm font-bold text-ludus-dark">{isEditing ? 'Edit Vendor' : 'Add New Vendor'}</h1>
          <p className="text-body-sm text-ludus-gray-600">{isEditing ? 'Update vendor information' : 'Create a new vendor profile'}</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/vendors')} className="text-ludus-dark border-ludus-gray-300">
          ← Back to Vendors
        </Button>
      </div>

      {message && <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">Business Name *</label>
              <Input value={formData.businessName} onChange={(e) => handleInputChange('businessName', e.target.value)} placeholder="Adventure Tours Saudi" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">Description *</label>
              <textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Describe your business..." className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md resize-none h-24" required />
            </div>

            {/* Logo Upload Section */}
            <div className="md:col-span-2">
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">Business Logo</label>
              <div className="flex items-center gap-4">
                {formData.images?.logo && (
                  <img src={formData.images.logo} alt="Logo Preview" className="w-20 h-20 rounded-md object-cover border border-ludus-gray-200" />
                )}
                <div className="flex-grow">
                  <Input type="file" onChange={handleLogoUpload} disabled={uploading} className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-ludus-orange-100 file:text-ludus-orange-700 hover:file:bg-ludus-orange-200" />
                  {uploading && <p className="text-sm text-ludus-gray-500 mt-1">Uploading...</p>}
                  {uploadError && <p className="text-sm text-red-500 mt-1">{uploadError}</p>}
                  <p className="text-xs text-ludus-gray-500 mt-1">Recommended size: 200x200px, PNG or JPG.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">Category *</label>
              <select value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)} className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md" required>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Other fields... */}
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
                <input type="checkbox" checked={formData.isActive} onChange={(e) => handleInputChange('isActive', e.target.checked)} className="mr-2"/>
                <span className="text-sm text-ludus-dark">Active</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" checked={formData.settings.featured} onChange={(e) => handleNestedInputChange('settings', 'featured', e.target.checked)} className="mr-2"/>
                <span className="text-sm text-ludus-dark">Featured</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" checked={formData.settings.verified} onChange={(e) => handleNestedInputChange('settings', 'verified', e.target.checked)} className="mr-2"/>
                <span className="text-sm text-ludus-dark">Verified</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Contact Information Card */}
        <Card className="p-6">
            <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-label-sm font-medium text-ludus-dark mb-2">Email *</label>
                    <Input type="email" value={formData.contactInfo.email} onChange={(e) => handleNestedInputChange('contactInfo', 'email', e.target.value)} required />
                </div>
                <div>
                    <label className="block text-label-sm font-medium text-ludus-dark mb-2">Phone *</label>
                    <Input type="tel" value={formData.contactInfo.phone} onChange={(e) => handleNestedInputChange('contactInfo', 'phone', e.target.value)} required />
                </div>
                <div>
                    <label className="block text-label-sm font-medium text-ludus-dark mb-2">Website</label>
                    <Input type="url" value={formData.contactInfo.website} onChange={(e) => handleNestedInputChange('contactInfo', 'website', e.target.value)} />
                </div>
                <div>
                    <label className="block text-label-sm font-medium text-ludus-dark mb-2">WhatsApp</label>
                    <Input type="tel" value={formData.contactInfo.whatsapp} onChange={(e) => handleNestedInputChange('contactInfo', 'whatsapp', e.target.value)} />
                </div>
            </div>
        </Card>

        {/* Address Card */}
        <Card className="p-6">
            <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-label-sm font-medium text-ludus-dark mb-2">Street Address *</label>
                    <Input value={formData.address.street} onChange={(e) => handleNestedInputChange('address', 'street', e.target.value)} required />
                </div>
                <div>
                    <label className="block text-label-sm font-medium text-ludus-dark mb-2">City *</label>
                    <Input value={formData.address.city} onChange={(e) => handleNestedInputChange('address', 'city', e.target.value)} required />
                </div>
                <div>
                    <label className="block text-label-sm font-medium text-ludus-dark mb-2">Governorate *</label>
                    <select value={formData.address.governorate} onChange={(e) => handleNestedInputChange('address', 'governorate', e.target.value)} className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md" required>
                        <option value="">Select Governorate</option>
                        {governorates.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-label-sm font-medium text-ludus-dark mb-2">Postal Code</label>
                    <Input value={formData.address.postalCode} onChange={(e) => handleNestedInputChange('address', 'postalCode', e.target.value)} />
                </div>
            </div>
        </Card>

        {/* ... other cards ... */}

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={saving || uploading} className="bg-ludus-orange text-white px-8">
            {saving ? '💾 Saving...' : isEditing ? '📝 Update Vendor' : '➕ Create Vendor'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/vendors')} className="text-ludus-dark border-ludus-gray-300">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VendorForm;