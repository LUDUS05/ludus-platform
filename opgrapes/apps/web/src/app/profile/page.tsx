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
      setErrors(prev => ({ ...prev, [field]: undefined }));
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
      <Stack gap="8">
        {/* Profile Header */}
        <Card>
          <Card.Body>
            <Stack gap="6">
              <div className="flex items-center gap-6">
                <Avatar
                  size="xl"
                  src={user.avatar}
                  alt={`${user.firstName} ${user.lastName}`}
                />
                <div className="flex-1">
                  <Text as="h1" size="3xl" weight="bold">
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
          </Card.Body>
        </Card>

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <Card>
            <Card.Header>
              <Text as="h2" size="xl" weight="bold">
                Personal Information
              </Text>
            </Card.Header>
            <Card.Body>
              <Stack gap="4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="First Name"
                    error={errors.firstName}
                  >
                    <Input
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing || isLoading}
                      error={!!errors.firstName}
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
                      error={!!errors.lastName}
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
                    error={!!errors.phone}
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
                    error={!!errors.location}
                  />
                </FormField>
              </Stack>
            </Card.Body>
          </Card>

          {/* Preferences */}
          <Card>
            <Card.Header>
              <Text as="h2" size="xl" weight="bold">
                Activity Preferences
              </Text>
            </Card.Header>
            <Card.Body>
              <Stack gap="4">
                <FormField
                  label="Preferred Activity Types"
                  error={errors.preferences}
                >
                  <Select
                    multiple
                    options={activityPreferences}
                    value={formData.preferences}
                    onChange={(value) => handleInputChange('preferences', value)}
                    disabled={!isEditing || isLoading}
                    error={!!errors.preferences}
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
            </Card.Body>
          </Card>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <Card>
            <Card.Body>
              <Stack gap="4" direction="row" className="justify-end">
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
            </Card.Body>
          </Card>
        )}

        {/* Error Display */}
        {errors.general && (
          <Card>
            <Card.Body>
              <Text color="red" className="text-center">
                {errors.general}
              </Text>
            </Card.Body>
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
