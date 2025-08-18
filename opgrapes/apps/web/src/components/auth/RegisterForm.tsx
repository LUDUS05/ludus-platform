'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@opgrapes/ui/Button';
import { Input } from '@opgrapes/ui/Input';
import { Card, CardBody, CardHeader, CardFooter } from '@opgrapes/ui/Card';
import { Text } from '@opgrapes/ui/Text';
import { Stack } from '@opgrapes/ui/Stack';
import { Form } from '@opgrapes/ui/Form';
import { FormField } from '@opgrapes/ui/FormField';
import { Select } from '@opgrapes/ui/Select';
import { z } from 'zod';

// Registration form validation schema
const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  location: z.string().min(2, 'Please enter your city or location'),
  preferences: z.array(z.string()).min(1, 'Please select at least one activity preference'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

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

export function RegisterForm({ onSuccess, onError }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    preferences: [],
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const router = useRouter();

  const handleInputChange = (field: keyof RegisterFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      registerSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<RegisterFormData> = {};
        error.issues.forEach(err => {
          const path = err.path[0];
          if (path && typeof path === 'string') {
            (newErrors as Record<string, string>)[path] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      
      // Store token in localStorage (you might want to use a more secure method)
      localStorage.setItem('authToken', data.token);
      
      // Call success callback or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      if (onError) {
        onError(errorMessage);
      } else {
        setErrors({ email: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <Text as="div" size="xl" weight="bold" className="text-center text-3xl">
          Create Your Account
        </Text>
        <Text size="sm" color="gray" className="text-center">
          Join LUDUS to discover amazing activities and experiences
        </Text>
      </CardHeader>
      
      <CardBody>
        <Form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="First Name"
                error={errors.firstName}
                required
              >
                <Input
                  type="text"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={isLoading}
                  error={errors.firstName}
                />
              </FormField>

              <FormField
                label="Last Name"
                error={errors.lastName}
                required
              >
                <Input
                  type="text"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={isLoading}
                  error={errors.lastName}
                />
              </FormField>
            </div>

            <FormField
              label="Email Address"
              error={errors.email}
              required
            >
              <Input
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isLoading}
                                  error={errors.email}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Password"
                error={errors.password}
                required
              >
                <Input
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={isLoading}
                  error={errors.password}
                />
              </FormField>

              <FormField
                label="Confirm Password"
                error={errors.confirmPassword}
                required
              >
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  disabled={isLoading}
                  error={errors.confirmPassword}
                />
              </FormField>
            </div>

            <FormField
              label="Phone Number (Optional)"
              error={errors.phone}
            >
              <Input
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={isLoading}
                                  error={errors.phone}
              />
            </FormField>

            <FormField
              label="Location"
              error={errors.location}
              required
            >
              <Input
                type="text"
                placeholder="Enter your city or location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                disabled={isLoading}
                                  error={errors.location}
              />
            </FormField>

            <FormField
              label="Activity Preferences"
              error={Array.isArray(errors.preferences) ? errors.preferences.join(', ') : errors.preferences}
              required
            >
                            <Select
                placeholder="Select your preferred activity types"
                options={activityPreferences}
                value={formData.preferences[0] || ''}
                onChange={(e) => handleInputChange('preferences', [e.target.value])}
                disabled={isLoading}
                error={Array.isArray(errors.preferences) ? errors.preferences.join(', ') : errors.preferences}
              />
              <Text size="xs" color="gray" className="mt-1">
                Select multiple preferences to get personalized recommendations
              </Text>
            </FormField>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
                      </Stack>
          </Form>
        </CardBody>
        
                <CardFooter>
          <Stack spacing="sm" className="text-center">
            <Text size="sm" color="gray">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/auth/login')}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Sign in here
              </button>
            </Text>
            
            <Text size="xs" color="gray">
              By creating an account, you agree to our{' '}
              <button
                type="button"
                onClick={() => router.push('/terms')}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={() => router.push('/privacy')}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Privacy Policy
              </button>
            </Text>
          </Stack>
        </CardFooter>
    </Card>
  );
}
