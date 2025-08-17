'use client';

import { useState, useEffect } from 'react';
import { Card } from '@opgrapes/ui/Card';
import { Button } from '@opgrapes/ui/Button';
import { Input } from '@opgrapes/ui/Input';
import { Textarea } from '@opgrapes/ui/Textarea';
import { Checkbox } from '@opgrapes/ui/Checkbox';
import { Text } from '@opgrapes/ui/Text';
import { Stack } from '@opgrapes/ui/Stack';
import { Badge } from '@opgrapes/ui/Badge';
import { Tabs, TabList, Tab, TabPanel } from '@opgrapes/ui/Tabs';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { 
  Building2, 
  Upload, 
  Save, 
  AlertCircle
} from 'lucide-react';

// Mock vendor data - replace with API calls
const mockVendor = {
  id: '1',
  name: 'Adventure Co.',
  description: 'Leading adventure company with over 10 years of experience in outdoor activities and extreme sports.',
  logo: '/images/adventure-co-logo.jpg',
  banner: '/images/adventure-banner.jpg',
  verified: true,
  rating: 4.9,
  reviewCount: 342,
  location: 'Mountain View, CA',
  established: '2014',
  activityCount: 15,
  categories: ['adventure', 'outdoor', 'water-sports'],
  contact: {
    phone: '+1 (555) 123-4567',
    email: 'info@adventureco.com',
    website: 'adventureco.com'
  },
  featured: true,
  about: 'Adventure Co. was founded with a simple mission: to make outdoor adventure accessible to everyone.',
  businessHours: {
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '10:00', close: '16:00', closed: false },
    sunday: { open: '10:00', close: '16:00', closed: false }
  },
  policies: {
    cancellation: 'Free cancellation up to 48 hours before activity',
    insurance: 'All activities include comprehensive insurance coverage',
    equipment: 'Professional-grade equipment provided for all activities',
    groupSize: 'Maximum 8 participants per guide for safety'
  }
};

