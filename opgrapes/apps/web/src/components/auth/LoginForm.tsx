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
import { z } from 'zod';

// Login form validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function LoginForm({ onSuccess, onError }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const router = useRouter();

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<LoginFormData> = {};
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
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
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      if (onError) {
        onError(errorMessage);
      } else {
        setErrors({ password: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <Text as="div" size="xl" weight="bold" className="text-center text-3xl">
          Welcome Back
        </Text>
        <Text size="sm" color="gray" className="text-center">
          Sign in to your account to continue
        </Text>
      </CardHeader>
      
      <CardBody>
        <Form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <FormField
              label="Email Address"
              error={errors.email}
              required
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isLoading}
                error={errors.email}
              />
            </FormField>

            <FormField
              label="Password"
              error={errors.password}
              required
            >
              <Input
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={isLoading}
                error={errors.password}
              />
            </FormField>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Stack>
        </Form>
      </CardBody>
      
      <CardFooter>
        <Stack spacing="sm" className="text-center">
          <Text size="sm" color="gray">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/auth/register')}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Sign up here
            </button>
          </Text>
          
          <button
            type="button"
            onClick={() => router.push('/auth/forgot-password')}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Forgot your password?
          </button>
        </Stack>
      </CardFooter>
    </Card>
  );
}
