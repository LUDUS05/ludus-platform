'use client';

import { useState, useEffect } from 'react';
import { Card } from 'ui/Card';
import { Button } from 'ui/Button';
import { Input } from 'ui/Input';
import { Textarea } from 'ui/Textarea';
import { Select } from 'ui/Select';
import { Checkbox } from 'ui/Checkbox';
import { Text } from 'ui/Text';
import { Stack } from 'ui/Stack';
import { Badge } from 'ui/Badge';
import { Tabs } from 'ui/Tabs';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Upload, 
  Save, 
  X,
  CheckCircle,
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
    website: 'adventureco.com',
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
    sunday: { open: '10:00', close: '16:00', closed: false },
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
  { value: 'fitness', label: 'Fitness & Sports', icon: '🏃' },
];

const daysOfWeek = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export default function VendorProfilePage() {
  const [vendor, setVendor] = useState(mockVendor);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState(mockVendor);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(mockVendor.logo);
  const [bannerPreview, setBannerPreview] = useState(mockVendor.banner);

  useEffect(() => {
    // In production, fetch vendor data from API
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleInputChange = (field: string, value: any) => {
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

  const handleBusinessHoursChange = (day: string, field: string, value: any) => {
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
      setLogoFile(file);
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
      setBannerFile(file);
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
      setVendor(formData);
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
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List className="mb-6">
            <Tabs.Tab value="basic">Basic Information</Tabs.Tab>
            <Tabs.Tab value="media">Media & Branding</Tabs.Tab>
            <Tabs.Tab value="hours">Business Hours</Tabs.Tab>
            <Tabs.Tab value="policies">Policies & Info</Tabs.Tab>
            <Tabs.Tab value="categories">Categories & Services</Tabs.Tab>
          </Tabs.List>

          {/* Basic Information Tab */}
          <Tabs.Panel value="basic">
            <Stack gap="6">
              <Card>
                <div className="px-6 py-4 border-b border-gray-200">
                  <Text as="h3" size="lg" weight="semibold">
                    Business Information
                  </Text>
                </div>
                <div className="p-6">
                  <Stack gap="4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Text size="sm" weight="medium" className="mb-2">
                          Business Name *
                        </Text>
                        <Input
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter business name"
                        />
                      </div>
                      <div>
                        <Text size="sm" weight="medium" className="mb-2">
                          Established Year
                        </Text>
                        <Input
                          value={formData.established}
                          onChange={(e) => handleInputChange('established', e.target.value)}
                          placeholder="e.g., 2014"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Text size="sm" weight="medium" className="mb-2">
                        Description *
                      </Text>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe your business and what makes you unique"
                        rows={4}
                      />
                    </div>

                    <div>
                      <Text size="sm" weight="medium" className="mb-2">
                        About Us
                      </Text>
                      <Textarea
                        value={formData.about}
                        onChange={(e) => handleInputChange('about', e.target.value)}
                        placeholder="Tell your story and mission"
                        rows={6}
                      />
                    </div>
                  </Stack>
                </div>
              </Card>

              <Card>
                <div className="px-6 py-4 border-b border-gray-200">
                  <Text as="h3" size="lg" weight="semibold">
                    Contact Information
                  </Text>
                </div>
                <div className="p-6">
                  <Stack gap="4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Text size="sm" weight="medium" className="mb-2">
                          Phone Number
                        </Text>
                        <Input
                          value={formData.contact.phone}
                          onChange={(e) => handleContactChange('phone', e.target.value)}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <Text size="sm" weight="medium" className="mb-2">
                          Email Address
                        </Text>
                        <Input
                          value={formData.contact.email}
                          onChange={(e) => handleContactChange('email', e.target.value)}
                          placeholder="info@yourbusiness.com"
                          type="email"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Text size="sm" weight="medium" className="mb-2">
                        Website
                      </Text>
                      <Input
                        value={formData.contact.website}
                        onChange={(e) => handleContactChange('website', e.target.value)}
                        placeholder="yourbusiness.com"
                      />
                    </div>

                    <div>
                      <Text size="sm" weight="medium" className="mb-2">
                        Location
                      </Text>
                      <Input
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="City, State"
                      />
                    </div>
                  </Stack>
                </div>
              </Card>
            </Stack>
          </Tabs.Panel>

          {/* Media & Branding Tab */}
          <Tabs.Panel value="media">
            <Stack gap="6">
              <Card>
                <div className="px-6 py-4 border-b border-gray-200">
                  <Text as="h3" size="lg" weight="semibold">
                    Logo & Branding
                  </Text>
                </div>
                <div className="p-6">
                  <Stack gap="6">
                    {/* Logo Upload */}
                    <div>
                      <Text size="sm" weight="medium" className="mb-3">
                        Business Logo
                      </Text>
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                          {logoPreview ? (
                            <img 
                              src={logoPreview} 
                              alt="Logo preview" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building2 size={32} className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                            <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                              <Upload size={16} />
                              <span>Upload Logo</span>
                            </div>
                          </label>
                          <Text size="xs" color="gray" className="mt-1">
                            Recommended: 200x200px, PNG or JPG
                          </Text>
                        </div>
                      </div>
                    </div>

                    {/* Banner Upload */}
                    <div>
                      <Text size="sm" weight="medium" className="mb-3">
                        Banner Image
                      </Text>
                      <div className="flex items-center gap-4">
                        <div className="w-48 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                          {bannerPreview ? (
                            <img 
                              src={bannerPreview} 
                              alt="Banner preview" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building2 size={32} className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleBannerUpload}
                              className="hidden"
                            />
                            <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                              <Upload size={16} />
                              <span>Upload Banner</span>
                            </div>
                          </label>
                          <Text size="xs" color="gray" className="mt-1">
                            Recommended: 1200x400px, PNG or JPG
                          </Text>
                        </div>
                      </div>
                    </div>
                  </Stack>
                </div>
              </Card>
            </Stack>
          </Tabs.Panel>

          {/* Business Hours Tab */}
          <Tabs.Panel value="hours">
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <Text as="h3" size="lg" weight="semibold">
                  Business Hours
                </Text>
              </div>
              <div className="p-6">
                <Stack gap="4">
                  {daysOfWeek.map((day) => (
                    <div key={day.key} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-24">
                        <Text weight="medium">{day.label}</Text>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={!formData.businessHours[day.key as keyof typeof formData.businessHours].closed}
                          onChange={(e) => handleBusinessHoursChange(day.key, 'closed', !e.target.checked)}
                        />
                        <Text size="sm">Open</Text>
                      </div>
                      
                      {!formData.businessHours[day.key as keyof typeof formData.businessHours].closed && (
                        <>
                          <div className="flex items-center gap-2">
                            <Text size="sm">Open:</Text>
                            <Input
                              type="time"
                              value={formData.businessHours[day.key as keyof typeof formData.businessHours].open}
                              onChange={(e) => handleBusinessHoursChange(day.key, 'open', e.target.value)}
                              className="w-24"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Text size="sm">Close:</Text>
                            <Input
                              type="time"
                              value={formData.businessHours[day.key as keyof typeof formData.businessHours].close}
                              onChange={(e) => handleBusinessHoursChange(day.key, 'close', e.target.value)}
                              className="w-24"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </Stack>
              </div>
            </Card>
          </Tabs.Panel>

          {/* Policies Tab */}
          <Tabs.Panel value="policies">
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <Text as="h3" size="lg" weight="semibold">
                  Business Policies
                </Text>
              </div>
              <div className="p-6">
                <Stack gap="4">
                  <div>
                    <Text size="sm" weight="medium" className="mb-2">
                      Cancellation Policy
                    </Text>
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
                    <Text size="sm" weight="medium" className="mb-2">
                      Insurance Information
                    </Text>
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
                    <Text size="sm" weight="medium" className="mb-2">
                      Equipment Policy
                    </Text>
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
                    <Text size="sm" weight="medium" className="mb-2">
                      Group Size Policy
                    </Text>
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
                </Stack>
              </div>
            </Card>
          </Tabs.Panel>

          {/* Categories Tab */}
          <Tabs.Panel value="categories">
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <Text as="h3" size="lg" weight="semibold">
                  Service Categories
                </Text>
                <Text size="sm" color="gray">
                  Select the categories that best describe your services
                </Text>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categoryOptions.map((category) => (
                    <label
                      key={category.value}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <Checkbox
                        checked={formData.categories.includes(category.value)}
                        onChange={() => handleCategoryToggle(category.value)}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{category.icon}</span>
                        <Text size="sm">{category.label}</Text>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
}