const categoryOptions = [
  { value: 'outdoor', label: 'Outdoor & Adventure', icon: '🌲' },
  { value: 'water-sports', label: 'Water Sports', icon: '🏊' },
  { value: 'food-drink', label: 'Food & Drink', icon: '🍽️' },
  { value: 'cultural', label: 'Cultural & Arts', icon: '🎭' },
  { value: 'wellness', label: 'Wellness & Spa', icon: '🧘' },
  { value: 'education', label: 'Education & Learning', icon: '📚' },
  { value: 'art-craft', label: 'Art & Craft', icon: '🎨' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎪' },
  { value: 'technology', label: 'Technology', icon: '💻' },
  { value: 'fitness', label: 'Fitness & Sports', icon: '🏃' }
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

export default function VendorProfilePage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState(mockVendor);
  const [logoPreview, setLogoPreview] = useState(mockVendor.logo);
  const [bannerPreview, setBannerPreview] = useState(mockVendor.banner);

  useEffect(() => {
    // In production, fetch vendor data from API
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }));
  };

  const handleBusinessHoursChange = (day: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day as keyof typeof prev.businessHours],
          [field]: value
        }
      }
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    // In production, send formData to API
    setTimeout(() => {
      setSaving(false);
      // Show success message
    }, 2000);
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(mockVendor);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Vendor Profile
              </h1>
              <p className="text-lg text-gray-600">
                Manage your business information and settings
              </p>
            </div>
            <div className="flex items-center gap-3">
              {hasChanges && (
                <Badge variant="warning" size="sm">
                  <AlertCircle size={14} className="mr-1" />
                  Unsaved Changes
                </Badge>
              )}
              <Button
                size="lg"
                variant="primary"
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultTab={activeTab}>
          <TabList>
            <Tab id="basic">Basic Information</Tab>
            <Tab id="contact">Contact & Hours</Tab>
            <Tab id="policies">Policies & Settings</Tab>
          </TabList>

          {/* Basic Information Tab */}
          <TabPanel id="basic">
            <Card className="p-6">
              <Stack spacing="lg">
                <div>
                  <Text size="lg" weight="semibold" className="mb-4">Basic Information</Text>
                  
                  {/* Logo and Banner */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <Text size="sm" weight="medium" className="mb-2">Company Logo</Text>
                      <div className="flex items-center gap-4">
                        <img 
                          src={logoPreview} 
                          alt="Company Logo" 
                          className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                        />
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                            id="logo-upload"
                          />
                          <label htmlFor="logo-upload">
                            <Button variant="outline" size="sm">
                              <Upload size={14} className="mr-2" />
                              Upload Logo
                            </Button>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Text size="sm" weight="medium" className="mb-2">Banner Image</Text>
                      <div className="flex items-center gap-4">
                        <img 
                          src={bannerPreview} 
                          alt="Banner" 
                          className="w-32 h-20 rounded-lg object-cover border-2 border-gray-200"
                        />
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerUpload}
                            className="hidden"
                            id="banner-upload"
                          />
                          <label htmlFor="banner-upload">
                            <Button variant="outline" size="sm">
                              <Upload size={14} className="mr-2" />
                              Upload Banner
                            </Button>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Company Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Text size="sm" weight="medium" className="mb-2">Company Name</Text>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter company name"
                      />
                    </div>
                    <div>
                      <Text size="sm" weight="medium" className="mb-2">Location</Text>
                      <Input
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="Enter location"
                      />
                    </div>
                    <div>
                      <Text size="sm" weight="medium" className="mb-2">Established Year</Text>
                      <Input
                        value={formData.established}
                        onChange={(e) => handleInputChange('established', e.target.value)}
                        placeholder="Enter year"
                      />
                    </div>
                    <div>
                      <Text size="sm" weight="medium" className="mb-2">Activity Count</Text>
                      <Input
                        type="number"
                        value={formData.activityCount}
                        onChange={(e) => handleInputChange('activityCount', parseInt(e.target.value))}
                        placeholder="Enter count"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Text size="sm" weight="medium" className="mb-2">Description</Text>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your company and services"
                      rows={4}
                    />
                  </div>

                  <div className="mt-4">
                    <Text size="sm" weight="medium" className="mb-2">About</Text>
                    <Textarea
                      value={formData.about}
                      onChange={(e) => handleInputChange('about', e.target.value)}
                      placeholder="Tell your story"
                      rows={4}
                    />
                  </div>

                  {/* Categories */}
                  <div className="mt-6">
                    <Text size="sm" weight="medium" className="mb-3">Activity Categories</Text>
                    <div className="flex flex-wrap gap-2">
                      {categoryOptions.map((category) => (
                        <Checkbox
                          key={category.value}
                          checked={formData.categories.includes(category.value)}
                          onChange={() => handleCategoryToggle(category.value)}
                          label={`${category.icon} ${category.label}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </Stack>
            </Card>
          </TabPanel>

          {/* Contact & Hours Tab */}
          <TabPanel id="contact">
            <Card className="p-6">
              <Stack spacing="lg">
                <div>
                  <Text size="lg" weight="semibold" className="mb-4">Contact Information</Text>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <Text size="sm" weight="medium" className="mb-2">Phone</Text>
                      <Input
                        value={formData.contact.phone}
                        onChange={(e) => handleContactChange('phone', e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <Text size="sm" weight="medium" className="mb-2">Email</Text>
                      <Input
                        value={formData.contact.email}
                        onChange={(e) => handleContactChange('email', e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Text size="sm" weight="medium" className="mb-2">Website</Text>
                      <Input
                        value={formData.contact.website}
                        onChange={(e) => handleContactChange('website', e.target.value)}
                        placeholder="Enter website URL"
                      />
                    </div>
                  </div>

                  <Text size="lg" weight="semibold" className="mb-4">Business Hours</Text>
                  <div className="space-y-3">
                    {daysOfWeek.map((day) => (
                      <div key={day.key} className="flex items-center gap-4">
                        <div className="w-24">
                          <Text size="sm">{day.label}</Text>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={!formData.businessHours[day.key as keyof typeof formData.businessHours].closed}
                            onChange={(checked) => handleBusinessHoursChange(day.key, 'closed', !checked)}
                            label="Open"
                          />
                        </div>
                        {!formData.businessHours[day.key as keyof typeof formData.businessHours].closed && (
                          <>
                            <Input
                              type="time"
                              value={formData.businessHours[day.key as keyof typeof formData.businessHours].open}
                              onChange={(e) => handleBusinessHoursChange(day.key, 'open', e.target.value)}
                              className="w-24"
                            />
                            <Text size="sm">to</Text>
                            <Input
                              type="time"
                              value={formData.businessHours[day.key as keyof typeof formData.businessHours].close}
                              onChange={(e) => handleBusinessHoursChange(day.key, 'close', e.target.value)}
                              className="w-24"
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Stack>
            </Card>
          </TabPanel>

          {/* Policies Tab */}
          <TabPanel id="policies">
            <Card className="p-6">
              <Stack spacing="lg">
                <div>
                  <Text size="lg" weight="semibold" className="mb-4">Policies & Settings</Text>
                  
                  <div className="space-y-4">
                    <div>
                      <Text size="sm" weight="medium" className="mb-2">Cancellation Policy</Text>
                      <Textarea
                        value={formData.policies.cancellation}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          policies: { ...prev.policies, cancellation: e.target.value }
                        }))}
                        placeholder="Describe your cancellation policy"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Text size="sm" weight="medium" className="mb-2">Insurance Coverage</Text>
                      <Textarea
                        value={formData.policies.insurance}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          policies: { ...prev.policies, insurance: e.target.value }
                        }))}
                        placeholder="Describe your insurance coverage"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Text size="sm" weight="medium" className="mb-2">Equipment Policy</Text>
                      <Textarea
                        value={formData.policies.equipment}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          policies: { ...prev.policies, equipment: e.target.value }
                        }))}
                        placeholder="Describe your equipment policy"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Text size="sm" weight="medium" className="mb-2">Group Size Policy</Text>
                      <Textarea
                        value={formData.policies.groupSize}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          policies: { ...prev.policies, groupSize: e.target.value }
                        }))}
                        placeholder="Describe your group size policy"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </Stack>
            </Card>
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
}
