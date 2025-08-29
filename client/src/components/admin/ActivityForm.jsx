import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import api from '../../services/api';
import { imageService } from '../../services/imageService';

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
    duration: { value: 1, unit: 'hours' },
    pricing: { basePrice: 0, currency: 'SAR', priceType: 'per_person' },
    capacity: { min: 1, max: 10 },
    location: { address: '', city: '', governorate: '', coordinates: { latitude: 0, longitude: 0 } },
    images: [],
    requirements: [],
    includes: [],
    excludes: [],
    cancellationPolicy: '',
    isActive: true,
    featured: false,
    ageRestriction: { minAge: 0, maxAge: 100 },
    difficulty: 'beginner',
    language: ['en', 'ar'],
    schedule: { type: 'flexible', availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], timeSlots: [] }
  });

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

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

  const fetchVendors = useCallback(async () => {
    try {
      const response = await api.get('/admin/vendors?limit=1000'); // Fetch all vendors
      setVendors(response.data.data.vendors || []);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    }
  }, []);

  const fetchActivity = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await api.get(`/admin/activities/${id}`);
      const fetchedData = response.data.data;
      // Ensure nested structures are present
      const sanitizedData = {
        ...fetchedData,
        images: fetchedData.images || [],
        pricing: fetchedData.pricing || { basePrice: 0, currency: 'SAR' },
        duration: fetchedData.duration || { value: 1, unit: 'hours' },
        capacity: fetchedData.capacity || { min: 1, max: 10 },
        location: fetchedData.location || { address: '', city: '' },
      };
      setFormData(sanitizedData);
    } catch (error) {
      console.error('Failed to fetch activity:', error);
      setMessage({ type: 'error', text: 'Failed to load activity' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVendors();
    if (isEditing) {
      fetchActivity();
    }
  }, [isEditing, fetchVendors, fetchActivity]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [field]: value } }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const response = await imageService.uploadImage(file);
      // The backend expects an array, so we'll set the first image as primary
      handleInputChange('images', [{ url: response.secure_url, isPrimary: true, alt: formData.title || 'Activity Image' }]);
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
      
      const submissionData = { ...formData };
      // The backend controller expects a single `imageUrl` for simplicity
      if (formData.images && formData.images.length > 0) {
        submissionData.imageUrl = formData.images[0].url;
      }

      if (isEditing) {
        await api.put(`/admin/activities/${id}`, submissionData);
        setMessage({ type: 'success', text: 'Activity updated successfully' });
      } else {
        await api.post('/admin/activities', submissionData);
        setMessage({ type: 'success', text: 'Activity created successfully' });
      }
      
      setTimeout(() => navigate('/admin/activities'), 1500);
      
    } catch (error) {
      console.error('Failed to save activity:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save activity' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const primaryImageUrl = formData.images?.[0]?.url;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-display-sm font-bold text-ludus-dark">{isEditing ? 'Edit Activity' : 'Add New Activity'}</h1>
          <p className="text-body-sm text-ludus-gray-600">{isEditing ? 'Update activity information' : 'Create a new activity'}</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/activities')} className="text-ludus-dark border-ludus-gray-300">
          ← Back to Activities
        </Button>
      </div>

      {message && <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">Activity Title *</label>
              <Input value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">Description *</label>
              <textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md h-24" required />
            </div>

            {/* Image Upload Section */}
            <div className="md:col-span-2">
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">Primary Image</label>
              <div className="flex items-center gap-4">
                {primaryImageUrl && (
                  <img src={primaryImageUrl} alt="Activity Preview" className="w-28 h-20 rounded-md object-cover border border-ludus-gray-200" />
                )}
                <div className="flex-grow">
                  <Input type="file" onChange={handleImageUpload} disabled={uploading} className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-ludus-orange-100 file:text-ludus-orange-700 hover:file:bg-ludus-orange-200" />
                  {uploading && <p className="text-sm text-ludus-gray-500 mt-1">Uploading image...</p>}
                  {uploadError && <p className="text-sm text-red-500 mt-1">{uploadError}</p>}
                  <p className="text-xs text-ludus-gray-500 mt-1">Main image for the activity card. Recommended size: 800x600px.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">Category *</label>
              <select value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)} className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md" required>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">Vendor *</label>
              <select value={formData.vendor} onChange={(e) => handleInputChange('vendor', e.target.value)} className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md" required>
                <option value="">Select Vendor</option>
                {vendors.map(v => <option key={v._id} value={v._id}>{v.businessName}</option>)}
              </select>
            </div>
            {/* ... other fields ... */}
            <div className="md:col-span-2 flex items-center gap-4">
              <label className="flex items-center">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => handleInputChange('isActive', e.target.checked)} className="mr-2"/>
                <span className="text-sm text-ludus-dark">Active</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" checked={formData.featured} onChange={(e) => handleInputChange('featured', e.target.checked)} className="mr-2"/>
                <span className="text-sm text-ludus-dark">Featured</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Pricing & Duration Card */}
        <Card className="p-6">
          <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">Pricing & Duration</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">Base Price (SAR) *</label>
              <Input type="number" value={formData.pricing.basePrice} onChange={(e) => handleNestedInputChange('pricing', 'basePrice', parseFloat(e.target.value))} required />
            </div>
            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">Duration Value *</label>
              <Input type="number" value={formData.duration.value} onChange={(e) => handleNestedInputChange('duration', 'value', parseInt(e.target.value))} required />
            </div>
            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">Duration Unit</label>
              <select value={formData.duration.unit} onChange={(e) => handleNestedInputChange('duration', 'unit', e.target.value)} className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md">
                {durationUnits.map(u => <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>)}
              </select>
            </div>
          </div>
        </Card>

        {/* ... other cards ... */}

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={saving || uploading} className="bg-ludus-orange text-white px-8">
            {saving ? '💾 Saving...' : isEditing ? '📝 Update Activity' : '➕ Create Activity'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/activities')} className="text-ludus-dark border-ludus-gray-300">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ActivityForm;