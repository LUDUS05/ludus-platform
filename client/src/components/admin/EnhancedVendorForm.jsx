import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import api from '../../services/api';

const EnhancedVendorForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  const isEditing = Boolean(id);
  const isViewing = location.pathname.includes('/view/');

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
    // NEW: Bank Account Information
    bankInfo: {
      bankName: '',
      accountNumber: '',
      iban: '',
      accountHolderName: '',
      swiftCode: ''
    },
    // NEW: Document Management
    documents: {
      commercialRegistration: {
        fileName: '',
        fileUrl: '',
        uploadDate: null,
        status: 'pending' // pending, approved, rejected
      },
      nationalId: {
        fileName: '',
        fileUrl: '',
        uploadDate: null,
        status: 'pending'
      },
      bankCertificate: {
        fileName: '',
        fileUrl: '',
        uploadDate: null,
        status: 'pending'
      },
      businessLicense: {
        fileName: '',
        fileUrl: '',
        uploadDate: null,
        status: 'pending'
      },
      other: []
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
    // ENHANCED: Status with notes logging
    status: {
      isActive: true,
      currentNote: '',
      history: []
    },
    rating: {
      average: 0,
      totalReviews: 0
    }
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusNote, setStatusNote] = useState('');

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

  const saudiBanks = [
    'Al Rajhi Bank', 'National Commercial Bank (NCB)', 'Riyad Bank', 'Samba Financial Group',
    'Banque Saudi Fransi', 'Arab National Bank', 'Saudi Investment Bank', 'Alinma Bank',
    'Bank AlJazira', 'Bank Albilad', 'Saudi British Bank (SABB)', 'Banque Saudi Fransi'
  ];

  const documentTypes = [
    { key: 'commercialRegistration', label: 'Commercial Registration (CR)', required: true },
    { key: 'nationalId', label: 'National ID / Iqama', required: true },
    { key: 'bankCertificate', label: 'Bank Certificate', required: false },
    { key: 'businessLicense', label: 'Business License', required: false }
  ];

  useEffect(() => {
    if (isEditing || isViewing) {
      fetchVendor();
    }
  }, [id]);

  const fetchVendor = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/vendors/${id}`);
      const vendorData = response.data.data;
      
      // Transform backend data to match form structure
      setFormData(prev => ({
        ...prev,
        ...vendorData,
        status: {
          isActive: vendorData.isActive || false,
          currentNote: '',
          history: vendorData.statusHistory || []
        },
        bankInfo: vendorData.bankInfo || prev.bankInfo,
        documents: vendorData.documents || prev.documents
      }));
    } catch (error) {
      console.error('Failed to fetch vendor:', error);
      setMessage({ type: 'error', text: 'Failed to load vendor data' });
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

  // NEW: Status Toggle with Notes
  const handleStatusToggle = () => {
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    try {
      const newStatus = !formData.status.isActive;
      const statusEntry = {
        status: newStatus ? 'active' : 'inactive',
        note: statusNote,
        timestamp: new Date().toISOString(),
        admin: 'Current Admin' // In real app, get from auth context
      };

      const updatedFormData = {
        ...formData,
        status: {
          isActive: newStatus,
          currentNote: statusNote,
          history: [...formData.status.history, statusEntry]
        }
      };

      setFormData(updatedFormData);
      
      if (isEditing) {
        await api.put(`/admin/vendors/${id}`, {
          isActive: newStatus,
          statusHistory: updatedFormData.status.history
        });
      }

      setShowStatusModal(false);
      setStatusNote('');
      setMessage({ 
        type: 'success', 
        text: `Vendor status changed to ${newStatus ? 'Active' : 'Inactive'}` 
      });
    } catch (error) {
      console.error('Failed to update status:', error);
      setMessage({ type: 'error', text: 'Failed to update vendor status' });
    }
  };

  // NEW: File Upload Handler
  const handleFileUpload = async (documentType, file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      formData.append('vendorId', id);

      // In real implementation, you would upload to cloud storage
      const response = await api.post('/uploads/vendor-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [documentType]: {
            fileName: file.name,
            fileUrl: response.data.fileUrl,
            uploadDate: new Date().toISOString(),
            status: 'pending'
          }
        }
      }));

      setMessage({ type: 'success', text: 'Document uploaded successfully' });
    } catch (error) {
      console.error('Upload failed:', error);
      setMessage({ type: 'error', text: 'Failed to upload document' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const submitData = {
        ...formData,
        isActive: formData.status.isActive,
        statusHistory: formData.status.history
      };

      if (isEditing) {
        await api.put(`/admin/vendors/${id}`, submitData);
        setMessage({ type: 'success', text: 'Vendor updated successfully' });
      } else {
        await api.post('/admin/vendors', submitData);
        setMessage({ type: 'success', text: 'Vendor created successfully' });
      }
      
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
            {isViewing ? 'View Vendor' : isEditing ? 'Edit Vendor' : 'Add New Vendor'}
          </h1>
          <p className="text-body-sm text-ludus-gray-600">
            {isViewing 
              ? 'View vendor details and documentation'
              : isEditing 
                ? 'Update vendor information' 
                : 'Create a new vendor profile for the platform'
            }
          </p>
        </div>
        <div className="flex gap-3">
          {/* Status Toggle Button */}
          {(isEditing || isViewing) && (
            <Button
              type="button"
              onClick={handleStatusToggle}
              className={`${
                formData.status.isActive
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              disabled={isViewing}
            >
              {formData.status.isActive ? '✅ Active' : '❌ Inactive'}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate('/admin/vendors')}
            className="text-ludus-dark border-ludus-gray-300"
          >
            ← Back to Vendors
          </Button>
        </div>
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
                disabled={isViewing}
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
                disabled={isViewing}
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
                disabled={isViewing}
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
                disabled={isViewing}
              />
            </div>
          </div>
        </Card>

        {/* NEW: Bank Account Information */}
        <Card className="p-6">
          <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">💰 Bank Account Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Bank Name *
              </label>
              <select
                value={formData.bankInfo.bankName}
                onChange={(e) => handleNestedInputChange('bankInfo', 'bankName', e.target.value)}
                className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md"
                required={!isViewing}
                disabled={isViewing}
              >
                <option value="">Select Bank</option>
                {saudiBanks.map(bank => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Account Holder Name *
              </label>
              <Input
                value={formData.bankInfo.accountHolderName}
                onChange={(e) => handleNestedInputChange('bankInfo', 'accountHolderName', e.target.value)}
                placeholder="Business Account Name"
                required={!isViewing}
                disabled={isViewing}
              />
            </div>

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                IBAN *
              </label>
              <Input
                value={formData.bankInfo.iban}
                onChange={(e) => handleNestedInputChange('bankInfo', 'iban', e.target.value)}
                placeholder="SA0000000000000000000000"
                required={!isViewing}
                disabled={isViewing}
              />
            </div>

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Account Number
              </label>
              <Input
                value={formData.bankInfo.accountNumber}
                onChange={(e) => handleNestedInputChange('bankInfo', 'accountNumber', e.target.value)}
                placeholder="Account Number"
                disabled={isViewing}
              />
            </div>

            <div>
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                SWIFT Code
              </label>
              <Input
                value={formData.bankInfo.swiftCode}
                onChange={(e) => handleNestedInputChange('bankInfo', 'swiftCode', e.target.value)}
                placeholder="NCBKSAJE"
                disabled={isViewing}
              />
            </div>
          </div>
        </Card>

        {/* NEW: Document Management */}
        <Card className="p-6">
          <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">📄 Required Documents</h3>
          
          <div className="space-y-4">
            {documentTypes.map(docType => (
              <div key={docType.key} className="border border-ludus-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-ludus-dark">
                    {docType.label} {docType.required && <span className="text-red-500">*</span>}
                  </h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    formData.documents[docType.key]?.status === 'approved' ? 'bg-green-100 text-green-800' :
                    formData.documents[docType.key]?.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {formData.documents[docType.key]?.status || 'Not Uploaded'}
                  </span>
                </div>
                
                {formData.documents[docType.key]?.fileName ? (
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">📎</span>
                      <div>
                        <p className="text-sm font-medium text-ludus-dark">
                          {formData.documents[docType.key].fileName}
                        </p>
                        <p className="text-xs text-ludus-gray-600">
                          Uploaded: {new Date(formData.documents[docType.key].uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {formData.documents[docType.key].fileUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(formData.documents[docType.key].fileUrl, '_blank')}
                        >
                          📄 View
                        </Button>
                      )}
                      {!isViewing && (
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => e.target.files[0] && handleFileUpload(docType.key, e.target.files[0])}
                          className="hidden"
                          id={`file-${docType.key}`}
                        />
                      )}
                      {!isViewing && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById(`file-${docType.key}`).click()}
                          disabled={uploading}
                        >
                          🔄 Replace
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-ludus-gray-300 rounded-lg p-6 text-center">
                    <span className="text-4xl text-ludus-gray-400 block mb-2">📁</span>
                    <p className="text-ludus-gray-600 mb-2">No file uploaded</p>
                    {!isViewing && (
                      <>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => e.target.files[0] && handleFileUpload(docType.key, e.target.files[0])}
                          className="hidden"
                          id={`upload-${docType.key}`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById(`upload-${docType.key}`).click()}
                          disabled={uploading}
                        >
                          {uploading ? 'Uploading...' : '📤 Upload Document'}
                        </Button>
                        <p className="text-xs text-ludus-gray-500 mt-2">
                          Supported formats: PDF, JPG, PNG (Max 10MB)
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Status History Log */}
        {(isEditing || isViewing) && formData.status.history.length > 0 && (
          <Card className="p-6">
            <h3 className="text-body-lg font-semibold text-ludus-dark mb-4">📋 Status History</h3>
            <div className="space-y-3">
              {formData.status.history.map((entry, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className={`w-3 h-3 rounded-full mt-2 ${
                    entry.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-ludus-dark">
                        Status changed to {entry.status === 'active' ? 'Active' : 'Inactive'}
                      </p>
                      <span className="text-xs text-ludus-gray-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="text-sm text-ludus-gray-600 mt-1">{entry.note}</p>
                    )}
                    <p className="text-xs text-ludus-gray-500 mt-1">By: {entry.admin}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Submit Button */}
        {!isViewing && (
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
        )}
      </form>

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-ludus-dark mb-4">
              Change Vendor Status
            </h3>
            <p className="text-ludus-gray-600 mb-4">
              You are about to change the vendor status from{' '}
              <span className={`font-medium ${formData.status.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {formData.status.isActive ? 'Active' : 'Inactive'}
              </span>{' '}
              to{' '}
              <span className={`font-medium ${!formData.status.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {!formData.status.isActive ? 'Active' : 'Inactive'}
              </span>
            </p>
            
            <div className="mb-4">
              <label className="block text-label-sm font-medium text-ludus-dark mb-2">
                Add a note (optional)
              </label>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="e.g., Waiting for vendor to provide his CR in order to be active"
                className="w-full px-3 py-2 border border-ludus-gray-300 rounded-md resize-none h-20"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={confirmStatusChange}
                className="bg-ludus-orange text-white flex-1"
              >
                Confirm Change
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowStatusModal(false);
                  setStatusNote('');
                }}
                className="text-ludus-dark border-ludus-gray-300 flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedVendorForm;