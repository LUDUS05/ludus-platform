'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Container } from '@opgrapes/ui/Container';
import { Card } from '@opgrapes/ui/Card';
import { Button } from '@opgrapes/ui/Button';
import { Input } from '@opgrapes/ui/Input';
import { Text } from '@opgrapes/ui/Text';
import { Stack } from '@opgrapes/ui/Stack';
import { Form } from '@opgrapes/ui/Form';
import { FormField } from '@opgrapes/ui/FormField';
import { Select } from '@opgrapes/ui/Select';
import { Avatar } from '@opgrapes/ui/Avatar';
import { Badge } from '@opgrapes/ui/Badge';
import { Divider } from '@opgrapes/ui/Divider';

const activityPreferences = [
  { value: 'outdoor', label: 'Outdoor Activities' },
  { value: 'indoor', label: 'Indoor Activities' },
  { value: 'water-sports', label: 'Water Sports' },
  { value: 'adventure', label: 'Adventure Sports' },
  { value: 'cultural', label: 'Cultural Activities' },
  { value: 'wellness', label: 'Wellness & Spa' },
  { value: 'food-drink', label: 'Food & Drink Experiences' },
  { value: 'art-craft', label: 'Art & Craft Workshops' },
  { value: 'music', label: 'Music & Entertainment' },
  { value: 'technology', label: 'Technology & Innovation' },
];

function ProfileContent() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    location: user?.location || '',
    preferences: user?.preferences || [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateUser(formData);
      setIsEditing(false);
      setErrors({});
    } catch (error) {
      setErrors({ general: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      location: user?.location || '',
      preferences: user?.preferences || [],
    });
    setErrors({});
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <Container size="lg" className="py-8">
      <Stack spacing="lg">
        {/* Profile Header */}
        <Card>
          <div className="p-6">
            <Stack spacing="lg">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </div>
                <div className="flex-1">
                  <Text as="div" size="xl" weight="bold">
                    {user.firstName} {user.lastName}
                  </Text>
                  <Text size="lg" color="gray">
                    {user.email}
                  </Text>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="primary">{user.role}</Badge>
                    <Text size="sm" color="gray">
                      Member since {new Date(user.createdAt).toLocaleDateString()}
                    </Text>
                  </div>
                </div>
                <Button
                  variant={isEditing ? "outline" : "primary"}
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={isLoading}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
            </Stack>
          </div>
        </Card>

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <Card>
            <div className="p-6 border-b border-gray-200">
              <Text as="div" size="xl" weight="bold">
                Personal Information
              </Text>
            </div>
            <div className="p-6">
              <Stack spacing="md">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="First Name"
                    error={errors.firstName}
                  >
                    <Input
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing || isLoading}
                      error={errors.firstName}
                    />
                  </FormField>

                  <FormField
                    label="Last Name"
                    error={errors.lastName}
                  >
                    <Input
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing || isLoading}
                      error={errors.lastName}
                    />
                  </FormField>
                </div>

                <FormField
                  label="Phone Number"
                  error={errors.phone}
                >
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing || isLoading}
                                          error={errors.phone}
                    placeholder="No phone number set"
                  />
                </FormField>

                <FormField
                  label="Location"
                  error={errors.location}
                >
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={!isEditing || isLoading}
                                          error={errors.location}
                  />
                </FormField>
              </Stack>
            </div>
          </Card>

          {/* Preferences */}
          <Card>
            <div className="p-6 border-b border-gray-200">
              <Text as="div" size="xl" weight="bold">
                Activity Preferences
              </Text>
            </div>
            <div className="p-6">
              <Stack spacing="md">
                <FormField
                  label="Preferred Activity Types"
                  error={errors.preferences}
                >
                  <Select
                    multiple
                    options={activityPreferences}
                    value={formData.preferences}
                    onChange={(e) => {
                      const select = e.target as HTMLSelectElement;
                      const selectedOptions = Array.from(select.selectedOptions).map(option => option.value);
                      handleInputChange('preferences', selectedOptions);
                    }}
                    disabled={!isEditing || isLoading}
                    error={errors.preferences}
                  />
                </FormField>

                <div className="flex flex-wrap gap-2">
                  {formData.preferences.map((pref) => (
                    <Badge key={pref} variant="secondary">
                      {activityPreferences.find(p => p.value === pref)?.label}
                    </Badge>
                  ))}
                </div>
              </Stack>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <Card>
            <div className="p-6">
              <Stack spacing="md" direction="horizontal" className="justify-end">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Stack>
            </div>
          </Card>
        )}

        {/* Error Display */}
        {errors.general && (
          <Card>
            <div className="p-6">
              <Text color="red" className="text-center">
                {errors.general}
              </Text>
            </div>
          </Card>
        )}
      </Stack>
    </Container>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
